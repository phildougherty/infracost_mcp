# Infracost MCP Server

MCP server that lets Claude interact with Infracost for Terraform cost estimation and cloud governance. Works with Claude Desktop and Claude Code.

<a href="https://glama.ai/mcp/servers/@phildougherty/infracost_mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@phildougherty/infracost_mcp/badge" alt="Infracost Server MCP server" />
</a>

## What it does

- Generate cost breakdowns for Terraform configurations
- Compare costs between different configs or branches
- Create and manage tagging policies in Infracost Cloud
- Set up cost guardrails that block expensive PRs
- Post cost comments to GitHub/GitLab/Azure/Bitbucket PRs
- Upload custom properties for resource classification

## Prerequisites

- Node.js >= 18
- [Infracost CLI](https://www.infracost.io/docs/) (for cost estimation tools)
- Infracost service token from [Infracost Cloud](https://dashboard.infracost.io) > Org Settings > API tokens

## Installation

```bash
git clone <repo-url> infracost_mcp
cd infracost_mcp
npm install
npm run build
```

## Configuration

Create a `.env` file in the project root:

```env
INFRACOST_SERVICE_TOKEN=ics_v1_your_token_here
INFRACOST_ORG=your_org_slug
```

Get your service token from the [Infracost Cloud dashboard](https://dashboard.infracost.io) under Org Settings > API tokens.

## Usage

### With Claude Code

The repo includes `.mcp.json` and `.claude/agents/` so it works out of the box - just open the project in Claude Code and the Infracost tools will be available.

### With Claude Desktop

Add to your Claude Desktop config file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

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

Restart Claude Desktop after updating the config.

## Examples

### Natural Language Queries

Ask Claude things like:

**Cost Estimation:**
- "What's the monthly cost of my Terraform in ./infrastructure?"
- "Show me a cost breakdown for ./terraform/prod in table format"
- "Generate an HTML cost report and save it to report.html"
- "Upload the cost estimate from infracost.json to Infracost Cloud"

**Cost Comparison:**
- "Compare costs between ./staging and ./prod configs"
- "What's the cost difference if I switch from t3.medium to t3.large?"
- "Show me cost changes between the current branch and main"

**Tagging Policies:**
- "Create a tagging policy that requires Environment and Owner tags"
- "List all tagging policies for my organization"
- "Add a tagging policy that allows only 'dev', 'staging', 'prod' for Environment tags"
- "Update the tagging policy to also require a CostCenter tag"

**Cost Guardrails:**
- "Set up a guardrail that blocks PRs adding more than $200/month"
- "Create a guardrail that warns when total infrastructure cost exceeds $10k/month"
- "Block PRs with cost increases over 25% for my production repo"
- "List all active guardrails"

**Pull Request Integration:**
- "Post the cost estimate from infracost.json to GitHub PR #123 in owner/repo"
- "Add a cost comment to the current GitLab merge request"

### JSON Examples

**Generate cost breakdown:**
```json
{
  "path": "./terraform/prod",
  "format": "json",
  "outFile": "cost-estimate.json"
}
```

**Compare configurations:**
```json
{
  "path": "./terraform/current",
  "compareTo": "./terraform/baseline",
  "format": "diff"
}
```

**Create tagging policy:**
```json
{
  "name": "Required tags policy",
  "prComment": true,
  "blockPr": true,
  "tags": [
    {
      "key": "Environment",
      "mandatory": true,
      "valueType": "LIST",
      "allowedValues": ["dev", "staging", "prod"]
    },
    {
      "key": "Owner",
      "mandatory": true,
      "valueType": "REGEX",
      "allowedRegex": "^[a-z]+\\.[a-z]+@company\\.com$"
    }
  ]
}
```

**Create cost guardrail:**
```json
{
  "name": "Production cost limit",
  "scope": {
    "type": "REPO",
    "repositories": ["myorg/prod-infrastructure"]
  },
  "increasePercentThreshold": 10,
  "totalThreshold": 50000,
  "blockPullRequest": true,
  "commentOnPullRequest": true
}
```

See [docs/EXAMPLES.md](docs/EXAMPLES.md) for more detailed examples.

## Available Tools

### CLI Tools (require Infracost CLI)

- `infracost_breakdown` - Generate cost breakdown for Terraform infrastructure
- `infracost_diff` - Show cost differences between two configurations
- `infracost_output` - Combine and format Infracost JSON files
- `infracost_upload` - Upload cost estimates to Infracost Cloud
- `infracost_comment` - Post cost comments to pull requests

### Cloud API Tools (require service token)

**Tagging Policies:**
- `infracost_cloud_list_tagging_policies` - List all tagging policies
- `infracost_cloud_get_tagging_policy` - Get a specific tagging policy
- `infracost_cloud_create_tagging_policy` - Create a new tagging policy
- `infracost_cloud_update_tagging_policy` - Update an existing tagging policy
- `infracost_cloud_delete_tagging_policy` - Delete a tagging policy

**Guardrails:**
- `infracost_cloud_list_guardrails` - List all guardrails
- `infracost_cloud_get_guardrail` - Get a specific guardrail
- `infracost_cloud_create_guardrail` - Create a cost guardrail
- `infracost_cloud_update_guardrail` - Update an existing guardrail
- `infracost_cloud_delete_guardrail` - Delete a guardrail

**Custom Properties:**
- `infracost_cloud_upload_custom_properties` - Upload custom property values via CSV

## Project Structure

- `src/` - TypeScript source code
- `dist/` - Compiled JavaScript output (created by `npm run build`)
- `docs/` - Additional documentation and examples
- `.claude/` - Claude Code agent configuration

## Development

```bash
npm run build   # Compile TypeScript
npm run watch   # Watch mode for development
npm start       # Run the MCP server
```

## Troubleshooting

**CLI tools not working:**
- Verify Infracost CLI is installed: `infracost --version`
- Ensure `INFRACOST_SERVICE_TOKEN` is set correctly

**Cloud API errors:**
- Check that your service token has the necessary permissions
- Verify the organization slug is correct

**Server not connecting:**
- Ensure the path to `dist/index.js` is absolute in your MCP config
- Restart Claude Desktop after making config changes
- Check that `npm run build` completed successfully

**No resources found:**
- Run `terraform init` in your Terraform directory first
- Verify the path to your Terraform files is correct

## Resources

- [Infracost Documentation](https://www.infracost.io/docs/)
- [Infracost Cloud API](https://www.infracost.io/docs/infracost_cloud/api/)
- [Model Context Protocol](https://modelcontextprotocol.io)

## License

MIT