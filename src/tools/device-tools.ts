import { BaseTool, type ToolArguments } from "./base-tool";
import type { ToolResponse, DeviceInfo } from "../types/index";

export class ListDevicesTool extends BaseTool {
	readonly name = "list_devices";
	readonly description = "List all Ring devices in your account";
	readonly inputSchema = {
		type: "object",
		properties: {},
	} as const;

	async execute(): Promise<ToolResponse> {
		this.validateRingApi();

		const locations = await this.ringApi.getLocations();
		const allDevices: DeviceInfo[] = [];

		for (const location of locations) {
			const cameras = location.cameras;
			const devices = await location.getDevices();

			for (const camera of cameras) {
				allDevices.push({
					id: camera.id,
					name: camera.name,
					type: "camera",
					model: camera.model,
					location: location.name,
					batteryLevel: camera.batteryLevel ?? undefined,
					online: camera.data.alerts?.connection === "online",
				});
			}

			for (const device of devices) {
				allDevices.push({
					id: device.id,
					name: device.name,
					type: device.deviceType,
					categoryId: device.data.categoryId,
					location: location.name,
					batteryLevel: device.data.batteryLevel ?? undefined,
					online: device.data.faulted === false,
				});
			}
		}

		return this.createJsonResponse(allDevices);
	}
}

export class GetDeviceInfoTool extends BaseTool {
	readonly name = "get_device_info";
	readonly description =
		"Get detailed information about a specific Ring device";
	readonly inputSchema = {
		type: "object",
		properties: {
			deviceId: {
				type: "string",
				description: "The ID of the Ring device",
			},
		},
		required: ["deviceId"],
	} as const;

	async execute(args?: ToolArguments): Promise<ToolResponse> {
		this.validateRingApi();

		const deviceId = args?.deviceId as string;
		if (!deviceId) {
			throw new Error("Device ID is required");
		}

		const locations = await this.ringApi.getLocations();

		for (const location of locations) {
			const cameras = location.cameras;
			const devices = await location.getDevices();

			const camera = cameras.find((c) => c.id.toString() === deviceId);
			if (camera) {
				const deviceInfo = {
					id: camera.id,
					name: camera.name,
					type: "camera",
					model: camera.model,
					location: location.name,
					batteryLevel: camera.batteryLevel ?? undefined,
					hasLight: camera.hasLight,
					hasSiren: camera.hasSiren,
					data: camera.data,
				};
				return this.createJsonResponse(deviceInfo);
			}

			const device = devices.find((d) => d.id.toString() === deviceId);
			if (device) {
				const deviceInfo = {
					id: device.id,
					name: device.name,
					type: device.deviceType,
					categoryId: device.data.categoryId,
					location: location.name,
					batteryLevel: device.data.batteryLevel ?? undefined,
					data: device.data,
				};
				return this.createJsonResponse(deviceInfo);
			}
		}

		throw new Error(`Device with ID ${deviceId} not found`);
	}
}
