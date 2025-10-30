# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that provides Infracost tools to Claude Desktop and Claude Code. It enables cost estimation and governance for Terraform infrastructure through both CLI commands and the Infracost Cloud API.

## Build and Development

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Watch mode for development
npm watch

# Start the server (requires build first)
npm start
```

The build output goes to `dist/` and must exist before running the server.

## Testing the MCP Server

Since this is an MCP server project with no test suite, testing is done by running the server:

```bash
# Build first
npm run build

# Test with environment variables
INFRACOST_SERVICE_TOKEN=ics_v1_... INFRACOST_ORG=your-org node dist/index.js
```

The server runs on stdio and will log configuration on startup. Use `.mcp.json` for Claude Code integration.

## Architecture

### Entry Point and MCP Server (src/index.ts)

- Initializes MCP server using `@modelcontextprotocol/sdk`
- Loads `.env` for `INFRACOST_SERVICE_TOKEN` and `INFRACOST_ORG`
- Registers 16 tools exposed to Claude
- Routes tool requests to `InfracostTools` class methods
- All tool calls validate input via Zod schemas

### Tool Implementation (src/tools.ts)

The `InfracostTools` class handles all tool implementations:

- **CLI-based tools**: Delegate to `src/cli.ts` functions (breakdown, diff, output, upload, comment)
- **API-based tools**: Delegate to `InfracostCloudAPIClient` from `src/api.ts`
- Each handler validates args with Zod, executes operation, and returns MCP-formatted response
- All API operations require `INFRACOST_SERVICE_TOKEN` and org slug

### CLI Wrapper (src/cli.ts)

Wraps the `infracost` CLI tool:

- Uses `execFileAsync` for safe command execution
- All file paths are resolved to absolute paths
- Supports JSON parsing for structured output
- `checkInfracostInstalled()` verifies CLI availability

### API Client (src/api.ts)

REST client for Infracost Cloud API (`https://api.infracost.io/v1`):

- Handles tagging policies (list, get, create, update, delete)
- Handles guardrails (list, get, create, update, delete)
- Handles custom properties upload
- Uses Bearer token auth with `INFRACOST_SERVICE_TOKEN`
- All responses return `CommandResult` type

### Type Definitions (src/types.ts)

Contains TypeScript interfaces and Zod schemas for:

- CLI command options (breakdown, diff, output, etc.)
- API request/response types (tagging policies, guardrails)
- Configuration and result types
- Zod schemas are exported for validation in tools.ts

## Key Implementation Details

### Scope Mapping for Guardrails

The MCP tool schema uses `scope.type` with values `ALL_PROJECTS`, `REPO`, `PROJECT`, but the API expects just `REPO` or `PROJECT`. The mapping logic is in `tools.ts:456-460`:

```typescript
if (scope.type === 'ALL_PROJECTS' || scope.type === 'REPO') {
  scopeString = 'REPO';
} else {
  scopeString = 'PROJECT';
}
```

### Environment Variables

- `INFRACOST_SERVICE_TOKEN`: Required for all Cloud API operations (tagging policies, guardrails, custom properties)
- `INFRACOST_ORG`: Default organization slug, can be overridden per tool call
- Token is logged (first 8 chars) on server startup for debugging

### Error Handling

All tools follow the same pattern:
1. Validate required config (CLI installed, token present, org slug)
2. Execute operation
3. Return `CommandResult` with `success`, `output`, optional `error`, optional `data`
4. Throw error if operation fails, which MCP SDK converts to tool error response

## Claude Code Integration

The `.mcp.json` configures the server to run automatically in Claude Code. The `.claude/agents/infracost-manager.md` defines a specialized agent with access to all Infracost tools, configured to use the sonnet model and pink color.

## Infracost CLI

The server wraps the Infracost CLI and requires it to be installed separately. It does not bundle or install Infracost. All CLI operations check for installation first via `checkInfracostInstalled()`.
