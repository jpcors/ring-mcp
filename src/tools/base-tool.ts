import type { Tool } from "@modelcontextprotocol/sdk/types";
import type { RingApi } from "ring-client-api";
import type { ToolResponse } from "../types/index";

export interface ToolArguments {
  [key: string]: unknown;
}

export abstract class BaseTool {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly inputSchema: Tool["inputSchema"];

  constructor(protected ringApi: RingApi) {}

  getDefinition(): Tool {
    return {
      name: this.name,
      description: this.description,
      inputSchema: this.inputSchema,
    };
  }

  abstract execute(args?: ToolArguments): Promise<ToolResponse>;

  protected validateRingApi(): void {
    if (!this.ringApi) {
      throw new Error("Ring API not initialized");
    }
  }

  protected createTextResponse(text: string): ToolResponse {
    return {
      content: [
        {
          type: "text",
          text,
        },
      ],
    };
  }

  protected createJsonResponse(data: unknown): ToolResponse {
    return this.createTextResponse(JSON.stringify(data, null, 2));
  }
}
