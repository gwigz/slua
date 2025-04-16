--# selene: allow(unscoped_variables, unused_variable, incorrect_standard_library_use)

type list = { string | number | boolean | vector }

local __INTERNAL_DO_NOT_USE_uuid = {}

__INTERNAL_DO_NOT_USE_uuid.__tostring = function(self)
	return tostring(self.value)
end

__INTERNAL_DO_NOT_USE_uuid.__eq = function(self, other)
	return type(other) == "table"
		and getmetatable(other) == __INTERNAL_DO_NOT_USE_uuid
		and self.value == other.value
end

function uuid(key: string | uuid)
	local self = {
		value = tostring(key),
		istruthy = tostring(key) ~= "00000000-0000-0000-0000-000000000000",
	}

	return setmetatable(self, __INTERNAL_DO_NOT_USE_uuid)
end

type uuid = typeof(setmetatable({ istruthy = true }, __INTERNAL_DO_NOT_USE_uuid))

local __INTERNAL_DO_NOT_USE_vector = vector

vector = setmetatable({}, {
	__index = __INTERNAL_DO_NOT_USE_vector,

	__call = function(_, ...)
		return __INTERNAL_DO_NOT_USE_vector.create(...)
	end,
})

function tovector(str: string)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\ttovector: not implemented`
	)
end

function quaternion(x: number, y: number, z: number, s: number)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tquaternion: not implemented`
	)
end

function toquaternion(str: string)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\ttoquaternion: not implemented`
	)
end

ACTIVE = 2
AGENT = 1
AGENT_ALWAYS_RUN = 4096
AGENT_ATTACHMENTS = 2
AGENT_AUTOMATED = 16384
AGENT_AUTOPILOT = 8192
AGENT_AWAY = 64
AGENT_BUSY = 2048
AGENT_BY_LEGACY_NAME = 1
AGENT_BY_USERNAME = 16
AGENT_CROUCHING = 1024
AGENT_FLOATING_VIA_SCRIPTED_ATTACHMENT = 32768
AGENT_FLYING = 1
AGENT_IN_AIR = 256
AGENT_LIST_PARCEL = 1
AGENT_LIST_PARCEL_OWNER = 2
AGENT_LIST_REGION = 4
AGENT_MOUSELOOK = 8
AGENT_ON_OBJECT = 32
AGENT_SCRIPTED = 4
AGENT_SITTING = 16
AGENT_TYPING = 512
AGENT_WALKING = 128
ALL_SIDES = -1
ANIM_ON = 1
ATTACH_ANY_HUD = -1
ATTACH_AVATAR_CENTER = 40
ATTACH_BACK = 9
ATTACH_BELLY = 28
ATTACH_CHEST = 1
ATTACH_CHIN = 12
ATTACH_FACE_JAW = 47
ATTACH_FACE_LEAR = 48
ATTACH_FACE_LEYE = 50
ATTACH_FACE_REAR = 49
ATTACH_FACE_REYE = 51
ATTACH_FACE_TONGUE = 52
ATTACH_GROIN = 53
ATTACH_HEAD = 2
ATTACH_HIND_LFOOT = 54
ATTACH_HIND_RFOOT = 55
ATTACH_HUD_BOTTOM = 37
ATTACH_HUD_BOTTOM_LEFT = 36
ATTACH_HUD_BOTTOM_RIGHT = 38
ATTACH_HUD_CENTER_1 = 35
ATTACH_HUD_CENTER_2 = 31
ATTACH_HUD_TOP_CENTER = 33
ATTACH_HUD_TOP_LEFT = 34
ATTACH_HUD_TOP_RIGHT = 32
ATTACH_LEAR = 13
ATTACH_LEFT_PEC = 29
ATTACH_LEYE = 15
ATTACH_LFOOT = 7
ATTACH_LHAND = 5
ATTACH_LHAND_RING1 = 41
ATTACH_LHIP = 25
ATTACH_LLARM = 21
ATTACH_LLLEG = 27
ATTACH_LPEC = 30
ATTACH_LSHOULDER = 3
ATTACH_LUARM = 20
ATTACH_LULEG = 26
ATTACH_LWING = 45
ATTACH_MOUTH = 11
ATTACH_NECK = 39
ATTACH_NOSE = 17
ATTACH_PELVIS = 10
ATTACH_REAR = 14
ATTACH_REYE = 16
ATTACH_RFOOT = 8
ATTACH_RHAND = 6
ATTACH_RHAND_RING1 = 42
ATTACH_RHIP = 22
ATTACH_RIGHT_PEC = 30
ATTACH_RLARM = 19
ATTACH_RLLEG = 24
ATTACH_RPEC = 29
ATTACH_RSHOULDER = 4
ATTACH_RUARM = 18
ATTACH_RULEG = 23
ATTACH_RWING = 46
ATTACH_TAIL_BASE = 43
ATTACH_TAIL_TIP = 44
AVOID_CHARACTERS = 1
AVOID_DYNAMIC_OBSTACLES = 2
AVOID_NONE = 0
BEACON_MAP = 1
CAMERA_ACTIVE = 12
CAMERA_BEHINDNESS_ANGLE = 8
CAMERA_BEHINDNESS_LAG = 9
CAMERA_DISTANCE = 7
CAMERA_FOCUS = 17
CAMERA_FOCUS_LAG = 6
CAMERA_FOCUS_LOCKED = 22
CAMERA_FOCUS_OFFSET = 1
CAMERA_FOCUS_THRESHOLD = 11
CAMERA_PITCH = 0
CAMERA_POSITION = 13
CAMERA_POSITION_LAG = 5
CAMERA_POSITION_LOCKED = 21
CAMERA_POSITION_THRESHOLD = 10
CHANGED_ALLOWED_DROP = 64
CHANGED_COLOR = 2
CHANGED_INVENTORY = 1
CHANGED_LINK = 32
CHANGED_MEDIA = 2048
CHANGED_OWNER = 128
CHANGED_REGION = 256
CHANGED_REGION_START = 1024
CHANGED_RENDER_MATERIAL = 4096
CHANGED_SCALE = 8
CHANGED_SHAPE = 4
CHANGED_TELEPORT = 512
CHANGED_TEXTURE = 16
CHARACTER_ACCOUNT_FOR_SKIPPED_FRAMES = 14
CHARACTER_AVOIDANCE_MODE = 5
CHARACTER_CMD_JUMP = 1
CHARACTER_CMD_SMOOTH_STOP = 2
CHARACTER_CMD_STOP = 0
CHARACTER_DESIRED_SPEED = 1
CHARACTER_DESIRED_TURN_SPEED = 12
CHARACTER_LENGTH = 3
CHARACTER_MAX_ACCEL = 8
CHARACTER_MAX_DECEL = 9
CHARACTER_MAX_SPEED = 13
CHARACTER_MAX_TURN_RADIUS = 10
CHARACTER_ORIENTATION = 4
CHARACTER_RADIUS = 2
CHARACTER_STAY_WITHIN_PARCEL = 15
CHARACTER_TYPE = 6
CHARACTER_TYPE_A = 0
CHARACTER_TYPE_B = 1
CHARACTER_TYPE_C = 2
CHARACTER_TYPE_D = 3
CHARACTER_TYPE_NONE = 4
CLICK_ACTION_BUY = 2
CLICK_ACTION_DISABLED = 8
CLICK_ACTION_IGNORE = 9
CLICK_ACTION_NONE = 0
CLICK_ACTION_OPEN = 4
CLICK_ACTION_OPEN_MEDIA = 6
CLICK_ACTION_PAY = 3
CLICK_ACTION_PLAY = 5
CLICK_ACTION_SIT = 1
CLICK_ACTION_TOUCH = 0
CLICK_ACTION_ZOOM = 7
COMBAT_CHANNEL = 2147483646
COMBAT_LOG_ID = "45e0fcfa-2268-4490-a51c-3e51bdfe80d1"
CONTENT_TYPE_ATOM = 4
CONTENT_TYPE_FORM = 7
CONTENT_TYPE_HTML = 1
CONTENT_TYPE_JSON = 5
CONTENT_TYPE_LLSD = 6
CONTENT_TYPE_RSS = 8
CONTENT_TYPE_TEXT = 0
CONTENT_TYPE_XHTML = 3
CONTENT_TYPE_XML = 2
CONTROL_BACK = 2
CONTROL_DOWN = 32
CONTROL_FWD = 1
CONTROL_LBUTTON = 268435456
CONTROL_LEFT = 4
CONTROL_ML_LBUTTON = 1073741824
CONTROL_RIGHT = 8
CONTROL_ROT_LEFT = 256
CONTROL_ROT_RIGHT = 512
CONTROL_UP = 16
DAMAGEABLE = 32
DAMAGE_TYPE_ACID = 1
DAMAGE_TYPE_BLUDGEONING = 2
DAMAGE_TYPE_COLD = 3
DAMAGE_TYPE_ELECTRIC = 4
DAMAGE_TYPE_EMOTIONAL = 14
DAMAGE_TYPE_FIRE = 5
DAMAGE_TYPE_FORCE = 6
DAMAGE_TYPE_GENERIC = 0
DAMAGE_TYPE_IMPACT = -1
DAMAGE_TYPE_NECROTIC = 7
DAMAGE_TYPE_PIERCING = 8
DAMAGE_TYPE_POISON = 9
DAMAGE_TYPE_PSYCHIC = 10
DAMAGE_TYPE_RADIANT = 11
DAMAGE_TYPE_SLASHING = 12
DAMAGE_TYPE_SONIC = 13
DATA_BORN = 3
DATA_NAME = 2
DATA_ONLINE = 1
DATA_PAYINFO = 8
DATA_RATING = 4
DATA_SIM_POS = 5
DATA_SIM_RATING = 7
DATA_SIM_STATUS = 6
DEBUG_CHANNEL = 2147483647
DEG_TO_RAD = 0.017453293
DENSITY = 1
DEREZ_DIE = 0
DEREZ_MAKE_TEMP = 1
ENVIRONMENT_DAYINFO = 200
ENV_INVALID_AGENT = -4
ENV_INVALID_RULE = -5
ENV_NOT_EXPERIENCE = -1
ENV_NO_ENVIRONMENT = -3
ENV_NO_EXPERIENCE_LAND = -7
ENV_NO_EXPERIENCE_PERMISSION = -2
ENV_NO_PERMISSIONS = -9
ENV_THROTTLE = -8
ENV_VALIDATION_FAIL = -6
EOF = "\n\n\n"
ERR_GENERIC = -1
ERR_MALFORMED_PARAMS = -3
ERR_PARCEL_PERMISSIONS = -2
ERR_RUNTIME_PERMISSIONS = -4
ERR_THROTTLED = -5
ESTATE_ACCESS_ALLOWED_AGENT_ADD = 4
ESTATE_ACCESS_ALLOWED_AGENT_REMOVE = 8
ESTATE_ACCESS_ALLOWED_GROUP_ADD = 16
ESTATE_ACCESS_ALLOWED_GROUP_REMOVE = 32
ESTATE_ACCESS_BANNED_AGENT_ADD = 64
ESTATE_ACCESS_BANNED_AGENT_REMOVE = 128
FALSE = 0
FILTER_FLAGS = 2
FILTER_FLAG_HUDS = 1
FILTER_INCLUDE = 1
FORCE_DIRECT_PATH = 1
FRICTION = 2
GAME_CONTROL_AXIS_LEFTX = 0
GAME_CONTROL_AXIS_LEFTY = 1
GAME_CONTROL_AXIS_RIGHTX = 2
GAME_CONTROL_AXIS_RIGHTY = 3
GAME_CONTROL_AXIS_TRIGGERLEFT = 4
GAME_CONTROL_AXIS_TRIGGERRIGHT = 5
GAME_CONTROL_BUTTON_A = 1
GAME_CONTROL_BUTTON_B = 2
GAME_CONTROL_BUTTON_BACK = 16
GAME_CONTROL_BUTTON_DPAD_DOWN = 4096
GAME_CONTROL_BUTTON_DPAD_LEFT = 8192
GAME_CONTROL_BUTTON_DPAD_RIGHT = 16384
GAME_CONTROL_BUTTON_DPAD_UP = 2048
GAME_CONTROL_BUTTON_GUIDE = 32
GAME_CONTROL_BUTTON_LEFTSHOULDER = 512
GAME_CONTROL_BUTTON_LEFTSTICK = 128
GAME_CONTROL_BUTTON_MISC1 = 32768
GAME_CONTROL_BUTTON_PADDLE1 = 65536
GAME_CONTROL_BUTTON_PADDLE2 = 131072
GAME_CONTROL_BUTTON_PADDLE3 = 262144
GAME_CONTROL_BUTTON_PADDLE4 = 524288
GAME_CONTROL_BUTTON_RIGHTSHOULDER = 1024
GAME_CONTROL_BUTTON_RIGHTSTICK = 256
GAME_CONTROL_BUTTON_START = 64
GAME_CONTROL_BUTTON_TOUCHPAD = 1048576
GAME_CONTROL_BUTTON_X = 4
GAME_CONTROL_BUTTON_Y = 8
GCNP_RADIUS = 0
GCNP_STATIC = 1
GRAVITY_MULTIPLIER = 8
HORIZONTAL = 1
HTTP_ACCEPT = 8
HTTP_BODY_MAXLENGTH = 2
HTTP_BODY_TRUNCATED = 0
HTTP_CUSTOM_HEADER = 5
HTTP_EXTENDED_ERROR = 9
HTTP_METHOD = 0
HTTP_MIMETYPE = 1
HTTP_PRAGMA_NO_CACHE = 6
HTTP_USER_AGENT = 7
HTTP_VERBOSE_THROTTLE = 4
HTTP_VERIFY_CERT = 3
IMG_USE_BAKED_AUX1 = "9742065b-19b5-297c-858a-29711d539043"
IMG_USE_BAKED_AUX2 = "03642e83-2bd1-4eb9-34b4-4c47ed586d2d"
IMG_USE_BAKED_AUX3 = "edd51b77-fc10-ce7a-4b3d-011dfc349e4f"
IMG_USE_BAKED_EYES = "52cc6bb6-2ee5-e632-d3ad-50197b1dcb8a"
IMG_USE_BAKED_HAIR = "09aac1fb-6bce-0bee-7d44-caac6dbb6c63"
IMG_USE_BAKED_HEAD = "5a9f4a74-30f2-821c-b88d-70499d3e7183"
IMG_USE_BAKED_LEFTARM = "ff62763f-d60a-9855-890b-0c96f8f8cd98"
IMG_USE_BAKED_LEFTLEG = "8e915e25-31d1-cc95-ae08-d58a47488251"
IMG_USE_BAKED_LOWER = "24daea5f-0539-cfcf-047f-fbc40b2786ba"
IMG_USE_BAKED_SKIRT = "43529ce8-7faa-ad92-165a-bc4078371687"
IMG_USE_BAKED_UPPER = "ae2de45c-d252-50b8-5c6e-19f39ce79317"
INVENTORY_ALL = -1
INVENTORY_ANIMATION = 20
INVENTORY_BODYPART = 13
INVENTORY_CLOTHING = 5
INVENTORY_GESTURE = 21
INVENTORY_LANDMARK = 3
INVENTORY_MATERIAL = 57
INVENTORY_NONE = -1
INVENTORY_NOTECARD = 7
INVENTORY_OBJECT = 6
INVENTORY_SCRIPT = 10
INVENTORY_SETTING = 56
INVENTORY_SOUND = 1
INVENTORY_TEXTURE = 0
JSON_APPEND = -1
JSON_ARRAY = "\u{fdd2}"
JSON_DELETE = "\u{fdd8}"
JSON_FALSE = "\u{fdd7}"
JSON_INVALID = "\u{fdd0}"
JSON_NULL = "\u{fdd5}"
JSON_NUMBER = "\u{fdd3}"
JSON_OBJECT = "\u{fdd1}"
JSON_STRING = "\u{fdd4}"
JSON_TRUE = "\u{fdd6}"
KFM_CMD_PAUSE = 2
KFM_CMD_PLAY = 0
KFM_CMD_STOP = 1
KFM_COMMAND = 0
KFM_DATA = 2
KFM_FORWARD = 0
KFM_LOOP = 1
KFM_MODE = 1
KFM_PING_PONG = 2
KFM_REVERSE = 3
KFM_ROTATION = 1
KFM_TRANSLATION = 2
LAND_LARGE_BRUSH = 3
LAND_LEVEL = 0
LAND_LOWER = 2
LAND_MEDIUM_BRUSH = 2
LAND_NOISE = 4
LAND_RAISE = 1
LAND_REVERT = 5
LAND_SMALL_BRUSH = 1
LAND_SMOOTH = 3
LINKSETDATA_DELETE = 2
LINKSETDATA_EMEMORY = 1
LINKSETDATA_ENOKEY = 2
LINKSETDATA_EPROTECTED = 3
LINKSETDATA_MULTIDELETE = 3
LINKSETDATA_NOTFOUND = 4
LINKSETDATA_NOUPDATE = 5
LINKSETDATA_OK = 0
LINKSETDATA_RESET = 0
LINKSETDATA_UPDATE = 1
LINK_ALL_CHILDREN = -3
LINK_ALL_OTHERS = -2
LINK_ROOT = 1
LINK_SET = -1
LINK_THIS = -4
LIST_STAT_GEOMETRIC_MEAN = 9
LIST_STAT_MAX = 2
LIST_STAT_MEAN = 3
LIST_STAT_MEDIAN = 4
LIST_STAT_MIN = 1
LIST_STAT_NUM_COUNT = 8
LIST_STAT_RANGE = 0
LIST_STAT_STD_DEV = 5
LIST_STAT_SUM = 6
LIST_STAT_SUM_SQUARES = 7
LOOP = 2
MASK_BASE = 0
MASK_COMBINED = 16
MASK_EVERYONE = 3
MASK_GROUP = 2
MASK_NEXT = 4
MASK_OWNER = 1
NAK = "\n\x15\n"
NULL_KEY = uuid("00000000-0000-0000-0000-000000000000")
OBJECT_ACCOUNT_LEVEL = 41
OBJECT_ANIMATED_COUNT = 39
OBJECT_ANIMATED_SLOTS_AVAILABLE = 40
OBJECT_ATTACHED_POINT = 19
OBJECT_ATTACHED_SLOTS_AVAILABLE = 35
OBJECT_BODY_SHAPE_TYPE = 26
OBJECT_CHARACTER_TIME = 17
OBJECT_CLICK_ACTION = 28
OBJECT_CREATION_TIME = 36
OBJECT_CREATOR = 8
OBJECT_DAMAGE = 51
OBJECT_DAMAGE_TYPE = 52
OBJECT_DESC = 2
OBJECT_GROUP = 7
OBJECT_GROUP_TAG = 33
OBJECT_HEALTH = 50
OBJECT_HOVER_HEIGHT = 25
OBJECT_LAST_OWNER_ID = 27
OBJECT_LINK_NUMBER = 46
OBJECT_MASS = 43
OBJECT_MATERIAL = 42
OBJECT_NAME = 1
OBJECT_OMEGA = 29
OBJECT_OWNER = 6
OBJECT_PATHFINDING_TYPE = 20
OBJECT_PERMS = 53
OBJECT_PERMS_COMBINED = 54
OBJECT_PHANTOM = 22
OBJECT_PHYSICS = 21
OBJECT_PHYSICS_COST = 16
OBJECT_POS = 3
OBJECT_PRIM_COUNT = 30
OBJECT_PRIM_EQUIVALENCE = 13
OBJECT_RENDER_WEIGHT = 24
OBJECT_RETURN_PARCEL = 1
OBJECT_RETURN_PARCEL_OWNER = 2
OBJECT_RETURN_REGION = 4
OBJECT_REZZER_KEY = 32
OBJECT_REZ_TIME = 45
OBJECT_ROOT = 18
OBJECT_ROT = 4
OBJECT_RUNNING_SCRIPT_COUNT = 9
OBJECT_SCALE = 47
OBJECT_SCRIPT_MEMORY = 11
OBJECT_SCRIPT_TIME = 12
OBJECT_SELECT_COUNT = 37
OBJECT_SERVER_COST = 14
OBJECT_SIT_COUNT = 38
OBJECT_STREAMING_COST = 15
OBJECT_TEMP_ATTACHED = 34
OBJECT_TEMP_ON_REZ = 23
OBJECT_TEXT = 44
OBJECT_TEXT_ALPHA = 49
OBJECT_TEXT_COLOR = 48
OBJECT_TOTAL_INVENTORY_COUNT = 31
OBJECT_TOTAL_SCRIPT_COUNT = 10
OBJECT_UNKNOWN_DETAIL = -1
OBJECT_VELOCITY = 5
OPT_AVATAR = 1
OPT_CHARACTER = 2
OPT_EXCLUSION_VOLUME = 6
OPT_LEGACY_LINKSET = 0
OPT_MATERIAL_VOLUME = 5
OPT_OTHER = -1
OPT_STATIC_OBSTACLE = 4
OPT_WALKABLE = 3
PARCEL_COUNT_GROUP = 2
PARCEL_COUNT_OTHER = 3
PARCEL_COUNT_OWNER = 1
PARCEL_COUNT_SELECTED = 4
PARCEL_COUNT_TEMP = 5
PARCEL_COUNT_TOTAL = 0
PARCEL_DETAILS_AREA = 4
PARCEL_DETAILS_DESC = 1
PARCEL_DETAILS_FLAGS = 12
PARCEL_DETAILS_GROUP = 3
PARCEL_DETAILS_ID = 5
PARCEL_DETAILS_LANDING_LOOKAT = 10
PARCEL_DETAILS_LANDING_POINT = 9
PARCEL_DETAILS_NAME = 0
PARCEL_DETAILS_OWNER = 2
PARCEL_DETAILS_PRIM_CAPACITY = 7
PARCEL_DETAILS_PRIM_USED = 8
PARCEL_DETAILS_SCRIPT_DANGER = 13
PARCEL_DETAILS_SEE_AVATARS = 6
PARCEL_DETAILS_TP_ROUTING = 11
PARCEL_FLAG_ALLOW_ALL_OBJECT_ENTRY = 134217728
PARCEL_FLAG_ALLOW_CREATE_GROUP_OBJECTS = 67108864
PARCEL_FLAG_ALLOW_CREATE_OBJECTS = 64
PARCEL_FLAG_ALLOW_DAMAGE = 32
PARCEL_FLAG_ALLOW_FLY = 1
PARCEL_FLAG_ALLOW_GROUP_OBJECT_ENTRY = 268435456
PARCEL_FLAG_ALLOW_GROUP_SCRIPTS = 33554432
PARCEL_FLAG_ALLOW_LANDMARK = 8
PARCEL_FLAG_ALLOW_SCRIPTS = 2
PARCEL_FLAG_ALLOW_TERRAFORM = 16
PARCEL_FLAG_LOCAL_SOUND_ONLY = 32768
PARCEL_FLAG_RESTRICT_PUSHOBJECT = 2097152
PARCEL_FLAG_USE_ACCESS_GROUP = 256
PARCEL_FLAG_USE_ACCESS_LIST = 512
PARCEL_FLAG_USE_BAN_LIST = 1024
PARCEL_FLAG_USE_LAND_PASS_LIST = 2048
PARCEL_MEDIA_COMMAND_AGENT = 7
PARCEL_MEDIA_COMMAND_AUTO_ALIGN = 9
PARCEL_MEDIA_COMMAND_DESC = 12
PARCEL_MEDIA_COMMAND_LOOP = 3
PARCEL_MEDIA_COMMAND_LOOP_SET = 13
PARCEL_MEDIA_COMMAND_PAUSE = 1
PARCEL_MEDIA_COMMAND_PLAY = 2
PARCEL_MEDIA_COMMAND_SIZE = 11
PARCEL_MEDIA_COMMAND_STOP = 0
PARCEL_MEDIA_COMMAND_TEXTURE = 4
PARCEL_MEDIA_COMMAND_TIME = 6
PARCEL_MEDIA_COMMAND_TYPE = 10
PARCEL_MEDIA_COMMAND_UNLOAD = 8
PARCEL_MEDIA_COMMAND_URL = 5
PASSIVE = 4
PASS_ALWAYS = 1
PASS_IF_NOT_HANDLED = 0
PASS_NEVER = 2
PATROL_PAUSE_AT_WAYPOINTS = 0
PAYMENT_INFO_ON_FILE = 1
PAYMENT_INFO_USED = 2
PAY_DEFAULT = -2
PAY_HIDE = -1
PERMISSION_ATTACH = 32
PERMISSION_CHANGE_JOINTS = 256
PERMISSION_CHANGE_LINKS = 128
PERMISSION_CHANGE_PERMISSIONS = 512
PERMISSION_CONTROL_CAMERA = 2048
PERMISSION_DEBIT = 2
PERMISSION_OVERRIDE_ANIMATIONS = 32768
PERMISSION_RELEASE_OWNERSHIP = 64
PERMISSION_REMAP_CONTROLS = 8
PERMISSION_RETURN_OBJECTS = 65536
PERMISSION_SILENT_ESTATE_MANAGEMENT = 16384
PERMISSION_TAKE_CONTROLS = 4
PERMISSION_TELEPORT = 4096
PERMISSION_TRACK_CAMERA = 1024
PERMISSION_TRIGGER_ANIMATION = 16
PERM_ALL = 2147483647
PERM_COPY = 32768
PERM_MODIFY = 16384
PERM_MOVE = 524288
PERM_TRANSFER = 8192
PI = 3.14159265
PING_PONG = 8
PI_BY_TWO = 1.57079633
PRIM_ALLOW_UNSIT = 39
PRIM_ALPHA_MODE = 38
PRIM_ALPHA_MODE_BLEND = 1
PRIM_ALPHA_MODE_EMISSIVE = 3
PRIM_ALPHA_MODE_MASK = 2
PRIM_ALPHA_MODE_NONE = 0
PRIM_BUMP_BARK = 4
PRIM_BUMP_BLOBS = 12
PRIM_BUMP_BRICKS = 5
PRIM_BUMP_BRIGHT = 1
PRIM_BUMP_CHECKER = 6
PRIM_BUMP_CONCRETE = 7
PRIM_BUMP_DARK = 2
PRIM_BUMP_DISKS = 10
PRIM_BUMP_GRAVEL = 11
PRIM_BUMP_LARGETILE = 14
PRIM_BUMP_NONE = 0
PRIM_BUMP_SHINY = 19
PRIM_BUMP_SIDING = 13
PRIM_BUMP_STONE = 9
PRIM_BUMP_STUCCO = 15
PRIM_BUMP_SUCTION = 16
PRIM_BUMP_TILE = 8
PRIM_BUMP_WEAVE = 17
PRIM_BUMP_WOOD = 3
PRIM_CAST_SHADOWS = 24
PRIM_CLICK_ACTION = 43
PRIM_COLLISION_SOUND = 53
PRIM_COLOR = 18
PRIM_DAMAGE = 51
PRIM_DESC = 28
PRIM_FLEXIBLE = 21
PRIM_FULLBRIGHT = 20
PRIM_GLOW = 25
PRIM_GLTF_ALPHA_MODE_BLEND = 1
PRIM_GLTF_ALPHA_MODE_MASK = 2
PRIM_GLTF_ALPHA_MODE_OPAQUE = 0
PRIM_GLTF_BASE_COLOR = 48
PRIM_GLTF_EMISSIVE = 46
PRIM_GLTF_METALLIC_ROUGHNESS = 47
PRIM_GLTF_NORMAL = 45
PRIM_HEALTH = 52
PRIM_HOLE_CIRCLE = 16
PRIM_HOLE_DEFAULT = 0
PRIM_HOLE_SQUARE = 32
PRIM_HOLE_TRIANGLE = 48
PRIM_LINK_TARGET = 34
PRIM_MATERIAL = 2
PRIM_MATERIAL_FLESH = 4
PRIM_MATERIAL_GLASS = 2
PRIM_MATERIAL_LIGHT = 7
PRIM_MATERIAL_METAL = 1
PRIM_MATERIAL_PLASTIC = 5
PRIM_MATERIAL_RUBBER = 6
PRIM_MATERIAL_STONE = 0
PRIM_MATERIAL_WOOD = 3
PRIM_MEDIA_ALT_IMAGE_ENABLE = 0
PRIM_MEDIA_AUTO_LOOP = 4
PRIM_MEDIA_AUTO_PLAY = 5
PRIM_MEDIA_AUTO_SCALE = 6
PRIM_MEDIA_AUTO_ZOOM = 7
PRIM_MEDIA_CONTROLS = 1
PRIM_MEDIA_CONTROLS_MINI = 1
PRIM_MEDIA_CONTROLS_STANDARD = 0
PRIM_MEDIA_CURRENT_URL = 2
PRIM_MEDIA_FIRST_CLICK_INTERACT = 8
PRIM_MEDIA_HEIGHT_PIXELS = 10
PRIM_MEDIA_HOME_URL = 3
PRIM_MEDIA_MAX_HEIGHT_PIXELS = 2048
PRIM_MEDIA_MAX_URL_LENGTH = 1024
PRIM_MEDIA_MAX_WHITELIST_COUNT = 64
PRIM_MEDIA_MAX_WHITELIST_SIZE = 1024
PRIM_MEDIA_MAX_WIDTH_PIXELS = 2048
PRIM_MEDIA_PARAM_MAX = 14
PRIM_MEDIA_PERMS_CONTROL = 14
PRIM_MEDIA_PERMS_INTERACT = 13
PRIM_MEDIA_PERM_ANYONE = 4
PRIM_MEDIA_PERM_GROUP = 2
PRIM_MEDIA_PERM_NONE = 0
PRIM_MEDIA_PERM_OWNER = 1
PRIM_MEDIA_WHITELIST = 12
PRIM_MEDIA_WHITELIST_ENABLE = 11
PRIM_MEDIA_WIDTH_PIXELS = 9
PRIM_NAME = 27
PRIM_NORMAL = 37
PRIM_OMEGA = 32
PRIM_PHANTOM = 5
PRIM_PHYSICS = 3
PRIM_PHYSICS_SHAPE_CONVEX = 2
PRIM_PHYSICS_SHAPE_NONE = 1
PRIM_PHYSICS_SHAPE_PRIM = 0
PRIM_PHYSICS_SHAPE_TYPE = 30
PRIM_POINT_LIGHT = 23
PRIM_POSITION = 6
PRIM_POS_LOCAL = 33
PRIM_PROJECTOR = 42
PRIM_REFLECTION_PROBE = 44
PRIM_REFLECTION_PROBE_BOX = 1
PRIM_REFLECTION_PROBE_DYNAMIC = 2
PRIM_REFLECTION_PROBE_MIRROR = 4
PRIM_RENDER_MATERIAL = 49
PRIM_ROTATION = 8
PRIM_ROT_LOCAL = 29
PRIM_SCRIPTED_SIT_ONLY = 40
PRIM_SCULPT_FLAG_ANIMESH = 32
PRIM_SCULPT_FLAG_INVERT = 64
PRIM_SCULPT_FLAG_MIRROR = 128
PRIM_SCULPT_TYPE_CYLINDER = 4
PRIM_SCULPT_TYPE_MASK = 7
PRIM_SCULPT_TYPE_MESH = 5
PRIM_SCULPT_TYPE_PLANE = 3
PRIM_SCULPT_TYPE_SPHERE = 1
PRIM_SCULPT_TYPE_TORUS = 2
PRIM_SHINY_HIGH = 3
PRIM_SHINY_LOW = 1
PRIM_SHINY_MEDIUM = 2
PRIM_SHINY_NONE = 0
PRIM_SIT_FLAGS = 50
PRIM_SIT_TARGET = 41
PRIM_SIZE = 7
PRIM_SLICE = 35
PRIM_SPECULAR = 36
PRIM_TEMP_ON_REZ = 4
PRIM_TEXGEN = 22
PRIM_TEXGEN_DEFAULT = 0
PRIM_TEXGEN_PLANAR = 1
PRIM_TEXT = 26
PRIM_TEXTURE = 17
PRIM_TYPE = 9
PRIM_TYPE_BOX = 0
PRIM_TYPE_CYLINDER = 1
PRIM_TYPE_PRISM = 2
PRIM_TYPE_RING = 6
PRIM_TYPE_SCULPT = 7
PRIM_TYPE_SPHERE = 3
PRIM_TYPE_TORUS = 4
PRIM_TYPE_TUBE = 5
PROFILE_NONE = 0
PROFILE_SCRIPT_MEMORY = 1
PSYS_PART_BF_DEST_COLOR = 2
PSYS_PART_BF_ONE = 0
PSYS_PART_BF_ONE_MINUS_DEST_COLOR = 4
PSYS_PART_BF_ONE_MINUS_SOURCE_ALPHA = 9
PSYS_PART_BF_ONE_MINUS_SOURCE_COLOR = 5
PSYS_PART_BF_SOURCE_ALPHA = 7
PSYS_PART_BF_SOURCE_COLOR = 3
PSYS_PART_BF_ZERO = 1
PSYS_PART_BLEND_FUNC_DEST = 25
PSYS_PART_BLEND_FUNC_SOURCE = 24
PSYS_PART_BOUNCE_MASK = 4
PSYS_PART_EMISSIVE_MASK = 256
PSYS_PART_END_ALPHA = 4
PSYS_PART_END_COLOR = 3
PSYS_PART_END_GLOW = 27
PSYS_PART_END_SCALE = 6
PSYS_PART_FLAGS = 0
PSYS_PART_FOLLOW_SRC_MASK = 16
PSYS_PART_FOLLOW_VELOCITY_MASK = 32
PSYS_PART_INTERP_COLOR_MASK = 1
PSYS_PART_INTERP_SCALE_MASK = 2
PSYS_PART_MAX_AGE = 7
PSYS_PART_RIBBON_MASK = 1024
PSYS_PART_START_ALPHA = 2
PSYS_PART_START_COLOR = 1
PSYS_PART_START_GLOW = 26
PSYS_PART_START_SCALE = 5
PSYS_PART_TARGET_LINEAR_MASK = 128
PSYS_PART_TARGET_POS_MASK = 64
PSYS_PART_WIND_MASK = 8
PSYS_SRC_ACCEL = 8
PSYS_SRC_ANGLE_BEGIN = 22
PSYS_SRC_ANGLE_END = 23
PSYS_SRC_BURST_PART_COUNT = 15
PSYS_SRC_BURST_RADIUS = 16
PSYS_SRC_BURST_RATE = 13
PSYS_SRC_BURST_SPEED_MAX = 18
PSYS_SRC_BURST_SPEED_MIN = 17
PSYS_SRC_INNERANGLE = 10
PSYS_SRC_MAX_AGE = 19
PSYS_SRC_OMEGA = 21
PSYS_SRC_OUTERANGLE = 11
PSYS_SRC_PATTERN = 9
PSYS_SRC_PATTERN_ANGLE = 4
PSYS_SRC_PATTERN_ANGLE_CONE = 8
PSYS_SRC_PATTERN_ANGLE_CONE_EMPTY = 16
PSYS_SRC_PATTERN_DROP = 1
PSYS_SRC_PATTERN_EXPLODE = 2
PSYS_SRC_TARGET_KEY = 20
PSYS_SRC_TEXTURE = 12
PUBLIC_CHANNEL = 0
PURSUIT_FUZZ_FACTOR = 3
PURSUIT_GOAL_TOLERANCE = 5
PURSUIT_INTERCEPT = 4
PURSUIT_OFFSET = 1
PU_EVADE_HIDDEN = 7
PU_EVADE_SPOTTED = 8
PU_FAILURE_DYNAMIC_PATHFINDING_DISABLED = 10
PU_FAILURE_INVALID_GOAL = 3
PU_FAILURE_INVALID_START = 2
PU_FAILURE_NO_NAVMESH = 9
PU_FAILURE_NO_VALID_DESTINATION = 6
PU_FAILURE_OTHER = 1000000
PU_FAILURE_PARCEL_UNREACHABLE = 11
PU_FAILURE_TARGET_GONE = 5
PU_FAILURE_UNREACHABLE = 4
PU_GOAL_REACHED = 1
PU_SLOWDOWN_DISTANCE_REACHED = 0
RAD_TO_DEG = 57.2957795
RCERR_CAST_TIME_EXCEEDED = -3
RCERR_SIM_PERF_LOW = -2
RCERR_UNKNOWN = -1
RC_DATA_FLAGS = 2
RC_DETECT_PHANTOM = 1
RC_GET_LINK_NUM = 4
RC_GET_NORMAL = 1
RC_GET_ROOT_KEY = 2
RC_MAX_HITS = 3
RC_REJECT_AGENTS = 1
RC_REJECT_LAND = 8
RC_REJECT_NONPHYSICAL = 4
RC_REJECT_PHYSICAL = 2
RC_REJECT_TYPES = 0
REGION_FLAG_ALLOW_DAMAGE = 1
REGION_FLAG_ALLOW_DIRECT_TELEPORT = 1048576
REGION_FLAG_BLOCK_FLY = 524288
REGION_FLAG_BLOCK_FLYOVER = 134217728
REGION_FLAG_BLOCK_TERRAFORM = 64
REGION_FLAG_DISABLE_COLLISIONS = 4096
REGION_FLAG_DISABLE_PHYSICS = 16384
REGION_FLAG_FIXED_SUN = 16
REGION_FLAG_RESTRICT_PUSHOBJECT = 4194304
REGION_FLAG_SANDBOX = 256
REMOTE_DATA_CHANNEL = 1
REMOTE_DATA_REPLY = 3
REMOTE_DATA_REQUEST = 2
REQUIRE_LINE_OF_SIGHT = 2
RESTITUTION = 4
REVERSE = 4
REZ_ACCEL = 5
REZ_DAMAGE = 8
REZ_DAMAGE_TYPE = 12
REZ_FLAGS = 1
REZ_FLAG_BLOCK_GRAB_OBJECT = 128
REZ_FLAG_DIE_ON_COLLIDE = 8
REZ_FLAG_DIE_ON_NOENTRY = 16
REZ_FLAG_NO_COLLIDE_FAMILY = 64
REZ_FLAG_NO_COLLIDE_OWNER = 32
REZ_FLAG_PHANTOM = 4
REZ_FLAG_PHYSICAL = 2
REZ_FLAG_TEMP = 1
REZ_LOCK_AXES = 11
REZ_OMEGA = 7
REZ_PARAM = 0
REZ_PARAM_STRING = 13
REZ_POS = 2
REZ_ROT = 3
REZ_SOUND = 9
REZ_SOUND_COLLIDE = 10
REZ_VEL = 4
ROTATE = 32
SCALE = 64
SCRIPTED = 8
SIM_STAT_ACTIVE_SCRIPT_COUNT = 12
SIM_STAT_AGENT_COUNT = 10
SIM_STAT_AGENT_MS = 7
SIM_STAT_AGENT_UPDATES = 2
SIM_STAT_AI_MS = 26
SIM_STAT_ASSET_DOWNLOADS = 15
SIM_STAT_ASSET_UPLOADS = 16
SIM_STAT_CHILD_AGENT_COUNT = 11
SIM_STAT_FRAME_MS = 3
SIM_STAT_IMAGE_MS = 8
SIM_STAT_IO_PUMP_MS = 24
SIM_STAT_NET_MS = 4
SIM_STAT_OTHER_MS = 5
SIM_STAT_PACKETS_IN = 13
SIM_STAT_PACKETS_OUT = 14
SIM_STAT_PCT_CHARS_STEPPED = 0
SIM_STAT_PHYSICS_FPS = 1
SIM_STAT_PHYSICS_MS = 6
SIM_STAT_PHYSICS_OTHER_MS = 20
SIM_STAT_PHYSICS_SHAPE_MS = 19
SIM_STAT_PHYSICS_STEP_MS = 18
SIM_STAT_SCRIPT_EPS = 21
SIM_STAT_SCRIPT_MS = 9
SIM_STAT_SCRIPT_RUN_PCT = 25
SIM_STAT_SLEEP_MS = 23
SIM_STAT_SPARE_MS = 22
SIM_STAT_UNACKED_BYTES = 17
SIT_FLAG_ALLOW_UNSIT = 2
SIT_FLAG_NO_COLLIDE = 16
SIT_FLAG_NO_DAMAGE = 32
SIT_FLAG_SCRIPTED_ONLY = 4
SIT_FLAG_SIT_TARGET = 1
SIT_INVALID_AGENT = -4
SIT_INVALID_LINK = -5
SIT_INVALID_OBJECT = -7
SIT_NOT_EXPERIENCE = -1
SIT_NO_ACCESS = -6
SIT_NO_EXPERIENCE_PERMISSION = -2
SIT_NO_SIT_TARGET = -3
SKY_AMBIENT = 0
SKY_BLUE = 22
SKY_CLOUDS = 2
SKY_CLOUD_TEXTURE = 19
SKY_DOME = 4
SKY_GAMMA = 5
SKY_GLOW = 6
SKY_HAZE = 23
SKY_LIGHT = 8
SKY_MOON = 9
SKY_MOON_TEXTURE = 20
SKY_PLANET = 10
SKY_REFLECTION_PROBE_AMBIANCE = 24
SKY_REFRACTION = 11
SKY_STAR_BRIGHTNESS = 13
SKY_SUN = 14
SKY_SUN_TEXTURE = 21
SKY_TEXTURE_DEFAULTS = 1
SKY_TRACKS = 15
SMOOTH = 16
SOUND_LOOP = 1
SOUND_PLAY = 0
SOUND_SYNC = 4
SOUND_TRIGGER = 2
SQRT2 = 1.41421356
STATUS_BLOCK_GRAB = 64
STATUS_BLOCK_GRAB_OBJECT = 1024
STATUS_BOUNDS_ERROR = 1002
STATUS_CAST_SHADOWS = 512
STATUS_DIE_AT_EDGE = 128
STATUS_DIE_AT_NO_ENTRY = 2048
STATUS_INTERNAL_ERROR = 1999
STATUS_MALFORMED_PARAMS = 1000
STATUS_NOT_FOUND = 1003
STATUS_NOT_SUPPORTED = 1004
STATUS_OK = 0
STATUS_PHANTOM = 16
STATUS_PHYSICS = 1
STATUS_RETURN_AT_EDGE = 256
STATUS_ROTATE_X = 2
STATUS_ROTATE_Y = 4
STATUS_ROTATE_Z = 8
STATUS_SANDBOX = 32
STATUS_TYPE_MISMATCH = 1001
STATUS_WHITELIST_FAILED = 2001
STRING_TRIM = 3
STRING_TRIM_HEAD = 1
STRING_TRIM_TAIL = 2
TARGETED_EMAIL_OBJECT_OWNER = 2
TARGETED_EMAIL_ROOT_CREATOR = 1
TERRAIN_DETAIL_1 = 0
TERRAIN_DETAIL_2 = 1
TERRAIN_DETAIL_3 = 2
TERRAIN_DETAIL_4 = 3
TERRAIN_HEIGHT_RANGE_NE = 7
TERRAIN_HEIGHT_RANGE_NW = 6
TERRAIN_HEIGHT_RANGE_SE = 5
TERRAIN_HEIGHT_RANGE_SW = 4
TERRAIN_PBR_OFFSET_1 = 16
TERRAIN_PBR_OFFSET_2 = 17
TERRAIN_PBR_OFFSET_3 = 18
TERRAIN_PBR_OFFSET_4 = 19
TERRAIN_PBR_ROTATION_1 = 12
TERRAIN_PBR_ROTATION_2 = 13
TERRAIN_PBR_ROTATION_3 = 14
TERRAIN_PBR_ROTATION_4 = 15
TERRAIN_PBR_SCALE_1 = 8
TERRAIN_PBR_SCALE_2 = 9
TERRAIN_PBR_SCALE_3 = 10
TERRAIN_PBR_SCALE_4 = 11
TEXTURE_BLANK = "5748decc-f629-461c-9a36-a35a221fe21f"
TEXTURE_DEFAULT = "89556747-24cb-43ed-920b-47caed15465f"
TEXTURE_MEDIA = "8b5fec65-8d8d-9dc5-cda8-8fdf2716e361"
TEXTURE_PLYWOOD = "89556747-24cb-43ed-920b-47caed15465f"
TEXTURE_TRANSPARENT = "8dcd4a48-2d37-4909-9f78-f7a9eb4ef903"
TOUCH_INVALID_FACE = -1
TOUCH_INVALID_TEXCOORD = vector.create(-1, -1, 0)
TOUCH_INVALID_VECTOR = vector.create(0, 0, 0)
TP_ROUTING_BLOCKED = 0
TP_ROUTING_FREE = 2
TP_ROUTING_LANDINGP = 1
TRANSFER_BAD_OPTS = -1
TRANSFER_BAD_ROOT = -5
TRANSFER_DEST = 0
TRANSFER_FLAGS = 1
TRANSFER_FLAG_COPY = 4
TRANSFER_FLAG_RESERVED = 1
TRANSFER_FLAG_TAKE = 2
TRANSFER_NO_ATTACHMENT = -7
TRANSFER_NO_ITEMS = -4
TRANSFER_NO_PERMS = -6
TRANSFER_NO_TARGET = -2
TRANSFER_OK = 0
TRANSFER_THROTTLE = -3
TRAVERSAL_TYPE = 7
TRAVERSAL_TYPE_FAST = 1
TRAVERSAL_TYPE_NONE = 2
TRAVERSAL_TYPE_SLOW = 0
TRUE = 1
TWO_PI = 6.2831853
TYPE_FLOAT = 2
TYPE_INTEGER = 1
TYPE_INVALID = 0
TYPE_KEY = 4
TYPE_ROTATION = 6
TYPE_STRING = 3
TYPE_VECTOR = 5
URL_REQUEST_DENIED = "URL_REQUEST_DENIED"
URL_REQUEST_GRANTED = "URL_REQUEST_GRANTED"
VEHICLE_ANGULAR_DEFLECTION_EFFICIENCY = 32
VEHICLE_ANGULAR_DEFLECTION_TIMESCALE = 33
VEHICLE_ANGULAR_FRICTION_TIMESCALE = 17
VEHICLE_ANGULAR_MOTOR_DECAY_TIMESCALE = 35
VEHICLE_ANGULAR_MOTOR_DIRECTION = 19
VEHICLE_ANGULAR_MOTOR_TIMESCALE = 34
VEHICLE_BANKING_EFFICIENCY = 38
VEHICLE_BANKING_MIX = 39
VEHICLE_BANKING_TIMESCALE = 40
VEHICLE_BUOYANCY = 27
VEHICLE_FLAG_BLOCK_INTERFERENCE = 1024
VEHICLE_FLAG_CAMERA_DECOUPLED = 512
VEHICLE_FLAG_HOVER_GLOBAL_HEIGHT = 16
VEHICLE_FLAG_HOVER_TERRAIN_ONLY = 8
VEHICLE_FLAG_HOVER_UP_ONLY = 32
VEHICLE_FLAG_HOVER_WATER_ONLY = 4
VEHICLE_FLAG_LIMIT_MOTOR_UP = 64
VEHICLE_FLAG_LIMIT_ROLL_ONLY = 2
VEHICLE_FLAG_MOUSELOOK_BANK = 256
VEHICLE_FLAG_MOUSELOOK_STEER = 128
VEHICLE_FLAG_NO_DEFLECTION_UP = 1
VEHICLE_FLAG_NO_FLY_UP = 1
VEHICLE_HOVER_EFFICIENCY = 25
VEHICLE_HOVER_HEIGHT = 24
VEHICLE_HOVER_TIMESCALE = 26
VEHICLE_LINEAR_DEFLECTION_EFFICIENCY = 28
VEHICLE_LINEAR_DEFLECTION_TIMESCALE = 29
VEHICLE_LINEAR_FRICTION_TIMESCALE = 16
VEHICLE_LINEAR_MOTOR_DECAY_TIMESCALE = 31
VEHICLE_LINEAR_MOTOR_DIRECTION = 18
VEHICLE_LINEAR_MOTOR_OFFSET = 20
VEHICLE_LINEAR_MOTOR_TIMESCALE = 30
VEHICLE_REFERENCE_FRAME = 44
VEHICLE_TYPE_AIRPLANE = 4
VEHICLE_TYPE_BALLOON = 5
VEHICLE_TYPE_BOAT = 3
VEHICLE_TYPE_CAR = 2
VEHICLE_TYPE_NONE = 0
VEHICLE_TYPE_SLED = 1
VEHICLE_VERTICAL_ATTRACTION_EFFICIENCY = 36
VEHICLE_VERTICAL_ATTRACTION_TIMESCALE = 37
VERTICAL = 0
WANDER_PAUSE_AT_WAYPOINTS = 0
WATER_BLUR_MULTIPLIER = 100
WATER_FOG = 101
WATER_FRESNEL = 102
WATER_NORMAL_SCALE = 104
WATER_NORMAL_TEXTURE = 107
WATER_REFRACTION = 105
WATER_TEXTURE_DEFAULTS = 103
WATER_WAVE_DIRECTION = 106
XP_ERROR_EXPERIENCES_DISABLED = 2
XP_ERROR_EXPERIENCE_DISABLED = 8
XP_ERROR_EXPERIENCE_SUSPENDED = 9
XP_ERROR_INVALID_EXPERIENCE = 7
XP_ERROR_INVALID_PARAMETERS = 3
XP_ERROR_KEY_NOT_FOUND = 14
XP_ERROR_MATURITY_EXCEEDED = 16
XP_ERROR_NONE = 0
XP_ERROR_NOT_FOUND = 6
XP_ERROR_NOT_PERMITTED = 4
XP_ERROR_NOT_PERMITTED_LAND = 17
XP_ERROR_NO_EXPERIENCE = 5
XP_ERROR_QUOTA_EXCEEDED = 11
XP_ERROR_REQUEST_PERM_TIMEOUT = 18
XP_ERROR_RETRY_UPDATE = 15
XP_ERROR_STORAGE_EXCEPTION = 13
XP_ERROR_STORE_DISABLED = 12
XP_ERROR_THROTTLED = 1
XP_ERROR_UNKNOWN_ERROR = 10
ZERO_ROTATION = nil
ZERO_VECTOR = vector.create(0, 0, 0)

internal = {
	-- object properties
	id = uuid("6e2809b3-3563-43b3-896b-e1c46ba5b46a"),
	name = "Object",
	description = "",

	position = vector.create(128, 128, 25.25),
	-- rotation = quaternion.identity,
	scale = vector.create(0.5, 0.5, 0.5),

	color = {
		vector.create(1, 1, 1),
		vector.create(1, 1, 1),
		vector.create(1, 1, 1),
		vector.create(1, 1, 1),
		vector.create(1, 1, 1),
	},

	alpha = table.create(6, 1),
	diffuse_textures = table.create(6, TEXTURE_PLYWOOD),

	-- get time offset
	time_offset = 0,

	-- linkset data
	data = {} :: { [string]: { value: string, pass: string? } },

	-- owner properties
	owner = {
		id = uuid("a2e76fcd-9360-4f6d-a924-000000000003"),
		name = "Philip Linden",
		username = "philip.linden",
	},

	CHAT_DEBUG = 1,
	CHAT_OWNER = 2,
	CHAT_WHISPER = 3,
	CHAT_SAY = 4,
	CHAT_SHOUT = 5,
	CHAT_REGION = 6,
	CHAT_INSTANT_MESSAGE = 7,

	listener_handles = {} :: {
		{
			active: boolean,
			channel: number,
			name: string?,
			id: uuid?,
			text: string?,
			handle: number,
		}
	},

	listen_handle_index = 0,
}

internal.reset = function()
	error("#!SLUA:RESET_SCRIPT")
end

internal.stop = function()
	error("#!SLUA:STOP_SCRIPT")
end

internal.die = function()
	error("#!SLUA:DIED")
end

internal.read = function(method: string, data: any): (() -> any)?
	local result = __INTERNAL_DO_NOT_USE_calljs(method, data)

	if type(result) == "function" then
		return result()
	end

	return nil
end

internal.chat = function(chat_type: number, message: string)
	if message == "" then
		return
	end

	if type(message) ~= "string" then
		error(
			"#!SLUA:ERROR\t"
				.. tostring(debug.info(2, "l"))
				.. "\tinvalid argument to chat function (string expected, got "
				.. type(message)
				.. ")"
		)
	end

	print("#!SLUA:CHAT", os.time(), os.clock(), chat_type, internal.name, message)
end

internal.protect_max_listeners = function()
	local max_listeners = 65
	local count = 0

	for _, listener in internal.listener_handles do
		if listener.active then
			count += 1
		end
	end

	if count >= max_listeners then
		error(
			"#!SLUA:ERROR\t"
				.. tostring(debug.info(4, "l"))
				.. "\tmax listeners reached"
		)
	end
end

internal.add_listener = function(
	channel: number,
	name: string,
	id: uuid,
	text: string
)
	internal.listen_handle_index += 1

	table.insert(internal.listener_handles, {
		active = true,
		channel = channel,
		name = if not name or name == "" then nil else name,
		id = if not id
				or tostring(id) == ""
				or tostring(id) == tostring(NULL_KEY)
			then nil
			else uuid(id),
		text = if not text or text == "" then nil else text,
		handle = internal.listen_handle_index,
	})

	internal.protect_max_listeners()

	return internal.listen_handle_index
end

internal.toggle_listener = function(
	channel_handle: number,
	active: number | boolean
)
	if internal.listener_handles[channel_handle] then
		internal.listener_handles[channel_handle].active = if active == 1
				or active == true
			then true
			else false
	end

	internal.protect_max_listeners()
end

internal.remove_listener = function(channel_handle: number)
	if internal.listener_handles[channel_handle] then
		internal.listener_handles[channel_handle] = nil
	end
end

internal.set_position = function(link: number, position: vector)
	if type(link) ~= "number" or type(position) ~= "vector" then
		return
	end

	internal.position = position

	print(
		"#!SLUA:SET_POSITION",
		link,
		internal.position.x,
		internal.position.y,
		internal.position.z
	)
end

internal.set_scale = function(link: number, scale: vector)
	if type(link) ~= "number" or type(scale) ~= "vector" then
		return
	end

	internal.scale = scale

	print(
		"#!SLUA:SET_SCALE",
		link,
		internal.scale.x,
		internal.scale.y,
		internal.scale.z
	)
end

internal.set_rotation = function(link: number, rotation: quaternion)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(3, "l"))}\tset_rotation: not implemented`
	)
end

internal.set_color = function(link: number, color: vector, face: number)
	if
		type(link) ~= "number"
		or type(color) ~= "vector"
		or type(face) ~= "number"
	then
		return
	end

	-- TODO: validate this
	if link ~= LINK_ROOT and link ~= LINK_THIS then
		return
	end

	if face >= 0 then
		face += 1
	end

	if face > ll.GetNumberOfSides() then
		return
	end

	internal.color[face] = color

	print("#!SLUA:SET_COLOR", link, color.x, color.y, color.z, face)
end

internal.get_color = function(face: number)
	if face == ALL_SIDES then
		local average = vector.zero

		for i = 1, ll.GetNumberOfSides() do
			average += internal.color[i]
		end

		return average / ll.GetNumberOfSides()
	end

	if face >= 0 then
		face += 1
	end

	if face > ll.GetNumberOfSides() then
		return vector.zero
	end

	return internal.color[face]
end

internal.set_alpha = function(link: number, alpha: number, face: number)
	if
		type(link) ~= "number"
		or type(alpha) ~= "vector"
		or type(face) ~= "number"
	then
		return
	end

	-- TODO: validate this
	if link ~= LINK_ROOT and link ~= LINK_THIS then
		return
	end

	internal.alpha[face] = alpha

	print("#!SLUA:SET_ALPHA", link, alpha, face)
end

internal.get_alpha = function(face: number)
	if face == ALL_SIDES then
		local sum = 0

		for i = 1, ll.GetNumberOfSides() do
			sum += internal.alpha[i]
		end

		return sum
	end

	if face >= 0 then
		face += 1
	end

	if face > ll.GetNumberOfSides() then
		return 0
	end

	return internal.alpha[face]
end

internal.set_diffuse_texture = function(
	link_number: number,
	face: number,
	texture: string
)
	face += 1

	if
		type(link_number) ~= "number"
		or type(face) ~= "number"
		or (type(texture) ~= "string" and getmetatable(texture) ~= __INTERNAL_DO_NOT_USE_uuid)
		or face < 1
		or face > ll.GetNumberOfSides()
	then
		return
	end

	internal.diffuse_textures[face] = tostring(texture or NULL_KEY)
end

internal.get_diffuse_texture = function(link_number: number, face: number)
	face += 1

	if
		type(link_number) ~= "number"
		or type(face) ~= "number"
		or face < 1
		or face > ll.GetNumberOfSides()
	then
		return tostring(NULL_KEY)
	end

	return tostring(internal.diffuse_textures[face] or NULL_KEY)
end

at_rot_target = function() end

internal.at_rot_target = function(
	handle: number,
	rotation: { number },
	ourRotation: { number }
)
	if type(at_rot_target) == "function" then
		error("at_rot_target: not implemented")
	end
end

at_target = function(handle: number, position: vector, ourPosition: vector) end

internal.at_target = function(
	handle: number,
	position: { number },
	ourPosition: { number }
)
	if type(at_target) == "function" then
		at_target(
			handle,
			vector.create(position[1], position[2], position[3]),
			vector.create(ourPosition[1], ourPosition[2], ourPosition[3])
		)
	end
end

attach = function(key: uuid) end

internal.attach = function(key: uuid)
	if type(attach) == "function" then
		attach(key)
	end
end

changed = function(detected: number) end

internal.changed = function(detected: number?)
	if type(changed) == "function" then
		changed(detected or 0)
	end
end

collision_start = function(detected: number) end
collision = function(detected: number) end
collision_end = function(detected: number) end

internal.collision = function(detected: number?)
	if type(collision_start) == "function" then
		collision_start(detected or 1)
	end

	if type(collision) == "function" then
		collision(detected or 1)
	end

	if type(collision_end) == "function" then
		collision_end(detected or 1)
	end
end

control = function(id: uuid, level: number, edge: number) end

internal.control = function(id: uuid, level: number, edge: number)
	if type(control) == "function" then
		control(id, level, edge)
	end
end

dataserver = function(id: uuid, data: string) end

internal.dataserver = function(id: uuid, data: string)
	if type(dataserver) == "function" then
		dataserver(id, data)
	end
end

email = function(
	time: string,
	address: string,
	subject: string,
	message: string,
	numLeft: number
)
	-- user implemented
end

internal.email = function(
	time: string,
	address: string,
	subject: string,
	message: string,
	numLeft: number
)
	if type(email) == "function" then
		email(time, address, subject, message, numLeft)
	end
end

experience_permissions = function(id: uuid) end

internal.experience_permissions = function(id: uuid)
	if type(experience_permissions) == "function" then
		experience_permissions(id)
	end
end

experience_permissions_denied = function(id: uuid, reason: number) end

internal.experience_permissions_denied = function(id: uuid, reason: number)
	if type(experience_permissions_denied) == "function" then
		experience_permissions_denied(id, reason)
	end
end

final_damage = function(damage: number) end

internal.final_damage = function(damage: number?)
	if type(damage) == "function" then
		final_damage(damage or 1)
	end
end

game_control = function(id: uuid, levels: number, axis: { number }) end

internal.game_control = function(id: uuid, levels: number, axis: { number })
	if type(game_control) == "function" then
		game_control(id, levels, axis)
	end
end

http_request = function(id: uuid, method: string, body: string) end

internal.http_request = function(id: uuid, method: string, body: string)
	if type(http_request) == "function" then
		http_request(id, method, body)
	end
end

http_response = function(
	id: uuid,
	status: number,
	metadata: { number },
	body: string
)
end

internal.http_response = function(
	id: uuid,
	status: number,
	metadata: { number },
	body: string
)
	if type(http_response) == "function" then
		http_response(id, status, metadata, body)
	end
end

land_collision_start = function(position: vector) end
land_collision = function(position: vector) end
land_collision_end = function(position: vector) end

internal.land_collision = function(position: { number })
	local position = vector.create(position[1], position[2], position[3])

	if type(land_collision_start) == "function" then
		land_collision_start(position)
	end

	if type(land_collision) == "function" then
		land_collision(position)
	end

	if type(land_collision_end) == "function" then
		land_collision_end(position)
	end
end

linkset_data = function(action: number, key: string, value: string) end

internal.linkset_data = function(action: number, key: string, value: string)
	if type(linkset_data) == "function" then
		linkset_data(action, key, value)
	end
end

link_message = function(
	sender: number,
	integer: number,
	data: string,
	key: uuid
)
end

internal.link_message = function(
	sender: number,
	integer: number,
	data: string,
	key: uuid
)
	if type(link_message) == "function" then
		link_message(sender, integer, data, key)
	end
end

listen = function(channel: number, name: string, key: uuid, message: string) end

internal.listen = function(
	channel: number,
	name: string,
	key: uuid,
	message: string
)
	if type(listen) ~= "function" then
		return
	end

	for _, listener in internal.listener_handles do
		if
			listener.channel == channel
			and listener.active
			and (not listener.name or listener.name == name)
			and (not listener.id or tostring(listener.id) == tostring(key))
			and (not listener.text or listener.text == message)
		then
			listen(channel, name, key, message)
			break
		end
	end
end

money = function(key: uuid, amount: number) end

internal.money = function(key: uuid, amount: number?)
	if type(money) == "function" then
		money(key, amount or 0)
	end
end

moving_start = function() end

internal.moving_start = function()
	if type(moving_start) == "function" then
		moving_start()
	end
end

moving_end = function() end

internal.moving_end = function()
	if type(moving_end) == "function" then
		moving_end()
	end
end

not_at_rot_target = function() end

internal.not_at_rot_target = function()
	if type(not_at_rot_target) == "function" then
		not_at_rot_target()
	end
end

not_at_target = function() end

internal.not_at_target = function()
	if type(not_at_target) == "function" then
		not_at_target()
	end
end

no_sensor = function() end

internal.no_sensor = function()
	if type(no_sensor) == "function" then
		no_sensor()
	end
end

object_rez = function(key: uuid) end

internal.object_rez = function(key: uuid?)
	if type(object_rez) == "function" then
		object_rez(key or "")
	end
end

on_damage = function(damage: number) end

internal.on_damage = function(damage: number?)
	if type(on_damage) == "function" then
		on_damage(damage or 1)
	end
end

on_death = function() end

internal.on_death = function()
	if type(on_death) == "function" then
		on_death()
	end
end

on_rez = function(param: number) end

internal.on_rez = function(param: number?)
	if type(on_rez) == "function" then
		on_rez(param or 0)
	end
end

path_update = function() end

internal.path_update = function(type: number, reserved: {}?)
	if type(path_update) == "function" then
		path_update(type, reserved or {})
	end
end

run_time_permissions = function(permissions: number) end

internal.run_time_permissions = function(permissions: number?)
	if type(run_time_permissions) == "function" then
		run_time_permissions(permissions or 0)
	end
end

sensor = function(detected: number) end

internal.sensor = function(detected: number?)
	if type(sensor) == "function" then
		sensor(detected or 1)
	end
end

touch_start = function(detected: number) end
touch = function(detected: number) end
touch_end = function(detected: number) end

internal.touch = function(detected: number?)
	if type(touch_start) == "function" then
		touch_start(detected or 1)
	end

	if type(touch) == "function" then
		touch(detected or 1)
	end

	if type(touch_end) == "function" then
		touch_end(detected or 1)
	end
end

transaction_result = function(id: uuid, success: number, data: string) end

internal.transaction_result = function(id: uuid, success: number, data: string)
	if type(transaction_result) == "function" then
		transaction_result(id, success, data)
	end
end

lljson = {}

lljson.encode = function(value: any)
	return internal.read("JSON.stringify", value)
end

lljson.decode = function(json: string)
	return internal.read("JSON.decode", json)
end

llbase64 = {}

llbase64.encode = function(value: string)
	return internal.read("btoa", value)
end

llbase64.decode = function(base64: string, as_buffer: boolean?)
	if as_buffer then
		error(
			`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tllbase64.decode: as buffer not yet supported`
		)
	end

	return internal.read("atob", base64)
end

ll = {}

ll.Abs = function(value: number)
	return math.abs(value)
end

ll.Acos = function(value: number)
	return math.acos(value)
end

ll.AddToLandBanList = function(id: uuid, hours: number)
	print("#!SLUA:ADD_TO_LAND_BAN_LIST", id, hours)
end

ll.AddToLandPassList = function(id: uuid, hours: number)
	print("#!SLUA:ADD_TO_LAND_PASS_LIST", id, hours)
end

ll.AdjustDamage = function(number: number, damage: number)
	print("#!SLUA:ADJUST_DAMAGE", number, damage)
end

ll.AdjustSoundVolume = function(volume: number)
	print("#!SLUA:ADJUST_SOUND_VOLUME", volume)
end

ll.AgentInExperience = function(id: uuid)
	return 0
end

ll.AllowInventoryDrop = function(flag: number)
	print("#!SLUA:ALLOW_INVENTORY_DROP", flag)
end

ll.AngleBetween = function(rot1: quaternion, rot2: quaternion)
	return 0
end

ll.ApplyImpulse = function(force: vector, relative: number)
	print("#!SLUA:APPLY_IMPULSE", force, relative)
end

ll.ApplyRotationalImpulse = function(force: vector, relative: number)
	print("#!SLUA:APPLY_ROTATIONAL_IMPULSE", force, relative)
end

ll.Asin = function(value: number)
	return math.asin(value)
end

ll.Atan2 = function(y: number, x: number)
	return math.atan2(y, x)
end

ll.AttachToAvatar = function(attachment_point: number)
	print("#!SLUA:ATTACH_TO_AVATAR", attachment_point)
end

ll.AttachToAvatarTemp = function(attach_point: number)
	print("#!SLUA:ATTACH_TO_AVATAR_TEMP", attach_point)
end

ll.AvatarOnLinkSitTarget = function(link_number: number)
	return NULL_KEY
end

ll.AvatarOnSitTarget = function()
	return NULL_KEY
end

ll.Axes2Rot = function(forward: vector, left: vector, up: vector)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\taxis2rot: not implemented`
	)
end

ll.AxisAngle2Rot = function(axis: vector, angle: number)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tangleaxis2rot: not implemented`
	)
end

ll.Base64ToInteger = function(text: string)
	local bytes = llbase64.decode(text)
	local value = 0

	for i = 1, #bytes do
		local byte = bytes:byte(i)
		value = value * 256 + byte
	end

	return value
end

ll.Base64ToString = function(text: string)
	return llbase64.decode(text)
end

ll.BreakAllLinks = function()
	print("#!SLUA:BREAK_ALL_LINKS")
end

ll.BreakLink = function(link_number: number)
	print("#!SLUA:BREAK_LINK", link_number)
end

ll.CSV2List = function(text: string)
	return {}
end

ll.CastRay = function(start: vector, finish: vector, options: list)
	return {}
end

ll.Ceil = function(value: number)
	return math.ceil(value)
end

ll.Char = function(value: number)
	return utf8.char(value)
end

ll.ClearCameraParams = function()
	print("#!SLUA:CLEAR_CAMERA_PARAMS")
end

ll.ClearLinkMedia = function(link: number, face: number)
	print("#!SLUA:CLEAR_LINK_MEDIA", link, face)
end

ll.ClearPrimMedia = function(face: number)
	print("#!SLUA:CLEAR_PRIM_MEDIA", face)
end

ll.CloseRemoteDataChannel = function(id: uuid)
	print("#!SLUA:CLOSE_REMOTE_DATA_CHANNEL", id)
end

ll.Cloud = function(offset: vector)
	return 0
end

ll.CollisionFilter = function(object_name: string, id: uuid, accept: number)
	return nil
end

ll.CollisionSound = function(impact_sound: string, impact_volume: number)
	print("#!SLUA:COLLISION_SOUND", impact_sound, impact_volume)
end

ll.CollisionSprite = function(impact_sprite: string)
	-- this doesn't do anything ingame
end

ll.ComputeHash = function(message: string, algorithm: string)
	return ""
end

ll.Cos = function(theta: number)
	return math.cos(theta)
end

ll.CreateCharacter = function(options: list)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tcreatecharacter: not implemented`
	)
end

ll.CreateKeyValue = function(key: string, value: string)
	return NULL_KEY
end

ll.CreateLink = function(target_prim: uuid, parent: number)
	print("#!SLUA:CREATE_LINK", target_prim, parent)
end

ll.Damage = function(target: uuid, damage: number, type: number)
	print("#!SLUA:DAMAGE", target, damage, type)
end

ll.DataSizeKeyValue = function()
	return NULL_KEY
end

ll.DeleteCharacter = function()
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tdeletecharacter: not implemented`
	)
end

ll.DeleteKeyValue = function(key: string)
	print("#!SLUA:DELETE_KEY_VALUE", key)
end

ll.DeleteSubList = function(source: list, start: number, finish: number)
	return {}
end

ll.DeleteSubString = function(source: string, start: number, finish: number)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tdeletesubstring: not implemented`
	)
end

ll.DerezObject = function(id: uuid, flags: number)
	print("#!SLUA:DEREZ_OBJECT", id, flags)

	return 0
end

ll.DetachFromAvatar = function()
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tdetachfromavatar: not implemented`
	)
end

ll.DetectedDamage = function(number: number)
	return {}
end

ll.DetectedGrab = function(number: number)
	return vector.zero
end

ll.DetectedGroup = function(number: number)
	return false
end

ll.DetectedKey = function(number: number)
	if number == 0 then
		return internal.id
	end

	return NULL_KEY
end

ll.DetectedLinkNumber = function(number: number)
	return 0
end

ll.DetectedName = function(number: number)
	if number == 0 then
		return internal.owner.name
	end

	return ""
end

ll.DetectedOwner = function(number: number)
	if number == 0 then
		return internal.owner.id
	end

	return NULL_KEY
end

ll.DetectedPos = function(number: number)
	return vector.zero
end

ll.DetectedRezzer = function(number: number)
	return NULL_KEY
end

ll.DetectedRot = function(number: number)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tdetectedrot: not implemented`
	)
end

ll.DetectedTouchBinormal = function(index: number)
	return vector.zero
end

ll.DetectedTouchFace = function(index: number)
	return 0
end

ll.DetectedTouchNormal = function(index: number)
	return vector.zero
end

ll.DetectedTouchPos = function(index: number)
	return vector.zero
end

ll.DetectedTouchST = function(index: number)
	return vector.zero
end

ll.DetectedTouchUV = function(index: number)
	return vector.zero
end

ll.DetectedType = function(number: number)
	if number == 0 then
		return AGENT
	end

	return 0
end

ll.DetectedVel = function(number: number)
	return vector.zero
end

ll.Dialog = function(id: uuid, text: string, buttons: list, channel: number)
	print("#!SLUA:DIALOG", id, text, buttons, channel)
end

ll.Die = function()
	internal.die()
end

ll.DumpList2String = function(source: list, separator: string)
	return table.concat(source, separator)
end

ll.EdgeOfWorld = function(position: vector, direction: vector)
	return 0
end

ll.EjectFromLand = function(id: uuid)
	print("#!SLUA:EJECT_FROM_LAND", id)
end

ll.Email = function(address: string, subject: string, text: string)
	error(`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\temail: not implemented`)
end

ll.EscapeURL = function(url: string)
	return url:gsub("([^%w%.%-])", function(char)
		return string.format("%%%02X", string.byte(char))
	end)
end

ll.Euler2Rot = function(vec: vector)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\teuler2rot: not implemented`
	)
end

ll.Evade = function(id: uuid, options: list)
	error(`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tevade: not implemented`)
end

ll.ExecCharacterCmd = function(command: number, options: list)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\texeccharactercmd: not implemented`
	)
end

ll.Fabs = function(value: number)
	return math.abs(value)
end

ll.FindNotecardTextCount = function(
	notecard_name: string,
	pattern: string,
	options: list
)
	return NULL_KEY
end

ll.FindNotecardTextSync = function(
	notecard_name: string,
	pattern: string,
	match: number,
	count: number,
	options: list
)
	return {}
end

ll.FleeFrom = function(source: vector, distance: number, options: list)
	error(`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tflee: not implemented`)
end

ll.Floor = function(value: number)
	return math.floor(value)
end

ll.ForceMouselook = function(enable: number)
	print("#!SLUA:FORCE_MOUSELOOK", enable)
end

ll.Frand = function(magnitude: number)
	return math.random() * magnitude
end

ll.GenerateKey = function()
	local function random_hex()
		return string.format("%x", math.random(0, 15))
	end

	local uuid = string.format(
		"%s%s-%s-%s-%s-%s%s%s",
		random_hex(),
		random_hex(),
		random_hex(),
		random_hex(),
		random_hex(),
		random_hex(),
		random_hex(),
		random_hex(),
		random_hex(),
		random_hex()
	)

	uuid = uuid:sub(1, 14) .. "4" .. uuid:sub(15, 36)
	uuid = uuid:sub(1, 19)
		.. string.char(bit32.bor(bit32.band(uuid:byte(20), 0x3f), 0x80))
		.. uuid:sub(21)

	return uuid
end

ll.GetAccel = function()
	return vector.zero
end

ll.GetAgentInfo = function(id: uuid)
	return 0
end

ll.GetAgentLanguage = function(id: uuid)
	return "en"
end

ll.GetAgentList = function(scope: number, options: list)
	return {}
end

ll.GetAgentSize = function(id: uuid)
	return vector.zero
end

ll.GetAlpha = function(face: number)
	return internal.get_alpha(face)
end

ll.GetAndResetTime = function()
	local time = ll.GetTime()

	ll.ResetTime()

	return time
end

ll.GetAnimation = function(id: uuid)
	return ""
end

ll.GetAnimationList = function(id: uuid)
	return {}
end

ll.GetAnimationOverride = function(animation_state: string)
	return ""
end

ll.GetAttached = function()
	return 0
end

ll.GetAttachedList = function(id: uuid)
	return {}
end

ll.GetAttachedListFiltered = function(id: uuid, options: list)
	return {}
end

ll.GetBoundingBox = function(id: uuid)
	return {}
end

ll.GetCameraAspect = function()
	return 0
end

ll.GetCameraFOV = function()
	return 0
end

ll.GetCameraPos = function()
	return vector.zero
end

ll.GetCameraRot = function()
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tgetcamerarot: not implemented`
	)
end

ll.GetCenterOfMass = function()
	return vector.zero
end

ll.GetClosestNavPoint = function(point: vector, options: list)
	return {}
end

ll.GetColor = function(face: number)
	return internal.get_color(face)
end

ll.GetCreator = function()
	return internal.owner.id
end

ll.GetDate = function()
	return os.date("!%Y-%m-%d")
end

ll.GetDayLength = function()
	return 0
end

ll.GetDayOffset = function()
	return 0
end

ll.GetDisplayName = function(id: uuid)
	if tostring(id) == tostring(internal.owner.id) then
		return internal.owner.name
	end

	return ""
end

ll.GetEnergy = function()
	return 1
end

ll.GetEnv = function(data_request: string)
	return ""
end

ll.GetEnvironment = function(position: vector, env_params: list)
	return {}
end

ll.GetExperienceDetails = function(id: uuid)
	return {}
end

ll.GetExperienceErrorMessage = function(error: number)
	return ""
end

ll.GetForce = function()
	return vector.zero
end

ll.GetFreeMemory = function()
	return 0
end

ll.GetFreeURLs = function()
	return 0
end

ll.GetGMTclock = function()
	local utc = os.date("!*t")

	local midnight = os.time({
		year = utc.year,
		month = utc.month,
		day = utc.day,
		hour = 0,
		min = 0,
		sec = 0,
	})

	return utc - midnight
end

ll.GetGeometricCenter = function()
	return vector.zero
end

ll.GetHTTPHeader = function(id: uuid, header: string)
	return ""
end

ll.GetHealth = function(id: uuid)
	return 0
end

ll.GetInventoryAcquireTime = function(inventory_item: string)
	return ""
end

ll.GetInventoryCreator = function(inventory_item: string)
	return NULL_KEY
end

ll.GetInventoryDesc = function(inventory_item: string)
	return ""
end

ll.GetInventoryKey = function(inventory_item: string)
	return NULL_KEY
end

ll.GetInventoryName = function(inventory_type: number, index: number)
	return ""
end

ll.GetInventoryNumber = function(inventory_type: number)
	return 0
end

ll.GetInventoryPermMask = function(inventory_item: string, bit_mask: number)
	return 0
end

ll.GetInventoryType = function(inventory_item: string)
	return 0
end

ll.GetKey = function()
	return internal.id
end

ll.GetLandOwnerAt = function(position: vector)
	return NULL_KEY
end

ll.GetLinkKey = function(link_number: number)
	if link_number == 0 then
		return internal.id
	end

	return NULL_KEY
end

ll.GetLinkMedia = function(link_number: number, face: number, parameters: list)
	return {}
end

ll.GetLinkName = function(link_number: number)
	if link_number == 0 then
		return internal.name
	end

	return ""
end

ll.GetLinkNumber = function()
	return 0
end

ll.GetLinkNumberOfSides = function(link_number: number)
	if link_number == 0 then
		return 6
	end

	return 0
end

ll.GetLinkPrimitiveParams = function(link_number: number, parameters: list)
	return {}
end

ll.GetLinkSitFlags = function(link_number: number)
	return 0
end

ll.GetListEntryType = function(list_variable: list, index: number)
	return 0
end

ll.GetListLength = function(list_variable: list)
	return #list_variable
end

ll.GetLocalPos = function()
	return vector.zero
end

ll.GetLocalRot = function()
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tgetlocalrot: not implemented`
	)
end

ll.GetMass = function()
	return 0
end

ll.GetMassMKS = function()
	return 0
end

ll.GetMaxScaleFactor = function()
	return 0
end

ll.GetMemoryLimit = function()
	return 0
end

ll.GetMinScaleFactor = function()
	return 0
end

ll.GetMoonDirection = function()
	return vector.zero
end

ll.GetMoonRotation = function()
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tgetmoonrotation: not implemented`
	)
end

ll.GetNextEmail = function(address: string, subject: string)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tgetnexteamil: not implemented`
	)
end

ll.GetNotecardLine = function(notecard_name: string, line_number: number)
	return NULL_KEY
end

ll.GetNotecardLineSync = function(notecard_name: string, line_number: number)
	return ""
end

ll.GetNumberOfNotecardLines = function(notecard_name: string)
	return NULL_KEY
end

ll.GetNumberOfPrims = function()
	return 1
end

ll.GetNumberOfSides = function()
	return 6
end

ll.GetObjectAnimationNames = function()
	return {}
end

ll.GetObjectDesc = function()
	return internal.description
end

ll.GetObjectDetails = function(id: uuid, parameters: list)
	return {}
end

ll.GetObjectLinkKey = function(id: uuid, link_no: number)
	if tostring(id) == tostring(internal.id) and link_no == 0 then
		return internal.id
	end

	return NULL_KEY
end

ll.GetObjectMass = function(id: uuid)
	return 0
end

ll.GetObjectName = function()
	return internal.name
end

ll.GetObjectPermMask = function(category: number)
	return PERM_ALL
end

ll.GetObjectPrimCount = function(id: uuid)
	if tostring(id) == tostring(internal.id) then
		return 1
	end

	return 0
end

ll.GetOmega = function()
	return vector.zero
end

ll.GetOwner = function()
	return internal.owner.id
end

ll.GetOwnerKey = function(id: uuid)
	if tostring(id) == tostring(internal.id) then
		return internal.owner.id
	end

	return NULL_KEY
end

ll.GetParcelDetails = function(position: vector, parcel_details: list)
	return {}
end

ll.GetParcelFlags = function(position: vector)
	return 0
end

ll.GetParcelMaxPrims = function(position: vector, sim_wide: number)
	return 0
end

ll.GetParcelMusicURL = function()
	return ""
end

ll.GetParcelPrimCount = function(
	position: vector,
	category: number,
	sim_wide: number
)
	return 0
end

ll.GetParcelPrimOwners = function(position: vector)
	return {}
end

ll.GetPermissions = function()
	return 0
end

ll.GetPermissionsKey = function()
	return NULL_KEY
end

ll.GetPhysicsMaterial = function()
	return {}
end

ll.GetPos = function()
	return internal.position
end

ll.GetPrimMediaParams = function(face: number, parameters: list)
	return {}
end

ll.GetPrimitiveParams = function(parameters: list)
	return {}
end

ll.GetRegionAgentCount = function()
	return 0
end

ll.GetRegionCorner = function()
	return vector.zero
end

ll.GetRegionDayLength = function()
	return 0
end

ll.GetRegionDayOffset = function()
	return 0
end

ll.GetRegionFPS = function()
	return 45
end

ll.GetRegionFlags = function()
	return 0
end

ll.GetRegionMoonDirection = function()
	return vector.zero
end

ll.GetRegionMoonRotation = function()
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tgetregionmoonrotation: not implemented`
	)
end

ll.GetRegionName = function()
	return "slua.tips"
end

ll.GetRegionSunDirection = function()
	return vector.zero
end

ll.GetRegionSunRotation = function()
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tgetregionsunrotation: not implemented`
	)
end

ll.GetRegionTimeDilation = function()
	return 1
end

ll.GetRegionTimeOfDay = function()
	return 0
end

ll.GetRenderMaterial = function(face: number)
	return ""
end

ll.GetRootPosition = function()
	return vector.zero
end

ll.GetRootRotation = function()
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tgetrootrotation: not implemented`
	)
end

ll.GetRot = function()
	error(`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tgetrot: not implemented`)
end

ll.GetSPMaxMemory = function()
	return 0
end

ll.GetScale = function()
	return vector.zero
end

ll.GetScriptName = function()
	return "New Script"
end

ll.GetScriptState = function(script_name: string)
	return true
end

ll.GetSimStats = function(stat_type: number)
	return 0
end

ll.GetSimulatorHostname = function()
	return "slua.tips"
end

ll.GetStartParameter = function()
	return 0
end

ll.GetStartString = function()
	return ""
end

ll.GetStaticPath = function(
	start: vector,
	finish: vector,
	radius: number,
	parameters: list
)
	return {}
end

ll.GetStatus = function(status_flag: number)
	return 0
end

ll.GetSubString = function(string: string, start: number, finish: number)
	if not start or not finish then
		return string
	end

	local length = #string

	if start == 0 then
		start = 1
	elseif start < 0 then
		start = length + start + 1
	else
		start += 1
	end

	if finish == 0 then
		finish = 1
	elseif finish < 0 then
		finish = length + finish + 1
	else
		finish += 1
	end

	-- handle wrap-around case where start is negative and finish is positive
	if start > finish then
		if start <= length and finish >= 1 then
			return string:sub(1, finish) .. string:sub(start, length)
		end

		return string:sub(start, length)
	end

	return string:sub(start, finish)
end

ll.GetSunDirection = function()
	return vector.zero
end

ll.GetSunRotation = function()
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tgetsunrotation: not implemented`
	)
end

ll.GetTexture = function(face: number)
	return internal.get_diffuse_texture(1, face)
end

ll.GetTextureOffset = function(face: number)
	return vector.create(0, 0, 0)
end

ll.GetTextureRot = function(face: number)
	return 0
end

ll.GetTextureScale = function(face: number)
	return vector.create(1, 1, 0)
end

ll.GetTime = function()
	return os.clock() - internal.time_offset
end

ll.GetTimeOfDay = function()
	return 0
end

ll.GetTimestamp = function()
	local timestamp = os.date("!%Y-%m-%dT%H:%M:%S")
	local fractionalSeconds = string.format("%.3f", os.clock() % 1):sub(3)

	return timestamp .. "." .. fractionalSeconds .. "Z"
end

ll.GetTorque = function()
	return vector.zero
end

ll.GetUnixTime = function()
	return os.time()
end

ll.GetUsedMemory = function()
	return 0
end

ll.GetUsername = function(id: uuid)
	if tostring(id) == tostring(internal.owner.id) then
		return internal.owner.username
	end

	return ""
end

ll.GetVel = function()
	return vector.zero
end

ll.GetVisualParams = function(id: uuid, parameters: list)
	return {}
end

ll.GetWallclock = function()
	local utc = os.date("!*t")

	-- TODO: pass in the daylight saving time offset
	local offset = -7 * 60 * 60

	local pst = os.time({
		year = utc.year,
		month = utc.month,
		day = utc.day,
		hour = utc.hour + offset / 3600,
		min = utc.min,
		sec = utc.sec,
	})

	local midnight = os.time({
		year = utc.year,
		month = utc.month,
		day = utc.day,
		hour = 0,
		min = 0,
		sec = 0,
	})

	return pst - midnight
end

ll.GiveAgentInventory = function(
	id: uuid,
	folder_name: string,
	inventory_items: list,
	options: list
)
	return 0
end

ll.GiveInventory = function(id: uuid, inventory_item: string)
	print("#!SLUA:GIVE_INVENTORY", id, inventory_item)
end

ll.GiveInventoryList = function(
	id: uuid,
	folder_name: string,
	inventory_items: list
)
	print("#!SLUA:GIVE_INVENTORY_LIST", id, folder_name, inventory_items)
end

ll.GiveMoney = function(id: uuid, amount: number)
	return 0
end

ll.GodLikeRezObject = function(id: uuid, position: vector)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tgodlikerezobject: not implemented`
	)
end

ll.Ground = function(offset: vector)
	return 0
end

ll.GroundContour = function(offset: vector)
	return vector.zero
end

ll.GroundNormal = function(offset: vector)
	return vector.zero
end

ll.GroundRepel = function(height: number, water: number, tau: number)
	print("#!SLUA:GROUND_REPEL", height, water, tau)
end

ll.GroundSlope = function(offset: vector)
	return vector.zero
end

ll.HMAC = function(key: string, message: string, algorithm: string)
	return ""
end

ll.HTTPRequest = function(url: string, parameters: list, body: string)
	return NULL_KEY
end

ll.HTTPResponse = function(id: uuid, status: number, body: string)
	print("#!SLUA:HTTP_RESPONSE", id, status, body)
end

ll.Hash = function(value: string)
	return 0
end

ll.InsertString = function(
	target_variable: string,
	position: number,
	source_variable: string
)
	return ""
end

ll.InstantMessage = function(id: uuid, text: string)
	if id == internal.owner.id then
		internal.chat(internal.CHAT_INSTANT_MESSAGE, text)
	end
end

ll.IntegerToBase64 = function(value: number)
	return ""
end

ll.IsFriend = function(id: uuid)
	return 0
end

ll.Json2List = function(json: string)
	return {}
end

ll.JsonGetValue = function(json: string, specifiers: list)
	return ""
end

ll.JsonSetValue = function(json: string, specifiers: list, value: string)
	return ""
end

ll.JsonValueType = function(json: string, specifiers: list)
	return ""
end

ll.Key2Name = function(id: uuid)
	if id == internal.owner.id then
		return internal.owner.name
	end

	return ""
end

ll.KeyCountKeyValue = function()
	return NULL_KEY
end

ll.KeysKeyValue = function(first: number, count: number)
	return NULL_KEY
end

ll.Linear2sRGB = function(color: vector)
	return vector.zero
end

ll.LinkAdjustSoundVolume = function(link_number: number, volume: number)
	print("#!SLUA:LINK_ADJUST_SOUND_VOLUME", link_number, volume)
end

ll.LinkParticleSystem = function(link_number: number, rules: list)
	print("#!SLUA:LINK_PARTICLE_SYSTEM", link_number, rules)
end

ll.LinkPlaySound = function(
	link_number: number,
	sound: string,
	volume: number,
	flags: number
)
	print("#!SLUA:LINK_PLAY_SOUND", link_number, sound, volume, flags)
end

ll.LinkSetSoundQueueing = function(link_number: number, queue_enable: number)
	print("#!SLUA:LINK_SET_SOUND_QUEUEING", link_number, queue_enable)
end

ll.LinkSetSoundRadius = function(link_number: number, radius: number)
	print("#!SLUA:LINK_SET_SOUND_RADIUS", link_number, radius)
end

ll.LinkSitTarget = function(
	link_number: number,
	offset: vector,
	rotation: quaternion
)
	print("#!SLUA:LINK_SIT_TARGET", link_number, offset, rotation)
end

ll.LinkStopSound = function(link_number: number)
	print("#!SLUA:LINK_STOP_SOUND", link_number)
end

ll.LinksetDataAvailable = function()
	local available = 131072

	for _, data in internal.data do
		available -= 2 + #data.name + #data.value + (data.pass and 32 or 0)
	end

	return available
end

ll.LinksetDataCountFound = function(search: string)
	-- TODO: requires a partial implementation of regex
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tlinksetdatacountfound: not implemented`
	)
end

ll.LinksetDataCountKeys = function()
	local count = 0

	for _ in internal.data do
		count += 1
	end

	return count
end

ll.LinksetDataDelete = function(name: string)
	local data = internal.data[name]

	if data then
		if not data.pass then
			internal.data[name] = nil
			internal.linkset_data(LINKSETDATA_DELETE, name, "")

			return LINKSETDATA_OK
		end

		return LINKSETDATA_EPROTECTED
	end

	return LINKSETDATA_NOTFOUND
end

ll.LinksetDataDeleteFound = function(search: string, pass: string)
	-- TODO: requires a partial implementation of regex
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tlinksetdatadeletefound: not implemented`
	)
end

ll.LinksetDataDeleteProtected = function(name: string, pass: string)
	local data = internal.data[name]

	if data then
		if data.pass == pass then
			internal.data[name] = nil
			internal.linkset_data(LINKSETDATA_DELETE, name, "")

			return LINKSETDATA_OK
		end

		return LINKSETDATA_EPROTECTED
	end

	return LINKSETDATA_NOTFOUND
end

ll.LinksetDataFindKeys = function(search: string, start: number, count: number)
	-- TODO: requires a partial implementation of regex
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tlinksetdatafindkeys: not implemented`
	)
end

ll.LinksetDataListKeys = function(start: number, count: number)
	local keys = {}

	for key in pairs(internal.data) do
		table.insert(keys, key)
	end

	return keys
end

ll.LinksetDataRead = function(name: string)
	local data = internal.data[name]

	if data and not data.pass then
		return data.value
	end

	return ""
end

ll.LinksetDataReadProtected = function(name: string, pass: string)
	local data = internal.data[name]

	if data and data.pass == pass then
		return data.value
	end

	return ""
end

ll.LinksetDataReset = function()
	internal.data = {}
	internal.linkset_data(LINKSETDATA_RESET, "", "")
end

ll.LinksetDataWrite = function(name: string, value: string)
	local data = internal.data[name]

	if data then
		if data.pass then
			return LINKSETDATA_EPROTECTED
		end

		if data.value == value then
			return LINKSETDATA_NOUPDATE
		end
	end

	internal.data[name] = { value = value }
	internal.linkset_data(LINKSETDATA_UPDATE, name, value)

	return LINKSETDATA_OK
end

ll.LinksetDataWriteProtected = function(
	name: string,
	value: string,
	pass: string
)
	local data = internal.data[name]

	if data then
		if data.pass and data.pass ~= pass then
			return LINKSETDATA_EPROTECTED
		end

		if data.value == value then
			return LINKSETDATA_NOUPDATE
		end
	end

	internal.data[name] = { value = value, pass = pass }

	return LINKSETDATA_OK
end

ll.List2CSV = function(list_variable: list)
	return table.concat(list_variable, ", ")
end

ll.List2Float = function(list_variable: list, index: number)
	return tonumber(list_variable[index])
end

ll.List2Integer = function(list_variable: list, index: number)
	return tonumber(list_variable[index])
end

ll.List2Json = function(json_type: string, values: list)
	return ""
end

ll.List2Key = function(list_variable: list, index: number)
	return NULL_KEY
end

ll.List2List = function(list_variable: list, start: number, finish: number)
	return {}
end

ll.List2ListSlice = function(
	list_variable: list,
	start: number,
	finish: number,
	stride: number,
	slice_index: number
)
	return {}
end

ll.List2ListStrided = function(
	list_variable: list,
	start: number,
	finish: number,
	stride: number
)
	return {}
end

ll.List2Rot = function(list_variable: list, index: number)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tlist2rot: not implemented`
	)
end

ll.List2String = function(list_variable: list, index: number)
	return tostring(list_variable[index])
end

ll.List2Vector = function(list_variable: list, index: number)
	return vector.zero
end

ll.ListFindList = function(list_variable: list, find: list)
	return 0
end

ll.ListFindListNext = function(
	list_variable: list,
	find: list,
	instance: number
)
	return 0
end

ll.ListFindStrided = function(
	list_variable: list,
	find: list,
	start: number,
	finish: number,
	stride: number
)
	return 0
end

ll.ListInsertList = function(
	target: list,
	list_variable: list,
	position: number
)
	return {}
end

ll.ListRandomize = function(list_variable: { any }, stride: number): { any }
	if #list_variable == 0 then
		return {}
	end

	stride = math.max(1, stride or 1)

	-- shortcut for stride == 1
	if stride == 1 then
		local result = table.clone(list_variable)

		for i = #result, 2, -1 do
			local j = math.random(i)
			result[i], result[j] = result[j], result[i]
		end

		return result
	end

	-- ignore if the stride is not a factor of the list length
	if #list_variable % stride ~= 0 then
		return list_variable
	end

	local result = table.create(#list_variable)
	local chunk_count = math.ceil(#list_variable / stride)
	local chunks = table.create(chunk_count)

	-- create chunks positions
	for i = 1, chunk_count do
		chunks[i] = {
			index = i,
			start = (i - 1) * stride + 1,
			finish = math.min(i * stride, #list_variable),
		}
	end

	-- shuffle chunk positions
	for i = #chunks, 2, -1 do
		local j = math.random(i)
		chunks[i], chunks[j] = chunks[j], chunks[i]
	end

	local dest_index = 1

	-- copy chunks in shuffled order
	for _, chunk in ipairs(chunks) do
		for i = chunk.start, chunk.finish do
			result[dest_index] = list_variable[i]
			dest_index += 1
		end
	end

	return result
end

ll.ListReplaceList = function(
	target: list,
	list_variable: list,
	start: number,
	finish: number
)
	return {}
end

ll.ListSort = function(list_variable: list, stride: number, ascending: number)
	return {}
end

ll.ListSortStrided = function(
	list_variable: list,
	stride: number,
	sortkey: number,
	ascending: number
)
	return {}
end

ll.ListStatistics = function(operation: number, list_variable: list)
	return 0
end

ll.Listen = function(
	channel: number,
	speakers_name: string,
	id: uuid,
	text: string
)
	return internal.add_listener(channel, speakers_name, id, text)
end

ll.ListenControl = function(channel_handle: number, active: number)
	internal.toggle_listener(channel_handle, active)
end

ll.ListenRemove = function(channel_handle: number)
	internal.remove_listener(channel_handle)
end

ll.LoadURL = function(id: uuid, text: string, url: string)
	return nil
end

ll.Log = function(value: number)
	return math.log(value)
end

ll.Log10 = function(value: number)
	return math.log10(value)
end

ll.LookAt = function(target: vector, strength: number, damping: number)
	return nil
end

ll.LoopSound = function(sound: string, volume: number)
	return nil
end

ll.LoopSoundMaster = function(sound: string, volume: number)
	return nil
end

ll.LoopSoundSlave = function(sound: string, volume: number)
	return nil
end

ll.MD5String = function(text: string, nonce: number)
	return ""
end

ll.MakeExplosion = function(
	particles: number,
	scale: number,
	velocity: number,
	lifetime: number,
	arc: number,
	texture: string,
	offset: vector
)
	return nil
end

ll.MakeFire = function(
	particles: number,
	scale: number,
	velocity: number,
	lifetime: number,
	arc: number,
	texture: string,
	offset: vector
)
	return nil
end

ll.MakeFountain = function(
	particles: number,
	scale: number,
	velocity: number,
	lifetime: number,
	arc: number,
	bounce: number,
	texture: string,
	offset: vector,
	bounce__offset: number
)
	return nil
end

ll.MakeSmoke = function(
	particles: number,
	scale: number,
	velocity: number,
	lifetime: number,
	arc: number,
	texture: string,
	offset: vector
)
	return nil
end

ll.ManageEstateAccess = function(action: number, id: uuid)
	return 0
end

ll.MapBeacon = function(region_name: string, position: vector, options: list)
	return nil
end

ll.MapDestination = function(
	region_name: string,
	position: vector,
	direction: vector
)
	return nil
end

ll.MessageLinked = function(
	link_number: number,
	number: number,
	text: string,
	id: uuid
)
	return nil
end

ll.MinEventDelay = function(delay: number)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tmineventdelay: not implemented`
	)
end

ll.ModPow = function(value: number, power: number, modulus: number)
	return math.pow(value, power) % modulus
end

ll.ModifyLand = function(action: number, area: number)
	return nil
end

ll.MoveToTarget = function(target: vector, tau: number)
	return nil
end

ll.Name2Key = function(name: string)
	if name == internal.owner.name then
		return internal.owner.id
	end

	return NULL_KEY
end

ll.NavigateTo = function(location: vector, options: list)
	return nil
end

ll.OffsetTexture = function(offsets: number, offsett: number, face: number)
	return nil
end

ll.OpenFloater = function(floater_name: string, url: string, params: list)
	return 0
end

ll.OpenRemoteDataChannel = function()
	return nil
end

ll.Ord = function(str: string, index: number)
	if type(str) ~= "string" or str == "" then
		return 0
	end

	str = ll.GetSubString(str, index, index)

	local ok, value = pcall(utf8.codepoint, str, 1, 1)

	if ok then
		return value
	end

	local byte = string.byte(str, 1) or 0

	return byte
end

ll.OverMyLand = function(id: uuid)
	return true
end

ll.OwnerSay = function(text: string)
	internal.chat(internal.CHAT_OWNER, text)
end

ll.ParcelMediaCommandList = function(command_list: list)
	return nil
end

ll.ParcelMediaQuery = function(query_list: list)
	return {}
end

ll.ParseString2List = function(text: string, separators: list, spacers: list)
	return {}
end

ll.ParseStringKeepNulls = function(
	text: string,
	separators: list,
	spacers: list
)
	return {}
end

ll.ParticleSystem = function(parameters: list)
	return nil
end

ll.PassCollisions = function(pass: number)
	return nil
end

ll.PassTouches = function(pass: number)
	return nil
end

ll.PatrolPoints = function(points: list, options: list)
	return nil
end

ll.PlaySound = function(sound: string, volume: number)
	return nil
end

ll.PlaySoundSlave = function(sound: string, volume: number)
	return nil
end

ll.Pow = function(value: number, exponent: number)
	return math.pow(value, exponent)
end

ll.PreloadSound = function(sound: string)
	return nil
end

ll.Pursue = function(id: uuid, options: list)
	return nil
end

ll.PushObject = function(
	id: uuid,
	impulse: vector,
	angular_impulse: vector,
	relative: number
)
	return nil
end

ll.ReadKeyValue = function(key: string)
	return NULL_KEY
end

ll.RefreshPrimURL = function()
	return nil
end

ll.RegionSay = function(channel: number, text: string)
	if channel == DEBUG_CHANNEL then
		internal.chat(internal.CHAT_DEBUG, text)
	end
end

ll.RegionSayTo = function(id: uuid, channel: number, text: string)
	if tostring(id) == tostring(internal.owner.id) then
		internal.chat(internal.CHAT_REGION, text)
	end
end

ll.ReleaseCamera = function(id: uuid)
	return nil
end

ll.ReleaseControls = function()
	return nil
end

ll.ReleaseURL = function(url: string)
	return nil
end

ll.RemoteDataReply = function(
	id: uuid,
	id: uuid,
	s_data: string,
	i_data: number
)
	return nil
end

ll.RemoteDataSetRegion = function()
	return nil
end

ll.RemoteLoadScriptPin = function(
	id: uuid,
	script_name: string,
	pin: number,
	running: number,
	parameter: number
)
	return nil
end

ll.RemoveFromLandBanList = function(id: uuid)
	return nil
end

ll.RemoveFromLandPassList = function(id: uuid)
	return nil
end

ll.RemoveInventory = function(inventory_item: string)
	return nil
end

ll.RemoveVehicleFlags = function(vehiclelags: number)
	return nil
end

ll.ReplaceAgentEnvironment = function(
	id: uuid,
	transition: number,
	environment: string
)
	return 0
end

ll.ReplaceEnvironment = function(
	position: vector,
	environment: string,
	track_no: number,
	day_length: number,
	day_offset: number
)
	return 0
end

ll.ReplaceSubString = function(
	initial_string: string,
	sub_string: string,
	new_sub_string: string,
	count: number
)
	return ""
end

ll.RequestAgentData = function(id: uuid, data: number)
	return NULL_KEY
end

ll.RequestDisplayName = function(id: uuid)
	return NULL_KEY
end

ll.RequestExperiencePermissions = function(id: uuid, unused: string)
	return nil
end

ll.RequestInventoryData = function(inventory_item: string)
	return NULL_KEY
end

ll.RequestPermissions = function(id: uuid, permission_mask: number)
	return nil
end

ll.RequestSecureURL = function()
	return NULL_KEY
end

ll.RequestSimulatorData = function(region_name: string, data: number)
	return NULL_KEY
end

ll.RequestURL = function()
	return NULL_KEY
end

ll.RequestUserKey = function(name: string)
	return NULL_KEY
end

ll.RequestUsername = function(id: uuid)
	return NULL_KEY
end

ll.ResetAnimationOverride = function(animation_state: string)
	return nil
end

ll.ResetLandBanList = function()
	return nil
end

ll.ResetLandPassList = function()
	return nil
end

ll.ResetOtherScript = function(script_name: string)
	if script_name == ll.GetScriptName() then
		internal.reset()
	end
end

ll.ResetScript = function()
	internal.reset()
end

ll.ResetTime = function()
	internal.time_offset = ll.GetTime()
end

ll.ReturnObjectsByID = function(objecti_ds: list)
	return 0
end

ll.ReturnObjectsByOwner = function(id: uuid, scope: number)
	return 0
end

ll.RezAtRoot = function(
	inventory_item: string,
	position: vector,
	velocity: vector,
	rotation: quaternion,
	parameter: number
)
	return nil
end

ll.RezObject = function(
	inventory_item: string,
	position: vector,
	velocity: vector,
	rotation: quaternion,
	parameter: number
)
	return nil
end

ll.RezObjectWithParams = function(inventory_item: string, params: list)
	return NULL_KEY
end

ll.Rot2Angle = function(rotation: quaternion)
	return 0
end

ll.Rot2Axis = function(rotation: quaternion)
	return vector.zero
end

ll.Rot2Euler = function(rotation: quaternion)
	return vector.zero
end

ll.Rot2Fwd = function(rotation: quaternion)
	return vector.zero
end

ll.Rot2Left = function(rotation: quaternion)
	return vector.zero
end

ll.Rot2Up = function(rotation: quaternion)
	return vector.zero
end

ll.RotBetween = function(vector1: vector, vector2: vector)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\trotbetween: not implemented`
	)
end

ll.RotLookAt = function(rotation: quaternion, strength: number, damping: number)
	return nil
end

ll.RotTarget = function(rotation: quaternion, lee_way: number)
	return 0
end

ll.RotTargetRemove = function(handle: number)
	return nil
end

ll.RotateTexture = function(radians: number, face: number)
	return nil
end

ll.Round = function(value: number)
	return math.round(value)
end

ll.SHA1String = function(text: string)
	return ""
end

ll.SHA256String = function(text: string)
	return ""
end

ll.SameGroup = function(id: uuid)
	return 0
end

ll.Say = function(channel: number, text: string)
	if channel == 0 then
		internal.chat(internal.CHAT_SAY, text)
	elseif channel == DEBUG_CHANNEL then
		internal.chat(internal.CHAT_DEBUG, text)
	end
end

ll.ScaleByFactor = function(scaling_factor: number)
	return 0
end

ll.ScaleTexture = function(horizontal: number, vertical: number, face: number)
	return nil
end

ll.ScriptDanger = function(position: vector)
	return false
end

ll.ScriptProfiler = function(state: number)
	return nil
end

ll.SendRemoteData = function(
	id: uuid,
	destination: string,
	value: number,
	text: string
)
	return NULL_KEY
end

ll.Sensor = function(
	name: string,
	id: uuid,
	sensor_type: number,
	range: number,
	arc: number
)
	if sensor_type == 0 then
		return
	end

	internal.no_sensor()
end

ll.SensorRemove = function()
	print("#!SLUA:REMOVE_SENSOR")
end

ll.SensorRepeat = function(
	name: string,
	id: uuid,
	sensor_type: number,
	range: number,
	arc: number,
	rate: number
)
	if sensor_type == 0 or type(rate) ~= "number" then
		return
	end

	print("#!SLUA:SET_SENSOR", name, id, type, range, arc, rate)
end

ll.SetAgentEnvironment = function(id: uuid, transition: number, settings: list)
	return 0
end

ll.SetAgentRot = function(rot: quaternion, flags: number)
	return nil
end

ll.SetAlpha = function(opacity: number, face: number)
	internal.set_alpha(1, opacity, face)
end

ll.SetAngularVelocity = function(ang_vel: vector, relative: number)
	return nil
end

ll.SetAnimationOverride = function(
	animation_state: string,
	animation_name: string
)
	return nil
end

ll.SetBuoyancy = function(buoyancy: number)
	return nil
end

ll.SetCameraAtOffset = function(offset: vector)
	return nil
end

ll.SetCameraEyeOffset = function(offset: vector)
	return nil
end

ll.SetCameraParams = function(parameters: list)
	return nil
end

ll.SetClickAction = function(action: number)
	return nil
end

ll.SetColor = function(color: vector, face: number)
	internal.set_color(1, color, face)
end

ll.SetContentType = function(id: uuid, content_type: number)
	return nil
end

ll.SetDamage = function(damage: number)
	return nil
end

ll.SetEnvironment = function(position: vector, env_params: list)
	return 0
end

ll.SetForce = function(force: vector, relative: number)
	return nil
end

ll.SetForceAndTorque = function(force: vector, torque: vector, relative: number)
	return nil
end

ll.SetGroundTexture = function(changes: list)
	return 0
end

ll.SetHoverHeight = function(height: number, water: number, tau: number)
	return nil
end

ll.SetInventoryPermMask = function(
	inventory_item: string,
	permission_flag: number,
	permission_mask: number
)
	return nil
end

ll.SetKeyframedMotion = function(keyframes: list, options: list)
	return nil
end

ll.SetLinkAlpha = function(link_number: number, opacity: number, face: number)
	internal.set_alpha(link_number, opacity, face)
end

ll.SetLinkCamera = function(
	link_number: number,
	eye_offset: vector,
	look_offset: vector
)
	return nil
end

ll.SetLinkColor = function(link_number: number, color: vector, face: number)
	internal.set_color(link_number, color, face)
end

ll.SetLinkMedia = function(link: number, face: number, parameters: list)
	return 0
end

ll.SetLinkPrimitiveParams = function(link_number: number, parameters: list)
	return nil
end

ll.SetLinkPrimitiveParamsFast = function(link_number: number, parameters: list)
	return nil
end

ll.SetLinkRenderMaterial = function(
	link_number: number,
	render_material: string,
	face: number
)
	return nil
end

ll.SetLinkSitFlags = function(link_number: number, flags: number)
	return nil
end

ll.SetLinkTexture = function(link_number: number, texture: string, face: number)
	internal.set_diffuse_texture(link_number, face, texture)
end

ll.SetLinkTextureAnim = function(
	link_number: number,
	mode: number,
	face: number,
	sizex: number,
	sizey: number,
	start: number,
	length: number,
	rate: number
)
	return nil
end

ll.SetLocalRot = function(rotation: quaternion)
	return nil
end

ll.SetMemoryLimit = function(limit: number)
	return 0
end

ll.SetObjectDesc = function(description: string)
	-- TODO: match length and character limits
	internal.description = description:gsub("[^%w%s]", "")
end

ll.SetObjectName = function(name: string)
	-- TODO: match length and character limits
	internal.name = name:gsub("[^%w%s]", "")
end

ll.SetObjectPermMask = function(
	permission_flag: number,
	permission_mask: number
)
	return nil
end

ll.SetParcelMusicURL = function(url: string)
	return nil
end

ll.SetPayPrice = function(price: number, quick_buttons: list)
	return nil
end

ll.SetPhysicsMaterial = function(
	material_bits: number,
	gravity_multiplier: number,
	restitution: number,
	friction: number,
	density: number
)
	return nil
end

ll.SetPos = function(position: vector)
	local direction = position - internal.position
	local distance = vector.magnitude(direction)

	if distance > 10 then
		direction = vector.normalize(direction) * 10
	end

	internal.set_position(1, internal.position + direction)
end

ll.SetPrimMediaParams = function(face: number, media_parameters: list)
	return 0
end

ll.SetPrimURL = function(url: string)
	return nil
end

ll.SetPrimitiveParams = function(parameters: list)
	return nil
end

ll.SetRegionPos = function(position: vector)
	internal.set_position(1, position)
end

ll.SetRemoteScriptAccessPin = function(pin: number)
	return nil
end

ll.SetRenderMaterial = function(material: string, face: number)
	return nil
end

ll.SetRot = function(rotation: quaternion)
	internal.set_rotation(1, rotation)
end

ll.SetScale = function(scale: vector)
	internal.set_scale(1, scale)
end

ll.SetScriptState = function(script_name: string, running: number)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tsetscriptstate: not implemented`
	)
end

ll.SetSitText = function(text: string)
	return nil
end

ll.SetSoundQueueing = function(queue_enable: number)
	return nil
end

ll.SetSoundRadius = function(radius: number)
	return nil
end

ll.SetStatus = function(status: number, value: number)
	return nil
end

ll.SetText = function(text: string, color: vector, opacity: number)
	return nil
end

ll.SetTexture = function(texture: string, face: number)
	internal.set_diffuse_texture(1, face, texture)
end

ll.SetTextureAnim = function(
	mode: number,
	face: number,
	sizex: number,
	sizey: number,
	start: number,
	length: number,
	rate: number
)
	return nil
end

ll.SetTimerEvent = function(rate: number)
	if type(rate) ~= "number" then
		return
	end

	print("#!SLUA:SET_TIMER", rate)
end

ll.SetTorque = function(torque: vector, relative: number)
	return nil
end

ll.SetTouchText = function(text: string)
	return nil
end

ll.SetVehicleFlags = function(flags: number)
	return nil
end

ll.SetVehicleFloatParam = function(
	parameter_name: number,
	parameter_value: number
)
	return nil
end

ll.SetVehicleRotationParam = function(
	parameter_name: number,
	parameter_value: quaternion
)
	return nil
end

ll.SetVehicleType = function(type: number)
	return nil
end

ll.SetVehicleVectorParam = function(
	parameter_name: number,
	parameter_value: vector
)
	return nil
end

ll.SetVelocity = function(velocity: vector, relative: number)
	return nil
end

ll.Shout = function(channel: number, text: string)
	if channel == 0 then
		internal.chat(internal.CHAT_SHOUT, text)
	elseif channel == DEBUG_CHANNEL then
		internal.chat(internal.CHAT_DEBUG, text)
	end
end

ll.SignRSA = function(private_key: string, message: string, algorithm: string)
	return ""
end

ll.Sin = function(theta: number)
	return math.sin(theta)
end

ll.SitOnLink = function(id: uuid, id: number)
	return 0
end

ll.SitTarget = function(offset: vector, rotation: quaternion)
	return nil
end

ll.Sleep = function(time: number)
	return nil
end

ll.Sound = function(sound: string, volume: number, queue: number, loop: number)
	return nil
end

ll.SoundPreload = function(sound: string)
	return nil
end

ll.Sqrt = function(value: number)
	return math.sqrt(value)
end

ll.StartAnimation = function(animation: string)
	return nil
end

ll.StartObjectAnimation = function(animation: string)
	return nil
end

ll.StopAnimation = function(animation: string)
	return nil
end

ll.StopHover = function()
	return nil
end

ll.StopLookAt = function()
	return nil
end

ll.StopMoveToTarget = function()
	return nil
end

ll.StopObjectAnimation = function(animation: string)
	return nil
end

ll.StopSound = function()
	return nil
end

ll.StringLength = function(text: string)
	return #text
end

ll.StringToBase64 = function(text: string)
	return llbase64.encode(text)
end

ll.StringTrim = function(text: string, trim_type: number)
	local result = text

	if trim_type == STRING_TRIM_HEAD then
		result = text:gsub("^%s*", "")
	elseif trim_type == STRING_TRIM_TAIL then
		result = text:gsub("%s*$", "")
	else
		result = text:gsub("^%s*", ""):gsub("%s*$", "")
	end

	return result
end

ll.SubStringIndex = function(text: string, sequence: string)
	local index = text:find(sequence, 1, true)

	if index then
		return index - 1
	end

	return -1
end

ll.TakeCamera = function(id: uuid)
	return nil
end

ll.TakeControls = function(controls: number, accept: boolean, pass_on: boolean)
	return nil
end

ll.Tan = function(theta: number)
	return math.tan(theta)
end

ll.Target = function(position: vector, range: number)
	return 0
end

ll.TargetOmega = function(axis: vector, spin_rate: number, gain: number)
	return nil
end

ll.TargetRemove = function(target: number)
	return nil
end

ll.TargetedEmail = function(target: number, subject: string, text: string)
	return nil
end

ll.TeleportAgent = function(
	id: uuid,
	landmark_name: string,
	position: vector,
	look_at_point: vector
)
	return nil
end

ll.TeleportAgentGlobalCoords = function(
	id: uuid,
	global_position: vector,
	region_position: vector,
	look_at_point: vector
)
	return nil
end

ll.TeleportAgentHome = function(id: uuid)
	return nil
end

ll.TextBox = function(id: uuid, text: string, channel: number)
	return nil
end

ll.ToLower = function(text: string)
	return text:lower()
end

ll.ToUpper = function(text: string)
	return text:upper()
end

ll.TransferLindenDollars = function(id: uuid, amount: number)
	return NULL_KEY
end

ll.TransferOwnership = function(id: uuid, flags: number, params: list)
	return 0
end

ll.TriggerSound = function(sound: string, volume: number)
	return nil
end

ll.TriggerSoundLimited = function(
	sound: string,
	volume: number,
	tne: vector,
	bsw: vector
)
	return nil
end

ll.UnSit = function(id: uuid)
	return nil
end

ll.UnescapeURL = function(url: string)
	return ""
end

ll.UpdateCharacter = function(options: list)
	return nil
end

ll.UpdateKeyValue = function(
	key: string,
	value: string,
	checked: number,
	original_value: string
)
	return NULL_KEY
end

ll.VecDist = function(location1: vector, location2: vector)
	return vector.magnitude(location1 - location2)
end

ll.VecMag = function(vec: vector)
	return vector.magnitude(vec)
end

ll.VecNorm = function(vec: vector)
	return vector.normalize(vec)
end

ll.VerifyRSA = function(
	public_key: string,
	message: string,
	signature: string,
	algorithm: string
)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\tverifyrsa: not implemented`
	)
end

ll.VolumeDetect = function(detect_enabled: number)
	return nil
end

ll.WanderWithin = function(origin: vector, area: vector, options: list)
	return nil
end

ll.Water = function(offset: vector)
	return 0
end

ll.Whisper = function(channel: number, text: string)
	if channel == 0 then
		internal.chat(internal.CHAT_WHISPER, text)
	elseif channel == DEBUG_CHANNEL then
		internal.chat(internal.CHAT_DEBUG, text)
	end
end

ll.Wind = function(offset: vector)
	return vector.zero
end

ll.WorldPosToHUD = function(world_pos: vector)
	return vector.zero
end

ll.XorBase64 = function(text1: string, text2: string)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\txorbase64: not implemented, use ll.XorBase64StringsCorrect instead`
	)
end

ll.XorBase64Strings = function(text1: string, text2: string)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\txorbase64strings: not implemented, use ll.XorBase64StringsCorrect instead`
	)
end

ll.XorBase64StringsCorrect = function(text1: string, text2: string)
	error(
		`#!SLUA:ERROR\t{tostring(debug.info(2, "l"))}\txorbase64stringscorrect: not implemented`
	)
end

ll.sRGB2Linear = function(srgb: vector)
	return vector.zero
end

table.freeze(ll)
table.freeze(lljson)
table.freeze(llbase64)
table.freeze(vector)

return {
	ll = ll,
	lljson = lljson,
	llbase64 = llbase64,
	vector = vector,
	uuid = uuid,
}
