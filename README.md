# Infracost MCP Server

MCP server that lets Claude interact with Infracost for Terraform cost estimation and cloud governance. Works with Claude Desktop and Claude Code.

## What it does

- Generate cost breakdowns for Terraform configurations
- Compare costs between different configs or branches
- Create and manage tagging policies in Infracost Cloud
- Set up cost guardrails that block expensive PRs
- Post cost comments to GitHub/GitLab/Azure/Bitbucket PRs
- Upload custom properties for resource classification

## Prerequisites

- Node.js 18+
- Infracost CLI ([install guide](https://www.infracost.io/docs/))
- Infracost service token (get from [dashboard](https://dashboard.infracost.io))

## Installation

```bash
git clone <repo-url> infracost_mcp
cd infracost_mcp
npm install
npm run build
```

Create a `.env` file:

```bash
INFRACOST_SERVICE_TOKEN=ics_v1_your_token_here
INFRACOST_ORG=your_org_slug
```

## Usage

### With Claude Code

The repo includes `.mcp.json` and `.claude/agents/` so it works out of the box - just open the project in Claude Code and the Infracost tools will be available.

### With Claude Desktop

Add to your config file (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "infracost": {
      "command": "node",
      "args": ["/absolute/path/to/infracost_mcp/dist/index.js"]
    }
  }
}
```

## Examples

Ask Claude things like:

- "What's the monthly cost of my Terraform in ./infrastructure?"
- "Compare costs between staging and prod configs"
- "Create a tagging policy that requires Environment and Owner tags"
- "Set up a guardrail that blocks PRs adding more than $200/month"
- "Generate an HTML cost report"

## Available Tools

**Cost Estimation:**
- `infracost_breakdown` - Generate cost breakdown
- `infracost_diff` - Compare two configurations
- `infracost_output` - Format/combine outputs
- `infracost_upload` - Upload to Infracost Cloud
- `infracost_comment` - Post to PRs

**Cloud API (requires service token):**
- Tagging policies: list, get, create, update, delete
- Guardrails: list, get, create, update, delete
- Custom properties: upload CSV data

See [docs/README.md](docs/README.md) for detailed tool parameters and [docs/EXAMPLES.md](docs/EXAMPLES.md) for JSON examples.

## Project Structure

- `src/` - TypeScript source
- `dist/` - Compiled output (created by `npm run build`)
- `docs/` - Additional documentation
- `.claude/` - Claude Code configuration (optional)

## Troubleshooting

**Server not working:** Verify Infracost CLI is installed (`infracost --version`) and token is set correctly in config.

**Claude not using tools:** Restart Claude after config changes. Make sure path to `dist/index.js` is absolute.

**No resources found:** Run `terraform init` in your Terraform directory first.

## License

MIT
