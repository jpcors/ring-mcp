# Ring MCP Server

A Model Context Protocol (MCP) server that provides seamless integration with Ring home security devices. Control your Ring doorbells, cameras, lights, and alarm systems through MCP-compatible clients like Claude Desktop.

## 🚀 Features

- **Device Management**: List and get detailed information about all Ring devices
- **Security Control**: Arm/disarm Ring alarm systems with different modes
- **Camera Operations**: Capture snapshots from Ring cameras
- **Light Control**: Turn Ring lights on/off
- **Real-time Monitoring**: Monitor doorbell presses, motion detection, and other Ring events
- **Smart Authentication**: Automatic token management with multiple authentication methods
- **Auto Token Updates**: Maintains push notifications by automatically updating refresh tokens

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Ring Account** with Two-Factor Authentication (2FA) enabled
- **MCP Client** like [Claude Desktop](https://claude.ai/download) or other MCP-compatible applications

## ⚡ Quick Start

### 1. Installation

```bash
git clone https://github.com/jpcors/ring-mcp
cd ring-mcp-server
npm install
npm run build
```

### 2. First Run (Interactive Authentication)

```bash
npm start
```

On first run, the server will automatically prompt you to authenticate with Ring:

- Enter your Ring email and password
- Provide the 2FA code when prompted
- The server will save your refresh token automatically

### 3. Use with Claude Desktop

Add this to your Claude Desktop MCP configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ring": {
      "command": "node",
      "args": ["/path/to/ring-mcp-server/build/index.js"],
      "env": {}
    }
  }
}
```

## 🔐 Authentication Options

The server supports multiple authentication methods (checked in priority order):

### Option 1: Command Line Token

```bash
npm start -- --token="your_refresh_token_here"
```

### Option 2: Environment Variable

```bash
export RING_REFRESH_TOKEN="your_refresh_token"
npm start
```

### Option 3: Automatic Config File

- Tokens are automatically saved to `ring-config.json`
- Updated tokens are automatically saved to maintain push notifications

### Option 4: Interactive Authentication

- If no token is found, the server runs `ring-auth-cli` automatically
- Follow the prompts to enter your Ring credentials

### Manual Authentication

```bash
# Generate token manually
npm run auth

# Then start server
npm start
```

## 🛠️ Available MCP Tools

Once connected to your MCP client, you can use these tools:

### `list_devices`

Lists all Ring devices in your account with basic information.

### `get_device_info`

Get detailed information about a specific Ring device.

- **Parameters**: `deviceId` (string)

### `arm_disarm_alarm`

Control your Ring alarm system.

- **Parameters**:
  - `locationId` (string) - The location ID where the alarm is located
  - `mode` (string) - `home`, `away`, or `disarmed`

### `get_camera_snapshot`

Capture a snapshot from a Ring camera.

- **Parameters**: `deviceId` (string) - The camera device ID

### `turn_light_on_off`

Control Ring light devices.

- **Parameters**:
  - `deviceId` (string) - The light device ID
  - `on` (boolean) - `true` to turn on, `false` to turn off

### `monitor_events`

Monitor real-time Ring events for a specified duration.

- **Parameters**: `duration` (number, optional) - Duration in seconds (default: 30)
- **Returns**: List of events including doorbell presses, motion detection, and notifications

## ⚙️ Configuration

### Development Commands

```bash
npm run build     # Compile TypeScript
npm run dev       # Development mode with watch
npm start         # Start the MCP server
npm run auth      # Manual Ring authentication
npm run help      # Show usage help
npm test          # Run tests
```

### Configuration Files

- `ring-config.json` - Automatically managed token storage
- `.env` - Optional environment variables
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration

## 🔒 Security Considerations

- **Token Security**: Refresh tokens provide full access to your Ring account
- **Local Storage**: Tokens are stored locally in `ring-config.json`
- **Auto-Updates**: Tokens are automatically updated to maintain security
- **Gitignore**: Sensitive files are excluded from version control

### Important Notes:

- Never share your refresh tokens
- The `ring-config.json` file contains sensitive authentication data
- Automatic token updates are **critical** for maintaining push notifications

## 🚨 Troubleshooting

### Push Notifications Not Working

This usually means tokens aren't being updated properly:

1. Check if `ring-config.json` exists and has recent `lastUpdated` timestamp
2. Restart the server to trigger token refresh
3. If problems persist, delete `ring-config.json` and re-authenticate

### Authentication Fails

1. Ensure 2FA is enabled on your Ring account
2. Check your email/password credentials
3. Verify you have an active internet connection
4. Try manual authentication: `npm run auth`

### Device Not Found

1. Use `list_devices` to get correct device IDs
2. Ensure the device is online in the Ring app
3. Check that your Ring account has access to the device

### MCP Connection Issues

1. Verify the path in your MCP client configuration
2. Ensure the server compiled successfully: `npm run build`
3. Check MCP client logs for connection errors

## 🔧 Development

### Project Structure

```
src/
  index.ts          # Main MCP server implementation
package.json        # Dependencies and scripts
tsconfig.json       # TypeScript configuration
ring-config.json    # Auto-generated token storage
.env               # Optional environment variables
```

### Key Architecture Components

- **RingMCPServer**: Main server class handling MCP protocol
- **Token Management**: Multi-tier authentication system
- **Ring API Integration**: Uses `ring-client-api` library
- **Event Monitoring**: Real-time Ring event subscriptions

### Building and Testing

```bash
npm install           # Install dependencies
npm run build         # Compile TypeScript
npm run dev           # Development with watch mode
npm start -- --help   # Show usage options
```

## ⚠️ Disclaimer

This is an unofficial integration using the community-driven `ring-client-api` library. It is not affiliated with or endorsed by Ring/Amazon. Use at your own risk and in accordance with Ring's Terms of Service.

## 🙏 Acknowledgments

- [dgreif/ring](https://github.com/dgreif/ring) - The Ring API library
- [Model Context Protocol](https://modelcontextprotocol.io/) - The MCP specification
- Ring community for reverse-engineering efforts
