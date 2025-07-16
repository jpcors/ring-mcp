import type { CallToolResult } from "@modelcontextprotocol/sdk/types";

export interface TokenConfig {
	refreshToken: string;
	lastUpdated: string;
}

export interface ServerOptions {
	transport: "stdio" | "http";
	port?: number;
	host?: string;
}

export interface DeviceInfo {
	id: string | number;
	name: string;
	type: string;
	model?: string;
	categoryId?: number;
	location: string;
	batteryLevel?: number;
	online: boolean;
	hasLight?: boolean;
	hasSiren?: boolean;
	deviceType?: string;
}

export interface EventInfo {
	type: string;
	timestamp: string;
	device: string;
	deviceId: string | number;
	deviceType?: string;
	notificationKind?: string;
	data: any;
}

export type ToolResponse = CallToolResult;
