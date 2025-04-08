-- DO NOT USE THESE
-- GET THEM FROM https://slua.wlf.io

----------------------------------
---------- LSL LUAU DEFS ---------
----------------------------------

type numeric = number|boolean|integer
type list = {[number]:(string|number|integer|vector|uuid|quaternion|boolean)}
type lljson_constant = number

declare class uuid
  istruthy: boolean -- property to check if uuid is valid
  function __tostring(self): string -- converts uuid to a string
end

declare class quaternion
  x: number -- x property of quaternion
  y: number -- y property of quaternion
  z: number -- z property of quaternion
  s: number -- s property of quaternion
  function __mul(self, other: vector): vector -- multiply vector/quaternion by quaternion
  function __mul(self, other: quaternion): quaternion -- multiply vector/quaternion by quaternion
end

declare class vector
  x: number -- x property of vector
  y: number -- y property of vector
  z: number -- z property of vector
  function __mul(self, other: vector): vector -- multiply vector by number, vector, or quaternion
  function __mul(self, other: quaternion): vector -- multiply vector by number, vector, or quaternion
  function __mul(self, other: number): vector -- multiply vector by number, vector, or quaternion
  function __div(self, other: vector): vector -- divide vector by number, vector, or quaternion
  function __div(self, other: quaternion): vector -- divide vector by number, vector, or quaternion
  function __div(self, other: number): vector -- divide vector by number, vector, or quaternion
  function __idiv(self, other: vector): vector -- floor divide vector by number, vector, or quaternion
  function __idiv(self, other: quaternion): vector -- floor divide vector by number, vector, or quaternion
  function __idiv(self, other: number): vector -- floor divide vector by number, vector, or quaternion
  function __add(self, other: vector): vector -- add two vectors
  function __sub(self, other: vector): vector -- subtract vector from vector
  function __unm(self): vector -- negate a vector
end

declare class integer
  function __add(self, other: integer): integer -- Meta function to allow for '+' operation
  function __add(self, other: number): number -- Meta function to allow for '+' operation
  function __sub(self, other: integer): integer -- Meta function to allow for '-' operation
  function __sub(self, other: number): number -- Meta function to allow for '-' operation
  function __mul(self, other: integer): integer -- Meta function to allow for '*' operation
  function __mul(self, other: number): number -- Meta function to allow for '*' operation
  function __div(self, other: integer): number -- Meta function to allow for '/' operation
  function __div(self, other: number): number -- Meta function to allow for '/' operation
  function __unm(self): integer -- Meta function to allow for '-' negation
  function __mod(self, other: integer): integer -- Meta function to allow for '%' operation
  function __mod(self, other: number): number -- Meta function to allow for '%' operation
  function __pow(self, other: integer): integer -- Meta function to allow for '^' operation
  function __pow(self, other: number): number -- Meta function to allow for '^' operation
  function __idiv(self, other: integer): integer -- Meta function to allow for '//' operation
  function __idiv(self, other: number): number -- Meta function to allow for '//' operation
  function __eq(self, other: integer): integer -- Meta function to allow for '==' operation
  function __lt(self, other: integer): integer -- Meta function to allow for '<' and '>' operation
  function __le(self, other: integer): integer -- Meta function to allow for '<=' and '>=' operation
end



declare function integer (value: string|number): integer -- Creates an integer value from argument
declare function uuid (str: string): uuid -- Creates a uuid from a string argument
declare function toquaternion (str: string): quaternion|nil -- Creates a quaternion from a string argument in format `<1,1,1,1>`  Invalid strings will return `nil`  #### Caveat  Due to an old error from lsl strings that match upto the closing `>` are interpreted as valid  So `<1,1,1,1` and `<1,1,1,1spoon` are both cast to `<1,1,1,1>`  When testing if a string is a quaternion or a vector, you should test with `toquaternion` first.
declare function tovector (str: string): vector|nil -- Creates a vector from a string argument in format `<1,1,1>`  Invalid strings will return `nil`  #### Caveat  Due to an old error from lsl strings that match upto the closing `>` are interpreted as valid  So `<1,1,1`, `<1,1,1,1` and `<1,1,1spoon` are all cast to `<1,1,1>`  When testing if a string is a quaternion or a vector, you should test with `toquaternion` first.
declare function quaternion (x: number, y: number, z: number, s: number): quaternion -- Creates a quaternion from x,y,z,s

---------------------------
-- Global Table: bit32
---------------------------

declare bit32: {
  arshift: ((n: integer, i: integer) -> integer) & ((n: integer|number, i: integer|number) -> number), -- Shifts `n` by `i` bits to the right (if `i` is negative, a left shift is performed instead). The most significant bit of `n` is propagated during the shift. When `i` is larger than `31`, returns an integer with all bits set to the sign bit of `n`. When `i` is smaller than `-31`, `0` is returned
  band: ((...integer) -> integer) & ((...(integer|number)) -> number), -- Performs a bitwise and of all input numbers and returns the result. If the function is called with no arguments, an integer with all bits set to `1` is returned.
  bnot: ((n: integer) -> integer) & ((n: integer|number) -> number), -- Returns a bitwise negation of the input number.
  bor: ((...integer) -> integer) & ((...(integer|number)) -> number), -- Performs a bitwise or of all input numbers and returns the result. If the function is called with no arguments, `0` is returned.
  btest: (...(integer|number)) -> boolean, -- Perform a bitwise and of all input numbers, and return `true` if the result is not `0`. If the function is called with no arguments, `true` is returned.
  bxor: ((...integer) -> integer) & ((...(integer|number)) -> number), -- Performs a bitwise xor (exclusive or) of all input numbers and returns the result. If the function is called with no arguments, `0` is returned.
  byteswap: ((n: integer) -> integer) & ((n: integer|number) -> number), -- Returns n with the order of the bytes swapped.
  countlz: ((n: integer) -> integer) & ((n: integer|number) -> number), -- Returns the number of consecutive zero bits in the 32-bit representation of `n` starting from the left-most (most significant) bit. Returns `32` if `n` is `0`.
  countrz: ((n: integer) -> integer) & ((n: integer|number) -> number), -- Returns the number of consecutive zero bits in the 32-bit representation of `n` starting from the right-most (least significant) bit. Returns `32` if `n` is `0`.
  extract: ((n: integer, f: integer, w: integer) -> integer) & ((n: integer|number, f: integer|number, w: integer|number) -> number), -- Extracts bits of `n` at position `f` with `a` width of `w`, and returns the resulting integer. `w` defaults to 1, so a two-argument version of extract returns the bit value at position `f`. Bits are indexed starting at `0`. Errors if `f` and `f+w-1` are not between `0` and `31`.
  lrotate: ((n: integer, i: integer) -> integer) & ((n: integer|number, i: integer|number) -> number), -- Rotates `n` to the left by `i` bits (if `i` is negative, a right rotate is performed instead) The bits that are shifted past the bit width are shifted back from the right.
  lshift: ((n: integer, i: integer) -> integer) & ((n: integer|number, i: integer|number) -> number), -- Shifts `n` to the left by `i` bits (if `i` is negative, a right shift is performed instead). When `i` is outside of `[-31..31]` range, returns `0`.
  replace: ((n: integer, r: integer, f: integer, w: integer?) -> integer) & ((n: integer|number, r: integer|number, f: integer|number, w: (integer|number)?) -> number), -- Replaces bits of `n` at position `f` and width `w` with `r`, and returns the resulting integer. `w` defaults to `1`, so a three-argument version of replace changes one bit at position `f` to `r` (which should be `0` or `1`) and returns the result. Bits are indexed starting at `0`. Errors if `f` and `f+w-1` are not between `0` and `31`.
  rrotate: ((n: integer, i: integer) -> integer) & ((n: integer|number, i: integer|number) -> number), -- Rotates `n` to the right by `i` bits (if `i` is negative, a left rotate is performed instead) The bits that are shifted past the bit width are shifted back from the left.
  rshift: ((n: integer, i: integer) -> integer) & ((n: integer|number, i: integer|number) -> number), -- Shifts `n` to the right by `i` bits (if `i` is negative, a left shift is performed instead). When `i` is outside of `[-31..31]` range, returns `0`.
}



---------------------------
-- Global Table: lljson
---------------------------

declare lljson: {
  _NAME: "lljson", -- Name of the lljson table
  _VERSION: string, -- Version of the lljson library (based on the lua-cjson library)
  array_mt: {}, -- Metatable for declaring table as an array for json encode
  array_mt: {}, -- Metatable for declaring table as an empty array for json encode
  decode: (json: string) -> string|number|integer|vector|uuid|quaternion|boolean|{}|nil, -- decode json string to lua value
  empty_array: lljson_constant, -- A constant to pass for an empty array to json encode
  encode: (value: string|number|integer|vector|uuid|quaternion|boolean|{}|nil) -> string, -- encode lua value as json
  null: lljson_constant, -- A constant to pass for null to json encode
}



---------------------------
-- Global Table: llbase64
---------------------------

declare llbase64: {
  decode: ((base64: string) -> string) & ((base64: string, asBuffer: true) -> buffer) & ((base64: string, asBuffer: false) -> string), -- decode a base64 string, to a buffer or string
  encode: (value: string|buffer) -> string, -- encode a string or buffer to base64
}



---------------------------
-- Global Table: vector
---------------------------

declare vector: {
  abs: (vec: vector) -> vector, -- Applies `math.abs` to every component of the input vector.
  angle: (vec1: vector, vec2: vector, axis: vector?) -> number, -- Computes the angle between two vectors in radians. The axis, if specified, is used to determine the sign of the angle.
  ceil: (vec: vector) -> vector, -- Applies `math.ceil` to every component of the input vector.
  clamp: (vec: vector, min: vector, max: vector) -> vector, -- Applies `math.clamp` to every component of the input vector.
  create: (x: number|integer, y: number|integer, z: number|integer) -> vector, -- Creates a new vector with the given component values
  cross: (vec1: vector, vec2: vector) -> vector, -- Computes the cross product of two vectors.
  dot: (vec1: vector, vec2: vector) -> number, -- Computes the dot product of two vectors.
  floor: (vec: vector) -> vector, -- Applies `math.floor` to every component of the input vector.
  magnitude: (vec: vector) -> number, -- Calculates the magnitude of a given vector.
  max: (...vector) -> vector, -- Applies `math.max` to the corresponding components of the input vectors.
  min: (...vector) -> vector, -- Applies `math.min` to the corresponding components of the input vectors.
  normalize: (vec: vector) -> vector, -- Computes the normalized version (unit vector) of a given vector.
  one: vector, -- A one vector <1,1,1>
  sign: (vec: vector) -> vector, -- Applies `math.sign` to every component of the input vector.
  zero: vector, -- A Zero vector <0,0,0>
}



---------------------------
-- Global Table: ll
---------------------------

declare ll: {
  Abs: (Value: integer|number) -> number, -- Returns the absolute (positive) version of Value.
  Acos: (Value: number) -> number, -- Returns the arc-cosine of Value, in radians.
  AddToLandBanList: (ID: uuid|string, Hours: number) -> (), -- Add avatar ID to the parcel ban list for the specified number of Hours. A value of 0 for Hours will add the agent indefinitely. The smallest value that Hours will accept is 0.01; anything smaller will be seen as 0. When values that small are used, it seems the function bans in approximately 30 second increments (Probably 36 second increments, as 0.01 of an hour is 36 seconds). Residents teleporting to a parcel where they are banned will be redirected to a neighbouring parcel.
  AddToLandPassList: (ID: uuid|string, Hours: number) -> (), -- Add avatar ID to the land pass list, for a duration of Hours.
  AdjustDamage: (Number: integer|number, Damage: number) -> (), -- Changes the amount of damage to be delivered by this damage event.
  AdjustSoundVolume: (Volume: number) -> (), -- Adjusts the volume (0.0 - 1.0) of the currently playing attached sound. This function has no effect on sounds started with llTriggerSound.
  AgentInExperience: (AgentID: uuid|string) -> number, --  Returns TRUE if the agent is in the Experience and the Experience can run in the current location.
  AllowInventoryDrop: (Flag: integer|number) -> (), -- If Flag == TRUE, users without object modify permissions can still drop inventory items into the object.
  AngleBetween: (Rot1: quaternion, Rot2: quaternion) -> number, -- Returns the angle, in radians, between rotations Rot1 and Rot2.
  ApplyImpulse: (Force: vector, Local: integer|number) -> (), -- Applies impulse to the object. If Local == TRUE, apply the Force in local coordinates; otherwise, apply the Force in global coordinates. This function only works on physical objects.
  ApplyRotationalImpulse: (Force: vector, Local: integer|number) -> (), -- Applies rotational impulse to the object. If Local == TRUE, apply the Force in local coordinates; otherwise, apply the Force in global coordinates. This function only works on physical objects.
  Asin: (Value: number) -> number, -- Returns the arc-sine, in radians, of Value.
  Atan2: (y: number, x: number) -> number, -- Returns the arc-tangent2 of y, x.
  AttachToAvatar: (AttachmentPoint: integer|number) -> (), -- Attach to avatar at point AttachmentPoint. Requires the PERMISSION_ATTACH runtime permission.
  AttachToAvatarTemp: (AttachPoint: integer|number) -> (), -- Follows the same convention as llAttachToAvatar, with the exception that the object will not create new inventory for the user, and will disappear on detach or disconnect.
  AvatarOnLinkSitTarget: (LinkNumber: integer|number) -> uuid, -- If an avatar is sitting on the link's sit target, return the avatar's key, NULL_KEY otherwise. Returns a key that is the UUID of the user seated on the specified link's prim.
  AvatarOnSitTarget: () -> uuid, -- If an avatar is seated on the sit target, returns the avatar's key, otherwise NULL_KEY. This only will detect avatars sitting on sit targets defined with llSitTarget.
  Axes2Rot: (Forward: vector, Left: vector, Up: vector) -> quaternion, -- Returns the rotation represented by coordinate axes Forward, Left, and Up.
  AxisAngle2Rot: (Axis: vector, Angle: number) -> quaternion, -- Returns the rotation that is a generated Angle about Axis.
  Base64ToInteger: (Text: string) -> number, -- Returns an integer that is the Text, Base64 decoded as a big endian integer. Returns zero if Text is longer then 8 characters. If Text contains fewer then 6 characters, the return value is unpredictable.
  Base64ToString: (Text: string) -> string, -- Converts a Base64 string to a conventional string. If the conversion creates any unprintable characters, they are converted to question marks.
  BreakAllLinks: () -> (), -- De-links all prims in the link set (requires permission PERMISSION_CHANGE_LINKS be set).
  BreakLink: (LinkNumber: integer|number) -> (), -- De-links the prim with the given link number (requires permission PERMISSION_CHANGE_LINKS be set).
  CSV2List: (Text: string) -> list, -- Create a list from a string of comma separated values specified in Text.
  CastRay: (Start: vector, End: vector, Options: list) -> list, -- Casts a ray into the physics world from 'start' to 'end' and returns data according to details in Options. Reports collision data for intersections with objects. Return value: [UUID_1, {link_number_1}, hit_position_1, {hit_normal_1}, UUID_2, {link_number_2}, hit_position_2, {hit_normal_2}, ... , status_code] where {} indicates optional data.
  Ceil: (Value: number) -> number, -- Returns smallest integer value >= Value.
  Char: (value: integer|number) -> string, -- Returns a single character string that is the representation of the unicode value.
  ClearCameraParams: () -> (), -- Resets all camera parameters to default values and turns off scripted camera control.
  ClearLinkMedia: (Link: integer|number, Face: integer|number) -> number, -- Clears (deletes) the media and all parameters from the given Face on the linked prim. Returns an integer that is a STATUS_* flag, which details the success/failure of the operation.
  ClearPrimMedia: (Face: integer|number) -> number, -- Clears (deletes) the media and all parameters from the given Face. Returns an integer that is a STATUS_* flag which details the success/failure of the operation.
  CloseRemoteDataChannel: (ChannelID: uuid|string) -> (), -- This function is deprecated.
  Cloud: (Offset: vector) -> number, -- Returns the cloud density at the object's position + Offset.
  CollisionFilter: (ObjectName: string, ObjectID: uuid|string, Accept: integer|number) -> (), -- Specify an empty string or NULL_KEY for Accept, to not filter on the corresponding parameter.
  CollisionSound: (ImpactSound: string, ImpactVolume: number) -> (), -- Suppress default collision sounds, replace default impact sounds with ImpactSound. The ImpactSound must be in the object inventory. Supply an empty string to suppress collision sounds.
  CollisionSprite: (ImpactSprite: string) -> (), -- Suppress default collision sprites, replace default impact sprite with ImpactSprite; found in the object inventory (empty string to just suppress).
  ComputeHash: (Message: string, Algorithm: string) -> string, -- Returns hex-encoded Hash string of Message using digest Algorithm.
  Cos: (Theta: number) -> number, -- Returns the cosine of Theta (Theta in radians).
  CreateCharacter: (Options: list) -> (), -- Convert link-set to AI/Physics character. Creates a path-finding entity, known as a "character", from the object containing the script. Required to activate use of path-finding functions. Options is a list of key/value pairs.
  CreateKeyValue: (Key: string, Value: string) -> uuid, --  Starts an asychronous transaction to create a key-value pair. Will fail with XP_ERROR_STORAGE_EXCEPTION if the key already exists. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is a two element commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. In the success case the second item will be the value passed to the function.
  CreateLink: (TargetPrim: uuid|string, Parent: integer|number) -> (), -- Attempt to link the object the script is in, to target (requires permission PERMISSION_CHANGE_LINKS be set). Requires permission PERMISSION_CHANGE_LINKS be set.
  Damage: (target: uuid|string, damage: number, type: integer|number) -> (), -- Generates a damage event on the targeted agent or task.
  DataSizeKeyValue: () -> uuid, --  Starts an asychronous transaction the request the used and total amount of data allocated for the Experience. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. In the success case the second item will be the the amount in use and the third item will be the total available.
  DeleteCharacter: () -> (), -- Convert link-set from AI/Physics character to Physics object. Convert the current link-set back to a standard object, removing all path-finding properties.
  DeleteKeyValue: (Key: string) -> uuid, --  Starts an asychronous transaction to delete a key-value pair. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is a two element commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. In the success case the second item will be the value associated with the key.
  DeleteSubList: (Source: list, Start: integer|number, End: integer|number) -> list, -- Removes the slice from start to end and returns the remainder of the list. Remove a slice from the list and return the remainder, start and end are inclusive. Using negative numbers for start and/or end causes the index to count backwards from the length of the list, so 0, -1 would delete the entire list. If Start is larger than End the list deleted is the exclusion of the entries; so 6, 4 would delete the entire list except for the 5th. list entry.
  DeleteSubString: (Source: string, Start: integer|number, End: integer|number) -> string, -- Removes the indicated sub-string and returns the result. Start and End are inclusive. Using negative numbers for Start and/or End causes the index to count backwards from the length of the string, so 0, -1 would delete the entire string. If Start is larger than End, the sub-string is the exclusion of the entries; so 6, 4 would delete the entire string except for the 5th. character.
  DerezObject: (ID: uuid|string, flags: integer|number) -> number, -- Derezzes an object previously rezzed by a script in this region. Returns TRUE on success or FALSE if the object could not be derezzed.
  DetachFromAvatar: () -> (), -- Remove the object containing the script from the avatar.
  DetectedDamage: (Number: integer|number) -> list, -- Returns a list containing the current damage for the event, the damage type and the original damage delivered.
  DetectedGrab: (Number: integer|number) -> vector, -- Returns the grab offset of a user touching the object. Returns <0.0, 0.0, 0.0> if Number is not a valid object.
  DetectedGroup: (Number: integer|number) -> number, -- Returns TRUE if detected object or agent Number has the same user group active as this object. It will return FALSE if the object or agent is in the group, but the group is not active.
  DetectedKey: (Number: integer|number) -> uuid, -- Returns the key of detected object or avatar number. Returns NULL_KEY if Number is not a valid index.
  DetectedLinkNumber: (Number: integer|number) -> number, -- Returns the link position of the triggered event for touches and collisions only. 0 for a non-linked object, 1 for the root of a linked object, 2 for the first child, etc.
  DetectedName: (Number: integer|number) -> string, -- Returns the name of detected object or avatar number. Returns the name of detected object number. Returns empty string if Number is not a valid index.
  DetectedOwner: (Number: integer|number) -> uuid, -- Returns the key of detected object's owner. Returns invalid key if Number is not a valid index.
  DetectedPos: (Number: integer|number) -> vector, -- Returns the position of detected object or avatar number. Returns <0.0, 0.0, 0.0> if Number is not a valid index.
  DetectedRezzer: (Number: integer|number) -> uuid, -- Returns the key for the rezzer of the detected object.
  DetectedRot: (Number: integer|number) -> quaternion, -- Returns the rotation of detected object or avatar number. Returns <0.0, 0.0, 0.0, 1.0> if Number is not a valid offset.
  DetectedTouchBinormal: (Index: integer|number) -> vector, -- Returns the surface bi-normal for a triggered touch event. Returns a vector that is the surface bi-normal (tangent to the surface) where the touch event was triggered.
  DetectedTouchFace: (Index: integer|number) -> number, -- Returns the index of the face where the avatar clicked in a triggered touch event.
  DetectedTouchNormal: (Index: integer|number) -> vector, -- Returns the surface normal for a triggered touch event. Returns a vector that is the surface normal (perpendicular to the surface) where the touch event was triggered.
  DetectedTouchPos: (Index: integer|number) -> vector, -- Returns the position, in region coordinates, where the object was touched in a triggered touch event. Unless it is a HUD, in which case it returns the position relative to the attach point.
  DetectedTouchST: (Index: integer|number) -> vector, -- Returns a vector that is the surface coordinates where the prim was touched. The X and Y vector positions contain the horizontal (S) and vertical (T) face coordinates respectively. Each component is in the interval [0.0, 1.0]. TOUCH_INVALID_TEXCOORD is returned if the surface coordinates cannot be determined (e.g. when the viewer does not support this function).
  DetectedTouchUV: (Index: integer|number) -> vector, -- Returns a vector that is the texture coordinates for where the prim was touched. The X and Y vector positions contain the U and V face coordinates respectively. TOUCH_INVALID_TEXCOORD is returned if the touch UV coordinates cannot be determined (e.g. when the viewer does not support this function).
  DetectedType: (Number: integer|number) -> number, -- Returns the type (AGENT, ACTIVE, PASSIVE, SCRIPTED) of detected object. Returns 0 if number is not a valid index. Note that number is a bit-field, so comparisons need to be a bitwise checked. e.g.: integer iType = llDetectedType(0); { 	// ...do stuff with the agent }
  DetectedVel: (Number: integer|number) -> vector, -- Returns the velocity of the detected object Number. Returns<0.0, 0.0, 0.0> if Number is not a valid offset.
  Dialog: (AvatarID: uuid|string, Text: string, Buttons: list, Channel: integer|number) -> (), -- Shows a dialog box on the avatar's screen with the message.  Up to 12 strings in the list form buttons.  If a button is clicked, the name is chatted on Channel. Opens a "notify box" in the given avatars screen displaying the message.  Up to twelve buttons can be specified in a list of strings. When the user clicks a button, the name of the button is said on the specified channel.  Channels work just like llSay(), so channel 0 can be heard by everyone.  The chat originates at the object's position, not the avatar's position, even though it is said as the avatar (uses avatar's UUID and Name etc.).  Examples:  llDialog(who, "Are you a boy or a girl?", [ "Boy", "Girl" ], -4913);  llDialog(who, "This shows only an OK button.", [], -192);  llDialog(who, "This chats so you can 'hear' it.", ["Hooray"], 0);
  Die: () -> (), -- Delete the object which holds the script.
  DumpList2String: (Source: list, Separator: string) -> string, -- Returns the list as a single string, using Separator between the entries. Write the list out as a single string, using Separator between values.
  EdgeOfWorld: (Position: vector, Direction: vector) -> number, -- Checks to see whether the border hit by Direction from Position is the edge of the world (has no neighboring region). Returns TRUE if the line along Direction from Position hits the edge of the world in the current simulator, returns FALSE if that edge crosses into another simulator.
  EjectFromLand: (AvatarID: uuid|string) -> (), -- Ejects AvatarID from land that you own. Ejects AvatarID from land that the object owner (group or resident) owns.
  Email: (Address: string, Subject: string, Text: string) -> (), -- Sends email to Address with Subject and Message. Sends an email to Address with Subject and Message.
  EscapeURL: (URL: string) -> string, -- Returns an escaped/encoded version of url, replacing spaces with %20 etc. Returns the string that is the URL-escaped version of URL (replacing spaces with %20, etc.).  This function returns the UTF-8 encoded escape codes for selected characters.
  Euler2Rot: (Vector: vector) -> quaternion, -- Returns the rotation representation of the Euler angles. Returns the rotation represented by the Euler Angle.
  Evade: (TargetID: uuid|string, Options: list) -> (), -- Evade a specified target. Characters will (roughly) try to hide from their pursuers if there is a good hiding spot along their fleeing path. Hiding means no direct line of sight from the head of the character (centre of the top of its physics bounding box) to the head of its pursuer and no direct path between the two on the navigation-mesh.
  ExecCharacterCmd: (Command: integer|number, Options: list) -> (), -- Execute a character command. Send a command to the path system. Currently only supports stopping the current path-finding operation or causing the character to jump.
  Fabs: (Value: number) -> number, -- Returns the positive version of Value. Returns the absolute value of Value.
  FindNotecardTextCount: (NotecardName: string, Pattern: string, Options: list) -> uuid, -- Searches the text of a cached notecard for lines containing the given pattern and returns the number of matches found through a dataserver event.
  FindNotecardTextSync: (NotecardName: string, Pattern: string, StartMatch: integer|number, Count: integer|number, Options: list) -> list, -- Searches the text of a cached notecard for lines containing the given pattern. Returns a list of line numbers and column where a match is found. If the notecard is not in the cache it returns a list containing a single entry of NAK. If no matches are found an empty list is returned.
  FleeFrom: (Source: vector, Distance: number, Options: list) -> (), -- Flee from a point. Directs a character (llCreateCharacter) to keep away from a defined position in the region or adjacent regions.
  Floor: (Value: number) -> number, -- Returns largest integer value <= Value.
  ForceMouselook: (Enable: integer|number) -> (), -- If Enable is TRUE any avatar that sits on this object is forced into mouse-look mode. After calling this function with Enable set to TRUE, any agent sitting down on the prim will be forced into mouse-look. Just like llSitTarget, this changes a permanent property of the prim (not the object) and needs to be reset by calling this function with Enable set to FALSE in order to disable it.
  Frand: (Magnitude: number) -> number, -- Returns a pseudo random number in the range [0, Magnitude] or [Magnitude, 0]. Returns a pseudo-random number between [0, Magnitude].
  GenerateKey: () -> uuid, -- Generates a key (SHA-1 hash) using UUID generation to create a unique key. As the UUID produced is versioned, it should never return a value of NULL_KEY. The specific UUID version is an implementation detail that has changed in the past and may change again in the future. Do not depend upon the UUID that is returned to be version 5 SHA-1 hash.
  GetAccel: () -> vector, -- Returns the acceleration of the object relative to the region's axes. Gets the acceleration of the object.
  GetAgentInfo: (AvatarID: uuid|string) -> number, -- Returns an integer bit-field containing the agent information about id.  Returns AGENT_FLYING, AGENT_ATTACHMENTS, AGENT_SCRIPTED, AGENT_SITTING, AGENT_ON_OBJECT, AGENT_MOUSELOOK, AGENT_AWAY, AGENT_BUSY, AGENT_TYPING, AGENT_CROUCHING, AGENT_ALWAYS_RUN, AGENT_WALKING, AGENT_IN_AIR and/or AGENT_FLOATING_VIA_SCRIPTED_ATTACHMENT. Returns information about the given agent ID as a bit-field of agent info constants.
  GetAgentLanguage: (AvatarID: uuid|string) -> string, -- Returns the language code of the preferred interface language of the avatar. Returns a string that is the language code of the preferred interface language of the resident.
  GetAgentList: (Scope: integer|number, Options: list) -> list, -- Requests a list of agents currently in the region, limited by the scope parameter. Returns a list [key UUID-0, key UUID-1, ..., key UUID-n] or [string error_msg] - returns avatar keys for all agents in the region limited to the area(s) specified by scope
  GetAgentSize: (AvatarID: uuid|string) -> vector, -- If the avatar is in the same region, returns the size of the bounding box of the requested avatar by id, otherwise returns ZERO_VECTOR. If the agent is in the same region as the object, returns the size of the avatar.
  GetAlpha: (Face: integer|number) -> number, -- Returns the alpha value of Face. Returns the 'alpha' of the given face. If face is ALL_SIDES the value returned is the mean average of all faces.
  GetAndResetTime: () -> number, -- Returns the script time in seconds and then resets the script timer to zero. Gets the time in seconds since starting and resets the time to zero.
  GetAnimation: (AvatarID: uuid|string) -> string, -- Returns the name of the currently playing locomotion animation for the avatar id. Returns the currently playing animation for the specified avatar ID.
  GetAnimationList: (AvatarID: uuid|string) -> list, -- Returns a list of keys of playing animations for an avatar. Returns a list of keys of all playing animations for the specified avatar ID.
  GetAnimationOverride: (AnimationState: string) -> string, -- Returns a string that is the name of the animation that is used for the specified animation state To use this function the script must obtain either the PERMISSION_OVERRIDE_ANIMATIONS or PERMISSION_TRIGGER_ANIMATION permission (automatically granted to attached objects).
  GetAttached: () -> number, -- Returns the object's attachment point, or 0 if not attached.
  GetAttachedList: (ID: uuid|string) -> list, -- Returns a list of keys of all visible (not HUD) attachments on the avatar identified by the ID argument
  GetAttachedListFiltered: (AgentID: uuid|string, Options: list) -> list, -- Retrieves a list of attachments on an avatar.
  GetBoundingBox: (ID: uuid|string) -> list, -- Returns the bounding box around the object (including any linked prims) relative to its root prim, as a list in the format [ (vector) min_corner, (vector) max_corner ].
  GetCameraAspect: () -> number, -- Returns the current camera aspect ratio (width / height) of the agent who has granted the scripted object PERMISSION_TRACK_CAMERA permissions. If no permissions have been granted: it returns zero.
  GetCameraFOV: () -> number, -- Returns the current camera field of view of the agent who has granted the scripted object PERMISSION_TRACK_CAMERA permissions. If no permissions have been granted: it returns zero.
  GetCameraPos: () -> vector, -- Returns the current camera position for the agent the task has permissions for. Returns the position of the camera, of the user that granted the script PERMISSION_TRACK_CAMERA. If no user has granted the permission, it returns ZERO_VECTOR.
  GetCameraRot: () -> quaternion, -- Returns the current camera orientation for the agent the task has permissions for. If no user has granted the PERMISSION_TRACK_CAMERA permission, returns ZERO_ROTATION.
  GetCenterOfMass: () -> vector, -- Returns the prim's centre of mass (unless called from the root prim, where it returns the object's centre of mass).
  GetClosestNavPoint: (Point: vector, Options: list) -> list, -- Get the closest navigable point to the point provided. The function accepts a point in region-local space (like all the other path-finding methods) and returns either an empty list or a list containing a single vector which is the closest point on the navigation-mesh to the point provided.
  GetColor: (Face: integer|number) -> vector, -- Returns the color on Face. Returns the color of Face as a vector of red, green, and blue values between 0 and 1. If face is ALL_SIDES the color returned is the mean average of each channel.
  GetCreator: () -> uuid, -- Returns a key for the creator of the prim. Returns the key of the object's original creator. Similar to llGetOwner.
  GetDate: () -> string, -- Returns the current date in the UTC time zone in the format YYYY-MM-DD. Returns the current UTC date as YYYY-MM-DD.
  GetDayLength: () -> number, -- Returns the number of seconds in a day on this parcel.
  GetDayOffset: () -> number, -- Returns the number of seconds in a day is offset from midnight in this parcel.
  GetDisplayName: (AvatarID: uuid|string) -> string, -- Returns the display name of an avatar, if the avatar is connected to the current region, or if the name has been cached. Otherwise, returns an empty string. Use llRequestDisplayName if the avatar may be absent from the region.
  GetEnergy: () -> number, -- Returns how much energy is in the object as a percentage of maximum.
  GetEnv: (DataRequest: string) -> string, -- Returns a string with the requested data about the region.
  GetEnvironment: (Position: vector, EnvParams: list) -> list, -- Returns a string with the requested data about the region.
  GetExperienceDetails: (ExperienceID: uuid|string) -> list, --  Returns a list with the following Experience properties: [Experience Name, Owner ID, Group ID, Experience ID, State, State Message]. State is an integer corresponding to one of the constants XP_ERROR_... and State Message is the string returned by llGetExperienceErrorMessage for that integer.
  GetExperienceErrorMessage: (Error: integer|number) -> string, --  Returns a string describing the error code passed or the string corresponding with XP_ERROR_UNKNOWN_ERROR if the value is not a valid Experience error code.
  GetForce: () -> vector, -- Returns the force (if the script is physical). Returns the current force if the script is physical.
  GetFreeMemory: () -> number, -- Returns the number of free bytes of memory the script can use. Returns the available free space for the current script. This is inaccurate with LSO.
  GetFreeURLs: () -> number, -- Returns the number of available URLs for the current script. Returns an integer that is the number of available URLs.
  GetGMTclock: () -> number, -- Returns the time in seconds since midnight GMT. Gets the time in seconds since midnight in GMT/UTC.
  GetGeometricCenter: () -> vector, -- Returns the vector that is the geometric center of the object relative to the root prim.
  GetHTTPHeader: (HTTPRequestID: uuid|string, Header: string) -> string, -- Returns the value for header for request_id. Returns a string that is the value of the Header for HTTPRequestID.
  GetHealth: (ID: uuid|string) -> number, -- Returns the current health of an avatar or object in the region.
  GetInventoryAcquireTime: (InventoryItem: string) -> string, -- Returns the time at which the item was placed into this prim's inventory as a timestamp.
  GetInventoryCreator: (InventoryItem: string) -> uuid, -- Returns a key for the creator of the inventory item. This function returns the UUID of the creator of item. If item is not found in inventory, the object says "No item named 'name'".
  GetInventoryDesc: (InventoryItem: string) -> string, -- Returns the item description of the item in inventory. If item is not found in inventory, the object says "No item named 'name'" to the debug channel and returns an empty string.
  GetInventoryKey: (InventoryItem: string) -> uuid, -- Returns the key that is the UUID of the inventory named. Returns the key of the inventory named.
  GetInventoryName: (InventoryType: integer|number, Index: integer|number) -> string, -- Returns the name of the inventory item of a given type, specified by index number. Use the inventory constants INVENTORY_* to specify the type.
  GetInventoryNumber: (InventoryType: integer|number) -> number, -- Returns the quantity of items of a given type (INVENTORY_* flag) in the prim's inventory. Use the inventory constants INVENTORY_* to specify the type.
  GetInventoryPermMask: (InventoryItem: string, BitMask: integer|number) -> number, -- Returns the requested permission mask for the inventory item. Returns the requested permission mask for the inventory item defined by InventoryItem. If item is not in the object's inventory, llGetInventoryPermMask returns FALSE and causes the object to say "No item named '<item>'", where "<item>" is item.
  GetInventoryType: (InventoryItem: string) -> number, -- Returns the type of the named inventory item. Like all inventory functions, llGetInventoryType is case-sensitive.
  GetKey: () -> uuid, -- Returns the key of the prim the script is attached to. Get the key for the object which has this script.
  GetLandOwnerAt: (Position: vector) -> uuid, -- Returns the key of the land owner, returns NULL_KEY if public. Returns the key of the land owner at Position, or NULL_KEY if public.
  GetLinkKey: (LinkNumber: integer|number) -> uuid, -- Returns the key of the linked prim LinkNumber. Returns the key of LinkNumber in the link set.
  GetLinkMedia: (LinkNumber: integer|number, Face: integer|number, Parameters: list) -> list, -- Get the media parameters for a particular face on linked prim, given the desired list of parameter names. Returns a list of values in the order requested.	Returns an empty list if no media exists on the face.
  GetLinkName: (LinkNumber: integer|number) -> string, -- Returns the name of LinkNumber in a link set. Returns the name of LinkNumber the link set.
  GetLinkNumber: () -> number, -- Returns the link number of the prim containing the script (0 means not linked, 1 the prim is the root, 2 the prim is the first child, etc.). Returns the link number of the prim containing the script. 0 means no link, 1 the root, 2 for first child, etc.
  GetLinkNumberOfSides: (LinkNumber: integer|number) -> number, -- Returns the number of sides of the specified linked prim. Returns an integer that is the number of faces (or sides) of the prim link.
  GetLinkPrimitiveParams: (LinkNumber: integer|number, Parameters: list) -> list, -- Returns the list of primitive attributes requested in the Parameters list for LinkNumber. PRIM_* flags can be broken into three categories, face flags, prim flags, and object flags. * Supplying a prim or object flag will return that flags attributes. * Face flags require the user to also supply a face index parameter.
  GetLinkSitFlags: (LinkNumber: integer|number) -> number, -- Returns the sit flags set on the specified prim in a linkset.
  GetListEntryType: (ListVariable: list, Index: integer|number) -> number, -- Returns the type of the index entry in the list (TYPE_INTEGER, TYPE_FLOAT, TYPE_STRING, TYPE_KEY, TYPE_VECTOR, TYPE_ROTATION, or TYPE_INVALID if index is off list). Returns the type of the variable at Index in ListVariable.
  GetListLength: (ListVariable: list) -> number, -- Returns the number of elements in the list. Returns the number of elements in ListVariable.
  GetLocalPos: () -> vector, -- Returns the position relative to the root. Returns the local position of a child object relative to the root.
  GetLocalRot: () -> quaternion, -- Returns the rotation local to the root. Returns the local rotation of a child object relative to the root.
  GetMass: () -> number, -- Returns the mass of object that the script is attached to. Returns the scripted object's mass. When called from a script in a link-set, the parent will return the sum of the link-set weights, while a child will return just its own mass. When called from a script inside an attachment, this function will return the mass of the avatar it's attached to, not its own.
  GetMassMKS: () -> number, -- Acts as llGetMass(), except that the units of the value returned are Kg.
  GetMaxScaleFactor: () -> number, -- Returns the largest multiplicative uniform scale factor that can be successfully applied (via llScaleByFactor()) to the object without violating prim size or linkability rules.
  GetMemoryLimit: () -> number, -- Get the maximum memory a script can use, in bytes.
  GetMinScaleFactor: () -> number, -- Returns the smallest multiplicative uniform scale factor that can be successfully applied (via llScaleByFactor()) to the object without violating prim size or linkability rules.
  GetMoonDirection: () -> vector, -- Returns a normalized vector of the direction of the moon in the parcel. Returns the moon's direction on the simulator in the parcel.
  GetMoonRotation: () -> quaternion, -- Returns the rotation applied to the moon in the parcel.
  GetNextEmail: (Address: string, Subject: string) -> (), -- Fetch the next queued email with that matches the given address and/or subject, via the email event. If the parameters are blank, they are not used for filtering.
  GetNotecardLine: (NotecardName: string, LineNumber: integer|number) -> uuid, -- Returns LineNumber from NotecardName via the dataserver event. The line index starts at zero. If the requested line is passed the end of the note-card the dataserver event will return the constant EOF string. The key returned by this function is a unique identifier which will be supplied to the dataserver event in the requested parameter.
  GetNotecardLineSync: (NotecardName: string, LineNumber: integer|number) -> string, -- Returns LineNumber from NotecardName. The line index starts at zero. If the requested line is past the end of the note-card the return value will be set to the constant EOF string. If the note-card is not cached on the simulator the return value is the NAK string.
  GetNumberOfNotecardLines: (NotecardName: string) -> uuid, -- Returns the number of lines contained within a notecard via the dataserver event. The key returned by this function is a query ID for identifying the dataserver reply.
  GetNumberOfPrims: () -> number, -- Returns the number of prims in a link set the script is attached to. Returns the number of prims in (and avatars seated on) the object the script is in.
  GetNumberOfSides: () -> number, -- Returns the number of faces (or sides) of the prim. Returns the number of sides of the prim which has the script.
  GetObjectAnimationNames: () -> list, -- Returns a list of names of playing animations for an object. Returns a list of names of all playing animations for the current object.
  GetObjectDesc: () -> string, -- Returns the description of the prim the script is attached to. Returns the description of the scripted object/prim. You can set the description using llSetObjectDesc.
  GetObjectDetails: (ID: uuid|string, Parameters: list) -> list, -- Returns a list of object details specified in the Parameters list for the object or avatar in the region with key ID. Parameters are specified by the OBJECT_* constants.
  GetObjectLinkKey: (id: uuid|string, link_no: integer|number) -> uuid, -- Returns the key of the linked prim link_no in a linkset. Returns the key of link_no in the link set specified by id.
  GetObjectMass: (ID: uuid|string) -> number, -- Returns the mass of the avatar or object in the region. Gets the mass of the object or avatar corresponding to ID.
  GetObjectName: () -> string, -- Returns the name of the prim which the script is attached to. Returns the name of the prim (not object) which contains the script.
  GetObjectPermMask: (Category: integer|number) -> number, -- Returns the permission mask of the requested category for the object.
  GetObjectPrimCount: (ObjectID: uuid|string) -> number, -- Returns the total number of prims for an object in the region. Returns the prim count for any object id in the same region.
  GetOmega: () -> vector, -- Returns the rotation velocity in radians per second. Returns a vector that is the rotation velocity of the object in radians per second.
  GetOwner: () -> uuid, -- Returns the object owner's UUID. Returns the key for the owner of the object.
  GetOwnerKey: (ObjectID: uuid|string) -> uuid, -- Returns the owner of ObjectID. Returns the key for the owner of object ObjectID.
  GetParcelDetails: (Position: vector, ParcelDetails: list) -> list, -- Returns a list of parcel details specified in the ParcelDetails list for the parcel at Position. Parameters is one or more of: PARCEL_DETAILS_NAME, _DESC, _OWNER, _GROUP, _AREA, _ID, _SEE_AVATARS. Returns a list that is the parcel details specified in ParcelDetails (in the same order) for the parcel at Position.
  GetParcelFlags: (Position: vector) -> number, -- Returns a mask of the parcel flags (PARCEL_FLAG_*) for the parcel that includes the point Position. Returns a bit-field specifying the parcel flags (PARCEL_FLAG_*) for the parcel at Position.
  GetParcelMaxPrims: (Position: vector, SimWide: integer|number) -> number, -- Returns the maximum number of prims allowed on the parcel at Position for a given scope. The scope may be set to an individual parcel or the combined resources of all parcels with the same ownership in the region.
  GetParcelMusicURL: () -> string, -- Gets the streaming audio URL for the parcel object is on. The object owner, avatar or group, must also be the land owner.
  GetParcelPrimCount: (Position: vector, Category: integer|number, SimWide: integer|number) -> number, -- Returns the number of prims on the parcel at Position of the given category. Categories: PARCEL_COUNT_TOTAL, _OWNER, _GROUP, _OTHER, _SELECTED, _TEMP. Returns the number of prims used on the parcel at Position which are in Category. If SimWide is TRUE, it returns the total number of objects for all parcels with matching ownership in the category specified. If SimWide is FALSE, it returns the number of objects on this specific parcel in the category specified
  GetParcelPrimOwners: (Position: vector) -> list, -- Returns a list of up to 100 residents who own objects on the parcel at Position, with per-owner land impact totals. Requires owner-like permissions for the parcel, and for the script owner to be present in the region. The list is formatted as [ key agentKey1, integer agentLI1, key agentKey2, integer agentLI2, ... ], sorted by agent key. The integers are the combined land impacts of the objects owned by the corresponding agents.
  GetPermissions: () -> number, -- Returns an integer bitmask of the permissions that have been granted to the script. Individual permissions can be determined using a bit-wise "and" operation against the PERMISSION_* constants
  GetPermissionsKey: () -> uuid, -- Returns the key of the avatar that last granted or declined permissions to the script. Returns NULL_KEY if permissions were never granted or declined.
  GetPhysicsMaterial: () -> list, -- Returns a list of the form [float gravity_multiplier, float restitution, float friction, float density].
  GetPos: () -> vector, -- Returns the position of the task in region coordinates. Returns the vector position of the task in region coordinates.
  GetPrimMediaParams: (Face: integer|number, Parameters: list) -> list, -- Returns the media parameters for a particular face on an object, given the desired list of parameter names, in the order requested. Returns an empty list if no media exists on the face.
  GetPrimitiveParams: (Parameters: list) -> list, -- Returns the primitive parameters specified in the parameters list. Returns primitive parameters specified in the Parameters list.
  GetRegionAgentCount: () -> number, -- Returns the number of avatars in the region. Returns an integer that is the number of avatars in the region.
  GetRegionCorner: () -> vector, -- Returns a vector, in meters, that is the global location of the south-west corner of the region which the object is in. Returns the Region-Corner of the simulator containing the task. The region-corner is a vector (values in meters) representing distance from the first region.
  GetRegionDayLength: () -> number, -- Returns the number of seconds in a day in this region.
  GetRegionDayOffset: () -> number, -- Returns the number of seconds in a day is offset from midnight in this parcel.
  GetRegionFPS: () -> number, -- Returns the mean region frames per second.
  GetRegionFlags: () -> number, -- Returns the region flags (REGION_FLAG_*) for the region the object is in. Returns a bit-field specifying the region flags (REGION_FLAG_*) for the region the object is in.
  GetRegionMoonDirection: () -> vector, -- Returns a normalized vector of the direction of the moon in the region. Returns the moon's direction on the simulator.
  GetRegionMoonRotation: () -> quaternion, -- Returns the rotation applied to the moon in the region.
  GetRegionName: () -> string, -- Returns the current region name.
  GetRegionSunDirection: () -> vector, -- Returns a normalized vector of the direction of the sun in the region. Returns the sun's direction on the simulator.
  GetRegionSunRotation: () -> quaternion, -- Returns the rotation applied to the sun in the region.
  GetRegionTimeDilation: () -> number, -- Returns the current time dilation as a float between 0.0 (full dilation) and 1.0 (no dilation). Returns the current time dilation as a float between 0.0 and 1.0.
  GetRegionTimeOfDay: () -> number, -- Returns the time in seconds since environmental midnight for the entire region.
  GetRenderMaterial: (Face: integer|number) -> string, -- Returns a string that is the render material on face (the inventory name if it is a material in the prim's inventory, otherwise the key). Returns the render material of a face, if it is found in object inventory, its key otherwise.
  GetRootPosition: () -> vector, -- Returns the position (in region coordinates) of the root prim of the object which the script is attached to. This is used to allow a child prim to determine where the root is.
  GetRootRotation: () -> quaternion, -- Returns the rotation (relative to the region) of the root prim of the object which the script is attached to. Gets the global rotation of the root object of the object script is attached to.
  GetRot: () -> quaternion, -- Returns the rotation relative to the region's axes. Returns the rotation.
  GetSPMaxMemory: () -> number, -- Returns the maximum used memory for the current script. Only valid after using PROFILE_SCRIPT_MEMORY. Non-mono scripts always use 16k. Returns the integer of the most bytes used while llScriptProfiler was last active.
  GetScale: () -> vector, -- Returns the scale of the prim. Returns a vector that is the scale (dimensions) of the prim.
  GetScriptName: () -> string, -- Returns the name of the script that this function is used in. Returns the name of this script.
  GetScriptState: (ScriptName: string) -> number, -- Returns TRUE if the script named is running. Returns TRUE if ScriptName is running.
  GetSimStats: (StatType: integer|number) -> number, -- Returns a float that is the requested statistic.
  GetSimulatorHostname: () -> string, -- Returns the host-name of the machine which the script is running on. For example, "sim225.agni.lindenlab.com".
  GetStartParameter: () -> number, -- Returns an integer that is the script rez parameter. If the object was rezzed by an agent, this function returns 0.
  GetStartString: () -> string, -- Returns an string that is the value passed to llRezObjectWithParams with REZ_PARAM_STRING. If the object was rezzed by an agent, this function returns an empty string.
  GetStaticPath: (Start: vector, End: vector, Radius: number, Parameters: list) -> list, --
  GetStatus: (StatusFlag: integer|number) -> number, -- Returns boolean value of the specified status (e.g. STATUS_PHANTOM) of the object the script is attached to.
  GetSubString: (String: string, Start: integer|number, End: integer|number) -> string, -- Returns a sub-string from String, in a range specified by the Start and End indicies (inclusive). Using negative numbers for Start and/or End causes the index to count backwards from the length of the string, so 0, -1 would capture the entire string. If Start is greater than End, the sub string is the exclusion of the entries.
  GetSunDirection: () -> vector, -- Returns a normalized vector of the direction of the sun in the parcel. Returns the sun's direction on the simulator in the parcel.
  GetSunRotation: () -> quaternion, -- Returns the rotation applied to the sun in the parcel.
  GetTexture: (Face: integer|number) -> string, -- Returns a string that is the texture on face (the inventory name if it is a texture in the prim's inventory, otherwise the key). Returns the texture of a face, if it is found in object inventory, its key otherwise.
  GetTextureOffset: (Face: integer|number) -> vector, -- Returns the texture offset of face in the x and y components of a vector.
  GetTextureRot: (Face: integer|number) -> number, -- Returns the texture rotation of side.
  GetTextureScale: (Face: integer|number) -> vector, -- Returns the texture scale of side in the x and y components of a vector. Returns the texture scale of a side in the x and y components of a vector.
  GetTime: () -> number, -- Returns the time in seconds since the last region reset, script reset, or call to either llResetTime or llGetAndResetTime.
  GetTimeOfDay: () -> number, -- Returns the time in seconds since environmental midnight on the parcel.
  GetTimestamp: () -> string, -- Returns a time-stamp (UTC time zone) in the format: YYYY-MM-DDThh:mm:ss.ff..fZ.
  GetTorque: () -> vector, -- Returns the torque (if the script is physical). Returns a vector that is the torque (if the script is physical).
  GetUnixTime: () -> number, -- Returns the number of seconds elapsed since 00:00 hours, Jan 1, 1970 UTC from the system clock.
  GetUsedMemory: () -> number, -- Returns the current used memory for the current script. Non-mono scripts always use 16K. Returns the integer of the number of bytes of memory currently in use by the script. Non-mono scripts always use 16K.
  GetUsername: (AvatarID: uuid|string) -> string, -- Returns the username of an avatar, if the avatar is connected to the current region, or if the name has been cached. Otherwise, returns an empty string. Use llRequestUsername if the avatar may be absent from the region.
  GetVel: () -> vector, -- Returns the velocity of the object. Returns a vector that is the velocity of the object.
  GetVisualParams: (ID: uuid|string, Parameters: list) -> list, -- Returns a list of the current value for each requested visual parameter.
  GetWallclock: () -> number, -- Returns the time in seconds since midnight California Pacific time (PST/PDT). Returns the time in seconds since simulator's time-zone midnight (Pacific Time).
  GiveAgentInventory: (AgentID: uuid|string, FolderName: string, InventoryItems: list, Options: list) -> number, -- Give InventoryItems to the specified agent as a new folder of items, as permitted by the permissions system. The target must be an agent.
  GiveInventory: (TargetID: uuid|string, InventoryItem: string) -> (), -- Give InventoryItem to destination represented by TargetID, as permitted by the permissions system. TargetID may be any agent or an object in the same region.
  GiveInventoryList: (TargetID: uuid|string, FolderName: string, InventoryItems: list) -> (), -- Give InventoryItems to destination (represented by TargetID) as a new folder of items, as permitted by the permissions system. TargetID may be any agent or an object in the same region. If TargetID is an object, the items are passed directly to the object inventory (no folder is created).
  GiveMoney: (AvatarID: uuid|string, Amount: integer|number) -> number, -- Transfers Amount of L$ from script owner to AvatarID. This call will silently fail if PERMISSION_DEBIT has not been granted.
  GodLikeRezObject: (InventoryItemID: uuid|string, Position: vector) -> (), -- Rez directly off of a UUID if owner has god-bit set.
  Ground: (Offset: vector) -> number, -- Returns the ground height at the object position + offset. Returns the ground height at the object's position + Offset.
  GroundContour: (Offset: vector) -> vector, -- Returns the ground contour direction below the object position + Offset. Returns the ground contour at the object's position + Offset.
  GroundNormal: (Offset: vector) -> vector, -- Returns the ground normal below the object position + offset. Returns the ground contour at the object's position + Offset.
  GroundRepel: (Height: number, Water: integer|number, Tau: number) -> (), -- Critically damps to height if within height * 0.5 of level (either above ground level or above the higher of land and water if water == TRUE). Critically damps to fHeight if within fHeight * 0.5 of ground or water level.  The height is above ground level if iWater is FALSE or above the higher of land and water if iWater is TRUE.  Do not use with vehicles. Only works in physics-enabled objects.
  GroundSlope: (Offset: vector) -> vector, -- Returns the ground slope below the object position + Offset. Returns the ground slope at the object position + Offset.
  HMAC: (Key: string, Message: string, Algorithm: string) -> string, -- Returns the base64-encoded hashed message authentication code (HMAC), of Message using PEM-formatted Key and digest Algorithm (md5, sha1, sha224, sha256, sha384, sha512).
  HTTPRequest: (URL: string, Parameters: list, Body: string) -> uuid, -- Sends an HTTP request to the specified URL with the Body of the request and Parameters. Returns a key that is a handle identifying the HTTP request made.
  HTTPResponse: (HTTPRequestID: uuid|string, Status: integer|number, Body: string) -> (), -- Responds to an incoming HTTP request which was triggerd by an http_request event within the script. HTTPRequestID specifies the request to respond to (this ID is supplied in the http_request event handler). Status and Body specify the status code and message to respond with.
  Hash: (value: string) -> number, -- Calculates the 32bit hash value for the provided string.
  InsertString: (TargetVariable: string, Position: integer|number, SourceVariable: string) -> string, -- Inserts SourceVariable into TargetVariable at Position, and returns the result. Inserts SourceVariable into TargetVariable at Position and returns the result. Note this does not alter TargetVariable.
  InstantMessage: (AvatarID: uuid|string, Text: string) -> (), -- IMs Text to the user identified. Send Text to the user as an instant message.
  IntegerToBase64: (Value: integer|number) -> string, -- Returns a string that is a Base64 big endian encode of Value. Encodes the Value as an 8-character Base64 string.
  IsFriend: (agent_id: uuid|string) -> number, -- Returns TRUE if avatar ID is a friend of the script owner.
  Json2List: (JSON: string) -> list, -- Converts the top level of the JSON string to a list.
  JsonGetValue: (JSON: string, Specifiers: list) -> string, -- Gets the value indicated by Specifiers from the JSON string.
  JsonSetValue: (JSON: string, Specifiers: list, Value: string) -> string, -- Returns a new JSON string that is the JSON given with the Value indicated by Specifiers set to Value.
  JsonValueType: (JSON: string, Specifiers: list) -> string, -- Returns the type constant (JSON_*) for the value in JSON indicated by Specifiers.
  Key2Name: (ID: uuid|string) -> string, -- Returns the name of the prim or avatar specified by ID. The ID must be a valid rezzed prim or avatar key in the current simulator, otherwise an empty string is returned. For avatars, the returned name is the legacy name
  KeyCountKeyValue: () -> uuid, --  Starts an asychronous transaction the request the number of keys in the data store. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. In the success case the second item will the the number of keys in the system.
  KeysKeyValue: (First: integer|number, Count: integer|number) -> uuid, --  Starts an asychronous transaction the request a number of keys from the data store. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. The error XP_ERROR_KEY_NOT_FOUND is returned if First is greater than or equal to the number of keys in the data store. In the success case the subsequent items will be the keys requested. The number of keys returned may be less than requested if the return value is too large or if there is not enough keys remaining. The order keys are returned is not guaranteed but is stable between subsequent calls as long as no keys are added or removed. Because the keys are returned in a comma-delimited list it is not recommended to use commas in key names if this function is used.
  Linear2sRGB: (color: vector) -> vector, -- Converts a color from the linear colorspace to sRGB.
  LinkAdjustSoundVolume: (LinkNumber: integer|number, Volume: number) -> (), -- Adjusts the volume (0.0 - 1.0) of the currently playing sound attached to the link. This function has no effect on sounds started with llTriggerSound.
  LinkParticleSystem: (LinkNumber: integer|number, Rules: list) -> (), -- Creates a particle system in prim LinkNumber based on Rules. An empty list removes a particle system from object. List format is [ rule-1, data-1, rule-2, data-2 ... rule-n, data-n ]. This is identical to llParticleSystem except that it applies to a specified linked prim and not just the prim the script is in.
  LinkPlaySound: (LinkNumber: integer|number, Sound: string, Volume: number, Flags: integer|number) -> (), -- Plays Sound, once or looping, at Volume (0.0 - 1.0). The sound may be attached to the link or triggered at its location. Only one sound may be attached to an object at a time, and attaching a new sound or calling llStopSound will stop the previously attached sound.
  LinkSetSoundQueueing: (LinkNumber: integer|number, QueueEnable: integer|number) -> (), -- Limits radius for audibility of scripted sounds (both attached and triggered) to distance Radius around the link.
  LinkSetSoundRadius: (LinkNumber: integer|number, radius: number) -> (), -- Limits radius for audibility of scripted sounds (both attached and triggered) to distance Radius around the link.
  LinkSitTarget: (LinkNumber: integer|number, Offset: vector, Rotation: quaternion) -> (), -- Set the sit location for the linked prim(s). If Offset == <0,0,0> clear it. Set the sit location for the linked prim(s). The sit location is relative to the prim's position and rotation.
  LinkStopSound: (LinkNumber: integer|number) -> (), -- Stops playback of the currently attached sound on a link.
  LinksetDataAvailable: () -> number, -- Returns the number of bytes remaining in the linkset's datastore.
  LinksetDataCountFound: (search: string) -> number, -- Returns the number of keys matching the regular expression passed in the search parameter.
  LinksetDataCountKeys: () -> number, -- Returns the number of keys in the linkset's datastore.
  LinksetDataDelete: (name: string) -> number, -- Deletes a name:value pair from the linkset's datastore.
  LinksetDataDeleteFound: (search: string, pass: string) -> list, -- Deletes all key value pairs in the linkset data where the key matches the regular expression in search. Returns a list consisting of [ #deleted, #not deleted ].
  LinksetDataDeleteProtected: (name: string, pass: string) -> number, -- Deletes a name:value pair from the linkset's datastore.
  LinksetDataFindKeys: (search: string, start: integer|number, count: integer|number) -> list, -- Returns a list of keys from the linkset's data store matching the search parameter.
  LinksetDataListKeys: (start: integer|number, count: integer|number) -> list, -- Returns a list of all keys in the linkset datastore.
  LinksetDataRead: (name: string) -> string, -- Returns the value stored for a key in the linkset.
  LinksetDataReadProtected: (name: string, pass: string) -> string, -- Returns the value stored for a key in the linkset.
  LinksetDataReset: () -> (), -- Resets the linkset's data store, erasing all key-value pairs.
  LinksetDataWrite: (name: string, value: string) -> number, -- Sets a name:value pair in the linkset's datastore
  LinksetDataWriteProtected: (name: string, value: string, pass: string) -> number, -- Sets a name:value pair in the linkset's datastore
  List2CSV: (ListVariable: list) -> string, -- Creates a string of comma separated values from the list. Create a string of comma separated values from the specified list.
  List2Float: (ListVariable: list, Index: integer|number) -> number, -- Copies the float at Index in the list. Returns the value at Index in the specified list. If Index describes a location not in the list, or the value cannot be type-cast to a float, then zero is returned.
  List2Integer: (ListVariable: list, Index: integer|number) -> number, -- Copies the integer at Index in the list. Returns the value at Index in the specified list. If Index describes a location not in the list, or the value cannot be type-cast to an integer, then zero is returned.
  List2Json: (JsonType: string, Values: list) -> string, -- Converts either a strided list of key:value pairs to a JSON_OBJECT, or a list of values to a JSON_ARRAY.
  List2Key: (ListVariable: list, Index: integer|number) -> uuid, -- Copies the key at Index in the list. Returns the value at Index in the specified list. If Index describes a location not in the list, or the value cannot be type-cast to a key, then null string is returned.
  List2List: (ListVariable: list, Start: integer|number, End: integer|number) -> list, -- Returns a subset of entries from ListVariable, in a range specified by the Start and End indicies (inclusive). Using negative numbers for Start and/or End causes the index to count backwards from the length of the string, so 0, -1 would capture the entire string. If Start is greater than End, the sub string is the exclusion of the entries.
  List2ListSlice: (ListVariable: list, Start: integer|number, End: integer|number, Stride: integer|number, slice_index: integer|number) -> list, -- Returns a subset of entries from ListVariable, in a range specified by Start and End indices (inclusive) return the slice_index element of each stride.  Using negative numbers for Start and/or End causes the index to count backwards from the length of the list. (e.g. 0, -1 captures entire list) If slice_index is less than 0, it is counted backwards from the end of the stride.  Stride must be a positive integer > 0 or an empy list is returned. If slice_index falls outside range of stride, an empty list is returned. slice_index is zero-based. (e.g. A stride of 2 has valid indices 0,1)
  List2ListStrided: (ListVariable: list, Start: integer|number, End: integer|number, Stride: integer|number) -> list, -- Copies the strided slice of the list from Start to End. Returns a copy of the strided slice of the specified list from Start to End.
  List2Rot: (ListVariable: list, Index: integer|number) -> quaternion, -- Copies the rotation at Index in the list. Returns the value at Index in the specified list. If Index describes a location not in the list, or the value cannot be type-cast to rotation, thenZERO_ROTATION is returned.
  List2String: (ListVariable: list, Index: integer|number) -> string, -- Copies the string at Index in the list. Returns the value at Index in the specified list as a string. If Index describes a location not in the list then null string is returned.
  List2Vector: (ListVariable: list, Index: integer|number) -> vector, -- Copies the vector at Index in the list. Returns the value at Index in the specified list. If Index describes a location not in the list, or the value cannot be type-cast to a vector, then ZERO_VECTOR is returned.
  ListFindList: (ListVariable: list, Find: list) -> number, -- Returns the index of the first instance of Find in ListVariable. Returns -1 if not found. Returns the position of the first instance of the Find list in the ListVariable. Returns -1 if not found.
  ListFindListNext: (ListVariable: list, Find: list, Instance: integer|number) -> number, -- Returns the index of the nth instance of Find in ListVariable. Returns -1 if not found.
  ListFindStrided: (ListVariable: list, Find: list, Start: integer|number, End: integer|number, Stride: integer|number) -> number, -- Returns the index of the first instance of Find in ListVariable. Returns -1 if not found. Returns the position of the first instance of the Find list in the ListVariable after the start index and before the end index. Steps through ListVariable by stride. Returns -1 if not found.
  ListInsertList: (Target: list, ListVariable: list, Position: integer|number) -> list, -- Returns a list that contains all the elements from Target but with the elements from ListVariable inserted at Position start. Returns a new list, created by inserting ListVariable into the Target list at Position. Note this does not alter the Target.
  ListRandomize: (ListVariable: list, Stride: integer|number) -> list, -- Returns a version of the input ListVariable which has been randomized by blocks of size Stride. If the remainder from the length of the list, divided by the stride is non-zero, this function does not randomize the list.
  ListReplaceList: (Target: list, ListVariable: list, Start: integer|number, End: integer|number) -> list, -- Returns a list that is Target with Start through End removed and ListVariable inserted at Start. Returns a list replacing the slice of the Target list from Start to End with the specified ListVariable. Start and End are inclusive, so 0, 1 would replace the first two entries and 0, 0 would replace only the first list entry.
  ListSort: (ListVariable: list, Stride: integer|number, Ascending: integer|number) -> list, -- Returns the specified list, sorted into blocks of stride in ascending order (if Ascending is TRUE, otherwise descending). Note that sort only works if the first entry of each block is the same datatype.
  ListSortStrided: (ListVariable: list, Stride: integer|number, Sortkey: integer|number, Ascending: integer|number) -> list, -- Returns the specified list, sorted by the specified element into blocks of stride in ascending order (if Ascending is TRUE, otherwise descending). Note that sort only works if the first entry of each block is the same datatype.
  ListStatistics: (Operation: integer|number, ListVariable: list) -> number, -- Performs a statistical aggregate function, specified by a LIST_STAT_* constant, on ListVariables. This function allows a script to perform a statistical operation as defined by operation on a list composed of integers and floats.
  Listen: (Channel: integer|number, SpeakersName: string, SpeakersID: uuid|string, Text: string) -> number, -- Creates a listen callback for Text on Channel from SpeakersName and SpeakersID (SpeakersName, SpeakersID, and/or Text can be empty) and returns an identifier that can be used to deactivate or remove the listen. Non-empty values for SpeakersName, SpeakersID, and Text will filter the results accordingly, while empty strings and NULL_KEY will not filter the results, for string and key parameters respectively. PUBLIC_CHANNEL is the public chat channel that all avatars see as chat text. DEBUG_CHANNEL is the script debug channel, and is also visible to nearby avatars. All other channels are are not sent to avatars, but may be used to communicate with scripts.
  ListenControl: (ChannelHandle: integer|number, Active: integer|number) -> (), -- Makes a listen event callback active or inactive. Pass in the value returned from llListen to the iChannelHandle parameter to specify which listener you are controlling. Use boolean values to specify Active
  ListenRemove: (ChannelHandle: integer|number) -> (), -- Removes a listen event callback. Pass in the value returned from llListen to the iChannelHandle parameter to specify which listener to remove.
  LoadURL: (AvatarID: uuid|string, Text: string, URL: string) -> (), -- Shows dialog to avatar AvatarID offering to load web page at URL.	If user clicks yes, launches their web browser. llLoadURL displays a dialogue box to the user, offering to load the specified web page using the default web browser.
  Log10: (Value: number) -> number, -- Returns the base 10 logarithm of Value. Returns zero if Value <= 0. Returns the base 10 (common) logarithm of the specified Value.
  Log: (Value: number) -> number, -- Returns the natural logarithm of Value. Returns zero if Value <= 0. Returns the base e (natural) logarithm of the specified Value.
  LookAt: (Target: vector, Strength: number, Damping: number) -> (), -- Cause object name to point its forward axis towards Target, at a force controlled by Strength and Damping. Good Strength values are around half the mass of the object and good Damping values are less than 1/10th of the Strength. Asymmetrical shapes require smaller Damping. A Strength of 0.0 cancels the look at.
  LoopSound: (Sound: string, Volume: number) -> (), -- Plays specified Sound, looping indefinitely, at Volume (0.0 - 1.0). Only one sound may be attached to an object at a time. A second call to llLoopSound with the same key will not restart the sound, but the new volume will be used. This allows control over the volume of already playing sounds. Setting the volume to 0 is not the same as calling llStopSound; a sound with 0 volume will continue to loop. To restart the sound from the beginning, call llStopSound before calling llLoopSound again.
  LoopSoundMaster: (Sound: string, Volume: number) -> (), -- Plays attached Sound, looping at volume (0.0 - 1.0), and declares it a sync master. Behaviour is identical to llLoopSound, with the addition of marking the source as a "Sync Master", causing "Slave" sounds to sync to it. If there are multiple masters within a viewers interest area, the most audible one (a function of both distance and volume) will win out as the master. The use of multiple masters within a small area is unlikely to produce the desired effect.
  LoopSoundSlave: (Sound: string, Volume: number) -> (), -- Plays attached sound looping at volume (0.0 - 1.0), synced to most audible sync master. Behaviour is identical to llLoopSound, unless there is a "Sync Master" present. If a Sync Master is already playing the Slave sound will begin playing from the same point the master is in its loop synchronizing the loop points of both sounds. If a Sync Master is started when the Slave is already playing, the Slave will skip to the correct position to sync with the Master.
  MD5String: (Text: string, Nonce: integer|number) -> string, -- Returns a string of 32 hex characters that is an RSA Data Security Inc., MD5 Message-Digest Algorithm of Text with Nonce used as the salt. Returns a 32-character hex string. (128-bit in binary.)
  MakeExplosion: (Particles: integer|number, Scale: number, Velocity: number, Lifetime: number, Arc: number, Texture: string, Offset: vector) -> (), -- Make a round explosion of particles. Deprecated: Use llParticleSystem instead. Make a round explosion of particles using texture from the objects inventory. Deprecated: Use llParticleSystem instead.
  MakeFire: (Particles: integer|number, Scale: number, Velocity: number, Lifetime: number, Arc: number, Texture: string, Offset: vector) -> (), -- Make fire like particles. Deprecated: Use llParticleSystem instead. Make fire particles using texture from the objects inventory. Deprecated: Use llParticleSystem instead.
  MakeFountain: (Particles: integer|number, Scale: number, Velocity: number, Lifetime: number, Arc: number, Bounce: integer|number, Texture: string, Offset: vector, Bounce_Offset: number) -> (), -- Make a fountain of particles. Deprecated: Use llParticleSystem instead. Make a fountain of particles using texture from the objects inventory. Deprecated: Use llParticleSystem instead.
  MakeSmoke: (Particles: integer|number, Scale: number, Velocity: number, Lifetime: number, Arc: number, Texture: string, Offset: vector) -> (), -- Make smoke like particles. Deprecated: Use llParticleSystem instead. Make smoky particles using texture from the objects inventory. Deprecated: Use llParticleSystem instead.
  ManageEstateAccess: (Action: integer|number, AvatarID: uuid|string) -> number, -- Adds or removes agents from the estate's agent access or ban lists, or groups to the estate's group access list. Action is one of the ESTATE_ACCESS_ALLOWED_* operations to perform. Returns an integer representing a boolean, TRUE if the call was successful; FALSE if throttled, invalid action, invalid or null id or object owner is not allowed to manage the estate. The object owner is notified of any changes, unless PERMISSION_SILENT_ESTATE_MANAGEMENT has been granted to the script.
  MapBeacon: (RegionName: string, Position: vector, Options: list) -> (), -- Displays an in world beacon and optionally opens world map for avatar who touched the object or is wearing the script, centered on RegionName with Position highlighted. Only works for scripts attached to avatar, or during touch events.
  MapDestination: (RegionName: string, Position: vector, Direction: vector) -> (), -- Opens world map for avatar who touched is is wearing the script, centred on RegionName with Position highlighted. Only works for scripts attached to avatar, or during touch events. Direction currently has no effect.
  MessageLinked: (LinkNumber: integer|number, Number: integer|number, Text: string, ID: uuid|string) -> (), -- Sends Number, Text, and ID to members of the link set identified by LinkNumber. LinkNumber is either a linked number (available through llGetLinkNumber) or a LINK_* constant.
  MinEventDelay: (Delay: number) -> (), -- Set the minimum time between events being handled.
  ModPow: (Value: integer|number, Power: integer|number, Modulus: integer|number) -> number, -- Returns a Value raised to the Power, mod Modulus. ((a**b)%c) b is capped at 0xFFFF (16 bits). Returns (Value ^ Power) % Modulus. (Value raised to the Power, Modulus). Value is capped at 0xFFFF (16 bits).
  ModifyLand: (Action: integer|number, Area: integer|number) -> (), -- Modify land with action (LAND_LEVEL, LAND_RAISE, LAND_LOWER, LAND_SMOOTH, LAND_NOISE, LAND_REVERT) on size (0, 1, 2, corresponding to 2m x 2m, 4m x 4m, 8m x 8m).
  MoveToTarget: (Target: vector, Tau: number) -> (), -- Critically damp to Target in Tau seconds (if the script is physical). Critically damp to position target in tau-seconds if the script is physical. Good tau-values are greater than 0.2. A tau of 0.0 stops the critical damping.
  Name2Key: (Name: string) -> uuid, -- Look up Agent ID for the named agent in the region.
  NavigateTo: (Location: vector, Options: list) -> (), -- Navigate to destination. Directs an object to travel to a defined position in the region or adjacent regions.
  OffsetTexture: (OffsetS: number, OffsetT: number, Face: integer|number) -> (), -- Sets the texture S and T offsets for the chosen Face. If Face is ALL_SIDES this function sets the texture offsets for all faces.
  OpenFloater: (floater_name: string, url: string, params: list) -> number, -- Returns the value for header for request_id. Returns a string that is the value of the Header for HTTPRequestID.
  OpenRemoteDataChannel: () -> (), -- This function is deprecated.
  Ord: (value: string, index: integer|number) -> number, -- Returns the unicode value of the indicated character in the string.
  OverMyLand: (ID: uuid|string) -> number, -- Returns TRUE if id ID over land owned by the script owner, otherwise FALSE. Returns TRUE if key ID is over land owned by the object owner, FALSE otherwise.
  OwnerSay: (Text: string) -> (), -- says Text to owner only (if owner is in region). Says Text to the owner of the object running the script, if the owner has been within the object's simulator since logging into Second Life, regardless of where they may be in-world.
  ParcelMediaCommandList: (CommandList: list) -> (), -- Controls the playback of multimedia resources on a parcel or for an agent, via one or more PARCEL_MEDIA_COMMAND_* arguments specified in CommandList.
  ParcelMediaQuery: (QueryList: list) -> list, -- Queries the media properties of the parcel containing the script, via one or more PARCEL_MEDIA_COMMAND_* arguments specified in CommandList. This function will only work if the script is contained within an object owned by the land-owner (or if the land is owned by a group, only if the object has been deeded to the group).
  ParseString2List: (Text: string, Separators: list, Spacers: list) -> list, -- Converts Text into a list, discarding Separators, keeping Spacers (Separators and Spacers must be lists of strings, maximum of 8 each). Separators and Spacers are lists of strings with a maximum of 8 entries each.
  ParseStringKeepNulls: (Text: string, Separators: list, Spacers: list) -> list, -- Breaks Text into a list, discarding separators, keeping spacers, keeping any null values generated. (separators and spacers must be lists of strings, maximum of 8 each). llParseStringKeepNulls works almost exactly like llParseString2List, except that if a null is found it will add a null-string instead of discarding it like llParseString2List does.
  ParticleSystem: (Parameters: list) -> (), -- Creates a particle system in the prim the script is attached to, based on Parameters. An empty list removes a particle system from object. List format is [ rule-1, data-1, rule-2, data-2 ... rule-n, data-n ].
  PassCollisions: (Pass: integer|number) -> (), -- Configures how collision events are passed to scripts in the linkset. If Pass == TRUE, collisions involving collision-handling scripted child prims are also passed on to the root prim. If Pass == FALSE (default behavior), such collisions will only trigger events in the affected child prim.
  PassTouches: (Pass: integer|number) -> (), -- Configures how touch events are passed to scripts in the linkset. If Pass == TRUE, touches involving touch-handling scripted child prims are also passed on to the root prim. If Pass == FALSE (default behavior), such touches will only trigger events in the affected child prim.
  PatrolPoints: (Points: list, Options: list) -> (), -- Patrol a list of points. Sets the points for a character (llCreateCharacter) to patrol along.
  PlaySound: (Sound: string, Volume: number) -> (), -- Plays Sound once, at Volume (0.0 - 1.0) and attached to the object. Only one sound may be attached to an object at a time, and attaching a new sound or calling llStopSound will stop the previously attached sound. A second call to llPlaySound with the same sound will not restart the sound, but the new volume will be used, which allows control over the volume of already playing sounds. To restart the sound from the beginning, call llStopSound before calling llPlaySound again.
  PlaySoundSlave: (Sound: string, Volume: number) -> (), -- Plays attached Sound once, at Volume (0.0 - 1.0), synced to next loop of most audible sync master. Behaviour is identical to llPlaySound, unless there is a "Sync Master" present. If a Sync Master is already playing, the Slave sound will not be played until the Master hits its loop point and returns to the beginning. llPlaySoundSlave will play the sound exactly once; if it is desired to have the sound play every time the Master loops, either use llLoopSoundSlave with extra silence padded on the end of the sound or ensure that llPlaySoundSlave is called at least once per loop of the Master.
  Pow: (Value: number, Exponent: number) -> number, -- Returns the Value raised to the power Exponent, or returns 0 and triggers Math Error for imaginary results. Returns the Value raised to the Exponent.
  PreloadSound: (Sound: string) -> (), -- Causes nearby viewers to preload the Sound from the object's inventory. This is intended to prevent delays in starting new sounds when called upon.
  Pursue: (TargetID: uuid|string, Options: list) -> (), -- Chase after a target. Causes the character (llCharacter) to pursue the target defined by TargetID.
  PushObject: (ObjectID: uuid|string, Impulse: vector, AngularImpulse: vector, Local: integer|number) -> (), -- Applies Impulse and AngularImpulse to ObjectID. Applies the supplied impulse and angular impulse to the object specified.
  ReadKeyValue: (Key: string) -> uuid, --  Starts an asychronous transaction to retrieve the value associated with the key given. Will fail with XP_ERROR_KEY_NOT_FOUND if the key does not exist. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is a two element commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. In the success case the second item will be the value associated with the key.
  RefreshPrimURL: () -> (), -- Reloads the web page shown on the sides of the object.
  RegionSay: (Channel: integer|number, Text: string) -> (), -- Broadcasts Text to entire region on Channel (except for channel 0).
  RegionSayTo: (TargetID: uuid|string, Channel: integer|number, Text: string) -> (), -- Says Text, on Channel, to avatar or object indicated by TargetID (if within region). If TargetID is an avatar and Channel is nonzero, Text can be heard by any attachment on the avatar.
  ReleaseCamera: (AvatarID: uuid|string) -> (), -- Return camera to agent. Deprecated: Use llClearCameraParams instead.
  ReleaseControls: () -> (), -- Stop taking inputs. Stop taking inputs from the avatar.
  ReleaseURL: (URL: string) -> (), -- Releases the specified URL, which was previously obtained using llRequestURL. Once released, the URL will no longer be usable.
  RemoteDataReply: (ChannelID: uuid|string, MessageID: uuid|string, sData: string, iData: integer|number) -> (), -- This function is deprecated.
  RemoteDataSetRegion: () -> (), -- This function is deprecated.
  RemoteLoadScriptPin: (ObjectID: uuid|string, ScriptName: string, PIN: integer|number, Running: integer|number, StartParameter: integer|number) -> (), -- If the owner of the object containing this script can modify the object identified by the specified object key, and if the PIN matches the PIN previously set using llSetRemoteScriptAccessPin (on the target prim), then the script will be copied into target. Running is a boolean specifying whether the script should be enabled once copied into the target object.
  RemoveFromLandBanList: (AvatarID: uuid|string) -> (), -- Remove avatar from the land ban list. Remove specified avatar from the land parcel ban list.
  RemoveFromLandPassList: (AvatarID: uuid|string) -> (), -- Remove avatar from the land pass list. Remove specified avatar from the land parcel pass list.
  RemoveInventory: (InventoryItem: string) -> (), -- Remove the named inventory item. Remove the named inventory item from the object inventory.
  RemoveVehicleFlags: (Vehiclelags: integer|number) -> (), -- Removes the enabled bits in 'flags'. Sets the vehicle flags to FALSE. Valid parameters can be found in the vehicle flags constants section.
  ReplaceAgentEnvironment: (agent_id: uuid|string, transition: number, environment: string) -> number, -- Replaces the entire environment for an agent. Must be used as part of an experience.
  ReplaceEnvironment: (position: vector, environment: string, track_no: integer|number, day_length: integer|number, day_offset: integer|number) -> number, -- Replaces the environment for a parcel or region.
  ReplaceSubString: (InitialString: string, SubString: string, NewSubString: string, Count: integer|number) -> string, -- Searches InitialString and replaces instances of SubString with NewSubString. Zero Count means "replace all". Positive Count moves left to right. Negative moves right to left.
  RequestAgentData: (AvatarID: uuid|string, Data: integer|number) -> uuid, -- Requests data about AvatarID. When data is available the dataserver event will be raised. This function requests data about an avatar. If and when the information is collected, the dataserver event is triggered with the key returned from this function passed in the requested parameter. See the agent data constants (DATA_*) for details about valid values of data and what each will return in the dataserver event.
  RequestDisplayName: (AvatarID: uuid|string) -> uuid, -- Requests the display name of the agent. When the display name is available the dataserver event will be raised. The avatar identified does not need to be in the same region or online at the time of the request. Returns a key that is used to identify the dataserver event when it is raised.
  RequestExperiencePermissions: (AgentID: uuid|string, unused: string) -> (), --  Ask the agent for permission to participate in an experience. This request is similar to llRequestPermissions with the following permissions: PERMISSION_TAKE_CONTROLS, PERMISSION_TRIGGER_ANIMATION, PERMISSION_ATTACH, PERMISSION_TRACK_CAMERA, PERMISSION_CONTROL_CAMERA and PERMISSION_TELEPORT. However, unlike llRequestPermissions the decision to allow or block the request is persistent and applies to all scripts using the experience grid wide. Subsequent calls to llRequestExperiencePermissions from scripts in the experience will receive the same response automatically with no user interaction. One of experience_permissions or experience_permissions_denied will be generated in response to this call. Outstanding permission requests will be lost if the script is derezzed, moved to another region or reset.
  RequestInventoryData: (InventoryItem: string) -> uuid, -- Requests data for the named InventoryItem. When data is available, the dataserver event will be raised with the key returned from this function in the requested parameter. The only request currently implemented is to request data from landmarks, where the data returned is in the form "<float, float, float>" which can be cast to a vector. This position is in region local coordinates.
  RequestPermissions: (AvatarID: uuid|string, PermissionMask: integer|number) -> (), -- Ask AvatarID to allow the script to perform certain actions, specified in the PermissionMask bitmask. PermissionMask should be one or more PERMISSION_* constants. Multiple permissions can be requested simultaneously by ORing the constants together. Many of the permissions requests can only go to object owner. This call will not stop script execution. If the avatar grants the requested permissions, the run_time_permissions event will be called.
  RequestSecureURL: () -> uuid, -- Requests one HTTPS:// (SSL) URL for use by this object. The http_request event is triggered with results. Returns a key that is the handle used for identifying the request in the http_request event.
  RequestSimulatorData: (RegionName: string, Data: integer|number) -> uuid, -- Requests the specified Data about RegionName. When the specified data is available, the dataserver event is raised. Data should use one of the DATA_SIM_* constants. Returns a dataserver query ID and triggers the dataserver event when data is found.
  RequestURL: () -> uuid, -- Requests one HTTP:// URL for use by this script. The http_request event is triggered with the result of the request. Returns a key that is the handle used for identifying the result in the http_request event.
  RequestUserKey: (Name: string) -> uuid, -- Look up Agent ID for the named agent using a historical name.
  RequestUsername: (AvatarID: uuid|string) -> uuid, -- Requests single-word user-name of an avatar. When data is available the dataserver event will be raised. Requests the user-name of the identified agent. When the user-name is available the dataserver event is raised. The agent identified does not need to be in the same region or online at the time of the request. Returns a key that is used to identify the dataserver event when it is raised.
  ResetAnimationOverride: (AnimationState: string) -> (), -- Resets the animation of the specified animation state to the default value. If animation state equals "ALL", then all animation states are reset.
  ResetLandBanList: () -> (), -- Removes all residents from the land ban list.
  ResetLandPassList: () -> (), -- Removes all residents from the land access/pass list.
  ResetOtherScript: (ScriptName: string) -> (), -- Resets the named script.
  ResetScript: () -> (), -- Resets the script.
  ResetTime: () -> (), -- Sets the time to zero. Sets the internal timer to zero.
  ReturnObjectsByID: (ObjectIDs: list) -> number, -- Return objects using their UUIDs. Requires the PERMISSION_RETURN_OBJECTS permission and that the script owner owns the parcel the returned objects are in, or is an estate manager or region owner.
  ReturnObjectsByOwner: (ID: uuid|string, Scope: integer|number) -> number, -- Return objects based upon their owner and a scope of parcel, parcel owner, or region. Requires the PERMISSION_RETURN_OBJECTS permission and that the script owner owns the parcel the returned objects are in, or is an estate manager or region owner.
  RezAtRoot: (InventoryItem: string, Position: vector, Velocity: vector, Rotation: quaternion, StartParameter: integer|number) -> (), -- Instantiate owner's InventoryItem at Position with Velocity, Rotation and with StartParameter. The last selected root object's location will be set to Position. Creates object's inventory item at the given Position, with Velocity, Rotation, and StartParameter.
  RezObject: (InventoryItem: string, Position: vector, Velocity: vector, Rotation: quaternion, StartParameter: integer|number) -> (), -- Instantiate owners InventoryItem at Position with Velocity, Rotation and with start StartParameter. Creates object's inventory item at Position with Velocity and Rotation supplied. The StartParameter value will be available to the newly created object in the on_rez event or through the llGetStartParameter function. The Velocity parameter is ignored if the rezzed object is not physical.
  RezObjectWithParams: (InventoryItem: string, Params: list) -> uuid, -- Instantiate owner's InventoryItem with the given parameters.
  Rot2Angle: (Rotation: quaternion) -> number, -- Returns the rotation angle represented by Rotation. Returns the angle represented by the Rotation.
  Rot2Axis: (Rotation: quaternion) -> vector, -- Returns the rotation axis represented by Rotation. Returns the axis represented by the Rotation.
  Rot2Euler: (Rotation: quaternion) -> vector, -- Returns the Euler representation (roll, pitch, yaw) of Rotation. Returns the Euler Angle representation of the Rotation.
  Rot2Fwd: (Rotation: quaternion) -> vector, -- Returns the forward vector defined by Rotation. Returns the forward axis represented by the Rotation.
  Rot2Left: (Rotation: quaternion) -> vector, -- Returns the left vector defined by Rotation. Returns the left axis represented by the Rotation.
  Rot2Up: (Rotation: quaternion) -> vector, -- Returns the up vector defined by Rotation. Returns the up axis represented by the Rotation.
  RotBetween: (Vector1: vector, Vector2: vector) -> quaternion, -- Returns the rotation to rotate Vector1 to Vector2. Returns the rotation needed to rotate Vector1 to Vector2.
  RotLookAt: (Rotation: quaternion, Strength: number, Damping: number) -> (), -- Cause object to rotate to Rotation, with a force function defined by Strength and Damping parameters. Good strength values are around half the mass of the object and good damping values are less than 1/10th of the strength. Asymmetrical shapes require smaller damping. A strength of 0.0 cancels the look at.
  RotTarget: (Rotation: quaternion, LeeWay: number) -> number, -- Set rotations with error of LeeWay radians as a rotational target, and return an ID for the rotational target. The returned number is a handle that can be used in at_rot_target and llRotTargetRemove.
  RotTargetRemove: (Handle: integer|number) -> (), -- Removes rotational target number. Remove rotational target indicated by the handle.
  RotateTexture: (Radians: number, Face: integer|number) -> (), -- Sets the texture rotation for the specified Face to angle Radians. If Face is ALL_SIDES, rotates the texture of all sides.
  Round: (Value: number) -> number, -- Returns Value rounded to the nearest integer. Returns the Value rounded to the nearest integer.
  SHA1String: (Text: string) -> string, -- Returns a string of 40 hex characters that is the SHA1 security hash of text.
  SHA256String: (text: string) -> string, -- Returns a string of 64 hex characters that is the SHA256 security hash of text.
  SameGroup: (ID: uuid|string) -> number, -- Returns TRUE if avatar ID is in the same region and has the same active group, otherwise FALSE. Returns TRUE if the object or agent identified is in the same simulator and has the same active group as this object. Otherwise, returns FALSE.
  Say: (Channel: integer|number, Text: string) -> (), -- Says Text on Channel. This chat method has a range of 20m radius. PUBLIC_CHANNEL is the public chat channel that all avatars see as chat text. DEBUG_CHANNEL is the script debug channel, and is also visible to nearby avatars. All other channels are are not sent to avatars, but may be used to communicate with scripts.
  ScaleByFactor: (ScalingFactor: number) -> number, -- Attempts to resize the entire object by ScalingFactor, maintaining the size-position ratios of the prims.  Resizing is subject to prim scale limits and linkability limits. This function can not resize the object if the linkset is physical, a pathfinding character, in a keyframed motion, or if resizing would cause the parcel to overflow. Returns a boolean (an integer) TRUE if it succeeds, FALSE if it fails.
  ScaleTexture: (Horizontal: number, Vertical: number, Face: integer|number) -> (), -- Sets the diffuse texture Horizontal and Vertical repeats on Face of the prim the script is attached to. If Face == ALL_SIDES, all sides are set in one call. Negative values for horizontal and vertical will flip the texture.
  ScriptDanger: (Position: vector) -> number, -- Returns TRUE if Position is over public land, sandbox land, land that doesn't allow everyone to edit and build, or land that doesn't allow outside scripts. Returns true if the position is over public land, land that doesn't allow everyone to edit and build, or land that doesn't allow outside scripts.
  ScriptProfiler: (State: integer|number) -> (), -- Enables or disables script profiling options. Currently only supports PROFILE_SCRIPT_MEMORY (Mono only) and PROFILE_NONE. May significantly reduce script performance.
  SendRemoteData: (ChannelID: uuid|string, Destination: string, Value: integer|number, Text: string) -> uuid, -- This function is deprecated.
  Sensor: (Name: string, ID: uuid|string, Type: integer|number, Range: number, Arc: number) -> (), -- Performs a single scan for Name and ID with Type (AGENT, ACTIVE, PASSIVE, and/or SCRIPTED) within Range meters and Arc radians of forward vector. Specifying a blank Name, 0 Type, or NULL_KEY ID will prevent filtering results based on that parameter. A range of 0.0 does not perform a scan. Results are returned in the sensor and no_sensor events.
  SensorRemove: () -> (), -- removes sensor. Removes the sensor set by llSensorRepeat.
  SensorRepeat: (Name: string, ID: uuid|string, Type: integer|number, Range: number, Arc: number, Rate: number) -> (), -- Initiates a periodic scan every Rate seconds, for Name and ID with Type (AGENT, ACTIVE, PASSIVE, and/or SCRIPTED) within Range meters and Arc radians of forward vector. Specifying a blank Name, 0 Type, or NULL_KEY ID will prevent filtering results based on that parameter. A range of 0.0 does not perform a scan. Results are returned in the sensor and no_sensor events.
  SetAgentEnvironment: (agent_id: uuid|string, transition: number, Settings: list) -> number, -- Sets an agent's environmental values to the specified values. Must be used as part of an experience.
  SetAgentRot: (rot: quaternion, flags: integer|number) -> (), -- Sets the avatar rotation to the given value.
  SetAlpha: (Opacity: number, Face: integer|number) -> (), -- Sets the alpha (opacity) of Face. Sets the alpha (opacity) value for Face. If Face is ALL_SIDES, sets the alpha for all faces. The alpha value is interpreted as an opacity percentage (1.0 is fully opaque, and 0.2 is mostly transparent). This function will clamp alpha values less than 0.1 to 0.1 and greater than 1.0 to 1.
  SetAngularVelocity: (AngVel: vector, Local: integer|number) -> (), -- Sets an object's angular velocity to AngVel, in local coordinates if Local == TRUE (if the script is physical). Has no effect on non-physical objects.
  SetAnimationOverride: (AnimationState: string, AnimationName: string) -> (), -- Sets the animation (in object inventory) that will play for the given animation state. To use this function the script must obtain the PERMISSION_OVERRIDE_ANIMATIONS permission.
  SetBuoyancy: (Buoyancy: number) -> (), -- Set the tasks buoyancy (0 is none, < 1.0 sinks, 1.0 floats, > 1.0 rises). Set the object buoyancy. A value of 0 is none, less than 1.0 sinks, 1.0 floats, and greater than 1.0 rises.
  SetCameraAtOffset: (Offset: vector) -> (), -- Sets the camera used in this object, at offset, if an avatar sits on it. Sets the offset that an avatar's camera will be moved to if the avatar sits on the object.
  SetCameraEyeOffset: (Offset: vector) -> (), -- Sets the camera eye offset used in this object if an avatar sits on it.
  SetCameraParams: (Parameters: list) -> (), -- Sets multiple camera parameters at once. List format is [ rule-1, data-1, rule-2, data-2 . . . rule-n, data-n ].
  SetClickAction: (Action: integer|number) -> (), -- Sets the action performed when a prim is clicked upon.
  SetColor: (Color: vector, Face: integer|number) -> (), -- Sets the color, for the face. Sets the color of the side specified. If Face is ALL_SIDES, sets the color on all faces.
  SetContentType: (HTTPRequestID: uuid|string, ContentType: integer|number) -> (), -- Set the media type of an LSL HTTP server response to ContentType. HTTPRequestID must be a valid http_request ID. ContentType must be one of the CONTENT_TYPE_* constants.
  SetDamage: (Damage: number) -> (), -- Sets the amount of damage that will be done to an avatar that this task hits.	Task will be killed. Sets the amount of damage that will be done to an avatar that this object hits. This object will be destroyed on damaging an avatar, and no collision event is triggered.
  SetEnvironment: (Position: vector, EnvParams: list) -> number, -- Returns a string with the requested data about the region.
  SetForce: (Force: vector, Local: integer|number) -> (), -- Sets Force on object, in object-local coordinates if Local == TRUE (otherwise, the region reference frame is used). Only works on physical objects.
  SetForceAndTorque: (Force: vector, Torque: vector, Local: integer|number) -> (), -- Sets the Force and Torque of object, in object-local coordinates if Local == TRUE (otherwise, the region reference frame is used). Only works on physical objects.
  SetGroundTexture: (Changes: list) -> number, -- Changes terrain texture properties in the region.
  SetHoverHeight: (Height: number, Water: integer|number, Tau: number) -> (), -- Critically damps a physical object to a Height (either above ground level or above the higher of land and water if water == TRUE). Do not use with vehicles. Use llStopHover to stop hovering.
  SetInventoryPermMask: (InventoryItem: string, PermissionFlag: integer|number, PermissionMask: integer|number) -> (), -- Sets the given permission mask to the new value on the inventory item.
  SetKeyframedMotion: (Keyframes: list, Options: list) -> (), -- Requests that a non-physical object be key-framed according to key-frame list. Specify a list of times, positions, and orientations to be followed by an object. The object will be smoothly moved between key-frames by the simulator. Collisions with other non-physical or key-framed objects will be ignored (no script events will fire and collision processing will not occur). Collisions with physical objects will be computed and reported, but the key-framed object will be unaffected by those collisions. Keyframes is a strided list containing positional, rotational, and time data for each step in the motion. Options is a list containing optional arguments and parameters (specified by KFM_* constants).
  SetLinkAlpha: (LinkNumber: integer|number, Opacity: number, Face: integer|number) -> (), -- If a prim exists in the link chain at LinkNumber, set Face to Opacity. Sets the Face, on the linked prim specified, to the Opacity.
  SetLinkCamera: (LinkNumber: integer|number, EyeOffset: vector, LookOffset: vector) -> (), -- Sets the camera eye offset, and the offset that camera is looking at, for avatars that sit on the linked prim.
  SetLinkColor: (LinkNumber: integer|number, Color: vector, Face: integer|number) -> (), -- If a task exists in the link chain at LinkNumber, set the Face to color. Sets the color of the linked child's side, specified by LinkNumber.
  SetLinkMedia: (Link: integer|number, Face: integer|number, Parameters: list) -> number, -- Set the media parameters for a particular face on linked prim, specified by Link. Returns an integer that is a STATUS_* flag which details the success/failure of the operation(s). MediaParameters is a set of name/value pairs in no particular order. Parameters not specified are unchanged, or if new media is added then set to the default specified.
  SetLinkPrimitiveParams: (LinkNumber: integer|number, Parameters: list) -> (), -- Set primitive parameters for LinkNumber based on Parameters. Sets the parameters (or properties) of any linked prim in one step.
  SetLinkPrimitiveParamsFast: (LinkNumber: integer|number, Parameters: list) -> (), -- Set primitive parameters for LinkNumber based on Parameters, without a delay. Set parameters for link number, from the list of Parameters, with no built-in script sleep. This function is identical to llSetLinkPrimitiveParams, except without the delay.
  SetLinkRenderMaterial: (LinkNumber: integer|number, RenderMaterial: string, Face: integer|number) -> (), -- Sets the Render Material of Face on a linked prim, specified by LinkNumber. Render Materail may be a UUID or name of a material in prim inventory.
  SetLinkSitFlags: (LinkNumber: integer|number, Flags: integer|number) -> (), -- Returns the sit flags set on the specified prim in a linkset.
  SetLinkTexture: (LinkNumber: integer|number, Texture: string, Face: integer|number) -> (), -- Sets the Texture of Face on a linked prim, specified by LinkNumber. Texture may be a UUID or name of a texture in prim inventory.
  SetLinkTextureAnim: (LinkNumber: integer|number, Mode: integer|number, Face: integer|number, SizeX: integer|number, SizeY: integer|number, Start: number, Length: number, Rate: number) -> (), -- Animates a texture on the prim specified by LinkNumber, by setting the texture scale and offset. Mode is a bitmask of animation options. Face specifies which object face to animate. SizeX and SizeY specify the number of horizontal and vertical frames.Start specifes the animation start point. Length specifies the animation duration. Rate specifies the animation playback rate.
  SetLocalRot: (Rotation: quaternion) -> (), -- Sets the rotation of a child prim relative to the root prim.
  SetMemoryLimit: (Limit: integer|number) -> number, -- Requests Limit bytes to be reserved for this script. Returns TRUE or FALSE indicating whether the limit was set successfully. This function has no effect if the script is running in the LSO VM.
  SetObjectDesc: (Description: string) -> (), -- Sets the description of the prim to Description. The description field is limited to 127 characters.
  SetObjectName: (Name: string) -> (), -- Sets the prim's name to Name.
  SetObjectPermMask: (PermissionFlag: integer|number, PermissionMask: integer|number) -> (), -- Sets the specified PermissionFlag permission to the value specified by PermissionMask on the object the script is attached to.
  SetParcelMusicURL: (URL: string) -> (), -- Sets the streaming audio URL for the parcel the object is on. The object must be owned by the owner of the parcel; if the parcel is group owned the object must be owned by that group.
  SetPayPrice: (Price: integer|number, QuickButtons: list) -> (), -- Sets the default amount when someone chooses to pay this object. Price is the default price shown in the textu input field. QuickButtons specifies the 4 payment values shown in the payment dialog's buttons. Input field and buttons may be hidden with PAY_HIDE constant, and may be set to their default values using PAY_DEFAULT.
  SetPhysicsMaterial: (MaterialBits: integer|number, GravityMultiplier: number, Restitution: number, Friction: number, Density: number) -> (), -- Sets the selected parameters of the object's physics behavior. MaterialBits is a bitmask specifying which of the parameters in the other arguments should be applied to the object. GravityMultiplier, Restitution, Friction, and Density are the possible parameters to manipulate.
  SetPos: (Position: vector) -> (), -- If the object is not physical, this function sets the position of the prim. If the script is in a child prim, Position is treated as root relative and the link-set is adjusted. If the prim is the root prim, the entire object is moved (up to 10m) to Position in region coordinates.
  SetPrimMediaParams: (Face: integer|number, MediaParameters: list) -> number, -- Sets the MediaParameters for a particular Face on the prim. Returns an integer that is a STATUS_* flag which details the success/failure of the operation(s). MediaParameters is a set of name/value pairs in no particular order. Parameters not specified are unchanged, or if new media is added then set to the default specified.
  SetPrimURL: (URL: string) -> (), -- Deprecated: Use llSetPrimMediaParams instead.
  SetPrimitiveParams: (Parameters: list) -> (), -- This function changes the many properties (or "parameters") of a prim in one operation. Parameters is a list of changes.
  SetRegionPos: (Position: vector) -> number, -- Attempts to move the object so that the root prim is within 0.1m of Position. Returns an integer boolean, TRUE if the object is successfully placed within 0.1 m of Position, FALSE otherwise. Position may be any location within the region or up to 10m across a region border. If the position is below ground, it will be set to the ground level at that x,y location.
  SetRemoteScriptAccessPin: (PIN: integer|number) -> (), -- If PIN is set to a non-zero number, the task will accept remote script loads via llRemoteLoadScriptPin() if it passes in the correct PIN. Othersise, llRemoteLoadScriptPin() is ignored.
  SetRenderMaterial: (Material: string, Face: integer|number) -> (), -- Applies Render Material to Face of prim. Render Material may be a UUID or name of a material in prim inventory. If Face is ALL_SIDES, set the render material on all faces.
  SetRot: (Rotation: quaternion) -> (), -- If the object is not physical, this function sets the rotation of the prim. If the script is in a child prim, Rotation is treated as root relative and the link-set is adjusted. If the prim is the root prim, the entire object is rotated to Rotation in the global reference frame.
  SetScale: (Scale: vector) -> (), -- Sets the prim's scale (size) to Scale.
  SetScriptState: (ScriptName: string, Running: integer|number) -> (), -- Enable or disable the script Running state of Script in the prim.
  SetSitText: (Text: string) -> (), -- Displays Text rather than 'Sit' in the viewer's context menu.
  SetSoundQueueing: (QueueEnable: integer|number) -> (), -- Sets whether successive calls to llPlaySound, llLoopSound, etc., (attached sounds) interrupt the currently playing sound. The default for objects is FALSE. Setting this value to TRUE will make the sound wait until the current playing sound reaches its end. The queue is one level deep.
  SetSoundRadius: (Radius: number) -> (), -- Limits radius for audibility of scripted sounds (both attached and triggered) to distance Radius.
  SetStatus: (Status: integer|number, Value: integer|number) -> (), -- Sets object status specified in Status bitmask (e.g. STATUS_PHYSICS|STATUS_PHANTOM) to boolean Value. For a full list of STATUS_* constants, see wiki documentation.
  SetText: (Text: string, Color: vector, Opacity: number) -> (), -- Causes Text to float above the prim, using the specified Color and Opacity.
  SetTexture: (Texture: string, Face: integer|number) -> (), -- Applies Texture to Face of prim. Texture may be a UUID or name of a texture in prim inventory. If Face is ALL_SIDES, set the texture on all faces.
  SetTextureAnim: (Mode: integer|number, Face: integer|number, SizeX: integer|number, SizeY: integer|number, Start: number, Length: number, Rate: number) -> (), -- Animates a texture by setting the texture scale and offset. Mode is a bitmask of animation options. Face specifies which object face to animate. SizeX and SizeY specify the number of horizontal and vertical frames.Start specifes the animation start point. Length specifies the animation duration. Rate specifies the animation playback rate.
  SetTimerEvent: (Rate: number) -> (), -- Causes the timer event to be triggered every Rate seconds.  Passing in 0.0 stops further timer events.
  SetTorque: (Torque: vector, Local: integer|number) -> (), -- Sets the Torque acting on the script's object, in object-local coordinates if Local == TRUE (otherwise, the region reference frame is used). Only works on physical objects.
  SetTouchText: (Text: string) -> (), -- Displays Text in the viewer context menu that acts on a touch.
  SetVehicleFlags: (Flags: integer|number) -> (), -- Enables the vehicle flags specified in the Flags bitmask. Valid parameters can be found in the wiki documentation.
  SetVehicleFloatParam: (ParameterName: integer|number, ParameterValue: number) -> (), -- Sets a vehicle float parameter. Valid parameters can be found in the wiki documentation.
  SetVehicleRotationParam: (ParameterName: integer|number, ParameterValue: quaternion) -> (), -- Sets a vehicle rotation parameter. Valid parameters can be found in the wiki documentation.
  SetVehicleType: (Type: integer|number) -> (), -- Activates the vehicle action on the object with vehicle preset Type. Valid Types and an explanation of their characteristics can be found in wiki documentation.
  SetVehicleVectorParam: (ParameterName: integer|number, ParameterValue: vector) -> (), -- Sets a vehicle vector parameter. Valid parameters can be found in the wiki documentation.
  SetVelocity: (Velocity: vector, Local: integer|number) -> (), -- If the object is physics-enabled, sets the object's linear velocity to Velocity. If Local==TRUE, Velocity is treated as a local directional vector; otherwise, Velocity is treated as a global directional vector.
  Shout: (Channel: integer|number, Text: string) -> (), -- Shouts Text on Channel. This chat method has a range of 100m radius. PUBLIC_CHANNEL is the public chat channel that all avatars see as chat text. DEBUG_CHANNEL is the script debug channel, and is also visible to nearby avatars. All other channels are are not sent to avatars, but may be used to communicate with scripts.
  SignRSA: (PrivateKey: string, Message: string, Algorithm: string) -> string, -- Returns the base64-encoded RSA signature of Message using PEM-formatted PrivateKey and digest Algorithm (sha1, sha224, sha256, sha384, sha512).
  Sin: (Theta: number) -> number, -- Returns the sine of Theta (Theta in radians).
  SitOnLink: (AvatarID: uuid|string, LinkID: integer|number) -> number, -- If agent identified by AvatarID is participating in the experience, sit them on the specified link's sit target.
  SitTarget: (Offset: vector, Rotation: quaternion) -> (), -- Set the sit location for this object. If offset == ZERO_VECTOR, clears the sit target.
  Sleep: (Time: number) -> (), -- Put script to sleep for Time seconds.
  Sound: (Sound: string, Volume: number, Queue: integer|number, Loop: integer|number) -> (), -- Deprecated: Use llPlaySound instead. Plays Sound at Volume and specifies whether the sound should loop and/or be enqueued.
  SoundPreload: (Sound: string) -> (), -- Deprecated: Use llPreloadSound instead. Preloads a sound on viewers within range.
  Sqrt: (Value: number) -> number, -- Returns the square root of Value. Triggers a math runtime error for imaginary results (if Value < 0.0).
  StartAnimation: (Animation: string) -> (), -- This function plays the specified animation from playing on the avatar who received the script's most recent permissions request. Animation may be an animation in task inventory or a built-in animation. Requires PERMISSION_TRIGGER_ANIMATION.
  StartObjectAnimation: (Animation: string) -> (), -- This function plays the specified animation on the rigged mesh object associated with the current script. Animation may be an animation in task inventory or a built-in animation.
  StopAnimation: (Animation: string) -> (), -- This function stops the specified animation on the avatar who received the script's most recent permissions request. Animation may be an animation in task inventory, a built-in animation, or the uuid of an animation. Requires PERMISSION_TRIGGER_ANIMATION.
  StopHover: () -> (), -- Stop hovering to a height (due to llSetHoverHeight()).
  StopLookAt: () -> (), -- Stop causing object to point at a target (due to llLookAt() or llRotLookAt()).
  StopMoveToTarget: () -> (), -- Stops critically damped motion (due to llMoveToTarget()).
  StopObjectAnimation: (Animation: string) -> (), -- This function stops the specified animation on the rigged mesh object associated with the current script. Animation may be an animation in task inventory, a built-in animation, or the uuid of an animation.
  StopSound: () -> (), -- Stops playback of the currently attached sound.
  StringLength: (Text: string) -> number, -- Returns an integer that is the number of characters in Text (not counting the null).
  StringToBase64: (Text: string) -> string, -- Returns the string Base64 representation of the input string.
  StringTrim: (Text: string, TrimType: integer|number) -> string, -- Outputs a string, eliminating white-space from the start and/or end of the input string Text. Valid options for TrimType: STRING_TRIM_HEAD: trim all leading spaces in Text STRING_TRIM_TAIL: trim all trailing spaces in Text STRING_TRIM: trim all leading and trailing spaces in Text.
  SubStringIndex: (Text: string, Sequence: string) -> number, -- Returns an integer that is the index in Text where string pattern Sequence first appears. Returns -1 if not found.
  TakeCamera: (AvatarID: uuid|string) -> (), -- Deprecated: Use llSetCameraParams instead.
  TakeControls: (Controls: integer|number, Accept: boolean, PassOn: boolean) -> (), -- Take controls from the agent the script has permissions for. If (Accept == (Controls & input)), send input to the script. PassOn determines whether Controls also perform their normal functions. Requires the PERMISSION_TAKE_CONTROLS permission to run.
  Tan: (Theta: number) -> number, -- Returns the tangent of Theta (Theta in radians).
  Target: (Position: vector, Range: number) -> number, -- This function is to have the script know when it has reached a position. It registers a Position with a Range that triggers at_target and not_at_target events continuously until unregistered.
  TargetOmega: (Axis: vector, SpinRate: number, Gain: number) -> (), -- Attempt to spin at SpinRate with strength Gain on Axis. A spin rate of 0.0 cancels the spin. This function always works in object-local coordinates.
  TargetRemove: (Target: integer|number) -> (), -- Removes positional target Handle registered with llTarget.
  TargetedEmail: (Target: integer|number, Subject: string, Text: string) -> (), -- Sends an email with Subject and Message to the owner or creator of an object .
  TeleportAgent: (AvatarID: uuid|string, LandmarkName: string, Position: vector, LookAtPoint: vector) -> (), -- Requests a teleport of avatar to a landmark stored in the object's inventory. If no landmark is provided (an empty string), the avatar is teleported to the location position in the current region. In either case, the avatar is turned to face the position given by look_at in local coordinates. Requires the PERMISSION_TELEPORT permission. This function can only teleport the owner of the object.
  TeleportAgentGlobalCoords: (AvatarID: uuid|string, GlobalPosition: vector, RegionPosition: vector, LookAtPoint: vector) -> (), -- Teleports an agent to the RegionPosition local coordinates within a region which is specified by the GlobalPosition global coordinates. The agent lands facing the position defined by LookAtPoint local coordinates. Requires the PERMISSION_TELEPORT permission. This function can only teleport the owner of the object.
  TeleportAgentHome: (AvatarID: uuid|string) -> (), -- Teleport agent over the owner's land to agent's home location.
  TextBox: (AvatarID: uuid|string, Text: string, Channel: integer|number) -> (), -- Opens a dialog for the specified avatar with message Text, which contains a text box for input. Any text that is entered is said on the specified Channel (as if by the avatar) when the "OK" button is clicked.
  ToLower: (Text: string) -> string, -- Returns a string that is Text with all lower-case characters.
  ToUpper: (Text: string) -> string, -- Returns a string that is Text with all upper-case characters.
  TransferLindenDollars: (AvatarID: uuid|string, Amount: integer|number) -> uuid, -- Transfer Amount of linden dollars (L$) from script owner to AvatarID. Returns a key to a corresponding transaction_result event for the success of the transfer. Attempts to send the amount of money to the specified avatar, and trigger a transaction_result event identified by the returned key.
  TransferOwnership: (AgentID: uuid|string, Flags: integer|number, Params: list) -> number, -- Transfers ownership of an object, or a copy of the object to a new agent.
  TriggerSound: (Sound: string, Volume: number) -> (), -- Plays Sound at Volume (0.0 - 1.0), centered at but not attached to object. There is no limit to the number of triggered sounds which can be generated by an object, and calling llTriggerSound does not affect the attached sounds created by llPlaySound and llLoopSound. This is very useful for things like collision noises, explosions, etc. There is no way to stop or alter the volume of a sound triggered by this function.
  TriggerSoundLimited: (Sound: string, Volume: number, TNE: vector, BSW: vector) -> (), -- Plays Sound at Volume (0.0 - 1.0), centered at but not attached to object, limited to axis-aligned bounding box defined by vectors top-north-east (TNE) and bottom-south-west (BSW). There is no limit to the number of triggered sounds which can be generated by an object, and calling llTriggerSound does not affect the attached sounds created by llPlaySound and llLoopSound. This is very useful for things like collision noises, explosions, etc. There is no way to stop or alter the volume of a sound triggered by this function.
  UnSit: (AvatarID: uuid|string) -> (), -- If agent identified by AvatarID is sitting on the object the script is attached to or is over land owned by the objects owner, the agent is forced to stand up.
  UnescapeURL: (URL: string) -> string, -- Returns the string that is the URL unescaped, replacing "%20" with spaces, etc., version of URL. This function can output raw UTF-8 strings.
  UpdateCharacter: (Options: list) -> (), -- Updates settings for a pathfinding character.
  UpdateKeyValue: (Key: string, Value: string, Checked: integer|number, OriginalValue: string) -> uuid, --  Starts an asychronous transaction to update the value associated with the key given. The dataserver callback will be executed with the key returned from this call and a string describing the result. The result is a two element commma-delimited list. The first item is an integer specifying if the transaction succeeded (1) or not (0). In the failure case, the second item will be an integer corresponding to one of the XP_ERROR_... constants. In the success case the second item will be the value associated with the key. If Checked is 1 the existing value in the data store must match the OriginalValue passed or XP_ERROR_RETRY_UPDATE will be returned. If Checked is 0 the key will be created if necessary.
  VecDist: (Location1: vector, Location2: vector) -> number, -- Returns the distance between Location1 and Location2.
  VecMag: (Vector: vector) -> number, -- Returns the magnitude of the vector.
  VecNorm: (Vector: vector) -> vector, -- Returns normalized vector.
  VerifyRSA: (PublicKey: string, Message: string, Signature: string, Algorithm: string) -> number, -- Returns TRUE if PublicKey, Message, and Algorithm produce the same base64-formatted Signature.
  VolumeDetect: (DetectEnabled: integer|number) -> (), -- If DetectEnabled = TRUE, object becomes phantom but triggers collision_start and collision_end events when other objects start and stop interpenetrating. If another object (including avatars) interpenetrates it, it will get a collision_start event. When an object stops interpenetrating, a collision_end event is generated. While the other is inter-penetrating, collision events are NOT generated.
  WanderWithin: (Origin: vector, Area: vector, Options: list) -> (), -- Wander within a specified volume. Sets a character to wander about a central spot within a specified area.
  Water: (Offset: vector) -> number, -- Returns the water height below the object position + Offset.
  Whisper: (Channel: integer|number, Text: string) -> (), -- Whispers Text on Channel. This chat method has a range of 10m radius. PUBLIC_CHANNEL is the public chat channel that all avatars see as chat text. DEBUG_CHANNEL is the script debug channel, and is also visible to nearby avatars. All other channels are are not sent to avatars, but may be used to communicate with scripts.
  Wind: (Offset: vector) -> vector, -- Returns the wind velocity at the object position + Offset.
  WorldPosToHUD: (world_pos: vector) -> vector, -- Returns the local position that would put the origin of a HUD object directly over world_pos as viewed by the current camera.
  XorBase64: (Text1: string, Text2: string) -> string, -- Performs an exclusive OR on two Base64 strings and returns a Base64 string. Text2 repeats if it is shorter than Text1.
  XorBase64Strings: (Text1: string, Text2: string) -> string, -- Deprecated: Please use llXorBase64 instead. Incorrectly performs an exclusive OR on two Base64 strings and returns a Base64 string. Text2 repeats if it is shorter than Text1. Retained for backwards compatibility.
  XorBase64StringsCorrect: (Text1: string, Text2: string) -> string, -- Deprecated: Please use llXorBase64 instead. Correctly (unless nulls are present) performs an exclusive OR on two Base64 strings and returns a Base64 string. Text2 repeats if it is shorter than Text1.
  sRGB2Linear: (srgb: vector) -> vector, -- Converts a color from the sRGB to the linear colorspace.
}


declare function at_rot_target (TargetNumber: integer|number, TargetRotation: quaternion, CurrentRotation: quaternion): () -- This event is triggered when a script comes within a defined angle of a target rotation. The range and rotation, are set by a call to llRotTarget.
declare function at_target (TargetNumber: integer|number, TargetPosition: vector, CurrentPosition: vector): () -- This event is triggered when the scripted object comes within a defined range of the target position, defined by the llTarget function call.
declare function attach (AvatarID: uuid|string): () -- This event is triggered whenever an object is attached or detached from an avatar. If it is attached, the key of the avatar it is attached to is passed in, otherwise NULL_KEY is.
declare function changed (Changed: integer|number): () -- Triggered when various events change the object. The change argument will be a bit-field of CHANGED_* constants.
declare function collision (NumberOfCollisions: integer|number): () -- This event is raised while another object, or avatar, is colliding with the object the script is attached to.			The number of detected objects is passed to the script. Information on those objects may be gathered via the llDetected* functions.
declare function collision_end (NumberOfCollisions: integer|number): () -- This event is raised when another object, or avatar, stops colliding with the object the script is attached to.			The number of detected objects is passed to the script. Information on those objects may be gathered via the llDetected* library functions.
declare function collision_start (NumberOfCollisions: integer|number): () -- This event is raised when another object, or avatar, starts colliding with the object the script is attached to.			The number of detected objects is passed to the script. Information on those objects may be gathered via the llDetected* library functions.
declare function control (AvatarID: uuid|string, Levels: integer|number, Edges: integer|number): () -- Once a script has the ability to grab control inputs from the avatar, this event will be used to pass the commands into the script.			The levels and edges are bit-fields of control constants.
declare function dataserver (RequestID: uuid|string, Data: string): () -- This event is triggered when the requested data is returned to the script.			Data may be requested by the llRequestAgentData, llRequestInventoryData, and llGetNotecardLine function calls, for example.
declare function email (Time: string, Address: string, Subject: string, Body: string, NumberRemaining: integer|number): () -- This event is triggered when an email sent to this script arrives.			The number remaining tells how many more emails are known to be still pending.
declare function experience_permissions (agent_id: uuid|string): () --
declare function experience_permissions_denied (agent_id: uuid|string, Reason: integer|number): () -- Describes why the Experience permissions were denied for the agent.
declare function final_damage (count: integer|number): () -- Triggered as damage is applied to an avatar or task, after all on_damage events have been processed.
declare function game_control (id: uuid|string, buttons: integer|number, axes: list): () -- This event is raised when game controller input changes.
declare function http_request (HTTPRequestID: uuid|string, HTTPMethod: string, Body: string): () -- Triggered when task receives an HTTP request.
declare function http_response (HTTPRequestID: uuid|string, Status: integer|number, Metadata: list, Body: string): () -- This event handler is invoked when an HTTP response is received for a pending llHTTPRequest request or if a pending request fails or times out.
declare function land_collision (Position: vector): () -- This event is raised when the object the script is attached to is colliding with the ground.
declare function land_collision_end (Position: vector): () -- This event is raised when the object the script is attached to stops colliding with the ground.
declare function land_collision_start (Position: vector): () -- This event is raised when the object the script is attached to begins to collide with the ground.
declare function link_message (SendersLink: integer|number, Value: integer|number, Text: string, ID: uuid|string): () -- Triggered when object receives a link message via llMessageLinked function call.
declare function linkset_data (action: integer|number, name: string, value: string): () -- Triggered when a script modifies the linkset datastore.
declare function listen (Channel: integer|number, Name: string, ID: uuid|string, Text: string): () -- This event is raised whenever a chat message matching the constraints set in the llListen command is received. The name and ID of the speaker, as well as the message, are passed in as parameters.			Channel 0 is the public chat channel that all avatars see as chat text. Channels 1 through 2,147,483,648 are private channels that are not sent to avatars but other scripts can listen on those channels.
declare function money (Payer: uuid|string, Amount: integer|number): () -- This event is triggered when a resident has given an amount of Linden dollars to the object.
declare function moving_end (): () -- Triggered whenever an object with this script stops moving.
declare function moving_start (): () -- Triggered whenever an object with this script starts moving.
declare function no_sensor (): () -- This event is raised when sensors are active, via the llSensor function call, but are not sensing anything.
declare function not_at_rot_target (): () -- When a target is set via the llRotTarget function call, but the script is outside the specified angle this event is raised.
declare function not_at_target (): () -- When a target is set via the llTarget library call, but the script is outside the specified range this event is raised.
declare function object_rez (RezzedObjectsID: uuid|string): () -- Triggered when an object rezzes another object from its inventory via the llRezObject, or similar, functions. The id is the globally unique key for the object rezzed.
declare function on_damage (count: integer|number): () -- Triggered when an avatar or object receives damage.
declare function on_death (): () -- Triggered when an avatar reaches 0 health.
declare function on_rez (StartParameter: integer|number): () -- Triggered whenever an object is rezzed from inventory or by another object. The start parameter is passed in from the llRezObject call, or zero if from inventory.
declare function path_update (Type: integer|number, Reserved: list): () -- This event is called to inform the script of changes within the object's path-finding status.
declare function remote_data (EventType: integer|number, ChannelID: uuid|string, MessageID: uuid|string, Sender: string, IData: integer|number, SData: string): () -- This event is deprecated.
declare function run_time_permissions (PermissionFlags: integer|number): () -- Scripts need permission from either the owner or the avatar they wish to act on before they may perform certain functions, such as debiting money from their owners account, triggering an animation on an avatar, or capturing control inputs. The llRequestPermissions library function is used to request these permissions and the various permissions integer constants can be supplied.			The integer returned to this event handler contains the current set of permissions flags, so if permissions equal 0 then no permissions are set.
declare function sensor (NumberDetected: integer|number): () -- This event is raised whenever objects matching the constraints of the llSensor command are detected.			The number of detected objects is passed to the script in the parameter. Information on those objects may be gathered via the llDetected* functions.
declare function timer (): () -- This event is raised at regular intervals set by the llSetTimerEvent library function.
declare function touch (NumberOfTouches: integer|number): () -- This event is raised while a user is touching the object the script is attached to.			The number of touching objects is passed to the script in the parameter.			Information on those objects may be gathered via the llDetected* library functions.
declare function touch_end (NumberOfTouches: integer|number): () -- This event is raised when a user stops touching the object the script is attached to. The number of touches is passed to the script in the parameter.			Information on those objects may be gathered via the llDetected* library functions.
declare function touch_start (NumberOfTouches: integer|number): () -- This event is raised when a user first touches the object the script is attached to. The number of touches is passed to the script in the parameter.			Information on those objects may be gathered via the llDetected() library functions.
declare function transaction_result (RequestID: uuid|string, Success: integer|number, Message: string): () -- Triggered by llTransferMoney() function.
declare ACTIVE: number -- Objects in world that are running a script or currently physically moving.
declare AGENT: number -- Objects in world that are agents.
declare AGENT_ALWAYS_RUN: number --
declare AGENT_ATTACHMENTS: number -- The agent has attachments.
declare AGENT_AUTOMATED: number -- The agent has been identified as a scripted agent
declare AGENT_AUTOPILOT: number --
declare AGENT_AWAY: number --
declare AGENT_BUSY: number --
declare AGENT_BY_LEGACY_NAME: number --
declare AGENT_BY_USERNAME: number --
declare AGENT_CROUCHING: number --
declare AGENT_FLOATING_VIA_SCRIPTED_ATTACHMENT: number -- The agent is floating via scripted attachment.
declare AGENT_FLYING: number -- The agent is flying.
declare AGENT_IN_AIR: number --
declare AGENT_LIST_PARCEL: number -- Agents on the same parcel where the script is running.
declare AGENT_LIST_PARCEL_OWNER: number -- Agents on any parcel in the region where the parcel owner is the same as the owner of the parcel under the scripted object.
declare AGENT_LIST_REGION: number -- All agents in the region.
declare AGENT_MOUSELOOK: number --
declare AGENT_ON_OBJECT: number --
declare AGENT_SCRIPTED: number -- The agent has scripted attachments.
declare AGENT_SITTING: number --
declare AGENT_TYPING: number --
declare AGENT_WALKING: number --
declare ALL_SIDES: number --
declare ANIM_ON: number -- Texture animation is on.
declare ATTACH_ANY_HUD: number -- Filtering for any HUD attachment.
declare ATTACH_AVATAR_CENTER: number -- Attach to the avatar's geometric centre.
declare ATTACH_BACK: number -- Attach to the avatar's back.
declare ATTACH_BELLY: number -- Attach to the avatar's belly.
declare ATTACH_CHEST: number -- Attach to the avatar's chest.
declare ATTACH_CHIN: number -- Attach to the avatar's chin.
declare ATTACH_FACE_JAW: number -- Attach to the avatar's jaw.
declare ATTACH_FACE_LEAR: number -- Attach to the avatar's left ear (extended).
declare ATTACH_FACE_LEYE: number -- Attach to the avatar's left eye (extended).
declare ATTACH_FACE_REAR: number -- Attach to the avatar's right ear (extended).
declare ATTACH_FACE_REYE: number -- Attach to the avatar's right eye (extended).
declare ATTACH_FACE_TONGUE: number -- Attach to the avatar's tongue.
declare ATTACH_GROIN: number -- Attach to the avatar's groin.
declare ATTACH_HEAD: number -- Attach to the avatar's head.
declare ATTACH_HIND_LFOOT: number -- Attach to the avatar's left hind foot.
declare ATTACH_HIND_RFOOT: number -- Attach to the avatar's right hind foot.
declare ATTACH_HUD_BOTTOM: number --
declare ATTACH_HUD_BOTTOM_LEFT: number --
declare ATTACH_HUD_BOTTOM_RIGHT: number --
declare ATTACH_HUD_CENTER_1: number --
declare ATTACH_HUD_CENTER_2: number --
declare ATTACH_HUD_TOP_CENTER: number --
declare ATTACH_HUD_TOP_LEFT: number --
declare ATTACH_HUD_TOP_RIGHT: number --
declare ATTACH_LEAR: number -- Attach to the avatar's left ear.
declare ATTACH_LEFT_PEC: number -- Attach to the avatar's left pectoral.
declare ATTACH_LEYE: number -- Attach to the avatar's left eye.
declare ATTACH_LFOOT: number -- Attach to the avatar's left foot.
declare ATTACH_LHAND: number -- Attach to the avatar's left hand.
declare ATTACH_LHAND_RING1: number -- Attach to the avatar's left ring finger.
declare ATTACH_LHIP: number -- Attach to the avatar's left hip.
declare ATTACH_LLARM: number -- Attach to the avatar's left lower arm.
declare ATTACH_LLLEG: number -- Attach to the avatar's lower left leg.
declare ATTACH_LPEC: number -- Attach to the avatar's right pectoral. (Deprecated, use ATTACH_RIGHT_PEC)
declare ATTACH_LSHOULDER: number -- Attach to the avatar's left shoulder.
declare ATTACH_LUARM: number -- Attach to the avatar's left upper arm.
declare ATTACH_LULEG: number -- Attach to the avatar's lower upper leg.
declare ATTACH_LWING: number -- Attach to the avatar's left wing.
declare ATTACH_MOUTH: number -- Attach to the avatar's mouth.
declare ATTACH_NECK: number -- Attach to the avatar's neck.
declare ATTACH_NOSE: number -- Attach to the avatar's nose.
declare ATTACH_PELVIS: number -- Attach to the avatar's pelvis.
declare ATTACH_REAR: number -- Attach to the avatar's right ear.
declare ATTACH_REYE: number -- Attach to the avatar's right eye.
declare ATTACH_RFOOT: number -- Attach to the avatar's right foot.
declare ATTACH_RHAND: number -- Attach to the avatar's right hand.
declare ATTACH_RHAND_RING1: number -- Attach to the avatar's right ring finger.
declare ATTACH_RHIP: number -- Attach to the avatar's right hip.
declare ATTACH_RIGHT_PEC: number -- Attach to the avatar's right pectoral.
declare ATTACH_RLARM: number -- Attach to the avatar's right lower arm.
declare ATTACH_RLLEG: number -- Attach to the avatar's right lower leg.
declare ATTACH_RPEC: number -- Attach to the avatar's left pectoral. (deprecated, use ATTACH_LEFT_PEC)
declare ATTACH_RSHOULDER: number -- Attach to the avatar's right shoulder.
declare ATTACH_RUARM: number -- Attach to the avatar's right upper arm.
declare ATTACH_RULEG: number -- Attach to the avatar's right upper leg.
declare ATTACH_RWING: number -- Attach to the avatar's right wing.
declare ATTACH_TAIL_BASE: number -- Attach to the avatar's tail base.
declare ATTACH_TAIL_TIP: number -- Attach to the avatar's tail tip.
declare AVOID_CHARACTERS: number --
declare AVOID_DYNAMIC_OBSTACLES: number --
declare AVOID_NONE: number --
declare BEACON_MAP: number -- Cause llMapBeacon to optionally display and focus the world map on the avatar's viewer.
declare CAMERA_ACTIVE: number --
declare CAMERA_BEHINDNESS_ANGLE: number --
declare CAMERA_BEHINDNESS_LAG: number --
declare CAMERA_DISTANCE: number --
declare CAMERA_FOCUS: number --
declare CAMERA_FOCUS_LAG: number --
declare CAMERA_FOCUS_LOCKED: number --
declare CAMERA_FOCUS_OFFSET: number --
declare CAMERA_FOCUS_THRESHOLD: number --
declare CAMERA_PITCH: number --
declare CAMERA_POSITION: number --
declare CAMERA_POSITION_LAG: number --
declare CAMERA_POSITION_LOCKED: number --
declare CAMERA_POSITION_THRESHOLD: number --
declare CHANGED_ALLOWED_DROP: number -- The object inventory has changed because an item was added through the llAllowInventoryDrop interface.
declare CHANGED_COLOR: number -- The object color has changed.
declare CHANGED_INVENTORY: number -- The object inventory has changed.
declare CHANGED_LINK: number -- The object has linked or its links were broken.
declare CHANGED_MEDIA: number --
declare CHANGED_OWNER: number --
declare CHANGED_REGION: number --
declare CHANGED_REGION_START: number --
declare CHANGED_RENDER_MATERIAL: number -- The render material has changed.
declare CHANGED_SCALE: number -- The object scale (size) has changed.
declare CHANGED_SHAPE: number -- The object base shape has changed, e.g., a box to a cylinder.
declare CHANGED_TELEPORT: number --
declare CHANGED_TEXTURE: number -- The texture offset, scale rotation, or simply the object texture has changed.
declare CHARACTER_ACCOUNT_FOR_SKIPPED_FRAMES: number -- If set to false, character will not attempt to catch up on lost time when pathfinding performance is low, potentially providing more reliable movement (albeit while potentially appearing to be more stuttery). Default is true to match pre-existing behavior.
declare CHARACTER_AVOIDANCE_MODE: number -- Allows you to specify that a character should not try to avoid other characters, should not try to avoid dynamic obstacles (relatively fast moving objects and avatars), or both.
declare CHARACTER_CMD_JUMP: number -- Makes the character jump. Requires an additional parameter, the height to jump, between 0.1m and 2.0m. This must be provided as the first element of the llExecCharacterCmd option list.
declare CHARACTER_CMD_SMOOTH_STOP: number --
declare CHARACTER_CMD_STOP: number -- Stops any current pathfinding operation.
declare CHARACTER_DESIRED_SPEED: number -- Speed of pursuit in meters per second.
declare CHARACTER_DESIRED_TURN_SPEED: number -- The character's maximum speed while turning about the Z axis. - Note that this is only loosely enforced.
declare CHARACTER_LENGTH: number -- Set collision capsule length - cannot be less than two times the radius.
declare CHARACTER_MAX_ACCEL: number -- The character's maximum acceleration rate.
declare CHARACTER_MAX_DECEL: number -- The character's maximum deceleration rate.
declare CHARACTER_MAX_SPEED: number -- The character's maximum speed.
declare CHARACTER_MAX_TURN_RADIUS: number -- The character's turn radius when travelling at CHARACTER_MAX_TURN_SPEED.
declare CHARACTER_ORIENTATION: number -- Valid options are: VERTICAL, HORIZONTAL.
declare CHARACTER_RADIUS: number -- Set collision capsule radius.
declare CHARACTER_STAY_WITHIN_PARCEL: number -- Determines whether a character can leave its starting parcel. Takes a boolean parameter. If TRUE, the character cannot voluntarilly leave the parcel, but can return to it.
declare CHARACTER_TYPE: number -- Specifies which walk-ability coefficient will be used by this character.
declare CHARACTER_TYPE_A: number --
declare CHARACTER_TYPE_B: number --
declare CHARACTER_TYPE_C: number --
declare CHARACTER_TYPE_D: number --
declare CHARACTER_TYPE_NONE: number --
declare CLICK_ACTION_BUY: number -- When the prim is clicked, the buy dialog is opened.
declare CLICK_ACTION_DISABLED: number -- No click action. No touches detected or passed.
declare CLICK_ACTION_IGNORE: number -- No click action. Object is invisible to the mouse.
declare CLICK_ACTION_NONE: number -- Performs the default action: when the prim is clicked, touch events are triggered.
declare CLICK_ACTION_OPEN: number -- When the prim is clicked, the object inventory dialog is opened.
declare CLICK_ACTION_OPEN_MEDIA: number -- When the prim is touched, the web media dialog is opened.
declare CLICK_ACTION_PAY: number -- When the prim is clicked, the pay dialog is opened.
declare CLICK_ACTION_PLAY: number -- When the prim is clicked, html-on-a-prim is enabled?
declare CLICK_ACTION_SIT: number -- When the prim is clicked, the avatar sits upon it.
declare CLICK_ACTION_TOUCH: number -- When the prim is clicked, touch events are triggered.
declare CLICK_ACTION_ZOOM: number -- Zoom in on object when clicked.
declare COMBAT_CHANNEL: number -- COMBAT_CHANNEL is an integer constant that, when passed to llRegionSay will add the message to the combat log. A script with a chat listen active on COMBAT_CHANNEL may also monitor the combat log.
declare COMBAT_LOG_ID: string --
declare CONTENT_TYPE_ATOM: number -- "application/atom+xml"
declare CONTENT_TYPE_FORM: number -- "application/x-www-form-urlencoded"
declare CONTENT_TYPE_HTML: number -- "text/html", only valid for embedded browsers on content owned by the person viewing. Falls back to "text/plain" otherwise.
declare CONTENT_TYPE_JSON: number -- "application/json"
declare CONTENT_TYPE_LLSD: number -- "application/llsd+xml"
declare CONTENT_TYPE_RSS: number -- "application/rss+xml"
declare CONTENT_TYPE_TEXT: number -- "text/plain"
declare CONTENT_TYPE_XHTML: number -- "application/xhtml+xml"
declare CONTENT_TYPE_XML: number -- "application/xml"
declare CONTROL_BACK: number -- Test for the avatar move back control.
declare CONTROL_DOWN: number -- Test for the avatar move down control.
declare CONTROL_FWD: number -- Test for the avatar move forward control.
declare CONTROL_LBUTTON: number -- Test for the avatar left button control.
declare CONTROL_LEFT: number -- Test for the avatar move left control.
declare CONTROL_ML_LBUTTON: number -- Test for the avatar left button control while in mouse look.
declare CONTROL_RIGHT: number -- Test for the avatar move right control.
declare CONTROL_ROT_LEFT: number -- Test for the avatar rotate left control.
declare CONTROL_ROT_RIGHT: number -- Test for the avatar rotate right control.
declare CONTROL_UP: number -- Test for the avatar move up control.
declare DAMAGEABLE: number -- Objects in world that are able to process damage.
declare DAMAGE_TYPE_ACID: number -- Damage caused by a caustic substance, such as acid
declare DAMAGE_TYPE_BLUDGEONING: number -- Damage caused by a blunt object, such as a club.
declare DAMAGE_TYPE_COLD: number -- Damage inflicted by exposure to extreme cold
declare DAMAGE_TYPE_ELECTRIC: number -- Damage caused by electricity.
declare DAMAGE_TYPE_EMOTIONAL: number --
declare DAMAGE_TYPE_FIRE: number -- Damage inflicted by exposure to heat or flames.
declare DAMAGE_TYPE_FORCE: number -- Damage inflicted by a great force or impact.
declare DAMAGE_TYPE_GENERIC: number -- Generic or legacy damage.
declare DAMAGE_TYPE_IMPACT: number -- System damage generated by imapact with land or a prim.
declare DAMAGE_TYPE_NECROTIC: number -- Damage caused by a direct assault on life-force
declare DAMAGE_TYPE_PIERCING: number -- Damage caused by a piercing object such as a bullet, spear, or arrow.
declare DAMAGE_TYPE_POISON: number -- Damage caused by poison.
declare DAMAGE_TYPE_PSYCHIC: number -- Damage caused by a direct assault on the mind.
declare DAMAGE_TYPE_RADIANT: number -- Damage caused by radiation or extreme light.
declare DAMAGE_TYPE_SLASHING: number -- Damage caused by a slashing object such as a sword or axe.
declare DAMAGE_TYPE_SONIC: number -- Damage caused by loud noises, like a Crash Worship concert.
declare DATA_BORN: number -- The date the agent was born, returned in ISO 8601 format of YYYY-MM-DD.
declare DATA_NAME: number -- The name of the agent.
declare DATA_ONLINE: number -- TRUE for online, FALSE for offline.
declare DATA_PAYINFO: number --
declare DATA_RATING: number -- Returns the agent ratings as a comma separated string of six integers. They are:			1) Positive rated behaviour			2) Negative rated behaviour			3) Positive rated appearance			4) Negative rated appearance			5) Positive rated building			6) Negative rated building
declare DATA_SIM_POS: number --
declare DATA_SIM_RATING: number --
declare DATA_SIM_STATUS: number --
declare DEBUG_CHANNEL: number -- DEBUG_CHANNEL is an integer constant that, when passed to llSay, llWhisper, or llShout as a channel parameter, will print text to the Script Warning/Error Window.
declare DEG_TO_RAD: number -- 0.017453293 - Number of radians per degree.			You can use this to convert degrees to radians by multiplying the degrees by this number.
declare DENSITY: number -- Used with llSetPhysicsMaterial to enable the density value. Must be between 1.0 and 22587.0 (in Kg/m^3 -- see if you can figure out what 22587 represents)
declare DEREZ_DIE: number -- Causes the object to immediately die.
declare DEREZ_MAKE_TEMP: number -- The object is made temporary and will be cleaned up at some later timer.
declare ENVIRONMENT_DAYINFO: number -- Day length, offset and progression.
declare ENV_INVALID_AGENT: number -- Could not find agent with the specified ID
declare ENV_INVALID_RULE: number -- Attempted to change an unknown property.
declare ENV_NOT_EXPERIENCE: number -- Attempt to change environments outside an experience.
declare ENV_NO_ENVIRONMENT: number -- Could not find environmental settings in object inventory.
declare ENV_NO_EXPERIENCE_LAND: number -- The experience has not been enabled on this land.
declare ENV_NO_EXPERIENCE_PERMISSION: number -- Agent has not granted permission to change environments.
declare ENV_NO_PERMISSIONS: number -- Script does not have permission to modify environment.
declare ENV_THROTTLE: number -- Could not validate values for environment.
declare ENV_VALIDATION_FAIL: number -- Could not validate values for environment.
declare EOF: string -- Indicates the last line of a notecard was read.
declare ERR_GENERIC: number --
declare ERR_MALFORMED_PARAMS: number --
declare ERR_PARCEL_PERMISSIONS: number --
declare ERR_RUNTIME_PERMISSIONS: number --
declare ERR_THROTTLED: number --
declare ESTATE_ACCESS_ALLOWED_AGENT_ADD: number -- Add the agent to this estate's Allowed Residents list.
declare ESTATE_ACCESS_ALLOWED_AGENT_REMOVE: number -- Remove the agent from this estate's Allowed Residents list.
declare ESTATE_ACCESS_ALLOWED_GROUP_ADD: number -- Add the group to this estate's Allowed groups list.
declare ESTATE_ACCESS_ALLOWED_GROUP_REMOVE: number -- Remove the group from this estate's Allowed groups list.
declare ESTATE_ACCESS_BANNED_AGENT_ADD: number -- Add the agent to this estate's Banned residents list.
declare ESTATE_ACCESS_BANNED_AGENT_REMOVE: number -- Remove the agent from this estate's Banned residents list.
declare FALSE: number -- An integer constant for boolean comparisons. Has the value '0'.
declare FILTER_FLAGS: number -- Flags to control returned attachments.
declare FILTER_FLAG_HUDS: number -- Include HUDs with matching experience.
declare FILTER_INCLUDE: number -- Include attachment point.
declare FORCE_DIRECT_PATH: number -- Makes character navigate in a straight line toward position. May be set to TRUE or FALSE.
declare FRICTION: number -- Used with llSetPhysicsMaterial to enable the friction value. Must be between 0.0 and 255.0
declare GAME_CONTROL_AXIS_LEFTX: number --
declare GAME_CONTROL_AXIS_LEFTY: number --
declare GAME_CONTROL_AXIS_RIGHTX: number --
declare GAME_CONTROL_AXIS_RIGHTY: number --
declare GAME_CONTROL_AXIS_TRIGGERLEFT: number --
declare GAME_CONTROL_AXIS_TRIGGERRIGHT: number --
declare GAME_CONTROL_BUTTON_A: number --
declare GAME_CONTROL_BUTTON_B: number --
declare GAME_CONTROL_BUTTON_BACK: number --
declare GAME_CONTROL_BUTTON_DPAD_DOWN: number --
declare GAME_CONTROL_BUTTON_DPAD_LEFT: number --
declare GAME_CONTROL_BUTTON_DPAD_RIGHT: number --
declare GAME_CONTROL_BUTTON_DPAD_UP: number --
declare GAME_CONTROL_BUTTON_GUIDE: number --
declare GAME_CONTROL_BUTTON_LEFTSHOULDER: number --
declare GAME_CONTROL_BUTTON_LEFTSTICK: number --
declare GAME_CONTROL_BUTTON_MISC1: number --
declare GAME_CONTROL_BUTTON_PADDLE1: number --
declare GAME_CONTROL_BUTTON_PADDLE2: number --
declare GAME_CONTROL_BUTTON_PADDLE3: number --
declare GAME_CONTROL_BUTTON_PADDLE4: number --
declare GAME_CONTROL_BUTTON_RIGHTSHOULDER: number --
declare GAME_CONTROL_BUTTON_RIGHTSTICK: number --
declare GAME_CONTROL_BUTTON_START: number --
declare GAME_CONTROL_BUTTON_TOUCHPAD: number --
declare GAME_CONTROL_BUTTON_X: number --
declare GAME_CONTROL_BUTTON_Y: number --
declare GCNP_RADIUS: number --
declare GCNP_STATIC: number --
declare GRAVITY_MULTIPLIER: number -- Used with llSetPhysicsMaterial to enable the gravity multiplier value. Must be between -1.0 and +28.0
declare HORIZONTAL: number --
declare HTTP_ACCEPT: number -- Provide a string value to be included in the HTTP accepts header value. This replaces the default Second Life HTTP accepts header.
declare HTTP_BODY_MAXLENGTH: number --
declare HTTP_BODY_TRUNCATED: number --
declare HTTP_CUSTOM_HEADER: number -- Add an extra custom HTTP header to the request. The first string is the name of the parameter to change, e.g. "Pragma", and the second string is the value, e.g. "no-cache". Up to 8 custom headers may be configured per request. Note that certain headers, such as the default headers, are blocked for security reasons.
declare HTTP_EXTENDED_ERROR: number -- Report extended error information through http_response event.
declare HTTP_METHOD: number --
declare HTTP_MIMETYPE: number --
declare HTTP_PRAGMA_NO_CACHE: number -- Allows enabling/disbling of the "Pragma: no-cache" header. Usage: [HTTP_PRAGMA_NO_CACHE, integer SendHeader]. When SendHeader is TRUE, the "Pragma: no-cache" header is sent by the script. This matches the default behavior. When SendHeader is FALSE, no "Pragma" header is sent by the script.
declare HTTP_USER_AGENT: number -- Provide a string value to be included in the HTTP User-Agent header value. This is appended to the default value.
declare HTTP_VERBOSE_THROTTLE: number --
declare HTTP_VERIFY_CERT: number --
declare IMG_USE_BAKED_AUX1: string --
declare IMG_USE_BAKED_AUX2: string --
declare IMG_USE_BAKED_AUX3: string --
declare IMG_USE_BAKED_EYES: string --
declare IMG_USE_BAKED_HAIR: string --
declare IMG_USE_BAKED_HEAD: string --
declare IMG_USE_BAKED_LEFTARM: string --
declare IMG_USE_BAKED_LEFTLEG: string --
declare IMG_USE_BAKED_LOWER: string --
declare IMG_USE_BAKED_SKIRT: string --
declare IMG_USE_BAKED_UPPER: string --
declare INVENTORY_ALL: number --
declare INVENTORY_ANIMATION: number --
declare INVENTORY_BODYPART: number --
declare INVENTORY_CLOTHING: number --
declare INVENTORY_GESTURE: number --
declare INVENTORY_LANDMARK: number --
declare INVENTORY_MATERIAL: number --
declare INVENTORY_NONE: number --
declare INVENTORY_NOTECARD: number --
declare INVENTORY_OBJECT: number --
declare INVENTORY_SCRIPT: number --
declare INVENTORY_SETTING: number --
declare INVENTORY_SOUND: number --
declare INVENTORY_TEXTURE: number --
declare JSON_APPEND: number --
declare JSON_ARRAY: string --
declare JSON_DELETE: string --
declare JSON_FALSE: string --
declare JSON_INVALID: string --
declare JSON_NULL: string --
declare JSON_NUMBER: string --
declare JSON_OBJECT: string --
declare JSON_STRING: string --
declare JSON_TRUE: string --
declare KFM_CMD_PAUSE: number -- For use with KFM_COMMAND.
declare KFM_CMD_PLAY: number -- For use with KFM_COMMAND.
declare KFM_CMD_STOP: number -- For use with KFM_COMMAND.
declare KFM_COMMAND: number --
declare KFM_DATA: number --
declare KFM_FORWARD: number -- For use with KFM_MODE.
declare KFM_LOOP: number -- For use with KFM_MODE.
declare KFM_MODE: number --
declare KFM_PING_PONG: number -- For use with KFM_MODE.
declare KFM_REVERSE: number -- For use with KFM_MODE.
declare KFM_ROTATION: number -- For use with KFM_DATA.
declare KFM_TRANSLATION: number -- For use with KFM_DATA.
declare LAND_LARGE_BRUSH: number -- Use a large brush size. NOTE: This value is incorrect, a large brush should be 2.
declare LAND_LEVEL: number -- Action to level the land.
declare LAND_LOWER: number -- Action to lower the land.
declare LAND_MEDIUM_BRUSH: number -- Use a medium brush size. NOTE: This value is incorrect, a medium brush should be 1.
declare LAND_NOISE: number --
declare LAND_RAISE: number -- Action to raise the land.
declare LAND_REVERT: number --
declare LAND_SMALL_BRUSH: number -- Use a small brush size. NOTE: This value is incorrect, a small brush should be 0.
declare LAND_SMOOTH: number --
declare LINKSETDATA_DELETE: number -- A name:value pair has been removed from the linkset datastore.
declare LINKSETDATA_EMEMORY: number -- A name:value pair was too large to write to the linkset datastore.
declare LINKSETDATA_ENOKEY: number -- The key supplied was empty.
declare LINKSETDATA_EPROTECTED: number -- The name:value pair has been protected from overwrite in the linkset datastore.
declare LINKSETDATA_MULTIDELETE: number -- A CSV list of names removed from the linkset datastore.
declare LINKSETDATA_NOTFOUND: number -- The named key was not found in the datastore.
declare LINKSETDATA_NOUPDATE: number -- The value written to a name in the keystore is the same as the value already there.
declare LINKSETDATA_OK: number -- The name:value pair was written to the datastore.
declare LINKSETDATA_RESET: number -- The linkset datastore has been reset.
declare LINKSETDATA_UPDATE: number -- A name:value pair in the linkset datastore has been changed or created.
declare LINK_ALL_CHILDREN: number -- This targets every object except the root in the linked set.
declare LINK_ALL_OTHERS: number -- This targets every object in the linked set except the object with the script.
declare LINK_ROOT: number -- This targets the root of the linked set.
declare LINK_SET: number -- This targets every object in the linked set.
declare LINK_THIS: number -- The link number of the prim containing the script.
declare LIST_STAT_GEOMETRIC_MEAN: number --
declare LIST_STAT_MAX: number --
declare LIST_STAT_MEAN: number --
declare LIST_STAT_MEDIAN: number --
declare LIST_STAT_MIN: number --
declare LIST_STAT_NUM_COUNT: number --
declare LIST_STAT_RANGE: number --
declare LIST_STAT_STD_DEV: number --
declare LIST_STAT_SUM: number --
declare LIST_STAT_SUM_SQUARES: number --
declare LOOP: number -- Loop the texture animation.
declare MASK_BASE: number --
declare MASK_COMBINED: number -- Fold permissions for object inventory into results.
declare MASK_EVERYONE: number --
declare MASK_GROUP: number --
declare MASK_NEXT: number --
declare MASK_OWNER: number --
declare NAK: string -- Indicates a notecard read was attempted and the notecard was not yet cached on the server.
declare NULL_KEY: uuid --
declare OBJECT_ACCOUNT_LEVEL: number -- Retrieves the account level of an avatar. Returns 0 when the avatar has a basic account,  1 when the avatar has a premium account,  10 when the avatar has a premium plus account,  or -1 if the object is not an avatar.
declare OBJECT_ANIMATED_COUNT: number -- This is a flag used with llGetObjectDetails to get the number of associated animated objects
declare OBJECT_ANIMATED_SLOTS_AVAILABLE: number -- This is a flag used with llGetObjectDetails to get the number of additional animated object attachments allowed.
declare OBJECT_ATTACHED_POINT: number -- Gets the attachment point to which the object is attached. Returns 0 if the object is not an attachment (or is an avatar, etc).
declare OBJECT_ATTACHED_SLOTS_AVAILABLE: number -- Returns the number of attachment slots available. Returns 0 if the object is not an avatar or none are available.
declare OBJECT_BODY_SHAPE_TYPE: number -- This is a flag used with llGetObjectDetails to get the body type of the avatar, based on shape data. If no data is available, -1.0 is returned. This is normally between 0 and 1.0, with 0.5 and larger considered 'male'
declare OBJECT_CHARACTER_TIME: number -- Units in seconds
declare OBJECT_CLICK_ACTION: number -- This is a flag used with llGetObjectDetails to get the click action. The default is 0
declare OBJECT_CREATION_TIME: number -- This is a flag used with llGetObjectDetails to get the time this object was created
declare OBJECT_CREATOR: number -- Gets the object's creator key. If id is an avatar, a NULL_KEY is returned.
declare OBJECT_DAMAGE: number -- Gets the damage value assigned to this object.
declare OBJECT_DAMAGE_TYPE: number -- Gets the damage type, if any, assigned to this object.
declare OBJECT_DESC: number -- Gets the object's description. If id is an avatar, an empty string is returned.
declare OBJECT_GROUP: number -- Gets the prims's group key. If id is an avatar, a NULL_KEY is returned.
declare OBJECT_GROUP_TAG: number -- Gets the agent's current group role tag. If id is an object, an empty is returned.
declare OBJECT_HEALTH: number -- Gets current health value for the object.
declare OBJECT_HOVER_HEIGHT: number -- This is a flag used with llGetObjectDetails to get hover height of the avatar If no data is available, 0.0 is returned.
declare OBJECT_LAST_OWNER_ID: number -- Gets the object's last owner ID.
declare OBJECT_LINK_NUMBER: number -- Gets the object's link number or 0 if unlinked.
declare OBJECT_MASS: number -- Get the object's mass
declare OBJECT_MATERIAL: number -- Get an object's material setting.
declare OBJECT_NAME: number -- Gets the object's name.
declare OBJECT_OMEGA: number -- Gets an object's angular velocity.
declare OBJECT_OWNER: number -- Gets an object's owner's key. If id is group owned, a NULL_KEY is returned.
declare OBJECT_PATHFINDING_TYPE: number -- Returns the pathfinding setting of any object in the region. It returns an integer matching one of the OPT_* constants.
declare OBJECT_PERMS: number -- Gets the objects permissions
declare OBJECT_PERMS_COMBINED: number -- Gets the object's permissions including any inventory.
declare OBJECT_PHANTOM: number -- Returns boolean, detailing if phantom is enabled or disabled on the object. If id is an avatar or attachment, 0 is returned.
declare OBJECT_PHYSICS: number -- Returns boolean, detailing if physics is enabled or disabled on the object. If id is an avatar or attachment, 0 is returned.
declare OBJECT_PHYSICS_COST: number --
declare OBJECT_POS: number -- Gets the object's position in region coordinates.
declare OBJECT_PRIM_COUNT: number -- Gets the prim count of the object. The script and target object must be owned by the same owner
declare OBJECT_PRIM_EQUIVALENCE: number --
declare OBJECT_RENDER_WEIGHT: number -- This is a flag used with llGetObjectDetails to get the Avatar_Rendering_Cost of an avatar, based on values reported by nearby viewers. If no data is available, -1 is returned. The maximum render weight stored by the simulator is 500000. When called against an object, 0 is returned.
declare OBJECT_RETURN_PARCEL: number --
declare OBJECT_RETURN_PARCEL_OWNER: number --
declare OBJECT_RETURN_REGION: number --
declare OBJECT_REZZER_KEY: number --
declare OBJECT_REZ_TIME: number -- Get the time when an object was rezzed.
declare OBJECT_ROOT: number -- Gets the id of the root prim of the object requested. If id is an avatar, return the id of the root prim of the linkset the avatar is sitting on (or the avatar's own id if the avatar is not sitting on an object within the region).
declare OBJECT_ROT: number -- Gets the object's rotation.
declare OBJECT_RUNNING_SCRIPT_COUNT: number --
declare OBJECT_SCALE: number -- Gets the object's size.
declare OBJECT_SCRIPT_MEMORY: number --
declare OBJECT_SCRIPT_TIME: number --
declare OBJECT_SELECT_COUNT: number -- This is a flag used with llGetObjectDetails to get the number of avatars selecting any part of the object
declare OBJECT_SERVER_COST: number --
declare OBJECT_SIT_COUNT: number -- This is a flag used with llGetObjectDetails to get the number of avatars sitting on the object
declare OBJECT_STREAMING_COST: number --
declare OBJECT_TEMP_ATTACHED: number -- Returns boolean, indicating if object is a temp attachment.
declare OBJECT_TEMP_ON_REZ: number -- Returns boolean, detailing if temporary is enabled or disabled on the object.
declare OBJECT_TEXT: number -- Gets an objects hover text.
declare OBJECT_TEXT_ALPHA: number -- Gets the alpha of an objects hover text.
declare OBJECT_TEXT_COLOR: number -- Gets the color of an objects hover text.
declare OBJECT_TOTAL_INVENTORY_COUNT: number -- Gets the total inventory count of the object. The script and target object must be owned by the same owner
declare OBJECT_TOTAL_SCRIPT_COUNT: number --
declare OBJECT_UNKNOWN_DETAIL: number --
declare OBJECT_VELOCITY: number -- Gets the object's velocity.
declare OPT_AVATAR: number -- Returned for avatars.
declare OPT_CHARACTER: number -- Returned for pathfinding characters.
declare OPT_EXCLUSION_VOLUME: number -- Returned for exclusion volumes.
declare OPT_LEGACY_LINKSET: number -- Returned for movable obstacles, movable phantoms, physical, and volumedetect objects.
declare OPT_MATERIAL_VOLUME: number -- Returned for material volumes.
declare OPT_OTHER: number -- Returned for attachments, Linden trees, and grass.
declare OPT_STATIC_OBSTACLE: number -- Returned for static obstacles.
declare OPT_WALKABLE: number -- Returned for walkable objects.
declare PARCEL_COUNT_GROUP: number --
declare PARCEL_COUNT_OTHER: number --
declare PARCEL_COUNT_OWNER: number --
declare PARCEL_COUNT_SELECTED: number --
declare PARCEL_COUNT_TEMP: number --
declare PARCEL_COUNT_TOTAL: number --
declare PARCEL_DETAILS_AREA: number -- The parcel's area, in square meters. (5 chars.).
declare PARCEL_DETAILS_DESC: number -- The description of the parcel. (127 chars).
declare PARCEL_DETAILS_FLAGS: number -- Flags set on the parcel
declare PARCEL_DETAILS_GROUP: number -- The parcel group's key. (36 chars.).
declare PARCEL_DETAILS_ID: number -- The parcel's key. (36 chars.).
declare PARCEL_DETAILS_LANDING_LOOKAT: number -- Lookat vector set for teleport routing.
declare PARCEL_DETAILS_LANDING_POINT: number -- The parcel's landing point, if any.
declare PARCEL_DETAILS_NAME: number -- The name of the parcel. (63 chars.).
declare PARCEL_DETAILS_OWNER: number -- The parcel owner's key. (36 chars.).
declare PARCEL_DETAILS_PRIM_CAPACITY: number -- The parcel's prim capacity.
declare PARCEL_DETAILS_PRIM_USED: number -- The number of prims used on this parcel.
declare PARCEL_DETAILS_SCRIPT_DANGER: number -- There are restrictions on this parcel that may impact script execution.
declare PARCEL_DETAILS_SEE_AVATARS: number -- The parcel's avatar visibility setting. (1 char.).
declare PARCEL_DETAILS_TP_ROUTING: number -- Parcel's teleport routing setting.
declare PARCEL_FLAG_ALLOW_ALL_OBJECT_ENTRY: number --
declare PARCEL_FLAG_ALLOW_CREATE_GROUP_OBJECTS: number --
declare PARCEL_FLAG_ALLOW_CREATE_OBJECTS: number --
declare PARCEL_FLAG_ALLOW_DAMAGE: number --
declare PARCEL_FLAG_ALLOW_FLY: number --
declare PARCEL_FLAG_ALLOW_GROUP_OBJECT_ENTRY: number --
declare PARCEL_FLAG_ALLOW_GROUP_SCRIPTS: number --
declare PARCEL_FLAG_ALLOW_LANDMARK: number --
declare PARCEL_FLAG_ALLOW_SCRIPTS: number --
declare PARCEL_FLAG_ALLOW_TERRAFORM: number --
declare PARCEL_FLAG_LOCAL_SOUND_ONLY: number --
declare PARCEL_FLAG_RESTRICT_PUSHOBJECT: number --
declare PARCEL_FLAG_USE_ACCESS_GROUP: number --
declare PARCEL_FLAG_USE_ACCESS_LIST: number --
declare PARCEL_FLAG_USE_BAN_LIST: number --
declare PARCEL_FLAG_USE_LAND_PASS_LIST: number --
declare PARCEL_MEDIA_COMMAND_AGENT: number --
declare PARCEL_MEDIA_COMMAND_AUTO_ALIGN: number --
declare PARCEL_MEDIA_COMMAND_DESC: number -- Use this to get or set the parcel media description.
declare PARCEL_MEDIA_COMMAND_LOOP: number --
declare PARCEL_MEDIA_COMMAND_LOOP_SET: number -- Used to get or set the parcel's media looping variable.
declare PARCEL_MEDIA_COMMAND_PAUSE: number --
declare PARCEL_MEDIA_COMMAND_PLAY: number --
declare PARCEL_MEDIA_COMMAND_SIZE: number -- Use this to get or set the parcel media pixel resolution.
declare PARCEL_MEDIA_COMMAND_STOP: number --
declare PARCEL_MEDIA_COMMAND_TEXTURE: number --
declare PARCEL_MEDIA_COMMAND_TIME: number --
declare PARCEL_MEDIA_COMMAND_TYPE: number -- Use this to get or set the parcel media MIME type (e.g. "text/html").
declare PARCEL_MEDIA_COMMAND_UNLOAD: number --
declare PARCEL_MEDIA_COMMAND_URL: number --
declare PASSIVE: number -- Static in-world objects.
declare PASS_ALWAYS: number -- Always pass the event.
declare PASS_IF_NOT_HANDLED: number -- Pass the event if there is no script handling the event in the prim.
declare PASS_NEVER: number -- Always pass the event.
declare PATROL_PAUSE_AT_WAYPOINTS: number --
declare PAYMENT_INFO_ON_FILE: number --
declare PAYMENT_INFO_USED: number --
declare PAY_DEFAULT: number --
declare PAY_HIDE: number --
declare PERMISSION_ATTACH: number -- If this permission is enabled, the object can successfully call llAttachToAvatar to attach to the given avatar.
declare PERMISSION_CHANGE_JOINTS: number -- (not yet implemented)
declare PERMISSION_CHANGE_LINKS: number -- If this permission is enabled, the object can successfully call llCreateLink, llBreakLink, and llBreakAllLinks to change links to other objects.
declare PERMISSION_CHANGE_PERMISSIONS: number -- (not yet implemented)
declare PERMISSION_CONTROL_CAMERA: number --
declare PERMISSION_DEBIT: number -- If this permission is enabled, the object can successfully call llGiveMoney or llTransferLindenDollars to debit the owners account.
declare PERMISSION_OVERRIDE_ANIMATIONS: number -- Permission to override default animations.
declare PERMISSION_RELEASE_OWNERSHIP: number -- (not yet implemented)
declare PERMISSION_REMAP_CONTROLS: number -- (not yet implemented)
declare PERMISSION_RETURN_OBJECTS: number --
declare PERMISSION_SILENT_ESTATE_MANAGEMENT: number -- A script with this permission does not notify the object owner when it modifies estate access rules via llManageEstateAccess.
declare PERMISSION_TAKE_CONTROLS: number -- If this permission enabled, the object can successfully call the llTakeControls libray call.
declare PERMISSION_TELEPORT: number --
declare PERMISSION_TRACK_CAMERA: number --
declare PERMISSION_TRIGGER_ANIMATION: number -- If this permission is enabled, the object can successfully call llStartAnimation for the avatar that owns this.
declare PERM_ALL: number --
declare PERM_COPY: number --
declare PERM_MODIFY: number --
declare PERM_MOVE: number --
declare PERM_TRANSFER: number --
declare PI: number -- 3.14159265 - The number of radians in a semi-circle.
declare PING_PONG: number -- Play animation going forwards, then backwards.
declare PI_BY_TWO: number -- 1.57079633 - The number of radians in a quarter circle.
declare PRIM_ALLOW_UNSIT: number -- Prim parameter for restricting manual standing for seated avatars in an experience. Ignored if the avatar was not seated via a call to llSitOnLink.
declare PRIM_ALPHA_MODE: number -- Prim parameter for materials using integer face, integer alpha_mode, integer alpha_cutoff. Defines how the alpha channel of the diffuse texture should be rendered. Valid options for alpha_mode are PRIM_ALPHA_MODE_BLEND, _NONE, _MASK, and _EMISSIVE. alpha_cutoff is used only for PRIM_ALPHA_MODE_MASK.
declare PRIM_ALPHA_MODE_BLEND: number -- Prim parameter setting for PRIM_ALPHA_MODE. Indicates that the diffuse texture's alpha channel should be rendered as alpha-blended.
declare PRIM_ALPHA_MODE_EMISSIVE: number -- Prim parameter setting for PRIM_ALPHA_MODE. Indicates that the diffuse texture's alpha channel should be rendered as an emissivity mask.
declare PRIM_ALPHA_MODE_MASK: number -- Prim parameter setting for PRIM_ALPHA_MODE. Indicates that the diffuse texture's alpha channel should be rendered as fully opaque for alpha values above alpha_cutoff and fully transparent otherwise.
declare PRIM_ALPHA_MODE_NONE: number -- Prim parameter setting for PRIM_ALPHA_MODE. Indicates that the diffuse texture's alpha channel should be ignored.
declare PRIM_BUMP_BARK: number --
declare PRIM_BUMP_BLOBS: number --
declare PRIM_BUMP_BRICKS: number --
declare PRIM_BUMP_BRIGHT: number --
declare PRIM_BUMP_CHECKER: number --
declare PRIM_BUMP_CONCRETE: number --
declare PRIM_BUMP_DARK: number --
declare PRIM_BUMP_DISKS: number --
declare PRIM_BUMP_GRAVEL: number --
declare PRIM_BUMP_LARGETILE: number --
declare PRIM_BUMP_NONE: number --
declare PRIM_BUMP_SHINY: number --
declare PRIM_BUMP_SIDING: number --
declare PRIM_BUMP_STONE: number --
declare PRIM_BUMP_STUCCO: number --
declare PRIM_BUMP_SUCTION: number --
declare PRIM_BUMP_TILE: number --
declare PRIM_BUMP_WEAVE: number --
declare PRIM_BUMP_WOOD: number --
declare PRIM_CAST_SHADOWS: number --
declare PRIM_CLICK_ACTION: number --
declare PRIM_COLLISION_SOUND: number -- Collision sound uuid and volume for this prim
declare PRIM_COLOR: number --
declare PRIM_DAMAGE: number -- Damage and damage type assigned to this prim.
declare PRIM_DESC: number --
declare PRIM_FLEXIBLE: number --
declare PRIM_FULLBRIGHT: number --
declare PRIM_GLOW: number -- PRIM_GLOW is used to get or set the glow status of the face.
declare PRIM_GLTF_ALPHA_MODE_BLEND: number -- Prim parameter setting for PRIM_GLTF_BASE_COLOR alpha mode "BLEND".
declare PRIM_GLTF_ALPHA_MODE_MASK: number -- Prim parameter setting for PRIM_GLTF_BASE_COLOR alpha mode "MASK".
declare PRIM_GLTF_ALPHA_MODE_OPAQUE: number -- Prim parameter setting for PRIM_GLTF_BASE_COLOR alpha mode "OPAQUE".
declare PRIM_GLTF_BASE_COLOR: number -- Prim parameter for materials using integer face, string texture, vector repeats, vector offsets, float rotation_in_radians, vector color, integer alpha_mode, integer alpha_cutoff, boolean double_sided. Valid options for alpha_mode are PRIM_ALPHA_MODE_BLEND, _NONE, and _MASK. alpha_cutoff is used only for PRIM_ALPHA_MODE_MASK.
declare PRIM_GLTF_EMISSIVE: number -- Prim parameter for GLTF materials using integer face, string texture, vector repeats, vector offsets, float rotation_in_radians, vector color
declare PRIM_GLTF_METALLIC_ROUGHNESS: number -- Prim parameter for GLTF materials using integer face, string texture, vector repeats, vector offsets, float rotation_in_radians, float metallic_factor, float roughness_factor
declare PRIM_GLTF_NORMAL: number -- Prim parameter for GLTF materials using integer face, string texture, vector repeats, vector offsets, float rotation_in_radians
declare PRIM_HEALTH: number -- Health value for this prim
declare PRIM_HOLE_CIRCLE: number --
declare PRIM_HOLE_DEFAULT: number --
declare PRIM_HOLE_SQUARE: number --
declare PRIM_HOLE_TRIANGLE: number --
declare PRIM_LINK_TARGET: number --
declare PRIM_MATERIAL: number --
declare PRIM_MATERIAL_FLESH: number --
declare PRIM_MATERIAL_GLASS: number --
declare PRIM_MATERIAL_LIGHT: number --
declare PRIM_MATERIAL_METAL: number --
declare PRIM_MATERIAL_PLASTIC: number --
declare PRIM_MATERIAL_RUBBER: number --
declare PRIM_MATERIAL_STONE: number --
declare PRIM_MATERIAL_WOOD: number --
declare PRIM_MEDIA_ALT_IMAGE_ENABLE: number -- Boolean. Gets/Sets the default image state (the image that the user sees before a piece of media is active) for the chosen face. The default image is specified by Second Life's server for that media type.
declare PRIM_MEDIA_AUTO_LOOP: number -- Boolean. Gets/Sets whether auto-looping is enabled.
declare PRIM_MEDIA_AUTO_PLAY: number -- Boolean. Gets/Sets whether the media auto-plays when a Resident can view it.
declare PRIM_MEDIA_AUTO_SCALE: number -- Boolean. Gets/Sets whether auto-scaling is enabled. Auto-scaling forces the media to the full size of the texture.
declare PRIM_MEDIA_AUTO_ZOOM: number -- Boolean. Gets/Sets whether clicking the media triggers auto-zoom and auto-focus on the media.
declare PRIM_MEDIA_CONTROLS: number -- Integer. Gets/Sets the style of controls. Can be either PRIM_MEDIA_CONTROLS_STANDARD or PRIM_MEDIA_CONTROLS_MINI.
declare PRIM_MEDIA_CONTROLS_MINI: number -- Mini web navigation controls; does not include an address bar.
declare PRIM_MEDIA_CONTROLS_STANDARD: number -- Standard web navigation controls.
declare PRIM_MEDIA_CURRENT_URL: number -- String. Gets/Sets the current url displayed on the chosen face. Changing this URL causes navigation. 1024 characters Maximum.
declare PRIM_MEDIA_FIRST_CLICK_INTERACT: number -- Boolean. Gets/Sets whether the first click interaction is enabled.
declare PRIM_MEDIA_HEIGHT_PIXELS: number -- Integer. Gets/Sets the height of the media in pixels.
declare PRIM_MEDIA_HOME_URL: number -- String. Gets/Sets the home URL for the chosen face. 1024 characters maximum.
declare PRIM_MEDIA_MAX_HEIGHT_PIXELS: number --
declare PRIM_MEDIA_MAX_URL_LENGTH: number --
declare PRIM_MEDIA_MAX_WHITELIST_COUNT: number --
declare PRIM_MEDIA_MAX_WHITELIST_SIZE: number --
declare PRIM_MEDIA_MAX_WIDTH_PIXELS: number --
declare PRIM_MEDIA_PARAM_MAX: number --
declare PRIM_MEDIA_PERMS_CONTROL: number -- Integer. Gets/Sets the permissions mask that control who can see the media control bar above the object:: PRIM_MEDIA_PERM_ANYONE, PRIM_MEDIA_PERM_GROUP, PRIM_MEDIA_PERM_NONE, PRIM_MEDIA_PERM_OWNER
declare PRIM_MEDIA_PERMS_INTERACT: number -- Integer. Gets/Sets the permissions mask that control who can interact with the object: PRIM_MEDIA_PERM_ANYONE, PRIM_MEDIA_PERM_GROUP, PRIM_MEDIA_PERM_NONE, PRIM_MEDIA_PERM_OWNER
declare PRIM_MEDIA_PERM_ANYONE: number --
declare PRIM_MEDIA_PERM_GROUP: number --
declare PRIM_MEDIA_PERM_NONE: number --
declare PRIM_MEDIA_PERM_OWNER: number --
declare PRIM_MEDIA_WHITELIST: number -- String. Gets/Sets the white-list as a string of escaped, comma-separated URLs. This string can hold up to 64 URLs or 1024 characters, whichever comes first.
declare PRIM_MEDIA_WHITELIST_ENABLE: number -- Boolean. Gets/Sets whether navigation is restricted to URLs in PRIM_MEDIA_WHITELIST.
declare PRIM_MEDIA_WIDTH_PIXELS: number -- Integer. Gets/Sets the width of the media in pixels.
declare PRIM_NAME: number --
declare PRIM_NORMAL: number -- Prim parameter for materials using integer face, string texture, vector repeats, vector offsets, float rotation_in_radians
declare PRIM_OMEGA: number --
declare PRIM_PHANTOM: number --
declare PRIM_PHYSICS: number --
declare PRIM_PHYSICS_SHAPE_CONVEX: number -- Use the convex hull of the prim shape for physics (this is the default for mesh objects).
declare PRIM_PHYSICS_SHAPE_NONE: number -- Ignore this prim in the physics shape. NB: This cannot be applied to the root prim.
declare PRIM_PHYSICS_SHAPE_PRIM: number -- Use the normal prim shape for physics (this is the default for all non-mesh objects).
declare PRIM_PHYSICS_SHAPE_TYPE: number -- Allows you to set the physics shape type of a prim via lsl. Permitted values are:			PRIM_PHYSICS_SHAPE_NONE, PRIM_PHYSICS_SHAPE_PRIM, PRIM_PHYSICS_SHAPE_CONVEX
declare PRIM_POINT_LIGHT: number --
declare PRIM_POSITION: number --
declare PRIM_POS_LOCAL: number --
declare PRIM_PROJECTOR: number --
declare PRIM_REFLECTION_PROBE: number -- Allows you to configure the object as a custom-placed reflection probe, for image-based lighting (IBL). Only objects in the influence volume of the reflection probe object are affected.
declare PRIM_REFLECTION_PROBE_BOX: number -- This is a flag option used with llGetPrimitiveParams and related functions when the parameter is PRIM_REFLECTION_PROBE. When set, the reflection probe is a box. When unset, the reflection probe is a sphere.
declare PRIM_REFLECTION_PROBE_DYNAMIC: number -- This is a flag option used with llGetPrimitiveParams and related functions when the parameter is PRIM_REFLECTION_PROBE. When set, the reflection probe includes avatars in IBL effects. When unset, the reflection probe excludes avatars.
declare PRIM_REFLECTION_PROBE_MIRROR: number -- This is a flag option used with llGetPrimitiveParams and related functions when the parameter is PRIM_REFLECTION_PROBE. When set, the reflection probe acts as a mirror.
declare PRIM_RENDER_MATERIAL: number --
declare PRIM_ROTATION: number --
declare PRIM_ROT_LOCAL: number --
declare PRIM_SCRIPTED_SIT_ONLY: number -- Prim parameter for restricting manual sitting on this prim. Sitting must be initiated via call to llSitOnLink.
declare PRIM_SCULPT_FLAG_ANIMESH: number -- Mesh is animated.
declare PRIM_SCULPT_FLAG_INVERT: number -- Render inside out (inverts the normals).
declare PRIM_SCULPT_FLAG_MIRROR: number -- Render an X axis mirror of the sculpty.
declare PRIM_SCULPT_TYPE_CYLINDER: number --
declare PRIM_SCULPT_TYPE_MASK: number --
declare PRIM_SCULPT_TYPE_MESH: number --
declare PRIM_SCULPT_TYPE_PLANE: number --
declare PRIM_SCULPT_TYPE_SPHERE: number --
declare PRIM_SCULPT_TYPE_TORUS: number --
declare PRIM_SHINY_HIGH: number --
declare PRIM_SHINY_LOW: number --
declare PRIM_SHINY_MEDIUM: number --
declare PRIM_SHINY_NONE: number --
declare PRIM_SIT_FLAGS: number --
declare PRIM_SIT_TARGET: number --
declare PRIM_SIZE: number --
declare PRIM_SLICE: number --
declare PRIM_SPECULAR: number -- Prim parameter for materials using integer face, string texture, vector repeats, vector offsets, float rotation_in_radians, vector color, integer glossy, integer environment
declare PRIM_TEMP_ON_REZ: number --
declare PRIM_TEXGEN: number --
declare PRIM_TEXGEN_DEFAULT: number --
declare PRIM_TEXGEN_PLANAR: number --
declare PRIM_TEXT: number --
declare PRIM_TEXTURE: number --
declare PRIM_TYPE: number --
declare PRIM_TYPE_BOX: number --
declare PRIM_TYPE_CYLINDER: number --
declare PRIM_TYPE_PRISM: number --
declare PRIM_TYPE_RING: number --
declare PRIM_TYPE_SCULPT: number --
declare PRIM_TYPE_SPHERE: number --
declare PRIM_TYPE_TORUS: number --
declare PRIM_TYPE_TUBE: number --
declare PROFILE_NONE: number -- Disables profiling
declare PROFILE_SCRIPT_MEMORY: number -- Enables memory profiling
declare PSYS_PART_BF_DEST_COLOR: number --
declare PSYS_PART_BF_ONE: number --
declare PSYS_PART_BF_ONE_MINUS_DEST_COLOR: number --
declare PSYS_PART_BF_ONE_MINUS_SOURCE_ALPHA: number --
declare PSYS_PART_BF_ONE_MINUS_SOURCE_COLOR: number --
declare PSYS_PART_BF_SOURCE_ALPHA: number --
declare PSYS_PART_BF_SOURCE_COLOR: number --
declare PSYS_PART_BF_ZERO: number --
declare PSYS_PART_BLEND_FUNC_DEST: number --
declare PSYS_PART_BLEND_FUNC_SOURCE: number --
declare PSYS_PART_BOUNCE_MASK: number -- Particles bounce off of a plane at the objects Z height.
declare PSYS_PART_EMISSIVE_MASK: number -- The particle glows.
declare PSYS_PART_END_ALPHA: number -- A float which determines the ending alpha of the object.
declare PSYS_PART_END_COLOR: number -- A vector <r, g, b> which determines the ending color of the object.
declare PSYS_PART_END_GLOW: number --
declare PSYS_PART_END_SCALE: number -- A vector <sx, sy, z>, which is the ending size of the particle billboard in meters (z is ignored).
declare PSYS_PART_FLAGS: number -- Each particle that is emitted by the particle system is simulated based on the following flags. To use multiple flags, bitwise or (|) them together.
declare PSYS_PART_FOLLOW_SRC_MASK: number -- The particle position is relative to the source objects position.
declare PSYS_PART_FOLLOW_VELOCITY_MASK: number -- The particle orientation is rotated so the vertical axis faces towards the particle velocity.
declare PSYS_PART_INTERP_COLOR_MASK: number -- Interpolate both the color and alpha from the start value to the end value.
declare PSYS_PART_INTERP_SCALE_MASK: number -- Interpolate the particle scale from the start value to the end value.
declare PSYS_PART_MAX_AGE: number -- Age in seconds of a particle at which it dies.
declare PSYS_PART_RIBBON_MASK: number --
declare PSYS_PART_START_ALPHA: number -- A float which determines the starting alpha of the object.
declare PSYS_PART_START_COLOR: number -- A vector <r.r, g.g, b.b> which determines the starting color of the object.
declare PSYS_PART_START_GLOW: number --
declare PSYS_PART_START_SCALE: number -- A vector <sx, sy, z>, which is the starting size of the particle billboard in meters (z is ignored).
declare PSYS_PART_TARGET_LINEAR_MASK: number --
declare PSYS_PART_TARGET_POS_MASK: number -- The particle heads towards the location of the target object as defined by PSYS_SRC_TARGET_KEY.
declare PSYS_PART_WIND_MASK: number -- Particles have their velocity damped towards the wind velocity.
declare PSYS_SRC_ACCEL: number -- A vector <x, y, z> which is the acceleration to apply on particles.
declare PSYS_SRC_ANGLE_BEGIN: number -- Area in radians specifying where particles will NOT be created (for ANGLE patterns)
declare PSYS_SRC_ANGLE_END: number -- Area in radians filled with particles (for ANGLE patterns) (if lower than PSYS_SRC_ANGLE_BEGIN, acts as PSYS_SRC_ANGLE_BEGIN itself, and PSYS_SRC_ANGLE_BEGIN acts as PSYS_SRC_ANGLE_END).
declare PSYS_SRC_BURST_PART_COUNT: number -- How many particles to release in a burst.
declare PSYS_SRC_BURST_RADIUS: number -- What distance from the center of the object to create the particles.
declare PSYS_SRC_BURST_RATE: number -- How often to release a particle burst (float seconds).
declare PSYS_SRC_BURST_SPEED_MAX: number -- Maximum speed that a particle should be moving.
declare PSYS_SRC_BURST_SPEED_MIN: number -- Minimum speed that a particle should be moving.
declare PSYS_SRC_INNERANGLE: number -- Specifies the inner angle of the arc created by the PSYS_SRC_PATTERN_ANGLE or PSYS_SRC_PATTERN_ANGLE_CONE source pattern.			The area specified will NOT have particles in it.
declare PSYS_SRC_MAX_AGE: number -- How long this particle system should last, 0.0 means forever.
declare PSYS_SRC_OMEGA: number -- Sets the angular velocity to rotate the axis that SRC_PATTERN_ANGLE and SRC_PATTERN_ANGLE_CONE use.
declare PSYS_SRC_OUTERANGLE: number -- Specifies the outer angle of the arc created by the PSYS_SRC_PATTERN_ANGLE or PSYS_SRC_PATTERN_ANGLE_CONE source pattern.			The area between the outer and inner angle will be filled with particles.
declare PSYS_SRC_PATTERN: number -- The pattern which is used to generate particles.			Use one of the following values: PSYS_SRC_PATTERN Values.
declare PSYS_SRC_PATTERN_ANGLE: number -- Shoot particles across a 2 dimensional area defined by the arc created from PSYS_SRC_OUTERANGLE. There will be an open area defined by PSYS_SRC_INNERANGLE within the larger arc.
declare PSYS_SRC_PATTERN_ANGLE_CONE: number -- Shoot particles out in a 3 dimensional cone with an outer arc of PSYS_SRC_OUTERANGLE and an inner open area defined by PSYS_SRC_INNERANGLE.
declare PSYS_SRC_PATTERN_ANGLE_CONE_EMPTY: number --
declare PSYS_SRC_PATTERN_DROP: number -- Drop particles at the source position.
declare PSYS_SRC_PATTERN_EXPLODE: number -- Shoot particles out in all directions, using the burst parameters.
declare PSYS_SRC_TARGET_KEY: number -- The key of a target object to move towards if PSYS_PART_TARGET_POS_MASK is enabled.
declare PSYS_SRC_TEXTURE: number -- An asset name for the texture to use for the particles.
declare PUBLIC_CHANNEL: number -- PUBLIC_CHANNEL is an integer constant that, when passed to llSay, llWhisper, or llShout as a channel parameter, will print text to the publicly heard chat channel.
declare PURSUIT_FUZZ_FACTOR: number -- Selects a random destination near the offset.
declare PURSUIT_GOAL_TOLERANCE: number --
declare PURSUIT_INTERCEPT: number -- Define whether the character attempts to predict the target's location.
declare PURSUIT_OFFSET: number -- Go to a position offset from the target.
declare PU_EVADE_HIDDEN: number -- Triggered when an llEvade character thinks it has hidden from its pursuer.
declare PU_EVADE_SPOTTED: number -- Triggered when an llEvade character switches from hiding to running
declare PU_FAILURE_DYNAMIC_PATHFINDING_DISABLED: number --
declare PU_FAILURE_INVALID_GOAL: number -- Goal is not on the navigation-mesh and cannot be reached.
declare PU_FAILURE_INVALID_START: number -- Character cannot navigate from the current location - e.g., the character is off the navmesh or too high above it.
declare PU_FAILURE_NO_NAVMESH: number -- This is a fatal error reported to a character when there is no navmesh for the region. This usually indicates a server failure and users should file a bug report and include the time and region in which they received this message.
declare PU_FAILURE_NO_VALID_DESTINATION: number -- There is no good place for the character to go - e.g., it is patrolling and all the patrol points are now unreachable.
declare PU_FAILURE_OTHER: number --
declare PU_FAILURE_PARCEL_UNREACHABLE: number --
declare PU_FAILURE_TARGET_GONE: number -- Target (for llPursue or llEvade) can no longer be tracked - e.g., it left the region or is an avatar that is now more than about 30m outside the region.
declare PU_FAILURE_UNREACHABLE: number -- Goal is no longer reachable for some reason - e.g., an obstacle blocks the path.
declare PU_GOAL_REACHED: number -- Character has reached the goal and will stop or choose a new goal (if wandering).
declare PU_SLOWDOWN_DISTANCE_REACHED: number -- Character is near current goal.
declare RAD_TO_DEG: number -- 57.2957795 - Number of degrees per radian. You can use this number to convert radians to degrees by multiplying the radians by this number.
declare RCERR_CAST_TIME_EXCEEDED: number --
declare RCERR_SIM_PERF_LOW: number --
declare RCERR_UNKNOWN: number --
declare RC_DATA_FLAGS: number --
declare RC_DETECT_PHANTOM: number --
declare RC_GET_LINK_NUM: number --
declare RC_GET_NORMAL: number --
declare RC_GET_ROOT_KEY: number --
declare RC_MAX_HITS: number --
declare RC_REJECT_AGENTS: number --
declare RC_REJECT_LAND: number --
declare RC_REJECT_NONPHYSICAL: number --
declare RC_REJECT_PHYSICAL: number --
declare RC_REJECT_TYPES: number --
declare REGION_FLAG_ALLOW_DAMAGE: number --
declare REGION_FLAG_ALLOW_DIRECT_TELEPORT: number --
declare REGION_FLAG_BLOCK_FLY: number --
declare REGION_FLAG_BLOCK_FLYOVER: number --
declare REGION_FLAG_BLOCK_TERRAFORM: number --
declare REGION_FLAG_DISABLE_COLLISIONS: number --
declare REGION_FLAG_DISABLE_PHYSICS: number --
declare REGION_FLAG_FIXED_SUN: number --
declare REGION_FLAG_RESTRICT_PUSHOBJECT: number --
declare REGION_FLAG_SANDBOX: number --
declare REMOTE_DATA_CHANNEL: number --
declare REMOTE_DATA_REPLY: number --
declare REMOTE_DATA_REQUEST: number --
declare REQUIRE_LINE_OF_SIGHT: number -- Define whether the character needs a line-of-sight to give chase.
declare RESTITUTION: number -- Used with llSetPhysicsMaterial to enable the density value. Must be between 0.0 and 1.0
declare REVERSE: number -- Play animation in reverse direction.
declare REZ_ACCEL: number -- Acceleration forced applied to the rezzed object. [vector force, integer rel]
declare REZ_DAMAGE: number -- Damage applied by the object when it collides with an agent. [float damage]
declare REZ_DAMAGE_TYPE: number -- Set the damage type applied when this object collides.
declare REZ_FLAGS: number -- Rez flags to set on the newly rezzed object. [integer flags]
declare REZ_FLAG_BLOCK_GRAB_OBJECT: number -- Prevent grabbing the object.
declare REZ_FLAG_DIE_ON_COLLIDE: number -- Object will die after its first collision.
declare REZ_FLAG_DIE_ON_NOENTRY: number -- Object will die if it attempts to enter a parcel that it can not.
declare REZ_FLAG_NO_COLLIDE_FAMILY: number -- Object will not trigger collision events with other objects created by the same rezzer.
declare REZ_FLAG_NO_COLLIDE_OWNER: number -- Object will not trigger collision events with its owner.
declare REZ_FLAG_PHANTOM: number -- Make the object phantom on rez.
declare REZ_FLAG_PHYSICAL: number -- Make the object physical on rez.
declare REZ_FLAG_TEMP: number -- Flag the object as temp on rez.
declare REZ_LOCK_AXES: number -- Prevent the object from rotating around some axes. [vector locks]
declare REZ_OMEGA: number -- Omega applied to the rezzed object. [vector axis, integer rel, float spin, float gain]
declare REZ_PARAM: number -- Integer value to pass to the object as its rez parameter. [integer param]
declare REZ_PARAM_STRING: number -- A string value to pass to the object as its rez parameter. [string param]
declare REZ_POS: number -- Position at which to rez the new object. [vector position, integer rel, integer atroot]
declare REZ_ROT: number -- Rotation applied to newly rezzed object. [rotation rot, integer rel]
declare REZ_SOUND: number -- Sound attached to the rezzed object. [string name, float volume, integer loop]
declare REZ_SOUND_COLLIDE: number -- Sound played by the object on a collision. [string name, float volume]
declare REZ_VEL: number -- Initial velocity of rezzed object. [vector vel, integer rel, integer inherit]
declare ROTATE: number -- Animate texture rotation.
declare SCALE: number -- Animate the texture scale.
declare SCRIPTED: number -- Scripted in-world objects.
declare SIM_STAT_ACTIVE_SCRIPT_COUNT: number -- Number of active scripts.
declare SIM_STAT_AGENT_COUNT: number -- Number of agents in region.
declare SIM_STAT_AGENT_MS: number -- Time spent in 'agent' segment of simulation frame.
declare SIM_STAT_AGENT_UPDATES: number -- Agent updates per second.
declare SIM_STAT_AI_MS: number -- Time spent on AI step.
declare SIM_STAT_ASSET_DOWNLOADS: number -- Pending asset download count.
declare SIM_STAT_ASSET_UPLOADS: number -- Pending asset upload count.
declare SIM_STAT_CHILD_AGENT_COUNT: number -- Number of child agents in region.
declare SIM_STAT_FRAME_MS: number -- Total frame time.
declare SIM_STAT_IMAGE_MS: number -- Time spent in 'image' segment of simulation frame.
declare SIM_STAT_IO_PUMP_MS: number -- Pump IO time.
declare SIM_STAT_NET_MS: number -- Time spent in 'network' segment of simulation frame.
declare SIM_STAT_OTHER_MS: number -- Time spent in 'other' segment of simulation frame.
declare SIM_STAT_PACKETS_IN: number -- Packets in per second.
declare SIM_STAT_PACKETS_OUT: number -- Packets out per second.
declare SIM_STAT_PCT_CHARS_STEPPED: number -- Returns the % of pathfinding characters skipped each frame, averaged over the last minute. The returned value corresponds to the "Characters Updated" stat in the viewer's Statistics Bar.
declare SIM_STAT_PHYSICS_FPS: number -- Physics simulation FPS.
declare SIM_STAT_PHYSICS_MS: number -- Time spent in 'physics' segment of simulation frame.
declare SIM_STAT_PHYSICS_OTHER_MS: number -- Physics other time.
declare SIM_STAT_PHYSICS_SHAPE_MS: number -- Physics shape update time.
declare SIM_STAT_PHYSICS_STEP_MS: number -- Physics step time.
declare SIM_STAT_SCRIPT_EPS: number -- Script events per second.
declare SIM_STAT_SCRIPT_MS: number -- Time spent in 'script' segment of simulation frame.
declare SIM_STAT_SCRIPT_RUN_PCT: number -- Percent of scripts run during frame.
declare SIM_STAT_SLEEP_MS: number -- Time spent sleeping.
declare SIM_STAT_SPARE_MS: number -- Spare time left after frame.
declare SIM_STAT_UNACKED_BYTES: number -- Total unacknowledged bytes.
declare SIT_FLAG_ALLOW_UNSIT: number -- The prim allows a seated avatar to stand up.
declare SIT_FLAG_NO_COLLIDE: number -- The seated avatar's hit box is disabled when seated on this prim.
declare SIT_FLAG_NO_DAMAGE: number -- Damage will not be forwarded to an avatar seated on this prim.
declare SIT_FLAG_SCRIPTED_ONLY: number -- An avatar may not manually sit on this prim.
declare SIT_FLAG_SIT_TARGET: number -- The prim has an explicitly set sit target.
declare SIT_INVALID_AGENT: number -- Avatar ID did not specify a valid avatar.
declare SIT_INVALID_LINK: number -- Link ID did not specify a valid prim in the linkset or resolved to multiple prims.
declare SIT_INVALID_OBJECT: number -- Attempt to force an avatar to sit on an attachment or other invalid target.
declare SIT_NOT_EXPERIENCE: number -- Attempt to force an avatar to sit outside an experience.
declare SIT_NO_ACCESS: number -- Avatar does not have access to the parcel containing the target linkset of the forced sit.
declare SIT_NO_EXPERIENCE_PERMISSION: number -- Avatar has not granted permission to force sits.
declare SIT_NO_SIT_TARGET: number -- No available sit target in linkset for forced sit.
declare SKY_AMBIENT: number -- The ambient color of the environment
declare SKY_BLUE: number -- Blue settings for environment
declare SKY_CLOUDS: number -- Settings controlling cloud density and configuration
declare SKY_CLOUD_TEXTURE: number -- Texture ID used by clouds
declare SKY_DOME: number -- Sky dome information.
declare SKY_GAMMA: number -- The gamma value applied to the scene.
declare SKY_GLOW: number -- Glow color applied to the sun and moon.
declare SKY_HAZE: number -- Haze settings for environment
declare SKY_LIGHT: number -- Miscellaneous lighting values.
declare SKY_MOON: number -- Environmental moon details.
declare SKY_MOON_TEXTURE: number -- Environmental moon texture.
declare SKY_PLANET: number -- Planet information used in rendering the sky.
declare SKY_REFLECTION_PROBE_AMBIANCE: number -- Settings the ambience of the reflection probe.
declare SKY_REFRACTION: number -- Sky refraction parameters for rainbows and optical effects.
declare SKY_STAR_BRIGHTNESS: number -- Brightness value for the stars.
declare SKY_SUN: number -- Detailed sun information
declare SKY_SUN_TEXTURE: number -- Environmental sun texture
declare SKY_TEXTURE_DEFAULTS: number -- Is the environment using the default textures.
declare SKY_TRACKS: number -- Track elevations for this region.
declare SMOOTH: number -- Slide in the X direction, instead of playing separate frames.
declare SOUND_LOOP: number -- Sound will loop until stopped.
declare SOUND_PLAY: number -- Sound will play normally.
declare SOUND_SYNC: number -- Sound will be synchronized with the nearest master.
declare SOUND_TRIGGER: number -- Sound will be triggered at the prim's location and not attached.
declare SQRT2: number -- 1.41421356 - The square root of 2.
declare STATUS_BLOCK_GRAB: number -- Controls whether the object can be grabbed. A grab is the default action when in third person, and is available as the hand tool in build mode. This is useful for physical objects that you don't want other people to be able to trivially disturb. The default is FALSE
declare STATUS_BLOCK_GRAB_OBJECT: number -- Prevent click-and-drag movement on all prims in the object.
declare STATUS_BOUNDS_ERROR: number -- Argument(s) passed to function had a bounds error.
declare STATUS_CAST_SHADOWS: number --
declare STATUS_DIE_AT_EDGE: number -- Controls whether the object is returned to the owners inventory if it wanders off the edge of the world. It is useful to set this status TRUE for things like bullets or rockets. The default is TRUE
declare STATUS_DIE_AT_NO_ENTRY: number -- Controls whether the object dies if it attempts to enter a parcel that does not allow object entry or does not have enough capacity. It is useful to set this status TRUE for things like bullets or rockets. The default is FALSE
declare STATUS_INTERNAL_ERROR: number -- An internal error occurred.
declare STATUS_MALFORMED_PARAMS: number -- Function was called with malformed parameters.
declare STATUS_NOT_FOUND: number -- Object or other item was not found.
declare STATUS_NOT_SUPPORTED: number -- Feature not supported.
declare STATUS_OK: number -- Result of function call was a success.
declare STATUS_PHANTOM: number -- Controls/indicates whether the object collides or not. Setting the value to TRUE makes the object non-colliding with all objects. It is a good idea to use this for most objects that move or rotate, but are non-physical. It is also useful for simulating volumetric lighting. The default is FALSE.
declare STATUS_PHYSICS: number -- Controls/indicates whether the object moves physically. This controls the same flag that the UI check-box for Physical controls. The default is FALSE.
declare STATUS_RETURN_AT_EDGE: number --
declare STATUS_ROTATE_X: number --
declare STATUS_ROTATE_Y: number --
declare STATUS_ROTATE_Z: number -- Controls/indicates whether the object can physically rotate around			the specific axis or not. This flag has no meaning			for non-physical objects. Set the value to FALSE			if you want to disable rotation around that axis. The			default is TRUE for a physical object.			A useful example to think about when visualizing			the effect is a sit-and-spin device. They spin around the			Z axis (up) but not around the X or Y axis.
declare STATUS_SANDBOX: number -- Controls/indicates whether the object can cross region boundaries			and move more than 20 meters from its creation			point. The default if FALSE.
declare STATUS_TYPE_MISMATCH: number -- Argument(s) passed to function had a type mismatch.
declare STATUS_WHITELIST_FAILED: number -- Whitelist Failed.
declare STRING_TRIM: number --
declare STRING_TRIM_HEAD: number --
declare STRING_TRIM_TAIL: number --
declare TARGETED_EMAIL_OBJECT_OWNER: number -- Send email to the owner of the object
declare TARGETED_EMAIL_ROOT_CREATOR: number -- Send email to the creator of the root object
declare TERRAIN_DETAIL_1: number --
declare TERRAIN_DETAIL_2: number --
declare TERRAIN_DETAIL_3: number --
declare TERRAIN_DETAIL_4: number --
declare TERRAIN_HEIGHT_RANGE_NE: number --
declare TERRAIN_HEIGHT_RANGE_NW: number --
declare TERRAIN_HEIGHT_RANGE_SE: number --
declare TERRAIN_HEIGHT_RANGE_SW: number --
declare TERRAIN_PBR_OFFSET_1: number --
declare TERRAIN_PBR_OFFSET_2: number --
declare TERRAIN_PBR_OFFSET_3: number --
declare TERRAIN_PBR_OFFSET_4: number --
declare TERRAIN_PBR_ROTATION_1: number --
declare TERRAIN_PBR_ROTATION_2: number --
declare TERRAIN_PBR_ROTATION_3: number --
declare TERRAIN_PBR_ROTATION_4: number --
declare TERRAIN_PBR_SCALE_1: number --
declare TERRAIN_PBR_SCALE_2: number --
declare TERRAIN_PBR_SCALE_3: number --
declare TERRAIN_PBR_SCALE_4: number --
declare TEXTURE_BLANK: string --
declare TEXTURE_DEFAULT: string --
declare TEXTURE_MEDIA: string --
declare TEXTURE_PLYWOOD: string --
declare TEXTURE_TRANSPARENT: string --
declare TOUCH_INVALID_FACE: number --
declare TOUCH_INVALID_TEXCOORD: vector --
declare TOUCH_INVALID_VECTOR: vector --
declare TP_ROUTING_BLOCKED: number -- Direct teleporting is blocked on this parcel.
declare TP_ROUTING_FREE: number -- Teleports are unrestricted on this parcel.
declare TP_ROUTING_LANDINGP: number -- Teleports are routed to a landing point if set on this parcel.
declare TRANSFER_BAD_OPTS: number -- Invalid inventory options.
declare TRANSFER_BAD_ROOT: number -- The root path specified in TRANSFER_DEST contained an invalid directory or was reduced to nothing.
declare TRANSFER_DEST: number -- The root folder to transfer inventory into.
declare TRANSFER_FLAGS: number -- Flags to control the behavior of inventory transfer.
declare TRANSFER_FLAG_COPY: number -- Gives a copy of the object being transfered. Implies TRANSFER_FLAG_TAKE.
declare TRANSFER_FLAG_RESERVED: number -- Reserved for future expansion.
declare TRANSFER_FLAG_TAKE: number -- On a successful transfer, automatically takes the object into inventory.
declare TRANSFER_NO_ATTACHMENT: number -- Can not transfer ownership of an attached object.
declare TRANSFER_NO_ITEMS: number -- No items in the inventory list are eligible for transfer.
declare TRANSFER_NO_PERMS: number -- The object does not have transfer permissions.
declare TRANSFER_NO_TARGET: number -- Could not find the receiver in the current region.
declare TRANSFER_OK: number -- Inventory transfer offer was successfully made.
declare TRANSFER_THROTTLE: number -- Inventory throttle hit.
declare TRAVERSAL_TYPE: number -- One of TRAVERSAL_TYPE_FAST, TRAVERSAL_TYPE_SLOW, and TRAVERSAL_TYPE_NONE.
declare TRAVERSAL_TYPE_FAST: number --
declare TRAVERSAL_TYPE_NONE: number --
declare TRAVERSAL_TYPE_SLOW: number --
declare TRUE: number -- An integer constant for boolean comparisons. Has the value '1'.
declare TWO_PI: number -- 6.28318530 - The radians of a circle.
declare TYPE_FLOAT: number -- The list entry is a float.
declare TYPE_INTEGER: number -- The list entry is an integer.
declare TYPE_INVALID: number -- The list entry is invalid.
declare TYPE_KEY: number -- The list entry is a key.
declare TYPE_ROTATION: number -- The list entry is a rotation.
declare TYPE_STRING: number -- The list entry is a string.
declare TYPE_VECTOR: number -- The list entry is a vector.
declare URL_REQUEST_DENIED: string --
declare URL_REQUEST_GRANTED: string --
declare VEHICLE_ANGULAR_DEFLECTION_EFFICIENCY: number -- A slider between minimum (0.0) and maximum (1.0) deflection of angular orientation. That is, its a simple scalar for modulating the strength of angular deflection such that the vehicles preferred axis of motion points toward its real velocity.
declare VEHICLE_ANGULAR_DEFLECTION_TIMESCALE: number -- The time-scale for exponential success of linear deflection deflection. Its another way to specify the strength of the vehicles tendency to reorient itself so that its preferred axis of motion agrees with its true velocity.
declare VEHICLE_ANGULAR_FRICTION_TIMESCALE: number -- A vector of timescales for exponential decay of the vehicles angular velocity about its preferred axes of motion (at, left, up).			Range = [0.07, inf) seconds for each element of the vector.
declare VEHICLE_ANGULAR_MOTOR_DECAY_TIMESCALE: number -- The timescale for exponential decay of the angular motors magnitude.
declare VEHICLE_ANGULAR_MOTOR_DIRECTION: number -- The direction and magnitude (in preferred frame) of the vehicles angular motor.The vehicle will accelerate (or decelerate if necessary) to match its velocity to its motor.
declare VEHICLE_ANGULAR_MOTOR_TIMESCALE: number -- The timescale for exponential approach to full angular motor velocity.
declare VEHICLE_BANKING_EFFICIENCY: number -- A slider between anti (-1.0), none (0.0), and maxmum (1.0) banking strength.
declare VEHICLE_BANKING_MIX: number -- A slider between static (0.0) and dynamic (1.0) banking. "Static" means the banking scales only with the angle of roll, whereas "dynamic" is a term that also scales with the vehicles linear speed.
declare VEHICLE_BANKING_TIMESCALE: number -- The timescale for banking to exponentially approach its maximum effect. This is another way to scale the strength of the banking effect, however it affects the term that is proportional to the difference between what the banking behavior is trying to do, and what the vehicle is actually doing.
declare VEHICLE_BUOYANCY: number -- A slider between minimum (0.0) and maximum anti-gravity (1.0).
declare VEHICLE_FLAG_BLOCK_INTERFERENCE: number -- Prevent other scripts from pushing vehicle.
declare VEHICLE_FLAG_CAMERA_DECOUPLED: number --
declare VEHICLE_FLAG_HOVER_GLOBAL_HEIGHT: number -- Hover at global height.
declare VEHICLE_FLAG_HOVER_TERRAIN_ONLY: number -- Ignore water height when hovering.
declare VEHICLE_FLAG_HOVER_UP_ONLY: number -- Hover does not push down. Use this flag for hovering vehicles that should be able to jump above their hover height.
declare VEHICLE_FLAG_HOVER_WATER_ONLY: number -- Ignore terrain height when hovering.
declare VEHICLE_FLAG_LIMIT_MOTOR_UP: number -- Prevents ground vehicles from motoring into the sky.
declare VEHICLE_FLAG_LIMIT_ROLL_ONLY: number -- For vehicles with vertical attractor that want to be able to climb/dive, for instance, aeroplanes that want to use the banking feature.
declare VEHICLE_FLAG_MOUSELOOK_BANK: number --
declare VEHICLE_FLAG_MOUSELOOK_STEER: number --
declare VEHICLE_FLAG_NO_DEFLECTION_UP: number -- This flag prevents linear deflection parallel to world z-axis. This is useful for preventing ground vehicles with large linear deflection, like bumper cars, from climbing their linear deflection into the sky.
declare VEHICLE_FLAG_NO_FLY_UP: number -- Old, changed to VEHICLE_FLAG_NO_DEFLECTION_UP
declare VEHICLE_HOVER_EFFICIENCY: number -- A slider between minimum (0.0 = bouncy) and maximum (1.0 = fast as possible) damped motion of the hover behavior.
declare VEHICLE_HOVER_HEIGHT: number -- The height (above the terrain or water, or global) at which the vehicle will try to hover.
declare VEHICLE_HOVER_TIMESCALE: number -- Period of time (in seconds) for the vehicle to achieve its hover height.
declare VEHICLE_LINEAR_DEFLECTION_EFFICIENCY: number -- A slider between minimum (0.0) and maximum (1.0) deflection of linear velocity. That is, its a simple scalar for modulating the strength of linear deflection.
declare VEHICLE_LINEAR_DEFLECTION_TIMESCALE: number -- The timescale for exponential success of linear deflection deflection. It is another way to specify how much time it takes for the vehicles linear velocity to be redirected to its preferred axis of motion.
declare VEHICLE_LINEAR_FRICTION_TIMESCALE: number -- A vector of timescales for exponential decay of the vehicles linear velocity along its preferred axes of motion (at, left, up).			Range = [0.07, inf) seconds for each element of the vector.
declare VEHICLE_LINEAR_MOTOR_DECAY_TIMESCALE: number -- The timescale for exponential decay of the linear motors magnitude.
declare VEHICLE_LINEAR_MOTOR_DIRECTION: number -- The direction and magnitude (in preferred frame) of the vehicles linear motor. The vehicle will accelerate (or decelerate if necessary) to match its velocity to its motor.			Range of magnitude = [0, 30] meters/second.
declare VEHICLE_LINEAR_MOTOR_OFFSET: number --
declare VEHICLE_LINEAR_MOTOR_TIMESCALE: number -- The timescale for exponential approach to full linear motor velocity.
declare VEHICLE_REFERENCE_FRAME: number -- A rotation of the vehicles preferred axes of motion and orientation (at, left, up) with respect to the vehicles local frame (x, y, z).
declare VEHICLE_TYPE_AIRPLANE: number -- Uses linear deflection for lift, no hover, and banking to turn. See http://wiki.secondlife.com/wiki/VEHICLE_TYPE_AIRPLANE
declare VEHICLE_TYPE_BALLOON: number -- Hover, and friction, but no deflection. See http://wiki.secondlife.com/wiki/VEHICLE_TYPE_BALLOON
declare VEHICLE_TYPE_BOAT: number -- Hovers over water with lots of friction and some anglar deflection. See http://wiki.secondlife.com/wiki/VEHICLE_TYPE_BOAT
declare VEHICLE_TYPE_CAR: number -- Another vehicle that bounces along the ground but needs the motors to be driven from external controls or timer events. See http://wiki.secondlife.com/wiki/VEHICLE_TYPE_CAR
declare VEHICLE_TYPE_NONE: number --
declare VEHICLE_TYPE_SLED: number -- Simple vehicle that bumps along the ground, and likes to move along its local x-axis. See http://wiki.secondlife.com/wiki/VEHICLE_TYPE_SLED
declare VEHICLE_VERTICAL_ATTRACTION_EFFICIENCY: number -- A slider between minimum (0.0 = wobbly) and maximum (1.0 = firm as possible) stability of the vehicle to keep itself upright.
declare VEHICLE_VERTICAL_ATTRACTION_TIMESCALE: number -- The period of wobble, or timescale for exponential approach, of the vehicle to rotate such that its preferred "up" axis is oriented along the worlds "up" axis.
declare VERTICAL: number --
declare WANDER_PAUSE_AT_WAYPOINTS: number --
declare WATER_BLUR_MULTIPLIER: number -- Blur factor.
declare WATER_FOG: number -- Fog properties when underwater.
declare WATER_FRESNEL: number -- Fresnel scattering applied to the surface of the water.
declare WATER_NORMAL_SCALE: number -- Scaling applied to the water normal map.
declare WATER_NORMAL_TEXTURE: number -- Normal map used for environmental waves.
declare WATER_REFRACTION: number -- Refraction factors when looking through the surface of the water.
declare WATER_TEXTURE_DEFAULTS: number -- Is the environment using the default wave map.
declare WATER_WAVE_DIRECTION: number -- Vectors for the directions of the waves.
declare XP_ERROR_EXPERIENCES_DISABLED: number -- The region currently has experiences disabled.
declare XP_ERROR_EXPERIENCE_DISABLED: number -- The experience owner has temporarily disabled the experience.
declare XP_ERROR_EXPERIENCE_SUSPENDED: number -- The experience has been suspended by Linden Customer Support.
declare XP_ERROR_INVALID_EXPERIENCE: number -- The script is associated with an experience that no longer exists.
declare XP_ERROR_INVALID_PARAMETERS: number -- One of the string arguments was too big to fit in the key-value store.
declare XP_ERROR_KEY_NOT_FOUND: number -- The requested key does not exist.
declare XP_ERROR_MATURITY_EXCEEDED: number -- The content rating of the experience exceeds that of the region.
declare XP_ERROR_NONE: number -- No error was detected.
declare XP_ERROR_NOT_FOUND: number -- The sim was unable to verify the validity of the experience. Retrying after a short wait is advised.
declare XP_ERROR_NOT_PERMITTED: number -- This experience is not allowed to run by the requested agent.
declare XP_ERROR_NOT_PERMITTED_LAND: number -- This experience is not allowed to run on the current region.
declare XP_ERROR_NO_EXPERIENCE: number -- This script is not associated with an experience.
declare XP_ERROR_QUOTA_EXCEEDED: number -- An attempted write data to the key-value store failed due to the data quota being met.
declare XP_ERROR_REQUEST_PERM_TIMEOUT: number -- Request timed out; permissions not modified.
declare XP_ERROR_RETRY_UPDATE: number -- A checked update failed due to an out of date request.
declare XP_ERROR_STORAGE_EXCEPTION: number -- Unable to communicate with the key-value store.
declare XP_ERROR_STORE_DISABLED: number -- The key-value store is currently disabled on this region.
declare XP_ERROR_THROTTLED: number -- The call failed due to too many recent calls.
declare XP_ERROR_UNKNOWN_ERROR: number -- Other unknown error.
declare ZERO_ROTATION: quaternion --
declare ZERO_VECTOR: vector --
