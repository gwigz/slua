# `@gwigz/slua-web`

SLua-like runtime for the web

## Features

- Emulates SLua scripts
- Luau Emscripten build
- TypeScript support

## Installation

```bash
npm install @gwigz/slua-web
```

## Usage

```js
import slua from "@gwigz/slua-web";

const example = `
function touch_start(num_detected)
  ll.OwnerSay("Ow!")
end

ll.OwnerSay("Hi!")
`;

const script = await slua.runScript(example, {
  onError: ({ timestamp, line, data }) => {
    console.error(timestamp, line, data);
  },
  onChat: ({ timestamp, name, data }) => {
    console.log(timestamp, name, data);
  },
});

if (script) {
  script.touch(1);

  // cleanup (currently just removes timers)
  script.dispose();
}
```

## Compatibility

<img align="right" src="https://progress-bar.xyz/40/?width=200&color=e1a650" />

- `integer` 🔴
- `uuid` 🟠 _does not have `.istruthy` yet_
- `toquaternion` 🔴
- `tovector` 🔴
- `quaternion` 🔴
- `lljson.encode` 🟡 _does not handle vectors correctly_
- `lljson.decode` 🟡 _does not handle vectors correctly_
- `llbase64.encode` 🟠 _buffer not supported_
- `llbase64.decode` 🟠 _buffer not supported_

<details>
  <summary>Expand full <code>ll.*</code> list</summary><br />

- `ll.Abs` 🟢 _not tested_
- `ll.Acos` 🟢 _not tested_
- `ll.AngleBetween` 🔴
- `ll.Asin` 🟢 _not tested_
- `ll.Atan2` 🟢 _not tested_
- `ll.Axes2Rot` 🔴
- `ll.AxisAngle2Rot` 🔴
- `ll.Base64ToInteger` 🟢 _not tested_
- `ll.Base64ToString` 🟢 _not tested_
- `ll.CSV2List` 🔴
- `ll.Ceil` 🟢 _not tested_
- `ll.Char` 🟢 _not tested_
- `ll.ComputeHash` 🔴
- `ll.Cos` 🟢 _not tested_
- `ll.CreateKeyValue` 🔴
- `ll.DataSizeKeyValue` 🔴
- `ll.DeleteKeyValue` 🔴
- `ll.DeleteSubList` 🔴
- `ll.DeleteSubString` 🔴
- `ll.DetectedGrab` 🔴
- `ll.DetectedGroup` 🔴
- `ll.DetectedKey` 🟢
- `ll.DetectedLinkNumber` 🟢
- `ll.DetectedName` 🟢
- `ll.DetectedOwner` 🟢
- `ll.DetectedPos` 🟢
- `ll.DetectedRezzer` 🟢
- `ll.DetectedRot` 🔴
- `ll.DetectedTouchBinormal` 🔴
- `ll.DetectedTouchFace` 🔴
- `ll.DetectedTouchNormal` 🔴
- `ll.DetectedTouchPos` 🔴
- `ll.DetectedTouchST` 🔴
- `ll.DetectedTouchUV` 🔴
- `ll.DetectedType` 🟢
- `ll.DetectedVel` 🟢
- `ll.Dialog` 🔴
- `ll.Die` 🟢
- `ll.DumpList2String` 🟢 _not tested_
- `ll.EscapeURL` 🟢 _not tested_
- `ll.Euler2Rot` 🔴
- `ll.Fabs` 🟢 _not tested_
- `ll.FindNotecardTextCount` 🔴
- `ll.FindNotecardTextSync` 🔴
- `ll.Floor` 🟢 _not tested_
- `ll.Frand` 🟢 _not tested_
- `ll.GenerateKey` 🟢 _not tested_
- `ll.GetAlpha` 🔴
- `ll.GetAndResetTime` 🟢 _not tested_
- `ll.GetBoundingBox` 🔴
- `ll.GetCameraAspect` 🔴
- `ll.GetCameraFOV` 🔴
- `ll.GetCameraPos` 🔴
- `ll.GetCameraRot` 🔴
- `ll.GetCenterOfMass` 🔴
- `ll.GetColor` 🟢 _not tested_
- `ll.GetCreator` 🟢
- `ll.GetDate` 🟢 _not tested_
- `ll.GetDisplayName` 🟢 _only works for owner_
- `ll.GetEnergy` 🟢 _always returns `1`_
- `ll.GetEnv` 🔴
- `ll.GetGMTclock` 🟢 _not tested_
- `ll.GetGeometricCenter` 🔴
- `ll.GetKey` 🟢
- `ll.GetLinkKey` 🟢 _only works for `0`_
- `ll.GetLinkName` 🟢 _only works for `0`_
- `ll.GetLinkNumber` 🟢
- `ll.GetLinkNumberOfSides` 🟢 _only works for `0`_
- `ll.GetLinkPrimitiveParams` 🔴
- `ll.GetListEntryType` 🔴
- `ll.GetListLength` 🟢 _not tested_
- `ll.GetLocalPos` 🟢
- `ll.GetLocalRot` 🔴
- `ll.GetMass` 🔴
- `ll.GetMassMKS` 🔴
- `ll.GetMaxScaleFactor` 🔴
- `ll.GetMinScaleFactor` 🔴
- `ll.GetMoonDirection` 🔴
- `ll.GetMoonRotation` 🔴
- `ll.GetNotecardLine` 🔴
- `ll.GetNotecardLineSync` 🔴
- `ll.GetNumberOfNotecardLines` 🔴
- `ll.GetNumberOfPrims` 🟢
- `ll.GetNumberOfSides` 🟢
- `ll.GetObjectDesc` 🟢
- `ll.GetObjectDetails` 🔴
- `ll.GetObjectLinkKey` 🟢 _not tested_
- `ll.GetObjectMass` 🔴
- `ll.GetObjectName` 🟢
- `ll.GetObjectPermMask` 🟢 _always returns `PERM_ALL`_
- `ll.GetObjectPrimCount` 🟢
- `ll.GetOmega` 🔴
- `ll.GetOwner` 🟢
- `ll.GetOwnerKey` 🟢
- `ll.GetPermissions` 🔴
- `ll.GetPermissionsKey` 🔴
- `ll.GetPhysicsMaterial` 🔴
- `ll.GetPos` 🟢
- `ll.GetPrimitiveParams` 🔴
- `ll.GetRegionCorner` 🔴
- `ll.GetRegionFPS` 🟢 _always returns `45`_
- `ll.GetRegionFlags` 🔴
- `ll.GetRegionName` 🟢
- `ll.GetRegionTimeDilation` 🟢 _always returns `1`_
- `ll.GetRenderMaterial` 🔴
- `ll.GetRootPosition` 🟢
- `ll.GetRootRotation` 🔴
- `ll.GetRot` 🔴
- `ll.GetScale` 🟢
- `ll.GetScriptName` 🟢
- `ll.GetScriptState` 🟢
- `ll.GetSimStats` 🔴
- `ll.GetSimulatorHostname` 🟢
- `ll.GetStartParameter` 🟢
- `ll.GetStartString` 🟢
- `ll.GetStatus` 🔴
- `ll.GetSubString` 🟢 _not passing all tests_
- `ll.GetTexture` 🔴
- `ll.GetTextureOffset` 🔴
- `ll.GetTextureRot` 🔴
- `ll.GetTextureScale` 🔴
- `ll.GetTime` 🟢
- `ll.GetTimeOfDay` 🔴
- `ll.GetTimestamp` 🟢 _not tested_
- `ll.GetUnixTime` 🟢
- `ll.GetUsername` 🟢
- `ll.GetWallclock` 🟢 _not tested_
- `ll.GiveMoney` 🔴
- `ll.Ground` 🔴
- `ll.Hash` 🔴
- `ll.InsertString` 🔴
- `ll.InstantMessage` 🟢
- `ll.IntegerToBase64` 🔴
- `ll.Json2List` 🔴
- `ll.JsonGetValue` 🔴
- `ll.JsonSetValue` 🔴
- `ll.JsonValueType` 🔴
- `ll.Key2Name` 🟢 _only works for owner_
- `ll.KeyCountKeyValue` 🔴
- `ll.KeysKeyValue` 🔴
- `ll.Linear2sRGB` 🔴
- `ll.LinksetDataAvailable` 🟢
- `ll.LinksetDataCountFound` 🔴
- `ll.LinksetDataCountKeys` 🟢
- `ll.LinksetDataDelete` 🟢
- `ll.LinksetDataDeleteFound` 🔴
- `ll.LinksetDataDeleteProtected` 🟢
- `ll.LinksetDataFindKeys` 🔴
- `ll.LinksetDataListKeys` 🟢
- `ll.LinksetDataRead` 🟢 _not tested_
- `ll.LinksetDataReadProtected` 🟢 _not tested_
- `ll.LinksetDataReset` 🟢
- `ll.LinksetDataWrite` 🟢 _not tested_
- `ll.LinksetDataWriteProtected` 🟢 _not tested_
- `ll.List2CSV` 🟢 _not tested_
- `ll.List2Float` 🟢 _not tested_
- `ll.List2Integer` 🟢 _not tested_
- `ll.List2Json` 🔴
- `ll.List2Key` 🔴
- `ll.List2List` 🔴
- `ll.List2ListSlice` 🔴
- `ll.List2ListStrided` 🔴
- `ll.List2Rot` 🔴
- `ll.List2String` 🟢 _not tested_
- `ll.List2Vector` 🔴
- `ll.ListFindList` 🔴
- `ll.ListFindListNext` 🔴
- `ll.ListFindStrided` 🔴
- `ll.ListInsertList` 🔴
- `ll.ListRandomize` 🔴
- `ll.ListReplaceList` 🔴
- `ll.ListSort` 🔴
- `ll.ListSortStrided` 🔴
- `ll.ListStatistics` 🔴
- `ll.Listen` 🔴
- `ll.ListenControl` 🔴
- `ll.ListenRemove` 🔴
- `ll.LoadURL` 🔴
- `ll.Log` 🟢 _not tested_
- `ll.Log10` 🟢 _not tested_
- `ll.LookAt` 🔴
- `ll.MD5String` 🔴
- `ll.MapBeacon` 🔴
- `ll.MapDestination` 🔴
- `ll.MessageLinked` 🔴
- `ll.ModPow` 🟢 _not tested_
- `ll.MoveToTarget` 🔴
- `ll.Name2Key` 🟢 _only works for owner_
- `ll.OffsetTexture` 🔴
- `ll.Ord` 🟡 _needs testing, probably wrong_
- `ll.OverMyLand` 🟢 _always return `true`_
- `ll.OwnerSay` 🟢
- `ll.ParseString2List` 🔴
- `ll.ParseStringKeepNulls` 🔴
- `ll.Pow` 🟢 _not tested_
- `ll.ReadKeyValue` 🔴
- `ll.RegionSay` 🟢
- `ll.RegionSayTo` 🟢
- `ll.ReplaceSubString` 🔴
- `ll.RequestSimulatorData` 🔴
- `ll.RequestUserKey` 🔴
- `ll.RequestUsername` 🔴
- `ll.ResetScript` 🟢
- `ll.ResetTime` 🟢
- `ll.ReturnObjectsByID` 🔴
- `ll.ReturnObjectsByOwner` 🔴
- `ll.Rot2Angle` 🔴
- `ll.Rot2Axis` 🔴
- `ll.Rot2Euler` 🔴
- `ll.Rot2Fwd` 🔴
- `ll.Rot2Left` 🔴
- `ll.Rot2Up` 🔴
- `ll.RotBetween` 🔴
- `ll.RotLookAt`
- `ll.RotTarget` 🔴 🔴
- `ll.RotTargetRemove` 🔴
- `ll.RotateTexture` 🔴
- `ll.Round` 🟢 _not tested_
- `ll.SHA1String` 🔴
- `ll.SHA256String` 🔴
- `ll.Say` 🟢
- `ll.ScaleByFactor` 🔴
- `ll.ScaleTexture` 🔴
- `ll.SendRemoteData`
- `ll.Sensor` 🔴
- `ll.SensorRemove` 🔴
- `ll.SensorRepeat` 🔴
- `ll.SetAlpha` 🟢
- `ll.SetClickAction` 🔴
- `ll.SetColor` 🟢
- `ll.SetEnvironment` 🔴
- `ll.SetGroundTexture` 🔴
- `ll.SetLinkAlpha` 🟢
- `ll.SetLinkColor` 🟢
- `ll.SetLinkPrimitiveParams` 🔴
- `ll.SetLinkPrimitiveParamsFast` 🔴
- `ll.SetLinkRenderMaterial` 🔴
- `ll.SetLinkTexture` 🔴
- `ll.SetLinkTextureAnim` 🔴
- `ll.SetLocalRot` 🔴
- `ll.SetObjectDesc` 🟢 _not tested, not limited_
- `ll.SetObjectName` 🟢 _not tested, not limited_
- `ll.SetPos` 🟢
- `ll.SetPrimitiveParams` 🔴
- `ll.SetRegionPos` 🟢
- `ll.SetRenderMaterial` 🔴
- `ll.SetRot` 🔴
- `ll.SetScale` 🟢
- `ll.SetScriptState` 🔴
- `ll.SetStatus` 🔴
- `ll.SetText` 🔴
- `ll.SetTexture` 🔴
- `ll.SetTextureAnim` 🔴
- `ll.SetTimerEvent` 🟢
- `ll.SetTouchText` 🔴
- `ll.Shout` 🟢
- `ll.Sin` 🟢 _not tested_
- `ll.Sleep` 🔴
- `ll.Sqrt` 🟢 _not tested_
- `ll.StopLookAt` 🔴
- `ll.StopMoveToTarget` 🔴
- `ll.StopSound` 🔴
- `ll.StringLength` 🟢 _not tested_
- `ll.StringToBase64` 🟢 _not tested_
- `ll.StringTrim` 🟢
- `ll.SubStringIndex` 🔴
- `ll.Tan` 🟢 _not tested_
- `ll.TargetOmega` 🔴
- `ll.TextBox` 🔴
- `ll.ToLower` 🟢 _not tested_
- `ll.ToUpper` 🟢 _not tested_
- `ll.UnescapeURL` 🔴
- `ll.UpdateKeyValue` 🔴
- `ll.VecDist` 🟢 _not tested_
- `ll.VecMag` 🟢 _not tested_
- `ll.VecNorm` 🟢 _not tested_
- `ll.Water` 🔴
- `ll.Whisper` 🟢
- `ll.WorldPosToHUD` 🔴
- `ll.XorBase64StringsCorrect` 🔴
- `ll.sRGB2Linear` 🔴

</details>

Anything not listed is either new, or there is no current intention to add functionality to those functions.

Physics, rezzing, inventory, and sounds may come later.

## Acknowledgements

- [WolfGangS/sl_lua_types](https://github.com/WolfGangS/sl_lua_types) providing typedefs and docs

## Links

- [GitHub Repository](https://github.com/gwigz/slua)
- [Issue Tracker](https://github.com/gwigz/slua/issues)
