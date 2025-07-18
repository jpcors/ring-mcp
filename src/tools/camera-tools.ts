import type { ToolResponse } from "../types/index.js";
import { BaseTool, type ToolArguments } from "./base-tool.js";

export class GetCameraSnapshotTool extends BaseTool {
	readonly name = "get_camera_snapshot";
	readonly description = "Get a snapshot from a Ring camera and analyze what's visible in the image";
	readonly inputSchema = {
		type: "object",
		properties: {
			deviceId: {
				type: "string",
				description: "The ID of the Ring camera device",
			},
			analyzeImage: {
				type: "boolean",
				description: "Whether to analyze the image content (default: true)",
				default: true,
			},
		},
		required: ["deviceId"],
	} as const;

	async execute(args?: ToolArguments): Promise<ToolResponse> {
		this.validateRingApi();

		const deviceId = args?.deviceId as string;
		const analyzeImage = args?.analyzeImage !== false;

		if (!deviceId) {
			throw new Error("Device ID is required");
		}

		const locations = await this.ringApi.getLocations();

		for (const location of locations) {
			const camera = location.cameras.find((c) => c.id.toString() === deviceId);
			if (camera) {
				const snapshot = await camera.getSnapshot();
				const base64Image = snapshot.toString("base64");

				if (analyzeImage) {
					return {
						content: [
							{
								type: "text",
								text: `Snapshot captured from camera "${camera.name}". Analyzing image content...`,
							},
							{
								type: "image",
								data: base64Image,
								mimeType: "image/jpeg",
							},
						],
						isError: false,
					};
				} else {
					return this.createTextResponse(
						`Snapshot captured from camera "${camera.name}". Image data: ${base64Image.length} bytes (base64 encoded)`
					);
				}
			}
		}

		throw new Error(`Camera with ID ${deviceId} not found`);
	}
}
