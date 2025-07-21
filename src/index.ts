#!/usr/bin/env node

import { config } from "dotenv";
import { createServerConfig } from "./config/index.js";
import { RingMCPServer } from "./server.js";

config({ debug: false, quiet: true });

async function main() {
  try {
    const config = createServerConfig();
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
