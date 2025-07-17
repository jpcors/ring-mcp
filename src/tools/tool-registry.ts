import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import type { ToolResponse } from "../types/index.js";
import type { BaseTool, ToolArguments } from "./base-tool.js";

export class ToolRegistry {
	private tools = new Map<string, BaseTool>();

	register(tool: BaseTool): void {
		this.tools.set(tool.name, tool);
	}

	registerMultiple(tools: BaseTool[]): void {
		tools.forEach((tool) => this.register(tool));
	}

	getToolDefinitions(): Tool[] {
		return Array.from(this.tools.values()).map((tool) => tool.getDefinition());
	}

	async executeTool(name: string, args?: ToolArguments): Promise<ToolResponse> {
		const tool = this.tools.get(name);

		if (!tool) {
			throw new Error(`Unknown tool: ${name}`);
		}

		try {
			return await tool.execute(args);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : String(error);
			return {
				content: [
					{
						type: "text",
						text: `Error: ${errorMessage}`,
					},
				],
			};
		}
	}

	hasTool(name: string): boolean {
		return this.tools.has(name);
	}

	getToolNames(): string[] {
		return Array.from(this.tools.keys());
	}

	clear(): void {
		this.tools.clear();
	}
}
