# Infracost MCP Server

MCP server for [Infracost](https://www.infracost.io) cost estimation. Supports both CLI-based operations and Infracost Cloud API access.

## Prerequisites

- Node.js >= 18
- [Infracost CLI](https://www.infracost.io/docs/) (for cost estimation tools)
- Infracost service token (from Infracost Cloud dashboard)

## Installation

```bash
npm install
npm run build
```

## Configuration

Create `.env` in project root:

```env
INFRACOST_SERVICE_TOKEN=ics_v1_your_token
INFRACOST_ORG=your_org_slug
```

Get your service token from [Infracost Cloud](https://dashboard.infracost.io) > Org Settings > API tokens.

## Usage with Claude Desktop

Add to your Claude config file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "infracost": {
      "command": "node",
      "args": ["/absolute/path/to/infracost_mcp/dist/index.js"],
      "env": {
        "INFRACOST_SERVICE_TOKEN": "ics_v1_your_token"
      }
    }
  }
}
```

## Available Tools

### CLI Tools (require Infracost CLI)

- `infracost_breakdown` - Generate cost breakdown
- `infracost_diff` - Compare configurations
- `infracost_output` - Format/combine outputs
- `infracost_upload` - Upload to Infracost Cloud
- `infracost_comment` - Post to PRs (GitHub/GitLab/Azure/Bitbucket)

### Cloud API Tools (require service token)

- `infracost_cloud_list_tagging_policies` - List tagging policies
- `infracost_cloud_get_tagging_policy` - Get specific policy
- `infracost_cloud_create_tagging_policy` - Create new policy
- `infracost_cloud_update_tagging_policy` - Update existing policy
- `infracost_cloud_delete_tagging_policy` - Delete policy
- `infracost_cloud_list_guardrails` - List guardrails
- `infracost_cloud_get_guardrail` - Get specific guardrail
- `infracost_cloud_create_guardrail` - Create cost guardrail
- `infracost_cloud_update_guardrail` - Update guardrail
- `infracost_cloud_delete_guardrail` - Delete guardrail
- `infracost_cloud_upload_custom_properties` - Upload custom properties CSV

## Tool Examples

### Generate Cost Breakdown

```json
{
  "path": "/path/to/terraform",
  "format": "json"
}
```

### Compare Configurations

```json
{
  "path": "/path/to/current",
  "compareTo": "/path/to/baseline",
  "format": "diff"
}
```

### Create Guardrail

```json
{
  "orgSlug": "my-org",
  "name": "Production limit",
  "scope": {
    "type": "REPO",
    "repositories": ["owner/repo"]
  },
  "increasePercentThreshold": 10,
  "blockPullRequest": true
}
```

See [EXAMPLES.md](EXAMPLES.md) for more examples.

## Troubleshooting

**CLI tools not working**: Verify `infracost --version` works and `INFRACOST_SERVICE_TOKEN` is set.

**Cloud API errors**: Check token permissions and organization slug.

**Server not connecting**: Ensure absolute path in MCP config and restart Claude Desktop.

## Development

```bash
npm run build   # Compile TypeScript
npm run watch   # Watch mode
npm start       # Run server
```

## License

MIT

## Resources

- [Infracost Docs](https://www.infracost.io/docs/)
- [Infracost Cloud API](https://www.infracost.io/docs/infracost_cloud/api/)
- [MCP Documentation](https://modelcontextprotocol.io)
