import type { Server } from "@modelcontextprotocol/sdk/server/index";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio";

export class StdioTransportManager {
	constructor(private server: Server) {}

	async start(): Promise<void> {
		const transport = new StdioServerTransport();
		await this.server.connect(transport);
		console.log("Ring MCP server running on stdio");
	}
}
