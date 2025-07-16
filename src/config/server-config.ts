import { join } from "path";
import type { ServerOptions } from "../types/index";
import { CliParser } from "./cli-parser";

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

export class ServerConfig {
	private static readonly DEFAULT_CONFIG: Partial<RingServerConfig> = {
		server: {
			name: "ring-mcp-server",
			version: "1.0.0",
		},
		auth: {
			configFilePath: join(process.cwd(), "ring-config.json"),
			maxRetries: 3,
		},
	};

	static create(): RingServerConfig {
		CliParser.checkForHelp();
		const transportOptions = CliParser.parseArgs();

		const config: RingServerConfig = {
			server: ServerConfig.DEFAULT_CONFIG.server!,
			transport: transportOptions,
			auth: {
				configFilePath: join(process.cwd(), "ring-config.json"),
				maxRetries: ServerConfig.DEFAULT_CONFIG.auth!.maxRetries!,
			},
		};

		return config;
	}

	static getDefaultConfigPath(): string {
		return join(process.cwd(), "ring-config.json");
	}
}
