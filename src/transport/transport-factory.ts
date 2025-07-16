import type { Server } from "@modelcontextprotocol/sdk/server/index";
import type { ServerOptions } from "../types/index";
import { StdioTransportManager } from "./stdio-transport";
import { HttpTransportManager } from "./http-transport";

export interface TransportManager {
	start(): Promise<void>;
	stop?(): Promise<void>;
}

export class TransportFactory {
	static create(server: Server, options: ServerOptions): TransportManager {
		switch (options.transport) {
			case "stdio":
				return new StdioTransportManager(server);
			case "http":
				return new HttpTransportManager(server, options);
			default:
				throw new Error(`Unsupported transport type: ${options.transport}`);
		}
	}
}
