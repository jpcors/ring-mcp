import type { ToolResponse } from "../types/index.js";
import { BaseTool, type ToolArguments } from "./base-tool.js";

export class TurnLightOnOffTool extends BaseTool {
	readonly name = "turn_light_on_off";
	readonly description = "Turn Ring light device on or off";
	readonly inputSchema = {
		type: "object",
		properties: {
			deviceId: {
				type: "string",
				description: "The ID of the Ring light device",
			},
			on: {
				type: "boolean",
				description: "Whether to turn the light on (true) or off (false)",
			},
		},
		required: ["deviceId", "on"],
	} as const;

	async execute(args?: ToolArguments): Promise<ToolResponse> {
		this.validateRingApi();

		const deviceId = args?.deviceId as string;
		const on = args?.on as boolean;

		if (!deviceId) {
			throw new Error("Device ID is required");
		}

		const locations = await this.ringApi.getLocations();

		for (const location of locations) {
			const camera = location.cameras.find((c) => c.id.toString() === deviceId);
			if (camera?.hasLight) {
				await camera.setLight(on);
				return this.createTextResponse(
					`Successfully turned light ${on ? "on" : "off"} for camera "${camera.name}"`
				);
			}

			const devices = await location.getDevices();
			const device = devices.find((d) => d.id.toString() === deviceId);
			if (
				device &&
				(device.deviceType.toString().includes("light") || device.data.categoryId === 2)
			) {
				await device.setInfo({ device: { v1: { on } } });
				return this.createTextResponse(
					`Successfully turned light ${on ? "on" : "off"} for device "${device.name}"`
				);
			}
		}

		throw new Error(`Light device with ID ${deviceId} not found`);
	}
}
