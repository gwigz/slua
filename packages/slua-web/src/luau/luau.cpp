// This file is part of the Luau programming language and is licensed under MIT License; see LICENSE.txt for details
#include "lua.h"
#include "lualib.h"
#include "luacode.h"

#include "Luau/Common.h"

#include <string>

#include <string.h>

// static global state that will be reused
static std::unique_ptr<lua_State, void (*)(lua_State*)> globalState(nullptr, lua_close);

constexpr int MaxTraversalLimit = 50;

static void setupState(lua_State* L)
{
    luaL_openlibs(L);
    luaL_sandbox(L);
}

static std::string runCode(lua_State* L, const std::string& source)
{
    size_t bytecodeSize = 0;
    char* bytecode = luau_compile(source.data(), source.length(), nullptr, &bytecodeSize);
    int result = luau_load(L, "=stdin", bytecode, bytecodeSize, 0);
    free(bytecode);

    if (result != 0)
    {
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

    if (status == 0)
    {
        int n = lua_gettop(T);

        if (n)
        {
            luaL_checkstack(T, LUA_MINSTACK, "too many results to print");
            lua_getglobal(T, "print");
            lua_insert(T, 1);
            lua_pcall(T, n, 0, 0);
        }

        lua_pop(L, 1); // pop T
        return std::string();
    }
    else
    {
        std::string error;

        lua_Debug ar;
        if (lua_getinfo(L, 0, "sln", &ar))
        {
            error += ar.short_src;
            error += ':';
            error += std::to_string(ar.currentline);
            error += ": ";
        }

        if (status == LUA_YIELD)
        {
            error += "thread yielded unexpectedly";
        }
        else if (const char* str = lua_tostring(T, -1))
        {
            error += str;
        }

        error += "\nstack backtrace:\n";
        error += lua_debugtrace(T);

        lua_pop(L, 1); // pop T
        return error;
    }
}

static void safeGetTable(lua_State* L, int tableIndex)
{
    lua_pushvalue(L, tableIndex); // Duplicate the table

    // The loop invariant is that the table to search is at -1
    // and the key is at -2.
    for (int loopCount = 0;; loopCount++)
    {
        lua_pushvalue(L, -2); // Duplicate the key
        lua_rawget(L, -2);    // Try to find the key
        if (!lua_isnil(L, -1) || loopCount >= MaxTraversalLimit)
        {
            // Either the key has been found, and/or we have reached the max traversal limit
            break;
        }
        else
        {
            lua_pop(L, 1); // Pop the nil result
            if (!luaL_getmetafield(L, -1, "__index"))
            {
                lua_pushnil(L);
                break;
            }
            else if (lua_istable(L, -1))
            {
                // Replace the current table being searched with __index table
                lua_replace(L, -2);
            }
            else
            {
                lua_pop(L, 1); // Pop the value
                lua_pushnil(L);
                break;
            }
        }
    }

    lua_remove(L, -2); // Remove the table
    lua_remove(L, -2); // Remove the original key
}

extern "C" const char* executeScript(const char* source)
{
    // setup flags
    for (Luau::FValue<bool>* flag = Luau::FValue<bool>::list; flag; flag = flag->next)
        if (strncmp(flag->name, "Luau", 4) == 0)
            flag->value = true;

    // create new state
    globalState.reset(luaL_newstate());
    lua_State* L = globalState.get();

    // setup state
    setupState(L);

    // sandbox thread
    luaL_sandboxthread(L);

    // static string for caching result (prevents dangling ptr on function exit)
    static std::string result;

    // run code + collect error
    result = runCode(L, source);

    return result.empty() ? NULL : result.c_str();
}

extern "C" const char* executeGlobalFunction(const char* functionName, const char* argsJson)
{
    if (!globalState)
    {
        return NULL;
    }

    lua_State* L = globalState.get();

    lua_checkstack(L, LUA_MINSTACK);

    // static string for caching result (prevents dangling ptr on function exit)
    static std::string result;

    // Split function name into table path and function name
    std::string fullName(functionName);
    size_t lastDot = fullName.find_last_of('.');
    
    if (lastDot != std::string::npos)
    {
        // handle table member function
        std::string tablePath = fullName.substr(0, lastDot);
        std::string funcName = fullName.substr(lastDot + 1);

        // push the global table onto the stack
        lua_pushvalue(L, LUA_GLOBALSINDEX);

        // traverse the table path
        size_t start = 0;

        for (;;)
        {
            size_t dot = tablePath.find('.', start);
            std::string part = tablePath.substr(start, dot - start);
            
            // get the next table in the path
            lua_pushlstring(L, part.data(), part.size());
            safeGetTable(L, -2);
            lua_remove(L, -2); // remove parent table

            if (lua_isnil(L, -1))
            {
                result = std::string("Table '") + part + "' not found in path '" + tablePath + "'";
                lua_pop(L, 1); // pop nil
                return result.c_str();
            }
            else if (!lua_istable(L, -1))
            {
                result = std::string("Table '") + part + "' exists but is not a table";
                lua_pop(L, 1); // pop the non-table value
                return result.c_str();
            }

            if (dot == std::string::npos)
                break;
            start = dot + 1;
        }

        // get the function from the final table
        lua_pushlstring(L, funcName.data(), funcName.size());
        safeGetTable(L, -2);
        lua_remove(L, -2); // remove the table

        if (!lua_isfunction(L, -1))
        {
            result = std::string("Function '") + funcName + "' not found in table '" + tablePath + "'";
            lua_pop(L, 1); // pop the non-function value
            return result.c_str();
        }
    }
    else
    {
        // handle direct global function
        lua_getglobal(L, functionName);
        if (!lua_isfunction(L, -1))
        {
            result = std::string("Global function '") + functionName + "' not found";
            lua_pop(L, 1);
            return result.c_str();
        }
    }

    // parse JSON arguments if provided, this would just be an array of arguments
    // either string, number, boolean, or null (nil)
    if (argsJson && argsJson[0] != '\0')
    {
        // TODO: finish this
        result = "JSON argument parsing not yet implemented";
        lua_pop(L, 1);
        return result.c_str();
    }

    // call the function
    int status = lua_pcall(L, 0, 1, 0);
    if (status != 0)
    {
        size_t len;
        const char* msg = lua_tolstring(L, -1, &len);
        result = std::string(msg, len);
        lua_pop(L, 1);
        return result.c_str();
    }

    // convert result to string
    if (!lua_isnil(L, -1))
    {
        size_t len;
        const char* str = lua_tolstring(L, -1, &len);
        if (str)
            result = std::string(str, len);
        else
            result = "Function returned non-string value";
    }
    else
    {
        result = "nil";
    }

    lua_pop(L, 1);

    return result.empty() ? NULL : result.c_str();
}
