# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that provides integration with Ring home security devices. It uses the unofficial `ring-client-api` library to communicate with Ring's API and exposes Ring functionality through MCP tools.

## Development Commands

- `npm run build` - Compile TypeScript to JavaScript in the `build/` directory
- `npm run dev` - Run TypeScript compiler in watch mode for development
- `npm start` - Start the MCP server (auto-handles authentication)
- `npm start -- --token=<your_token>` - Start server with specific refresh token
- `npm run auth` - Run Ring authentication CLI manually
- `npm run help` - Show server usage help
- `npm install` - Install dependencies
- `npm test` - Run tests (when implemented)

## Authentication & Token Management

The server uses a flexible, multi-tier token management system:

### Token Source Priority (checked in order):

1. **Command line argument**: `--token=your_refresh_token`
2. **Environment variable**: `RING_REFRESH_TOKEN`
3. **Config file**: `ring-config.json` (automatically managed)
4. **Fail-fast authentication**: Server refuses to start without valid token (run `npm run auth` first)

### Automatic Token Updates

- Ring updates tokens ~hourly to maintain push notifications
- Server automatically saves updated tokens to `ring-config.json`
- **Critical**: Without token updates, push notifications stop working permanently

### Usage Examples:

```bash
# First run - authenticate first
npm run auth

# Start server with stdio transport (for Claude Desktop)
npm start

# Use specific token
npm start -- --token="your_refresh_token_here"

# Use environment variable
RING_REFRESH_TOKEN="your_token" npm start

# Start with HTTP transport (for remote access)
npm start -- --http

# Custom HTTP port and host
npm start -- --http --port=8080 --host=0.0.0.0
```

## Architecture

### Core Components

- **RingMCPServer**: Main server class that handles MCP protocol communication
- **Ring API Integration**: Uses the `ring-client-api` library to interact with Ring devices
- **Tool Handlers**: Implements MCP tools for Ring device operations

### Available MCP Tools

1. `list_devices` - Lists all Ring devices in the account
2. `get_device_info` - Gets detailed information about a specific device
3. `arm_disarm_alarm` - Controls Ring alarm system modes
4. `get_camera_snapshot` - Captures snapshots from Ring cameras
5. `turn_light_on_off` - Controls Ring light devices
6. `monitor_events` - Monitors real-time Ring events (doorbell presses, motion detection, notifications) for a specified duration

### Key Files

- `src/index.ts` - Main server implementation with all MCP tool handlers
- `package.json` - Node.js project configuration and dependencies
- `tsconfig.json` - TypeScript compiler configuration
- `ring-config.json` - Automatically managed token storage (created on first run)
- `.env` - Optional environment variables (RING_REFRESH_TOKEN)

## Running the Server

The server supports dual transport modes:

### Stdio Transport (Default)

- **Use case**: Claude Desktop integration and local MCP clients
- **Command**: `npm start`
- **Benefits**: Simple, secure, universally supported

### HTTP Transport (Optional)

- **Use case**: Remote access, web integration, multiple concurrent connections
- **Command**: `npm start -- --http`
- **Features**:
  - HTTP+SSE transport on localhost:3000 by default
  - Health check endpoint at `/health`
  - CORS security headers
  - Configurable port and host

### Transport Selection

```bash
# stdio transport (default)
npm start

# HTTP transport with defaults
npm start -- --http

# HTTP transport with custom settings
npm start -- --http --port=8080 --host=0.0.0.0
```

The server validates Ring API connection on startup with automatic retry logic. All Ring device operations are handled through the defined MCP tools.

For detailed user instructions, setup guides, and troubleshooting, see the [README.md](./README.md).

## Security Notes

- The Ring refresh token provides full access to the Ring account
- Tokens are stored in `ring-config.json` and should be kept secure
- Tokens are automatically updated to maintain push notifications
- HTTP transport includes CORS security headers and localhost binding by default
- For production HTTP deployments, use HTTPS and proper authentication
- The server provides defensive capabilities only - device monitoring and control

## Development Notes

- Use TypeScript for all new code
- Follow existing patterns for MCP tool implementation
- Don't add redundant comments!
- Test with actual Ring devices when possible
- Always handle token updates to maintain push notification functionality
- Use the multi-tier authentication system for flexibility
- Server validates Ring API connection on startup with retry logic
- Supports both stdio and HTTP transports for different deployment scenarios
