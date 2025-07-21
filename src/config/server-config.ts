import { join } from "node:path";
import type { ServerOptions } from "../types/index.js";
import { CliParser } from "./cli-parser.js";

export interface RingServerConfig {
  server: {
    name: string;
    version: string;
  };
  transport: ServerOptions;
  auth: {
    configFilePath: string;
    maxRetries: number;
  };
}

const DEFAULT_CONFIG: Partial<RingServerConfig> = {
  server: {
    name: "ring-mcp-server",
    version: "1.0.0",
  },
  auth: {
    configFilePath: join(process.cwd(), "ring-config.json"),
    maxRetries: 3,
  },
};

export function createServerConfig(): RingServerConfig {
  CliParser.checkForHelp();
  const transportOptions = CliParser.parseArgs();

  const config: RingServerConfig = {
    server: DEFAULT_CONFIG.server ?? {
      name: "ring-mcp-server",
      version: "1.0.0",
    },
    transport: transportOptions,
    auth: {
      configFilePath: join(process.cwd(), "ring-config.json"),
      maxRetries: DEFAULT_CONFIG.auth?.maxRetries ?? 3,
    },
  };

  return config;
}

export function getDefaultConfigPath(): string {
  return join(process.cwd(), "ring-config.json");
}
