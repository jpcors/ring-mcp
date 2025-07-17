import { createServer, type Server as HTTPServer } from "node:http";
import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import type { ServerOptions } from "../types/index.js";

export class HttpTransportManager {
	private httpServer?: HTTPServer;

	constructor(
		private server: Server,
		private options: ServerOptions
	) {}

	async start(): Promise<void> {
		const port = this.options.port || 3000;
		const host = this.options.host || "localhost";

		this.httpServer = createServer();

		this.httpServer.on("request", async (req, res) => {
			res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
			res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
			res.setHeader("Access-Control-Allow-Headers", "Content-Type");
			res.setHeader("Access-Control-Allow-Credentials", "true");

			if (req.method === "OPTIONS") {
				res.writeHead(200);
				res.end();
				return;
			}

			if (req.url === "/mcp" && req.method === "POST") {
				let _body = "";
				req.on("data", (chunk) => {
					_body += chunk;
				});
				req.on("end", async () => {
					try {
						const transport = new SSEServerTransport("/mcp", res);
						await this.server.connect(transport);
					} catch (_error) {
						res.writeHead(500, { "Content-Type": "application/json" });
						res.end(JSON.stringify({ error: "MCP connection failed" }));
					}
				});
			} else if (req.url === "/mcp" && req.method === "GET") {
				res.writeHead(200, {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
					"Access-Control-Allow-Origin": "http://localhost:3000",
					"Access-Control-Allow-Credentials": "true",
				});

				const transport = new SSEServerTransport("/mcp", res);
				await this.server.connect(transport);
			} else {
				if (req.url === "/health") {
					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ status: "ok", transport: "http" }));
				} else {
					res.writeHead(404);
					res.end("Not Found");
				}
			}
		});

		return new Promise((resolve, reject) => {
			this.httpServer?.listen(port, host, () => {
				console.error(`Ring MCP server running on http://${host}:${port}/mcp`);
				console.error(`Health check available at http://${host}:${port}/health`);
				resolve();
			});

			this.httpServer?.on("error", reject);
		});
	}

	async stop(): Promise<void> {
		if (this.httpServer) {
			return new Promise((resolve) => {
				this.httpServer?.close(() => {
					resolve();
				});
			});
		}
	}
}
