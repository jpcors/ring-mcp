import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { ServerOptions } from "../types/index.js";
import { HttpTransportManager } from "./http-transport.js";
import { StdioTransportManager } from "./stdio-transport.js";

export interface TransportManager {
	start(): Promise<void>;
	stop?(): Promise<void>;
}

export function createTransport(server: Server, options: ServerOptions): TransportManager {
	switch (options.transport) {
		case "stdio":
			return new StdioTransportManager(server);
		case "http":
			return new HttpTransportManager(server, options);
		default:
			throw new Error(`Unsupported transport type: ${options.transport}`);
	}
}
