import { Server } from "@modelcontextprotocol/sdk/server/index";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types";
import type { RingApi } from "ring-client-api";

import type { RingServerConfig } from "./config/index";
import { TokenManager } from "./auth/token-manager";
import { createToolRegistry, type ToolRegistry } from "./tools/index";
import { TransportFactory, type TransportManager } from "./transport/index";

export class RingMCPServer {
	private server: Server;
	private ringApi: RingApi | null = null;
	private tokenManager: TokenManager;
	private toolRegistry: ToolRegistry | null = null;
	private transportManager: TransportManager;

	constructor(private config: RingServerConfig) {
		this.server = new Server(
			{
				name: config.server.name,
				version: config.server.version,
			},
			{
				capabilities: {
					tools: {},
				},
			},
		);

		this.tokenManager = new TokenManager({
			configFilePath: config.auth.configFilePath,
			maxRetries: config.auth.maxRetries,
		});

		this.transportManager = TransportFactory.create(
			this.server,
			config.transport,
		);

		this.setupToolHandlers();
		this.setupErrorHandling();
	}

	private async initializeRingApi(): Promise<void> {
		if (this.ringApi) return;

		this.ringApi = await this.tokenManager.initializeRingApi();
		this.toolRegistry = createToolRegistry(this.ringApi);

		console.log("[Ring MCP] Ring API and tools initialized successfully");
	}

	private setupToolHandlers(): void {
		this.server.setRequestHandler(ListToolsRequestSchema, async () => {
			if (!this.toolRegistry) {
				await this.initializeRingApi();
			}

			return {
				tools: this.toolRegistry!.getToolDefinitions(),
			};
		});

		this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
			if (!this.toolRegistry) {
				await this.initializeRingApi();
			}

			return await this.toolRegistry!.executeTool(
				request.params.name,
				request.params.arguments,
			);
		});
	}

	private setupErrorHandling(): void {
		this.server.onerror = (error) => {
			console.error("[MCP Error]", error);
		};

		process.on("SIGINT", async () => {
			await this.stop();
			process.exit(0);
		});

		process.on("SIGTERM", async () => {
			await this.stop();
			process.exit(0);
		});

		process.on("unhandledRejection", (reason) => {
			if (
				reason instanceof Error &&
				reason.message.includes("No Ring refresh token found")
			) {
				console.error(
					"[Ring MCP] Authentication required. Please run: npm run auth",
				);
				process.exit(1);
			}
			console.error("[Ring MCP] Unhandled rejection:", reason);
			process.exit(1);
		});
	}

	async start(): Promise<void> {
		try {
			await this.initializeRingApi();
			await this.transportManager.start();
		} catch (error) {
			console.error("[Ring MCP] Failed to start server:", error);
			throw error;
		}
	}

	async stop(): Promise<void> {
		try {
			if (this.transportManager.stop) {
				await this.transportManager.stop();
			}
			await this.server.close();
			console.log("[Ring MCP] Server stopped");
		} catch (error) {
			console.error("[Ring MCP] Error stopping server:", error);
		}
	}

	getConfig(): RingServerConfig {
		return { ...this.config };
	}

	isInitialized(): boolean {
		return this.ringApi !== null && this.toolRegistry !== null;
	}
}
