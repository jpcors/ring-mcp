export { ListDevicesTool, GetDeviceInfoTool } from "./device-tools";
export { ArmDisarmAlarmTool } from "./alarm-tools";
export { GetCameraSnapshotTool } from "./camera-tools";
export { TurnLightOnOffTool } from "./light-tools";
export { MonitorEventsTool } from "./event-tools";
export { BaseTool, ToolArguments } from "./base-tool";
export { ToolRegistry } from "./tool-registry";
import type { RingApi } from "ring-client-api";
import { ToolRegistry } from "./tool-registry";
import { ListDevicesTool, GetDeviceInfoTool } from "./device-tools";
import { ArmDisarmAlarmTool } from "./alarm-tools";
import { GetCameraSnapshotTool } from "./camera-tools";
import { TurnLightOnOffTool } from "./light-tools";
import { MonitorEventsTool } from "./event-tools";

export function createToolRegistry(ringApi: RingApi): ToolRegistry {
	const registry = new ToolRegistry(ringApi);

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
