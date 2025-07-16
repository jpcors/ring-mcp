import { writeFileSync, readFileSync, existsSync } from "fs";
import { RingApi } from "ring-client-api";
import type { TokenConfig, AuthenticationOptions } from "./types";

export class TokenManager {
	private configFilePath: string;
	private maxRetries: number;

	constructor(options: AuthenticationOptions) {
		this.configFilePath = options.configFilePath;
		this.maxRetries = options.maxRetries || 3;
	}

	async getRefreshToken(): Promise<string> {
		const tokenFromArgs = process.argv.find((arg) =>
			arg.startsWith("--token="),
		);
		if (tokenFromArgs) {
			const token = tokenFromArgs.split("=")[1];
			console.log("[Ring MCP] Using token from command line argument");
			return token;
		}

		if (process.env.RING_REFRESH_TOKEN) {
			console.log(
				"[Ring MCP] Using token from RING_REFRESH_TOKEN environment variable",
			);
			return process.env.RING_REFRESH_TOKEN;
		}

		const configToken = this.loadTokenConfig();
		if (configToken) {
			console.log("[Ring MCP] Using token from config file");
			return configToken.refreshToken;
		}
		throw new Error(`No Ring refresh token found. Please authenticate first by running:

npm run auth

Or provide a token via:
- Command line: npm start -- --token=your_refresh_token
- Environment variable: RING_REFRESH_TOKEN=your_token npm start

The server cannot start without valid Ring credentials.`);
	}

	loadTokenConfig(): TokenConfig | null {
		try {
			if (existsSync(this.configFilePath)) {
				const configData = readFileSync(this.configFilePath, "utf8");
				return JSON.parse(configData) as TokenConfig;
			}
		} catch (error) {
			console.error("[Ring MCP] Error reading config file:", error);
		}
		return null;
	}

	saveTokenConfig(refreshToken: string): void {
		try {
			const config: TokenConfig = {
				refreshToken,
				lastUpdated: new Date().toISOString(),
			};

			writeFileSync(
				this.configFilePath,
				JSON.stringify(config, null, 2),
				"utf8",
			);
			console.log("[Ring MCP] Successfully saved updated token to config file");
		} catch (error) {
			console.error("[Ring MCP] Failed to save token to config file:", error);
			console.error(
				"[Ring MCP] WARNING: Push notifications may stop working if token is not manually updated",
			);
		}
	}

	async validateRingConnection(ringApi: RingApi): Promise<void> {
		const retryDelay = (attempt: number) =>
			Math.min(1000 * 2 ** attempt, 10000);

		for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
			try {
				console.log("[Ring MCP] Validating Ring API connection...");
				const locations = await ringApi.getLocations();
				console.log(
					`[Ring MCP] Connected successfully to ${locations.length} location(s)`,
				);
				return;
			} catch (error) {
				const errorMsg = error instanceof Error ? error.message : String(error);
				console.error(
					`[Ring MCP] Ring API connection validation failed (attempt ${
						attempt + 1
					}/${this.maxRetries + 1}): ${errorMsg}`,
				);

				if (attempt === this.maxRetries) {
					throw new Error(`Ring API authentication failed after ${
						this.maxRetries + 1
					} attempts: ${errorMsg}

This usually means:
- Your refresh token has expired
- Your Ring account credentials have changed
- Ring API is temporarily unavailable

Please run 'npm run auth' to get a fresh token.`);
				}

				const delay = retryDelay(attempt);
				console.log(`[Ring MCP] Retrying in ${delay}ms...`);
				await new Promise((resolve) => setTimeout(resolve, delay));
			}
		}
	}

	setupTokenRefreshCallback(ringApi: RingApi): void {
		ringApi.onRefreshTokenUpdated.subscribe(
			({ newRefreshToken, oldRefreshToken }) => {
				console.log(
					`[Ring MCP] Refresh token updated from ${
						oldRefreshToken?.substring(0, 10) || "unknown"
					}... to ${newRefreshToken.substring(0, 10)}...`,
				);
				this.saveTokenConfig(newRefreshToken);
			},
		);
	}

	async initializeRingApi(): Promise<RingApi> {
		const refreshToken = await this.getRefreshToken();

		const ringApi = new RingApi({
			refreshToken,
			debug: false,
		});

		this.setupTokenRefreshCallback(ringApi);
		await this.validateRingConnection(ringApi);

		console.log("[Ring MCP] Ring API initialized and validated successfully");
		return ringApi;
	}
}
