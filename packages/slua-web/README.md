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

<img align="right" src="https://progress-bar.xyz/45/?width=200&color=e1a650" />

- 🟢 `uuid` _not tested_
- 🟡 `lljson.decode` _does not handle vectors correctly_
- 🟡 `lljson.encode` _does not handle vectors correctly_
- 🟠 `llbase64.decode` _buffer not supported_
- 🟠 `llbase64.encode` _buffer not supported_
- 🔴 `integer` _not a huge need for this_
- 🔴 `quaternion` _work in progress_
- 🔴 `toquaternion`
- 🔴 `tovector`

<details>
  <summary>Expand full <code>ll.*</code> list</summary><br />

- 🟢 `ll.Abs` _not tested_
- 🟢 `ll.Acos` _not tested_
- 🟢 `ll.Asin` _not tested_
- 🟢 `ll.Atan2` _not tested_
- 🟢 `ll.Base64ToInteger` _not tested_
- 🟢 `ll.Base64ToString` _not tested_
- 🟢 `ll.Ceil` _not tested_
- 🟢 `ll.Char` _not tested_
- 🟢 `ll.Cos` _not tested_
- 🟢 `ll.DetectedKey`
- 🟢 `ll.DetectedLinkNumber`
- 🟢 `ll.DetectedName`
- 🟢 `ll.DetectedOwner`
- 🟢 `ll.DetectedPos`
- 🟢 `ll.DetectedRezzer`
- 🟢 `ll.DetectedType`
- 🟢 `ll.DetectedVel`
- 🟢 `ll.Die`
- 🟢 `ll.DumpList2String` _not tested_
- 🟢 `ll.EscapeURL` _not tested_
- 🟢 `ll.Fabs` _not tested_
- 🟢 `ll.Floor` _not tested_
- 🟢 `ll.Frand` _not tested_
- 🟢 `ll.GenerateKey` _not tested_
- 🟢 `ll.GetAlpha` _not tested_
- 🟢 `ll.GetAndResetTime` _not tested_
- 🟢 `ll.GetColor` _not tested_
- 🟢 `ll.GetCreator`
- 🟢 `ll.GetDate` _not tested_
- 🟢 `ll.GetDisplayName` _only works for owner_
- 🟢 `ll.GetEnergy` _always returns `1`_
- 🟢 `ll.GetGMTclock` _not tested_
- 🟢 `ll.GetKey`
- 🟢 `ll.GetLinkKey` _only works for `0`_
- 🟢 `ll.GetLinkName` _only works for `0`_
- 🟢 `ll.GetLinkNumber`
- 🟢 `ll.GetLinkNumberOfSides` _only works for `0`_
- 🟢 `ll.GetListLength` _not tested_
- 🟢 `ll.GetLocalPos`
- 🟢 `ll.GetNumberOfPrims`
- 🟢 `ll.GetNumberOfSides`
- 🟢 `ll.GetObjectDesc`
- 🟢 `ll.GetObjectLinkKey` _not tested_
- 🟢 `ll.GetObjectName`
- 🟢 `ll.GetObjectPermMask` _always returns `PERM_ALL`_
- 🟢 `ll.GetObjectPrimCount`
- 🟢 `ll.GetOwner`
- 🟢 `ll.GetOwnerKey`
- 🟢 `ll.GetPos`
- 🟢 `ll.GetRegionFPS` _always returns `45`_
- 🟢 `ll.GetRegionName`
- 🟢 `ll.GetRegionTimeDilation` _always returns `1`_
- 🟢 `ll.GetRootPosition`
- 🟢 `ll.GetScale`
- 🟢 `ll.GetScriptName`
- 🟢 `ll.GetScriptState`
- 🟢 `ll.GetSimulatorHostname`
- 🟢 `ll.GetStartParameter`
- 🟢 `ll.GetStartString`
- 🟢 `ll.GetSubString` _not passing all tests_
- 🟢 `ll.GetTexture`
- 🟢 `ll.GetTime`
- 🟢 `ll.GetTimestamp` _not tested_
- 🟢 `ll.GetUnixTime`
- 🟢 `ll.GetUsername`
- 🟢 `ll.GetWallclock` _not tested_
- 🟢 `ll.InstantMessage`
- 🟢 `ll.Key2Name` _only works for owner_
- 🟢 `ll.LinksetDataAvailable`
- 🟢 `ll.LinksetDataCountKeys`
- 🟢 `ll.LinksetDataDelete`
- 🟢 `ll.LinksetDataDeleteProtected`
- 🟢 `ll.LinksetDataListKeys`
- 🟢 `ll.LinksetDataRead` _not tested_
- 🟢 `ll.LinksetDataReadProtected` _not tested_
- 🟢 `ll.LinksetDataReset`
- 🟢 `ll.LinksetDataWrite` _not tested_
- 🟢 `ll.LinksetDataWriteProtected` _not tested_
- 🟢 `ll.List2CSV` _not tested_
- 🟢 `ll.List2Float` _not tested_
- 🟢 `ll.List2Integer` _not tested_
- 🟢 `ll.List2String` _not tested_
- 🟢 `ll.Listen`
- 🟢 `ll.ListenControl`
- 🟢 `ll.ListenRemove`
- 🟢 `ll.Log` _not tested_
- 🟢 `ll.Log10` _not tested_
- 🟢 `ll.ModPow` _not tested_
- 🟢 `ll.Name2Key` _only works for owner_
- 🟢 `ll.OverMyLand` _always return `true`_
- 🟢 `ll.OwnerSay`
- 🟢 `ll.Pow` _not tested_
- 🟢 `ll.RegionSay`
- 🟢 `ll.RegionSayTo`
- 🟢 `ll.ResetScript`
- 🟢 `ll.ResetTime`
- 🟢 `ll.Round` _not tested_
- 🟢 `ll.Say`
- 🟢 `ll.Sensor` _just calls `no_sensor`_
- 🟢 `ll.SensorRemove`
- 🟢 `ll.SensorRepeat` _just calls `no_sensor`_
- 🟢 `ll.SetAlpha`
- 🟢 `ll.SetColor`
- 🟢 `ll.SetLinkAlpha`
- 🟢 `ll.SetLinkColor`
- 🟢 `ll.SetObjectDesc` _not tested, not limited_
- 🟢 `ll.SetObjectName` _not tested, not limited_
- 🟢 `ll.SetPos`
- 🟢 `ll.SetRegionPos`
- 🟢 `ll.SetScale`
- 🟢 `ll.SetTimerEvent`
- 🟢 `ll.Shout`
- 🟢 `ll.Sin` _not tested_
- 🟢 `ll.Sqrt` _not tested_
- 🟢 `ll.StringLength` _not tested_
- 🟢 `ll.StringToBase64` _not tested_
- 🟢 `ll.StringTrim`
- 🟢 `ll.SubStringIndex` _not tested_
- 🟢 `ll.Tan` _not tested_
- 🟢 `ll.ToLower` _not tested_
- 🟢 `ll.ToUpper` _not tested_
- 🟢 `ll.VecDist` _not tested_
- 🟢 `ll.VecMag` _not tested_
- 🟢 `ll.VecNorm` _not tested_
- 🟢 `ll.Whisper`
- 🟡 `ll.SetTexture` _does not render in playground yet_
- 🟡 `ll.Ord` _needs testing, probably wrong_
- 🔴 `ll.AngleBetween`
- 🔴 `ll.Axes2Rot`
- 🔴 `ll.AxisAngle2Rot`
- 🔴 `ll.ComputeHash`
- 🔴 `ll.CreateKeyValue`
- 🔴 `ll.CSV2List`
- 🔴 `ll.DataSizeKeyValue`
- 🔴 `ll.DeleteKeyValue`
- 🔴 `ll.DeleteSubList`
- 🔴 `ll.DeleteSubString`
- 🔴 `ll.DetectedGrab`
- 🔴 `ll.DetectedGroup`
- 🔴 `ll.DetectedRot`
- 🔴 `ll.DetectedTouchBinormal`
- 🔴 `ll.DetectedTouchFace`
- 🔴 `ll.DetectedTouchNormal`
- 🔴 `ll.DetectedTouchPos`
- 🔴 `ll.DetectedTouchST`
- 🔴 `ll.DetectedTouchUV`
- 🔴 `ll.Dialog`
- 🔴 `ll.Euler2Rot`
- 🔴 `ll.FindNotecardTextCount`
- 🔴 `ll.FindNotecardTextSync`
- 🔴 `ll.GetBoundingBox`
- 🔴 `ll.GetCameraAspect`
- 🔴 `ll.GetCameraFOV`
- 🔴 `ll.GetCameraPos`
- 🔴 `ll.GetCameraRot`
- 🔴 `ll.GetCenterOfMass`
- 🔴 `ll.GetEnv`
- 🔴 `ll.GetGeometricCenter`
- 🔴 `ll.GetLinkPrimitiveParams`
- 🔴 `ll.GetListEntryType`
- 🔴 `ll.GetLocalRot`
- 🔴 `ll.GetMass`
- 🔴 `ll.GetMassMKS`
- 🔴 `ll.GetMaxScaleFactor`
- 🔴 `ll.GetMinScaleFactor`
- 🔴 `ll.GetMoonDirection`
- 🔴 `ll.GetMoonRotation`
- 🔴 `ll.GetNotecardLine`
- 🔴 `ll.GetNotecardLineSync`
- 🔴 `ll.GetNumberOfNotecardLines`
- 🔴 `ll.GetObjectDetails`
- 🔴 `ll.GetObjectMass`
- 🔴 `ll.GetOmega`
- 🔴 `ll.GetPermissions`
- 🔴 `ll.GetPermissionsKey`
- 🔴 `ll.GetPhysicsMaterial`
- 🔴 `ll.GetPrimitiveParams`
- 🔴 `ll.GetRegionCorner`
- 🔴 `ll.GetRegionFlags`
- 🔴 `ll.GetRenderMaterial`
- 🔴 `ll.GetRootRotation`
- 🔴 `ll.GetRot`
- 🔴 `ll.GetSimStats`
- 🔴 `ll.GetStatus`
- 🔴 `ll.GetTextureOffset`
- 🔴 `ll.GetTextureRot`
- 🔴 `ll.GetTextureScale`
- 🔴 `ll.GetTimeOfDay`
- 🔴 `ll.GiveMoney`
- 🔴 `ll.Ground`
- 🔴 `ll.Hash`
- 🔴 `ll.InsertString`
- 🔴 `ll.IntegerToBase64`
- 🔴 `ll.Json2List`
- 🔴 `ll.JsonGetValue`
- 🔴 `ll.JsonSetValue`
- 🔴 `ll.JsonValueType`
- 🔴 `ll.KeyCountKeyValue`
- 🔴 `ll.KeysKeyValue`
- 🔴 `ll.Linear2sRGB`
- 🔴 `ll.LinksetDataCountFound`
- 🔴 `ll.LinksetDataDeleteFound`
- 🔴 `ll.LinksetDataFindKeys`
- 🔴 `ll.List2Json`
- 🔴 `ll.List2Key`
- 🔴 `ll.List2List`
- 🔴 `ll.List2ListSlice`
- 🔴 `ll.List2ListStrided`
- 🔴 `ll.List2Rot`
- 🔴 `ll.List2Vector`
- 🔴 `ll.ListFindList`
- 🔴 `ll.ListFindListNext`
- 🔴 `ll.ListFindStrided`
- 🔴 `ll.ListInsertList`
- 🔴 `ll.ListRandomize`
- 🔴 `ll.ListReplaceList`
- 🔴 `ll.ListSort`
- 🔴 `ll.ListSortStrided`
- 🔴 `ll.ListStatistics`
- 🔴 `ll.LoadURL`
- 🔴 `ll.LookAt`
- 🔴 `ll.MapBeacon`
- 🔴 `ll.MapDestination`
- 🔴 `ll.MD5String`
- 🔴 `ll.MessageLinked`
- 🔴 `ll.OffsetTexture`
- 🔴 `ll.ParseString2List`
- 🔴 `ll.ParseStringKeepNulls`
- 🔴 `ll.ReadKeyValue`
- 🔴 `ll.ReplaceSubString`
- 🔴 `ll.RequestSimulatorData`
- 🔴 `ll.RequestUserKey`
- 🔴 `ll.RequestUsername`
- 🔴 `ll.ReturnObjectsByID`
- 🔴 `ll.ReturnObjectsByOwner`
- 🔴 `ll.Rot2Angle`
- 🔴 `ll.Rot2Axis`
- 🔴 `ll.Rot2Euler`
- 🔴 `ll.Rot2Fwd`
- 🔴 `ll.Rot2Left`
- 🔴 `ll.Rot2Up`
- 🔴 `ll.RotateTexture`
- 🔴 `ll.RotBetween`
- 🔴 `ll.RotLookAt`
- 🔴 `ll.ScaleByFactor`
- 🔴 `ll.ScaleTexture`
- 🔴 `ll.SendRemoteData`
- 🔴 `ll.SetGroundTexture`
- 🔴 `ll.SetLinkPrimitiveParams`
- 🔴 `ll.SetLinkPrimitiveParamsFast`
- 🔴 `ll.SetLinkRenderMaterial`
- 🔴 `ll.SetLinkTexture`
- 🔴 `ll.SetLinkTextureAnim`
- 🔴 `ll.SetLocalRot`
- 🔴 `ll.SetPrimitiveParams`
- 🔴 `ll.SetRenderMaterial`
- 🔴 `ll.SetRot`
- 🔴 `ll.SetScriptState`
- 🔴 `ll.SetStatus`
- 🔴 `ll.SetText`
- 🔴 `ll.SetTextureAnim`
- 🔴 `ll.SetTouchText`
- 🔴 `ll.SHA1String`
- 🔴 `ll.SHA256String`
- 🔴 `ll.Sleep`
- 🔴 `ll.sRGB2Linear`
- 🔴 `ll.StopLookAt`
- 🔴 `ll.StopSound`
- 🔴 `ll.TargetOmega`
- 🔴 `ll.TextBox`
- 🔴 `ll.UnescapeURL`
- 🔴 `ll.UpdateKeyValue`
- 🔴 `ll.Water`
- 🔴 `ll.WorldPosToHUD`
- 🔴 `ll.XorBase64StringsCorrect`

</details>

Anything not listed is either new, or there is no current intention to add functionality to those functions. Physics, rezzing, inventory, and sounds may come later.

Any functions that are meant to delay, currently do not delay.

## Acknowledgements

- [WolfGangS/sl_lua_types](https://github.com/WolfGangS/sl_lua_types) providing typedefs and docs

## Links

- [GitHub Repository](https://github.com/gwigz/slua)
- [Issue Tracker](https://github.com/gwigz/slua/issues)
