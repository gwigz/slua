#include "lua.h"
#include "lualib.h"
#include "luacode.h"

#include "Luau/Common.h"
#include "Luau/Compiler.h"

#include <string>
#include <string_view>
#include <memory>
#include <sstream>
#include <stdexcept>
#include <emscripten/bind.h>
#include <emscripten/em_js.h>

namespace {

// ------------------------------------------------
// Global state, Luau compile options, etc.
// ------------------------------------------------

constexpr int kMaxTraversalLimit = 50;
constexpr int kDefaultOptimizationLevel = 1;
constexpr int kDefaultDebugLevel = 1;

struct GlobalState {
    std::unique_ptr<lua_State, void (*)(lua_State*)> luaState{nullptr, lua_close};

    int optimizationLevel = kDefaultOptimizationLevel;
    int debugLevel = kDefaultDebugLevel;
} gState;

Luau::CompileOptions getCompileOptions() {
    Luau::CompileOptions result = {};

    result.optimizationLevel = gState.optimizationLevel;
    result.debugLevel = gState.debugLevel;
    result.typeInfoLevel = 1;
    result.coverageLevel = 0;

    return result;
}

// ------------------------------------------------
// JSON serialization utilities
// ------------------------------------------------

class JsonSerializer {
public:
    static std::string escapeString(std::string_view str) {
        std::string result;
        result.reserve(str.length() + 2);
        result += '"';

        for (char c : str) {
            switch (c) {
                case '\"': result += "\\\""; break;
                case '\\': result += "\\\\"; break;
                case '\b': result += "\\b"; break;
                case '\f': result += "\\f"; break;
                case '\n': result += "\\n"; break;
                case '\r': result += "\\r"; break;
                case '\t': result += "\\t"; break;
                default:
                    if (c < 32 || c > 126) {
                        char hex[7];
                        snprintf(hex, sizeof(hex), "\\u%04x", static_cast<unsigned char>(c));
                        result += hex;
                    } else {
                        result += c;
                    }
                    break;
            }
        }

        result += '"';
        return result;
    }

    static void serializeArray(lua_State* L, int index, std::string& result, int length) {
        result += '[';
        for (int i = 1; i <= length; i++) {
            if (i > 1) {
                result += ',';
            }

            lua_rawgeti(L, index, i);
            result += serializeValue(L, -1);
            lua_pop(L, 1);
        }
        result += ']';
    }

    static void serializeTable(lua_State* L, int index, std::string& result) {
        bool hasNonSequentialKeys = false;
        int maxSequentialKey = 0;

        // first check if the table has any non-sequential numeric keys
        lua_pushnil(L);
        while (lua_next(L, index)) {
            if (lua_type(L, -2) == LUA_TNUMBER) {
                double key = lua_tonumber(L, -2);
                if (key != floor(key) || key < 1) {
                    hasNonSequentialKeys = true;
                } else {
                    maxSequentialKey = std::max(maxSequentialKey, static_cast<int>(key));
                }
            } else {
                hasNonSequentialKeys = true;
            }
            lua_pop(L, 1);
        }

        // if we have non-sequential keys or non-numeric keys, treat as object
        if (hasNonSequentialKeys) {
            serializeObject(L, index, result);
        } else {
            // otherwise treat as array
            serializeArray(L, index, result, maxSequentialKey);
        }
    }

    static std::string serializeValue(lua_State* L, int index) {
        std::string result;
        int type = lua_type(L, index);

        switch (type) {
            case LUA_TNIL:
                result = "null";
                break;
            case LUA_TBOOLEAN:
                result = lua_toboolean(L, index) ? "true" : "false";
                break;
            case LUA_TNUMBER: {
                std::string numStr = std::to_string(lua_tonumber(L, index));
                size_t dotPos = numStr.find('.');
                if (dotPos != std::string::npos) {
                    size_t lastNonZero = numStr.find_last_not_of('0');
                    if (lastNonZero == dotPos) {
                        numStr = numStr.substr(0, dotPos);
                    } else {
                        numStr = numStr.substr(0, lastNonZero + 1);
                    }
                }

                result = numStr;
                break;
            }
            case LUA_TSTRING:
                result = escapeString(lua_tostring(L, index));
                break;
            case LUA_TTABLE:
                lua_pushvalue(L, index);
                serializeTable(L, lua_gettop(L), result);
                lua_pop(L, 1);
                break;
            default:
                result = "\"[unsupported]\"";
                break;
        }

        return result;
    }

    static void serializeObject(lua_State* L, int index, std::string& result) {
        result += '{';

        lua_pushnil(L);

        bool first = true;
        while (lua_next(L, index)) {
            if (!first) {
                result += ',';
            }

            first = false;

            if (lua_type(L, -2) == LUA_TSTRING) {
                result += escapeString(lua_tostring(L, -2)) + ':';
            } else if (lua_type(L, -2) == LUA_TNUMBER) {
                result += '"' + serializeValue(L, -2) + "\":";
            }

            result += serializeValue(L, lua_gettop(L));

            lua_pop(L, 1);
        }

        result += '}';
    }
};

// ------------------------------------------------
// JavaScript interop
// ------------------------------------------------

EM_JS(const char*, readSync, (const char* method, const char* data), {
    try {
        const result = Module.readSync(UTF8ToString(method), UTF8ToString(data));
        const lengthBytes = lengthBytesUTF8(result) + 1;
        const stringOnWasmHeap = _malloc(lengthBytes);
        stringToUTF8(result, stringOnWasmHeap, lengthBytes);
        return stringOnWasmHeap;
    } catch (error) {
        console.error('Error in readSync:', error);
        return "";
    }
});

// ------------------------------------------------
// Luau state management
// ------------------------------------------------

class LuaStateManager {
public:
    static void setupState(lua_State* L) {
        if (!L) {
            throw std::runtime_error("Invalid Lua state");
        }

        luaL_openlibs(L);

        static const luaL_Reg funcs[] = {
            {"__INTERNAL_DO_NOT_USE_calljs", lua_calljs},
            {NULL, NULL},
        };

        lua_pushvalue(L, LUA_GLOBALSINDEX);
        luaL_register(L, NULL, funcs);
        lua_pop(L, 1);

        luaL_sandbox(L);
    }

    static void safeGetTable(lua_State* L, int tableIndex) {
        if (!L) {
            throw std::runtime_error("Invalid Lua state");
        }

        lua_pushvalue(L, tableIndex);

        for (int loopCount = 0;; loopCount++) {
            lua_pushvalue(L, -2);
            lua_rawget(L, -2);
            if (!lua_isnil(L, -1) || loopCount >= kMaxTraversalLimit) {
                break;
            }

            lua_pop(L, 1);
            if (!luaL_getmetafield(L, -1, "__index")) {
                lua_pushnil(L);
                break;
            }

            if (lua_istable(L, -1)) {
                lua_replace(L, -2);
            } else {
                lua_pop(L, 1);
                lua_pushnil(L);
                break;
            }
        }

        lua_remove(L, -2);
        lua_remove(L, -2);
    }

private:
    // static int lua_loadstring(lua_State* L)
    // {
    //     size_t l = 0;
    //     const char* s = luaL_checklstring(L, 1, &l);
    //     const char* chunkname = luaL_optstring(L, 2, s);

    //     lua_setsafeenv(L, LUA_ENVIRONINDEX, false);

    //     std::string bytecode = Luau::compile(std::string(s, l), copts());
    //     if (luau_load(L, chunkname, bytecode.data(), bytecode.size(), 0) == 0)
    //         return 1;

    //     lua_pushnil(L);
    //     lua_insert(L, -2); // put before error message
    //     return 2;          // return nil plus error message
    // }

    static int lua_calljs(lua_State* L) {
        const char* method = luaL_checkstring(L, 1);
        std::string json = JsonSerializer::serializeValue(L, 2);
        const char* result = readSync(method, json.c_str());

        if (!result || !*result) {
            lua_pushstring(L, "Error in readSync");
            // lua_pushnil(L);
            return 1;
        }

        lua_setsafeenv(L, LUA_ENVIRONINDEX, false);

        std::string bytecode = Luau::compile(result, getCompileOptions());
        if (luau_load(L, "=stdin", bytecode.data(), bytecode.size(), 0) == 0) {
            // malloc free, idk if necessary
            free(const_cast<char*>(result));
            return 1;
        }

        // malloc free, idk if necessary
        free(const_cast<char*>(result));

        lua_pushnil(L);
        lua_insert(L, -2);
        return 2;
    }
};

class ScriptRunner {
public:
    static std::string runCode(lua_State* L, std::string source) {
        if (!L) {
            throw std::runtime_error("Invalid Lua state");
        }

        lua_setsafeenv(L, LUA_ENVIRONINDEX, false);

        std::string bytecode = Luau::compile(source.c_str(), getCompileOptions());
        if (luau_load(L, "=stdin", bytecode.data(), bytecode.size(), 0) != 0) {
            size_t len;
            const char* msg = lua_tolstring(L, -1, &len);
            std::string error(msg, len);
            lua_pop(L, 1);
            return error;
        }

        lua_State* T = lua_newthread(L);
        lua_pushvalue(L, -2);
        lua_remove(L, -3);
        lua_xmove(L, T, 1);

        int status = lua_resume(T, NULL, 0);
        if (status == 0) {
            int n = lua_gettop(T);
            if (n) {
                luaL_checkstack(T, LUA_MINSTACK, "too many results to print");
                lua_getglobal(T, "print");
                lua_insert(T, 1);
                lua_pcall(T, n, 0, 0);
            }

            lua_pop(L, 1);
            return "";
        }

        std::string error = handleError(L, T, status);
        lua_pop(L, 1);
        return error;
    }

private:
    static void handleSuccess(lua_State* T) {
        int n = lua_gettop(T);
        if (n) {
            luaL_checkstack(T, LUA_MINSTACK, "too many results to print");
            lua_getglobal(T, "print");
            lua_insert(T, 1);
            lua_pcall(T, n, 0, 0);
        }
    }

    static std::string handleError(lua_State* L, lua_State* T, int status) {
        std::string error;
        lua_Debug ar;

        if (lua_getinfo(L, 0, "sln", &ar)) {
            error.reserve(256);
            error += ar.short_src;
            error += ':';
            error += std::to_string(ar.currentline);
            error += ": ";
        }

        if (status == LUA_YIELD) {
            error += "thread yielded unexpectedly";
        } else if (const char* str = lua_tostring(T, -1)) {
            error += str;
        }

        error += "\nstack backtrace:\n";
        error += lua_debugtrace(T);
        return error;
    }
};

std::string slapFunction(lua_State* L, const std::string& argsJson) {
    if (!argsJson.empty()) {
        // TODO: parse JSON arguments, array of simple primitives
        // these would need to be passed in to the `pcall` below
    }

    int status = lua_pcall(L, 0, 1, 0);
    if (status != 0) {
        size_t len;
        const char* msg = lua_tolstring(L, -1, &len);
        std::string error(msg, len);
        lua_pop(L, 1);
        return error;
    }

    std::string result;
    if (!lua_isnil(L, -1)) {
        size_t len;
        const char* str = lua_tolstring(L, -1, &len);
        if (str) {
            result = std::string(str, len);
        } else {
            result = "Function returned non-string value";
        }
    } else {
        result = "nil";
    }

    lua_pop(L, 1);
    return result;
}

std::string slapTableFunction(lua_State* L, const std::string& name, size_t lastDot, const std::string& argsJson) {
    std::string tablePath = name.substr(0, lastDot);
    std::string funcName = name.substr(lastDot + 1);

    lua_pushvalue(L, LUA_GLOBALSINDEX);

    size_t start = 0;
    while (true) {
        size_t dot = tablePath.find('.', start);
        std::string part = tablePath.substr(start, dot - start);

        lua_pushlstring(L, part.data(), part.size());
        LuaStateManager::safeGetTable(L, -2);
        lua_remove(L, -2);

        if (lua_isnil(L, -1)) {
            lua_pop(L, 1);
            return "Table '" + part + "' not found in path '" + tablePath + "'";
        }

        if (!lua_istable(L, -1)) {
            lua_pop(L, 1);
            return "Table '" + part + "' exists but is not a table";
        }

        if (dot == std::string::npos) break;
        start = dot + 1;
    }

    lua_pushlstring(L, funcName.data(), funcName.size());
    LuaStateManager::safeGetTable(L, -2);
    lua_remove(L, -2);

    if (!lua_isfunction(L, -1)) {
        lua_pop(L, 1);
        return "Function '" + funcName + "' not found in table '" + tablePath + "'";
    }

    return slapFunction(L, argsJson);
}

std::string slapGlobalFunction(lua_State* L, const std::string& name, const std::string& argsJson) {
    lua_getglobal(L, name.c_str());
    if (!lua_isfunction(L, -1)) {
        lua_pop(L, 1);
        return "Global function '" + name + "' not found";
    }

    return slapFunction(L, argsJson);
}

} // namespace

// ------------------------------------------------
// Public API
// ------------------------------------------------

std::string runScript(const std::string& source) {
    // setup flags
    for (Luau::FValue<bool>* flag = Luau::FValue<bool>::list; flag; flag = flag->next) {
        if (strncmp(flag->name, "Luau", 4) == 0) {
            flag->value = true;
        }
    }

    // create new state
    gState.luaState.reset(luaL_newstate());
    lua_State* L = gState.luaState.get();

    // setup state
    LuaStateManager::setupState(L);
    luaL_sandboxthread(L);

    return ScriptRunner::runCode(L, source);
}

std::string callGlobalFunction(const std::string& name, const std::string& argsJson) {
    if (!gState.luaState) {
        return "Lua state not initialized";
    }

    lua_State* L = gState.luaState.get();
    lua_checkstack(L, LUA_MINSTACK);

    size_t lastDot = name.find_last_of('.');
    if (lastDot != std::string::npos) {
        return slapTableFunction(L, name, lastDot, argsJson);
    } else {
        return slapGlobalFunction(L, name, argsJson);
    }
}

EMSCRIPTEN_BINDINGS(Module) {
    emscripten::function("runScript", &runScript);
    emscripten::function("callGlobalFunction", &callGlobalFunction);
}
