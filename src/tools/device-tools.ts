import type { DeviceInfo, ToolResponse } from "../types/index.js";
import { BaseTool, type ToolArguments } from "./base-tool.js";

export class ListDevicesTool extends BaseTool {
	readonly name = "list_devices";
	readonly description = "List all Ring devices in your account";
	readonly inputSchema = {
		type: "object",
		properties: {},
	} as const;

	async execute(): Promise<ToolResponse> {
		console.error("[ListDevices] Executing device enumeration...");
		this.validateRingApi();
		console.error("[ListDevices] Validated Ring API instance");

		try {
			return (await this.performDeviceListOperation()) as ToolResponse;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
			console.error("[ListDevices] Error:", errorMessage);
			return this.createTextResponse(`Error listing devices: ${errorMessage}`);
		}
	}

	private async performDeviceListOperation(): Promise<ToolResponse> {
		console.error("[ListDevices] Starting device enumeration...");

		console.error("[ListDevices] About to call getLocations()...");
		const locations = await this.withTimeout(
			this.ringApi.getLocations(),
			1000,
			"getLocations() call timed out"
		);
		console.error(`[ListDevices] Found ${locations.length} location(s)`);

		const allDevices: DeviceInfo[] = [];

		for (const [index, location] of locations.entries()) {
			console.error(`[ListDevices] Processing location ${index + 1}: ${location.name}`);

			const cameras = location.cameras;
			console.error(`[ListDevices] Found ${cameras.length} camera(s) in ${location.name}`);

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

			try {
				console.error(`[ListDevices] Fetching additional devices for ${location.name}`);
				console.error(`[ListDevices] About to call location.getDevices()...`);
				const devices = await this.withTimeout(
					location.getDevices(),
					1000,
					`getDevices() call timed out for location ${location.name}`
				);
				console.error(`[ListDevices] location.getDevices() completed successfully`);
				console.error(`[ListDevices] Found ${devices.length} other device(s) in ${location.name}`);

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
			} catch (deviceError) {
				console.error(
					`[ListDevices] Warning: Failed to get additional devices for ${location.name}:`,
					deviceError
				);
			}
		}

		console.error(`[ListDevices] Successfully enumerated ${allDevices.length} total device(s)`);
		console.error(`[ListDevices] About to create JSON response...`);
		const response = this.createJsonResponse(allDevices);
		console.error(`[ListDevices] JSON response created successfully`);
		return response;
	}
}

export class GetDeviceInfoTool extends BaseTool {
	readonly name = "get_device_info";
	readonly description = "Get detailed information about a specific Ring device";
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

		const locations = await this.withTimeout(
			this.ringApi.getLocations(),
			1000,
			"getLocations() call timed out"
		);

		for (const location of locations) {
			const cameras = location.cameras;
			const devices = await this.withTimeout(
				location.getDevices(),
				1000,
				`getDevices() call timed out for location ${location.name}`
			);

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
