#!/usr/bin/env node

import { ServerConfig } from "./config/index";
import { RingMCPServer } from "./server";

async function main() {
	try {
		const config = ServerConfig.create();
		const server = new RingMCPServer(config);
		await server.start();
	} catch (error) {
		console.error("[Ring MCP] Failed to start server:", error);
		process.exit(1);
	}
}
main().catch((error) => {
	console.error("[Ring MCP] Unexpected error:", error);
	process.exit(1);
});
