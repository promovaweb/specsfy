> ## Documentation Index
> Fetch the complete documentation index at: https://modelcontextprotocol.io/llms.txt
> Use this file to discover all available pages before exploring further.

# Debugging

> A comprehensive guide to debugging Model Context Protocol (MCP) integrations

Effective debugging is essential when developing MCP servers or integrating
them with applications. This guide covers the debugging tools and approaches
available in the MCP ecosystem.

## Debugging tools overview

MCP provides several tools for debugging at different levels:

1. **[MCP Inspector](https://modelcontextprotocol.io/docs/2025-11-25/tools/inspector.md)**: interactive, transport-agnostic
   testing UI. Connect to stdio or Streamable HTTP servers, invoke
   [tools](https://modelcontextprotocol.io/specification/2025-11-25/server/tools.md),
   [prompts](https://modelcontextprotocol.io/specification/2025-11-25/server/prompts.md), and
   [resources](https://modelcontextprotocol.io/specification/2025-11-25/server/resources.md), and watch the
   notification stream. This should be your first stop.
2. **Server logging**: structured logs to stderr (stdio transport) or via
   [`notifications/message`](https://modelcontextprotocol.io/specification/2025-11-25/server/utilities/logging#log-message-notifications)
   (all transports).
3. **Client developer tools**: most MCP clients expose logs and connection
   state. See [Debugging in Claude Desktop](#debugging-in-claude-desktop)
   below for one example, or consult your client's documentation.

## Implementing logging

### Server-side logging

When building a server that uses the local
[stdio transport](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md#stdio), all messages
logged to stderr (standard error) will be captured by the host application
automatically.

> [!WARNING]
>
> Local MCP servers should not log messages to stdout (standard out), as this
> will interfere with protocol operation.

For servers using the
[Streamable HTTP transport](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md#streamable-http),
stderr is not captured by the client. Use the log message notifications below,
your own server-side log aggregation, or standard HTTP tooling (curl, browser
DevTools Network panel) to inspect requests,
[`Mcp-Session-Id` headers](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports#session-management),
and SSE streams.

For all [transports](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports.md), you can also
provide logging to the client by sending a log message notification:

```python Python theme={null}
@server.tool()
async def my_tool(ctx: Context) -> str:
    await ctx.session.send_log_message(
        level="info",
        data="Server started successfully",
    )
    return "done"
```

```typescript TypeScript theme={null}
await server.sendLoggingMessage({
  level: "info",
  data: "Server started successfully",
});
```

MCP defines eight
[RFC 5424 severity levels](https://modelcontextprotocol.io/specification/2025-11-25/server/utilities/logging.md#log-levels)
(`debug` through `emergency`). Clients can adjust the minimum level at runtime
via the
[`logging/setLevel`](https://modelcontextprotocol.io/specification/2025-11-25/server/utilities/logging#setting-log-level)
request.

Important events to log:

* Initialization steps
* Resource access
* Tool execution
* Error conditions
* Performance metrics

## Common issues

The examples below use Claude Desktop's
[`claude_desktop_config.json`](https://modelcontextprotocol.io/docs/2025-11-25/develop/connect-local-servers); the same
principles apply to any stdio-based MCP client.

### Working directory

When an MCP client launches a stdio server:

* The working directory for servers launched via the client's config may be
  undefined (like `/` on macOS) since the client could be started from
  anywhere
* Always use absolute paths in your configuration and `.env` files to ensure
  reliable operation
* For testing servers directly via command line, the working directory will be
  where you run the command

For example in `claude_desktop_config.json`, use:

```json theme={null}
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/username/data"
      ]
    }
  }
}
```

Instead of relative paths like `./data`

### Environment variables

MCP servers launched over stdio inherit only a limited subset of environment
variables automatically (the exact set is platform-dependent).

To override the default variables or provide your own, you can specify an
`env` key in `claude_desktop_config.json`:

```json theme={null}
{
  "mcpServers": {
    "myserver": {
      "command": "mcp-server-myapp",
      "env": {
        "MYAPP_API_KEY": "some_key"
      }
    }
  }
}
```

### Server initialization

Common initialization problems:

1. **Path Issues**
   * Incorrect server executable path
   * Missing required files
   * Permission problems
   * Try using an absolute path for `command`

2. **Configuration Errors**
   * Invalid JSON syntax
   * Missing required fields
   * Type mismatches

3. **Environment Problems**
   * Missing environment variables
   * Incorrect variable values
   * Permission restrictions

### Connection problems

When servers fail to connect:

1. Check client logs
2. Verify server process is running
3. Test standalone with [Inspector](https://modelcontextprotocol.io/docs/2025-11-25/tools/inspector.md)
4. Verify
   [protocol compatibility](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle.md#version-negotiation)
5. Check
   [capability negotiation](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle.md#capability-negotiation):
   error [`-32602`](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle#error-handling) is
   the standard JSON-RPC "Invalid params" code and is returned in many
   contexts. One common cause is a server sending
   [sampling](https://modelcontextprotocol.io/specification/2025-11-25/client/sampling.md) or
   [elicitation](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation.md) requests to a
   client that hasn't declared that capability. Inspect the
   [`initialize` exchange](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle#initialization)
   to verify both sides declared what you expect

## Debugging in Claude Desktop

Claude Desktop is one of many MCP clients. It is available on
macOS, Windows, and Linux.

### Checking server status

Click the "Add files, connectors, and more" plus icon in the chat input, then
hover over the **Connectors** menu to see connected servers and available
tools.

![Available MCP tools](https://mintcdn.com/mcp/zNouQwo2h8cbxlDS/images/available-mcp-tools.png?fit=max\&auto=format\&n=zNouQwo2h8cbxlDS\&q=85\&s=e2ace1ac88895a5fe30ebd8d01456bc3)

### Viewing logs

Log files are written to:

* macOS: `~/Library/Logs/Claude`
* Windows: `%APPDATA%\Claude\logs`

```bash macOS theme={null}
tail -n 20 -F ~/Library/Logs/Claude/mcp*.log
```

```powershell Windows theme={null}
type "$env:AppData\Claude\logs\mcp*.log"
```

The logs capture:

* Server connection events
* Configuration issues
* Runtime errors
* Message exchanges

### Using Chrome DevTools

Access Chrome's developer tools inside Claude Desktop to investigate
client-side errors:

1. Create a `developer_settings.json` file with `allowDevTools` set to true:

```bash macOS theme={null}
echo '{"allowDevTools": true}' > ~/Library/Application\ Support/Claude/developer_settings.json
```

```powershell Windows theme={null}
'{"allowDevTools": true}' | Set-Content "$env:AppData\Claude\developer_settings.json"
```

2. Open DevTools: `Command-Option-I` (macOS) or `Ctrl+Alt+I` (Windows)

Note: You'll see two DevTools windows:

* Main content window
* App title bar window

Use the Console panel to inspect client-side errors.

Use the Network panel to inspect:

* Message payloads
* Connection timing

## Debugging workflow

### Development cycle

1. Initial Development
   * Use [Inspector](https://modelcontextprotocol.io/docs/2025-11-25/tools/inspector.md) for basic testing
   * Implement core functionality
   * Add logging points

2. Integration Testing
   * Test in your target MCP client
   * Monitor logs
   * Check error handling

### Testing changes

To test changes efficiently:

* **Configuration changes**: Restart the MCP client
* **Server code changes**: Restart the client (for Claude Desktop, fully quit
  and reopen; closing the window is not enough)
* **Quick iteration**: Use [Inspector](https://modelcontextprotocol.io/docs/2025-11-25/tools/inspector.md) during
  development

## Best practices

### Logging strategy

1. **Structured Logging**
   * Use consistent formats
   * Include context
   * Add timestamps
   * Track request IDs

2. **Error Handling**
   * Log stack traces
   * Include error context
   * Track error patterns
   * Monitor recovery

3. **Performance Tracking**
   * Log operation timing
   * Monitor resource usage
   * Track message sizes
   * Measure latency

### Security considerations

When debugging:

1. **Sensitive Data**
   * Sanitize logs
   * Protect credentials
   * Mask personal information

2. **Access Control**
   * Verify permissions
   * Check authentication
   * Monitor access patterns

For a full treatment of MCP attack vectors and mitigations, see
[Security Best Practices](https://modelcontextprotocol.io/docs/2025-11-25/tutorials/security/security_best_practices.md).

## Getting help

When encountering issues:

1. **First Steps**
   * Check server logs
   * Test with [Inspector](https://modelcontextprotocol.io/docs/2025-11-25/tools/inspector.md)
   * Review configuration
   * Verify environment

2. **Support Channels**
   * [GitHub issues](https://github.com/modelcontextprotocol/modelcontextprotocol/issues)
   * [GitHub discussions](https://github.com/modelcontextprotocol/modelcontextprotocol/discussions)

3. **Providing Information**
   * Log excerpts
   * Configuration files
   * Steps to reproduce
   * Environment details

## Next steps

> [card] [MCP Inspector](https://modelcontextprotocol.io/docs/2025-11-25/tools/inspector.md)
>
> Learn to use the MCP Inspector

> [card] [Build an MCP server](https://modelcontextprotocol.io/docs/2025-11-25/develop/build-server.md)
>
> Walk through building a server from scratch

> [card] [Connect local servers](https://modelcontextprotocol.io/docs/2025-11-25/develop/connect-local-servers.md)
>
> Full claude\_desktop\_config.json reference and troubleshooting
