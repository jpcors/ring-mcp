import type { ServerOptions } from "../types/index";

export class CliParser {
  static parseArgs(): ServerOptions {
    const args = process.argv.slice(2);
    const options: ServerOptions = { transport: "stdio" };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === "--http") {
        options.transport = "http";
      } else if (arg.startsWith("--port=")) {
        options.port = parseInt(arg.split("=")[1], 10);
      } else if (arg.startsWith("--host=")) {
        options.host = arg.split("=")[1];
      }
    }

    // Validate port if provided
    if (options.port && (options.port < 1 || options.port > 65535)) {
      console.error("Error: Port must be between 1 and 65535");
      process.exit(1);
    }

    return options;
  }

  static showHelpAndExit(): void {
    console.log(`
Ring MCP Server

Usage:
  npm start                                    - Start server with stdio transport
  npm start -- --token=<token>                - Start server with specific refresh token
  npm start -- --http                         - Start server with HTTP transport on localhost:3000
  npm start -- --http --port=8080            - Start server with HTTP transport on custom port
  npm start -- --http --host=0.0.0.0         - Start server with HTTP transport on all interfaces
  
Transport Options:
  --http                                       - Use HTTP+SSE transport instead of stdio
  --port=<port>                               - Port for HTTP transport (default: 3000)
  --host=<host>                               - Host for HTTP transport (default: localhost)

Authentication:
  --token=<refresh_token>                      - Use specific Ring refresh token

Environment Variables:
  RING_REFRESH_TOKEN                          - Ring refresh token (alternative to --token)

The server will check for tokens in this order:
1. Command line --token argument
2. RING_REFRESH_TOKEN environment variable  
3. Saved token in ring-config.json
4. Fail with authentication error (run 'npm run auth' first)

Tokens are automatically updated and saved to ring-config.json to maintain push notifications.

Examples:
  npm start                                    # stdio transport (for Claude Desktop)
  npm start -- --http                         # HTTP transport on localhost:3000
  npm start -- --http --port=8080            # HTTP transport on port 8080
  npm start -- --token=your_token --http     # HTTP transport with specific token
`);
    process.exit(0);
  }

  static checkForHelp(): void {
    if (process.argv.includes("--help") || process.argv.includes("-h")) {
      CliParser.showHelpAndExit();
    }
  }
}
