import type { ToolResponse } from "../types/index.js";
import { BaseTool, type ToolArguments } from "./base-tool.js";

export class ArmDisarmAlarmTool extends BaseTool {
  readonly name = "arm_disarm_alarm";
  readonly description = "Arm or disarm the Ring alarm system";
  readonly inputSchema = {
    type: "object",
    properties: {
      locationId: {
        type: "string",
        description: "The location ID where the alarm is located",
      },
      mode: {
        type: "string",
        enum: ["home", "away", "disarmed"],
        description: "The alarm mode to set",
      },
    },
    required: ["locationId", "mode"],
  } as const;

  async execute(args?: ToolArguments): Promise<ToolResponse> {
    this.validateRingApi();

    const locationId = args?.locationId as string;
    const mode = args?.mode as string;

    if (!locationId) {
      throw new Error("Location ID is required");
    }
    if (!mode) {
      throw new Error("Mode is required");
    }

    const locations = await this.ringApi.getLocations();
    const location = locations.find((l) => l.id.toString() === locationId);

    if (!location) {
      throw new Error(`Location with ID ${locationId} not found`);
    }

    // Map user-friendly mode names to Ring API modes
    const modeMapping: Record<string, "all" | "some" | "none"> = {
      home: "some",
      away: "all",
      disarmed: "none",
    };

    const ringMode = modeMapping[mode];
    if (!ringMode) {
      throw new Error(`Invalid mode: ${mode}`);
    }

    await location.setAlarmMode(ringMode);

    return this.createTextResponse(
      `Successfully set alarm mode to "${mode}" for location "${location.name}"`
    );
  }
}
