# Usage Examples

## Basic Cost Estimation

### Generate Cost Breakdown
```json
{
  "tool": "infracost_breakdown",
  "arguments": {
    "path": "/path/to/terraform",
    "format": "json"
  }
}
```

### With Terraform Variables
```json
{
  "tool": "infracost_breakdown",
  "arguments": {
    "path": "/path/to/terraform",
    "terraformVar": {
      "instance_type": "t3.large",
      "region": "us-west-2"
    }
  }
}
```

### Using Variable Files
```json
{
  "tool": "infracost_breakdown",
  "arguments": {
    "path": "/path/to/terraform",
    "terraformVarFile": ["/path/to/prod.tfvars"]
  }
}
```

## Cost Comparisons

### Compare Configurations
```json
{
  "tool": "infracost_diff",
  "arguments": {
    "path": "/path/to/current",
    "compareTo": "/path/to/baseline"
  }
}
```

## Output Formatting

### Generate HTML Report
```json
{
  "tool": "infracost_output",
  "arguments": {
    "path": "/path/to/costs.json",
    "format": "html",
    "outFile": "/path/to/report.html"
  }
}
```

### Combine Multiple Files
```json
{
  "tool": "infracost_output",
  "arguments": {
    "path": "/path/to/costs/*.json",
    "format": "json"
  }
}
```

## Cloud Integration

### Upload to Infracost Cloud
```json
{
  "tool": "infracost_upload",
  "arguments": {
    "path": "/path/to/costs.json"
  }
}
```

### Post to GitHub PR
```json
{
  "tool": "infracost_comment",
  "arguments": {
    "path": "/path/to/costs.json",
    "platform": "github",
    "repo": "owner/repo",
    "pullRequest": "123"
  }
}
```

## Infracost Cloud API

### Update Tagging Policy
```json
{
  "tool": "infracost_cloud_update_tagging_policy",
  "arguments": {
    "orgSlug": "my-org",
    "policyId": "policy-uuid",
    "tags": [
      {
        "key": "Environment",
        "mandatory": true,
        "valueType": "LIST",
        "allowedValues": ["dev", "staging", "prod"]
      }
    ]
  }
}
```

### Create Cost Guardrail
```json
{
  "tool": "infracost_cloud_create_guardrail",
  "arguments": {
    "orgSlug": "my-org",
    "name": "Production cost limit",
    "scope": {
      "type": "REPO",
      "repositories": ["owner/prod-infra"]
    },
    "increasePercentThreshold": 10,
    "blockPullRequest": true
  }
}
```

## Common Workflows

### CI/CD Pipeline
1. Generate cost breakdown for PR changes
2. Compare with baseline
3. Post comment to PR
4. Upload to Infracost Cloud for tracking

### Local Development
1. Make Terraform changes
2. Run breakdown to estimate costs
3. Review before committing
