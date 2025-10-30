# Terraform Cost Estimation Examples

This directory contains sample Terraform configurations for testing Infracost MCP tools.

## Files

- `main.tf` - Main infrastructure definition with various AWS resources
- `variables.tf` - Variable definitions
- `dev.tfvars` - Development environment configuration (smaller, cheaper resources)
- `prod.tfvars` - Production environment configuration (larger, more expensive resources)

## Resources Included

The configuration includes common AWS resources with different cost profiles:

1. **EC2 Instance** - Compute costs
2. **RDS PostgreSQL** - Database costs (significant cost driver)
3. **S3 Bucket** - Storage costs
4. **Application Load Balancer** - Network costs
5. **NAT Gateway** - High fixed cost ($32/month + data transfer)
6. **ElastiCache Redis** - Caching costs
7. **CloudWatch Log Group** - Logging costs

## Testing Examples

### Basic Cost Breakdown

```bash
# Get cost estimate for dev environment
infracost breakdown --path . --terraform-var-file dev.tfvars

# Get cost estimate for prod environment
infracost breakdown --path . --terraform-var-file prod.tfvars
```

### Compare Environments

```bash
# See the cost difference between dev and prod
infracost diff --path . --terraform-var-file prod.tfvars --compare-to . --terraform-var-file dev.tfvars
```

### Using with Claude via MCP

Ask Claude:
- "What's the monthly cost of the dev environment in examples/terraform?"
- "Compare the cost between dev and prod configurations"
- "What are the top 3 cost drivers in the prod setup?"
- "Generate a cost breakdown and save it as JSON"

## Expected Costs (approximate)

### Dev Environment (~$75-100/month)
- EC2 t3.small: ~$15/month
- RDS db.t3.micro: ~$15/month
- NAT Gateway: ~$32/month
- ElastiCache: ~$12/month
- ALB: ~$16/month
- Other: ~$5/month

### Prod Environment (~$800-900/month)
- EC2 t3.xlarge: ~$120/month
- RDS db.r6g.xlarge: ~$300/month
- NAT Gateway: ~$32/month
- ElastiCache (3x r6g.large): ~$240/month
- ALB: ~$16/month
- Storage (500GB): ~$50/month
- Other: ~$20/month

## Notes

- Costs are estimates and vary by region and usage
- NAT Gateway is a significant fixed cost regardless of size
- Database and cache instances are the main cost drivers in prod
- Actual costs depend on data transfer, storage usage, and other factors
