import { BaseTool, type ToolArguments } from "./base-tool";
import type { ToolResponse } from "../types/index";

export class GetCameraSnapshotTool extends BaseTool {
	readonly name = "get_camera_snapshot";
	readonly description = "Get a snapshot from a Ring camera";
	readonly inputSchema = {
		type: "object",
		properties: {
			deviceId: {
				type: "string",
				description: "The ID of the Ring camera device",
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
			const camera = location.cameras.find((c) => c.id.toString() === deviceId);
			if (camera) {
				const snapshot = await camera.getSnapshot();
				const base64Image = snapshot.toString("base64");

				return this.createTextResponse(
					`Snapshot captured from camera "${camera.name}". Image data: ${base64Image.length} bytes (base64 encoded)`,
				);
			}
		}

		throw new Error(`Camera with ID ${deviceId} not found`);
	}
}
