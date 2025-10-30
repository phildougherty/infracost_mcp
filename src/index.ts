#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import {
  InfracostTools,
  BreakdownSchema,
  DiffSchema,
  OutputSchema,
  UploadSchema,
  CommentSchema,
  ListTaggingPoliciesSchema,
  GetTaggingPolicySchema,
  CreateTaggingPolicySchema,
  UpdateTaggingPolicySchema,
  DeleteTaggingPolicySchema,
  ListGuardrailsSchema,
  GetGuardrailSchema,
  CreateGuardrailSchema,
  UpdateGuardrailSchema,
  DeleteGuardrailSchema,
  UploadCustomPropertiesSchema,
} from './tools.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

if (!process.env.INFRACOST_SERVICE_TOKEN) {
  dotenv.config();
}

const config = {
  serviceToken: process.env.INFRACOST_SERVICE_TOKEN,
  orgSlug: process.env.INFRACOST_ORG,
};

console.error('Infracost MCP Server Configuration:');
console.error(`- Service Token: ${config.serviceToken ? 'Set (' + config.serviceToken.substring(0, 8) + '...)' : 'Not set'}`);
console.error(`- Organization: ${config.orgSlug || 'Not set'}`);

const tools = new InfracostTools(config);

const server = new Server(
  {
    name: 'infracost-mcp-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'infracost_breakdown',
        description:
          'Generate a cost breakdown for Terraform infrastructure. Analyzes Terraform configuration and provides detailed cost estimates for resources. Requires infracost CLI to be installed.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to Terraform directory or plan JSON file',
            },
            format: {
              type: 'string',
              enum: ['json', 'table', 'html'],
              description: 'Output format (default: table)',
            },
            outFile: {
              type: 'string',
              description: 'Save output to a file',
            },
            terraformVarFile: {
              type: 'array',
              items: { type: 'string' },
              description: 'Terraform variable file paths',
            },
            terraformVar: {
              type: 'object',
              description: 'Terraform variables as key-value pairs',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'infracost_diff',
        description:
          'Show cost differences between two Terraform configurations. Compares baseline and current infrastructure to identify cost changes. Requires infracost CLI to be installed.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to current Terraform directory or plan JSON file',
            },
            compareTo: {
              type: 'string',
              description: 'Path to baseline Terraform directory or plan JSON file',
            },
            format: {
              type: 'string',
              enum: ['json', 'diff'],
              description: 'Output format (default: diff)',
            },
            outFile: {
              type: 'string',
              description: 'Save output to a file',
            },
          },
          required: ['path', 'compareTo'],
        },
      },
      {
        name: 'infracost_output',
        description:
          'Combine and format Infracost JSON files. Useful for merging multiple cost estimates or converting formats. Requires infracost CLI to be installed.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to Infracost JSON file(s) - supports glob patterns',
            },
            format: {
              type: 'string',
              enum: [
                'json',
                'table',
                'html',
                'diff',
                'github-comment',
                'gitlab-comment',
                'azure-repos-comment',
                'bitbucket-comment',
              ],
              description: 'Output format',
            },
            outFile: {
              type: 'string',
              description: 'Save output to a file',
            },
            fields: {
              type: 'array',
              items: { type: 'string' },
              description: 'Fields to include in output (e.g., ["price", "monthlyQuantity"])',
            },
            showSkipped: {
              type: 'boolean',
              description: 'Show skipped resources in output',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'infracost_upload',
        description:
          'Upload Infracost JSON output to Infracost Cloud for centralized cost tracking and reporting. Requires infracost CLI to be installed.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to Infracost JSON file to upload',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'infracost_comment',
        description:
          'Post cost estimate comments to pull requests on GitHub, GitLab, Azure Repos, or Bitbucket. Automatically updates existing comments. Requires infracost CLI to be installed and appropriate platform credentials.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Path to Infracost JSON file',
            },
            platform: {
              type: 'string',
              enum: ['github', 'gitlab', 'azure-repos', 'bitbucket'],
              description: 'Git platform',
            },
            repo: {
              type: 'string',
              description: 'Repository in format owner/repo',
            },
            pullRequest: {
              type: 'string',
              description: 'Pull request number',
            },
            commit: {
              type: 'string',
              description: 'Commit SHA to associate comment with',
            },
            tag: {
              type: 'string',
              description: 'Tag for comment identification',
            },
            behavior: {
              type: 'string',
              enum: ['update', 'new', 'delete-and-new'],
              description: 'How to handle existing comments (default: update)',
            },
          },
          required: ['path', 'platform'],
        },
      },
      {
        name: 'infracost_cloud_list_tagging_policies',
        description:
          'List all tagging policies in Infracost Cloud. Requires INFRACOST_SERVICE_TOKEN environment variable.',
        inputSchema: {
          type: 'object',
          properties: {
            orgSlug: {
              type: 'string',
              description: 'Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)',
            },
          },
          required: [],
        },
      },
      {
        name: 'infracost_cloud_get_tagging_policy',
        description:
          'Get a specific tagging policy from Infracost Cloud. Requires INFRACOST_SERVICE_TOKEN environment variable.',
        inputSchema: {
          type: 'object',
          properties: {
            orgSlug: {
              type: 'string',
              description: 'Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)',
            },
            policyId: {
              type: 'string',
              description: 'Policy ID',
            },
          },
          required: ['policyId'],
        },
      },
      {
        name: 'infracost_cloud_create_tagging_policy',
        description:
          'Create a new tagging policy in Infracost Cloud for tag validation in pull requests. Requires INFRACOST_SERVICE_TOKEN environment variable.',
        inputSchema: {
          type: 'object',
          properties: {
            orgSlug: {
              type: 'string',
              description: 'Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)',
            },
            name: {
              type: 'string',
              description: 'Name for the tagging policy',
            },
            message: {
              type: 'string',
              description: 'The message to display in the PR comment',
            },
            prComment: {
              type: 'boolean',
              description: 'Whether to add a comment to the PR',
            },
            blockPr: {
              type: 'boolean',
              description: 'Whether to block the PR',
            },
            tags: {
              type: 'array',
              description: 'Array of tag definitions',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string', description: 'Tag key name' },
                  mandatory: { type: 'boolean', description: 'Whether the tag is required' },
                  valueType: {
                    type: 'string',
                    enum: ['ANY', 'LIST', 'REGEX'],
                    description: 'Value type: ANY (any value), LIST (predefined values), or REGEX (regex pattern)',
                  },
                  allowedValues: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of allowed values (for LIST type)',
                  },
                  allowedRegex: {
                    type: 'string',
                    description: 'Regex pattern for allowed values (for REGEX type)',
                  },
                  message: {
                    type: 'string',
                    description: 'Optional message to display if the tag is missing/invalid',
                  },
                },
                required: ['key', 'mandatory', 'valueType'],
              },
            },
            filters: {
              type: 'object',
              description: 'Filters to limit scope of the policy',
              properties: {
                repos: {
                  type: 'object',
                  description: 'Repository filters',
                  properties: {
                    include: { type: 'array', items: { type: 'string' } },
                    exclude: { type: 'array', items: { type: 'string' } },
                  },
                },
                projects: {
                  type: 'object',
                  description: 'Project filters',
                  properties: {
                    include: { type: 'array', items: { type: 'string' } },
                    exclude: { type: 'array', items: { type: 'string' } },
                  },
                },
                baseBranches: {
                  type: 'object',
                  description: 'Base branch filters',
                  properties: {
                    include: { type: 'array', items: { type: 'string' } },
                    exclude: { type: 'array', items: { type: 'string' } },
                  },
                },
                resources: {
                  type: 'object',
                  description: 'Resource filters',
                  properties: {
                    include: { type: 'array', items: { type: 'string' } },
                    exclude: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          required: ['name', 'tags'],
        },
      },
      {
        name: 'infracost_cloud_update_tagging_policy',
        description:
          'Update tagging policies in Infracost Cloud with allowed tag values for validation in pull requests. Requires INFRACOST_SERVICE_TOKEN environment variable.',
        inputSchema: {
          type: 'object',
          properties: {
            orgSlug: {
              type: 'string',
              description: 'Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)',
            },
            policyId: {
              type: 'string',
              description: 'Policy ID from the URL in Infracost Cloud UI',
            },
            name: {
              type: 'string',
              description: 'Name for the tagging policy',
            },
            message: {
              type: 'string',
              description: 'The message to display in the PR comment',
            },
            prComment: {
              type: 'boolean',
              description: 'Whether to add a comment to the PR',
            },
            blockPr: {
              type: 'boolean',
              description: 'Whether to block the PR',
            },
            tags: {
              type: 'array',
              description: 'Array of tag definitions',
              items: {
                type: 'object',
                properties: {
                  key: { type: 'string', description: 'Tag key name' },
                  mandatory: { type: 'boolean', description: 'Whether the tag is required' },
                  valueType: {
                    type: 'string',
                    enum: ['ANY', 'LIST', 'REGEX'],
                    description: 'Value type: ANY (any value), LIST (predefined values), or REGEX (regex pattern)',
                  },
                  allowedValues: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of allowed values (for LIST type)',
                  },
                  allowedRegex: {
                    type: 'string',
                    description: 'Regex pattern for allowed values (for REGEX type)',
                  },
                  message: {
                    type: 'string',
                    description: 'Optional message to display if the tag is missing/invalid',
                  },
                },
                required: ['key', 'mandatory', 'valueType'],
              },
            },
            filters: {
              type: 'object',
              description: 'Filters to limit scope of the policy',
              properties: {
                repos: {
                  type: 'object',
                  description: 'Repository filters',
                  properties: {
                    include: { type: 'array', items: { type: 'string' } },
                    exclude: { type: 'array', items: { type: 'string' } },
                  },
                },
                projects: {
                  type: 'object',
                  description: 'Project filters',
                  properties: {
                    include: { type: 'array', items: { type: 'string' } },
                    exclude: { type: 'array', items: { type: 'string' } },
                  },
                },
                baseBranches: {
                  type: 'object',
                  description: 'Base branch filters',
                  properties: {
                    include: { type: 'array', items: { type: 'string' } },
                    exclude: { type: 'array', items: { type: 'string' } },
                  },
                },
                resources: {
                  type: 'object',
                  description: 'Resource filters',
                  properties: {
                    include: { type: 'array', items: { type: 'string' } },
                    exclude: { type: 'array', items: { type: 'string' } },
                  },
                },
              },
            },
          },
          required: ['policyId'],
        },
      },
      {
        name: 'infracost_cloud_delete_tagging_policy',
        description:
          'Delete a tagging policy from Infracost Cloud. Requires INFRACOST_SERVICE_TOKEN environment variable.',
        inputSchema: {
          type: 'object',
          properties: {
            orgSlug: {
              type: 'string',
              description: 'Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)',
            },
            policyId: {
              type: 'string',
              description: 'Policy ID to delete',
            },
          },
          required: ['policyId'],
        },
      },
      {
        name: 'infracost_cloud_list_guardrails',
        description:
          'List all guardrails in Infracost Cloud. Requires INFRACOST_SERVICE_TOKEN environment variable.',
        inputSchema: {
          type: 'object',
          properties: {
            orgSlug: {
              type: 'string',
              description: 'Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)',
            },
          },
          required: [],
        },
      },
      {
        name: 'infracost_cloud_get_guardrail',
        description:
          'Get a specific guardrail from Infracost Cloud. Requires INFRACOST_SERVICE_TOKEN environment variable.',
        inputSchema: {
          type: 'object',
          properties: {
            orgSlug: {
              type: 'string',
              description: 'Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)',
            },
            guardrailId: {
              type: 'string',
              description: 'Guardrail ID',
            },
          },
          required: ['guardrailId'],
        },
      },
      {
        name: 'infracost_cloud_create_guardrail',
        description:
          'Create cost guardrails in Infracost Cloud that notify stakeholders or block PRs when cost thresholds are exceeded. Requires INFRACOST_SERVICE_TOKEN environment variable.',
        inputSchema: {
          type: 'object',
          properties: {
            orgSlug: {
              type: 'string',
              description: 'Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)',
            },
            name: {
              type: 'string',
              description: 'Name for the guardrail',
            },
            scope: {
              type: 'object',
              description: 'Scope configuration',
              properties: {
                type: {
                  type: 'string',
                  enum: ['ALL_PROJECTS', 'REPO', 'PROJECT'],
                  description: 'Scope type for the guardrail',
                },
                repositories: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Repository names (for REPO scope)',
                },
                projects: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Project names (for PROJECT scope)',
                },
              },
              required: ['type'],
            },
            increaseThreshold: {
              type: 'number',
              description: 'Threshold for cost increases (monthly dollar amount)',
            },
            increasePercentThreshold: {
              type: 'number',
              description: 'Threshold for cost increases (percentage)',
            },
            totalThreshold: {
              type: 'number',
              description: 'Threshold for total cost (monthly dollar amount)',
            },
            message: {
              type: 'string',
              description: 'Custom message to display when threshold is exceeded',
            },
            webhookUrl: {
              type: 'string',
              description: 'Webhook URL to notify when threshold is exceeded',
            },
            blockPullRequest: {
              type: 'boolean',
              description: 'Whether to block PR when threshold is exceeded',
            },
            commentOnPullRequest: {
              type: 'boolean',
              description: 'Whether to comment on PR when threshold is exceeded',
            },
          },
          required: ['name', 'scope'],
        },
      },
      {
        name: 'infracost_cloud_update_guardrail',
        description:
          'Update an existing guardrail in Infracost Cloud. Requires INFRACOST_SERVICE_TOKEN environment variable.',
        inputSchema: {
          type: 'object',
          properties: {
            orgSlug: {
              type: 'string',
              description: 'Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)',
            },
            guardrailId: {
              type: 'string',
              description: 'Guardrail ID',
            },
            name: {
              type: 'string',
              description: 'Name for the guardrail',
            },
            filters: {
              type: 'array',
              description: 'Filters to limit scope of the guardrail',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: ['project', 'repository'],
                    description: 'Filter type',
                  },
                  value: { type: 'string', description: 'Filter value' },
                },
                required: ['type', 'value'],
              },
            },
            increaseThreshold: {
              type: 'number',
              description: 'Threshold for cost increases (monthly dollar amount)',
            },
            increasePercentThreshold: {
              type: 'number',
              description: 'Threshold for cost increases (percentage)',
            },
            totalThreshold: {
              type: 'number',
              description: 'Threshold for total cost (monthly dollar amount)',
            },
            message: {
              type: 'string',
              description: 'Custom message to display when threshold is exceeded',
            },
            webhookUrl: {
              type: 'string',
              description: 'Webhook URL to notify when threshold is exceeded',
            },
            blockPullRequest: {
              type: 'boolean',
              description: 'Whether to block PR when threshold is exceeded',
            },
            commentOnPullRequest: {
              type: 'boolean',
              description: 'Whether to comment on PR when threshold is exceeded',
            },
          },
          required: ['guardrailId'],
        },
      },
      {
        name: 'infracost_cloud_delete_guardrail',
        description:
          'Delete a guardrail from Infracost Cloud. Requires INFRACOST_SERVICE_TOKEN environment variable.',
        inputSchema: {
          type: 'object',
          properties: {
            orgSlug: {
              type: 'string',
              description: 'Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)',
            },
            guardrailId: {
              type: 'string',
              description: 'Guardrail ID to delete',
            },
          },
          required: ['guardrailId'],
        },
      },
      {
        name: 'infracost_cloud_upload_custom_properties',
        description:
          'Upload custom property values to Infracost Cloud via CSV for resource classification. Requires INFRACOST_SERVICE_TOKEN environment variable.',
        inputSchema: {
          type: 'object',
          properties: {
            orgSlug: {
              type: 'string',
              description: 'Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)',
            },
            csvData: {
              type: 'string',
              description: 'CSV data containing custom properties',
            },
          },
          required: ['csvData'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'infracost_breakdown': {
        const validatedArgs = BreakdownSchema.parse(args);
        return await tools.handleBreakdown(validatedArgs);
      }

      case 'infracost_diff': {
        const validatedArgs = DiffSchema.parse(args);
        return await tools.handleDiff(validatedArgs);
      }

      case 'infracost_output': {
        const validatedArgs = OutputSchema.parse(args);
        return await tools.handleOutput(validatedArgs);
      }

      case 'infracost_upload': {
        const validatedArgs = UploadSchema.parse(args);
        return await tools.handleUpload(validatedArgs);
      }

      case 'infracost_comment': {
        const validatedArgs = CommentSchema.parse(args);
        return await tools.handleComment(validatedArgs);
      }

      case 'infracost_cloud_list_tagging_policies': {
        const validatedArgs = ListTaggingPoliciesSchema.parse(args);
        return await tools.handleListTaggingPolicies(validatedArgs);
      }

      case 'infracost_cloud_get_tagging_policy': {
        const validatedArgs = GetTaggingPolicySchema.parse(args);
        return await tools.handleGetTaggingPolicy(validatedArgs);
      }

      case 'infracost_cloud_create_tagging_policy': {
        const validatedArgs = CreateTaggingPolicySchema.parse(args);
        return await tools.handleCreateTaggingPolicy(validatedArgs);
      }

      case 'infracost_cloud_update_tagging_policy': {
        const validatedArgs = UpdateTaggingPolicySchema.parse(args);
        return await tools.handleUpdateTaggingPolicy(validatedArgs);
      }

      case 'infracost_cloud_delete_tagging_policy': {
        const validatedArgs = DeleteTaggingPolicySchema.parse(args);
        return await tools.handleDeleteTaggingPolicy(validatedArgs);
      }

      case 'infracost_cloud_list_guardrails': {
        const validatedArgs = ListGuardrailsSchema.parse(args);
        return await tools.handleListGuardrails(validatedArgs);
      }

      case 'infracost_cloud_get_guardrail': {
        const validatedArgs = GetGuardrailSchema.parse(args);
        return await tools.handleGetGuardrail(validatedArgs);
      }

      case 'infracost_cloud_create_guardrail': {
        const validatedArgs = CreateGuardrailSchema.parse(args);
        return await tools.handleCreateGuardrail(validatedArgs);
      }

      case 'infracost_cloud_update_guardrail': {
        const validatedArgs = UpdateGuardrailSchema.parse(args);
        return await tools.handleUpdateGuardrail(validatedArgs);
      }

      case 'infracost_cloud_delete_guardrail': {
        const validatedArgs = DeleteGuardrailSchema.parse(args);
        return await tools.handleDeleteGuardrail(validatedArgs);
      }

      case 'infracost_cloud_upload_custom_properties': {
        const validatedArgs = UploadCustomPropertiesSchema.parse(args);
        return await tools.handleUploadCustomProperties(validatedArgs);
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new McpError(ErrorCode.InternalError, error.message);
    }
    throw error;
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Infracost MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
