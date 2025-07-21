export { ArmDisarmAlarmTool } from "./alarm-tools.js";
export { BaseTool, ToolArguments } from "./base-tool.js";
export { GetCameraSnapshotTool } from "./camera-tools.js";
export { GetDeviceInfoTool, ListDevicesTool } from "./device-tools.js";
export { MonitorEventsTool } from "./event-tools.js";
export { TurnLightOnOffTool } from "./light-tools.js";
export { ToolRegistry } from "./tool-registry.js";

import type { RingApi } from "ring-client-api";
import { ArmDisarmAlarmTool } from "./alarm-tools.js";
import { GetCameraSnapshotTool } from "./camera-tools.js";
import { GetDeviceInfoTool, ListDevicesTool } from "./device-tools.js";
import { MonitorEventsTool } from "./event-tools.js";
import { TurnLightOnOffTool } from "./light-tools.js";
import { ToolRegistry } from "./tool-registry.js";

export function createToolRegistry(ringApi: RingApi): ToolRegistry {
  const registry = new ToolRegistry();

  registry.registerMultiple([
    new ListDevicesTool(ringApi),
    new GetDeviceInfoTool(ringApi),
    new ArmDisarmAlarmTool(ringApi),
    new GetCameraSnapshotTool(ringApi),
    new TurnLightOnOffTool(ringApi),
    new MonitorEventsTool(ringApi),
  ]);

  return registry;
}
