export interface TokenConfig {
	refreshToken: string;
	lastUpdated: string;
}

export interface AuthenticationOptions {
	configFilePath: string;
	maxRetries?: number;
}
