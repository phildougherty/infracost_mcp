import { z } from 'zod';
import type { InfracostConfig } from './types.js';
import {
  executeBreakdown,
  executeDiff,
  executeOutput,
  executeUpload,
  executeComment,
  checkInfracostInstalled,
} from './cli.js';
import { InfracostCloudAPIClient } from './api.js';

export const BreakdownSchema = z.object({
  path: z.string().describe('Path to Terraform directory or plan JSON file'),
  format: z.enum(['json', 'table', 'html']).optional().describe('Output format'),
  outFile: z.string().optional().describe('Save output to file'),
  terraformVarFile: z.array(z.string()).optional().describe('Terraform var file paths'),
  terraformVar: z.record(z.string()).optional().describe('Terraform variables as key-value pairs'),
});

export const DiffSchema = z.object({
  path: z.string().describe('Path to Terraform directory or plan JSON file'),
  compareTo: z.string().describe('Path to baseline Terraform directory or plan JSON file'),
  format: z.enum(['json', 'diff']).optional().describe('Output format'),
  outFile: z.string().optional().describe('Save output to file'),
});

export const OutputSchema = z.object({
  path: z.string().describe('Path to Infracost JSON file(s)'),
  format: z
    .enum([
      'json',
      'table',
      'html',
      'diff',
      'github-comment',
      'gitlab-comment',
      'azure-repos-comment',
      'bitbucket-comment',
    ])
    .optional()
    .describe('Output format'),
  outFile: z.string().optional().describe('Save output to file'),
  fields: z.array(z.string()).optional().describe('Fields to include in output'),
  showSkipped: z.boolean().optional().describe('Show skipped resources'),
});

export const UploadSchema = z.object({
  path: z.string().describe('Path to Infracost JSON file'),
});

export const CommentSchema = z.object({
  path: z.string().describe('Path to Infracost JSON file'),
  platform: z.enum(['github', 'gitlab', 'azure-repos', 'bitbucket']).describe('Git platform'),
  repo: z.string().optional().describe('Repository in format owner/repo'),
  pullRequest: z.string().optional().describe('Pull request number'),
  commit: z.string().optional().describe('Commit SHA'),
  tag: z.string().optional().describe('Tag for comment identification'),
  behavior: z
    .enum(['update', 'new', 'delete-and-new'])
    .optional()
    .describe('Comment behavior'),
});

export const UpdateTaggingPolicySchema = z.object({
  orgSlug: z.string().optional().describe('Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)'),
  policyId: z.string().describe('Policy ID from the URL in Infracost Cloud UI'),
  name: z.string().optional().describe('Name for the tagging policy'),
  message: z.string().optional().describe('The message to display in the PR comment'),
  prComment: z.boolean().optional().describe('Whether to add a comment to the PR'),
  blockPr: z.boolean().optional().describe('Whether to block the PR'),
  tags: z
    .array(
      z.object({
        key: z.string().describe('Tag key name'),
        mandatory: z.boolean().describe('Whether the tag is required'),
        valueType: z.enum(['ANY', 'LIST', 'REGEX']).describe('Value type: ANY (any value), LIST (predefined values), or REGEX (regex pattern)'),
        allowedValues: z.array(z.string()).optional().describe('List of allowed values (for LIST type)'),
        allowedRegex: z.string().optional().describe('Regex pattern for allowed values (for REGEX type)'),
        message: z.string().optional().describe('Optional message to display if the tag is missing/invalid'),
      })
    )
    .optional()
    .describe('Array of tag definitions'),
  filters: z
    .object({
      repos: z.object({
        include: z.array(z.string()).optional(),
        exclude: z.array(z.string()).optional(),
      }).optional().describe('Repository filters'),
      projects: z.object({
        include: z.array(z.string()).optional(),
        exclude: z.array(z.string()).optional(),
      }).optional().describe('Project filters'),
      baseBranches: z.object({
        include: z.array(z.string()).optional(),
        exclude: z.array(z.string()).optional(),
      }).optional().describe('Base branch filters'),
      resources: z.object({
        include: z.array(z.string()).optional(),
        exclude: z.array(z.string()).optional(),
      }).optional().describe('Resource filters'),
    })
    .optional()
    .describe('Filters to limit scope of the policy'),
});

export const CreateGuardrailSchema = z.object({
  orgSlug: z.string().optional().describe('Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)'),
  name: z.string().describe('Name for the guardrail'),
  scope: z
    .object({
      type: z
        .enum(['ALL_PROJECTS', 'REPO', 'PROJECT'])
        .describe('Scope type for the guardrail'),
      repositories: z.array(z.string()).optional().describe('Repository names (for REPO scope)'),
      projects: z.array(z.string()).optional().describe('Project names (for PROJECT scope)'),
    })
    .describe('Scope configuration'),
  increaseThreshold: z
    .number()
    .optional()
    .describe('Threshold for cost increases (monthly dollar amount)'),
  increasePercentThreshold: z
    .number()
    .optional()
    .describe('Threshold for cost increases (percentage)'),
  totalThreshold: z
    .number()
    .optional()
    .describe('Threshold for total cost (monthly dollar amount)'),
  message: z.string().optional().describe('Custom message to display when threshold is exceeded'),
  webhookUrl: z.string().optional().describe('Webhook URL to notify when threshold is exceeded'),
  blockPullRequest: z.boolean().optional().describe('Whether to block PR when threshold is exceeded'),
  commentOnPullRequest: z
    .boolean()
    .optional()
    .describe('Whether to comment on PR when threshold is exceeded'),
  emailRecipientOrgMemberIds: z
    .array(z.string())
    .optional()
    .describe('Array of organization member IDs to email'),
  mailingListEmails: z
    .array(z.string())
    .optional()
    .describe('Array of email addresses to notify'),
  msTeamsEmails: z
    .array(z.string())
    .optional()
    .describe('Array of MS Teams email addresses to notify'),
});

export const UploadCustomPropertiesSchema = z.object({
  orgSlug: z.string().optional().describe('Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)'),
  csvData: z.string().describe('CSV data containing custom properties'),
});

// New tagging policy schemas
export const ListTaggingPoliciesSchema = z.object({
  orgSlug: z.string().optional().describe('Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)'),
});

export const GetTaggingPolicySchema = z.object({
  orgSlug: z.string().optional().describe('Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)'),
  policyId: z.string().describe('Policy ID'),
});

export const CreateTaggingPolicySchema = z.object({
  orgSlug: z.string().optional().describe('Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)'),
  name: z.string().describe('Name for the tagging policy'),
  message: z.string().optional().describe('The message to display in the PR comment'),
  prComment: z.boolean().optional().describe('Whether to add a comment to the PR'),
  blockPr: z.boolean().optional().describe('Whether to block the PR'),
  tags: z
    .array(
      z.object({
        key: z.string().describe('Tag key name'),
        mandatory: z.boolean().describe('Whether the tag is required'),
        valueType: z.enum(['ANY', 'LIST', 'REGEX']).describe('Value type: ANY (any value), LIST (predefined values), or REGEX (regex pattern)'),
        allowedValues: z.array(z.string()).optional().describe('List of allowed values (for LIST type)'),
        allowedRegex: z.string().optional().describe('Regex pattern for allowed values (for REGEX type)'),
        message: z.string().optional().describe('Optional message to display if the tag is missing/invalid'),
      })
    )
    .describe('Array of tag definitions'),
  filters: z
    .object({
      repos: z.object({
        include: z.array(z.string()).optional(),
        exclude: z.array(z.string()).optional(),
      }).optional().describe('Repository filters'),
      projects: z.object({
        include: z.array(z.string()).optional(),
        exclude: z.array(z.string()).optional(),
      }).optional().describe('Project filters'),
      baseBranches: z.object({
        include: z.array(z.string()).optional(),
        exclude: z.array(z.string()).optional(),
      }).optional().describe('Base branch filters'),
      resources: z.object({
        include: z.array(z.string()).optional(),
        exclude: z.array(z.string()).optional(),
      }).optional().describe('Resource filters'),
    })
    .optional()
    .describe('Filters to limit scope of the policy'),
});

export const DeleteTaggingPolicySchema = z.object({
  orgSlug: z.string().optional().describe('Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)'),
  policyId: z.string().describe('Policy ID to delete'),
});

export const ListGuardrailsSchema = z.object({
  orgSlug: z.string().optional().describe('Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)'),
});

export const GetGuardrailSchema = z.object({
  orgSlug: z.string().optional().describe('Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)'),
  guardrailId: z.string().describe('Guardrail ID'),
});

export const UpdateGuardrailSchema = z.object({
  orgSlug: z.string().optional().describe('Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)'),
  guardrailId: z.string().describe('Guardrail ID'),
  name: z.string().optional().describe('Name for the guardrail'),
  scope: z
    .object({
      type: z
        .enum(['ALL_PROJECTS', 'REPO', 'PROJECT'])
        .describe('Scope type for the guardrail'),
      repositories: z.array(z.string()).optional().describe('Repository names (for REPO scope)'),
      projects: z.array(z.string()).optional().describe('Project names (for PROJECT scope)'),
    })
    .optional()
    .describe('Scope configuration'),
  increaseThreshold: z
    .number()
    .optional()
    .describe('Threshold for cost increases (monthly dollar amount)'),
  increasePercentThreshold: z
    .number()
    .optional()
    .describe('Threshold for cost increases (percentage)'),
  totalThreshold: z
    .number()
    .optional()
    .describe('Threshold for total cost (monthly dollar amount)'),
  message: z.string().optional().describe('Custom message to display when threshold is exceeded'),
  webhookUrl: z.string().optional().describe('Webhook URL to notify when threshold is exceeded'),
  blockPullRequest: z.boolean().optional().describe('Whether to block PR when threshold is exceeded'),
  commentOnPullRequest: z
    .boolean()
    .optional()
    .describe('Whether to comment on PR when threshold is exceeded'),
  emailRecipientOrgMemberIds: z
    .array(z.string())
    .optional()
    .describe('Array of organization member IDs to email'),
  mailingListEmails: z
    .array(z.string())
    .optional()
    .describe('Array of email addresses to notify'),
  msTeamsEmails: z
    .array(z.string())
    .optional()
    .describe('Array of MS Teams email addresses to notify'),
});

export const DeleteGuardrailSchema = z.object({
  orgSlug: z.string().optional().describe('Organization slug from Infracost Cloud (defaults to INFRACOST_ORG env var)'),
  guardrailId: z.string().describe('Guardrail ID to delete'),
});

export class InfracostTools {
  private config: InfracostConfig;
  private cloudApiClient?: InfracostCloudAPIClient;

  constructor(config: InfracostConfig) {
    this.config = config;
    if (config.serviceToken) {
      this.cloudApiClient = new InfracostCloudAPIClient(config);
    }
  }

  async handleBreakdown(args: z.infer<typeof BreakdownSchema>) {
    const isInstalled = await checkInfracostInstalled();
    if (!isInstalled) {
      throw new Error(
        'Infracost CLI is not installed. Please install it from https://www.infracost.io/docs/'
      );
    }

    const result = await executeBreakdown(args);

    if (!result.success) {
      throw new Error(result.error || 'Breakdown command failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output || 'Breakdown completed successfully',
        },
      ],
    };
  }

  async handleDiff(args: z.infer<typeof DiffSchema>) {
    const isInstalled = await checkInfracostInstalled();
    if (!isInstalled) {
      throw new Error(
        'Infracost CLI is not installed. Please install it from https://www.infracost.io/docs/'
      );
    }

    const result = await executeDiff(args);

    if (!result.success) {
      throw new Error(result.error || 'Diff command failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output || 'Diff completed successfully',
        },
      ],
    };
  }

  async handleOutput(args: z.infer<typeof OutputSchema>) {
    const isInstalled = await checkInfracostInstalled();
    if (!isInstalled) {
      throw new Error(
        'Infracost CLI is not installed. Please install it from https://www.infracost.io/docs/'
      );
    }

    const result = await executeOutput(args);

    if (!result.success) {
      throw new Error(result.error || 'Output command failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output || 'Output generated successfully',
        },
      ],
    };
  }

  async handleUpload(args: z.infer<typeof UploadSchema>) {
    const isInstalled = await checkInfracostInstalled();
    if (!isInstalled) {
      throw new Error(
        'Infracost CLI is not installed. Please install it from https://www.infracost.io/docs/'
      );
    }

    const result = await executeUpload(args);

    if (!result.success) {
      throw new Error(result.error || 'Upload command failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output || 'Upload completed successfully',
        },
      ],
    };
  }

  async handleComment(args: z.infer<typeof CommentSchema>) {
    const isInstalled = await checkInfracostInstalled();
    if (!isInstalled) {
      throw new Error(
        'Infracost CLI is not installed. Please install it from https://www.infracost.io/docs/'
      );
    }

    const result = await executeComment(args);

    if (!result.success) {
      throw new Error(result.error || 'Comment command failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output || 'Comment posted successfully',
        },
      ],
    };
  }

  async handleUpdateTaggingPolicy(args: z.infer<typeof UpdateTaggingPolicySchema>) {
    if (!this.cloudApiClient) {
      throw new Error('INFRACOST_SERVICE_TOKEN is not configured for Infracost Cloud API operations');
    }

    const orgSlug = args.orgSlug || this.config.orgSlug;
    if (!orgSlug) {
      throw new Error('Organization slug is required. Provide it via orgSlug parameter or set INFRACOST_ORG environment variable');
    }

    const { policyId, orgSlug: _, ...updateData } = args;
    const result = await this.cloudApiClient.updateTaggingPolicy(orgSlug, policyId, updateData);

    if (!result.success) {
      throw new Error(result.error || 'Update tagging policy request failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output || 'Tagging policy updated successfully',
        },
      ],
    };
  }

  async handleCreateGuardrail(args: z.infer<typeof CreateGuardrailSchema>) {
    if (!this.cloudApiClient) {
      throw new Error('INFRACOST_SERVICE_TOKEN is not configured for Infracost Cloud API operations');
    }

    const orgSlug = args.orgSlug || this.config.orgSlug;
    if (!orgSlug) {
      throw new Error('Organization slug is required. Provide it via orgSlug parameter or set INFRACOST_ORG environment variable');
    }

    const {
      orgSlug: _,
      scope,
      blockPullRequest,
      commentOnPullRequest,
      webhookUrl,
      emailRecipientOrgMemberIds,
      mailingListEmails,
      msTeamsEmails,
      ...rest
    } = args;

    let scopeString: string;
    if (scope.type === 'ALL_PROJECTS' || scope.type === 'REPO') {
      scopeString = 'REPO';
    } else {
      scopeString = 'PROJECT';
    }
    const filters: any = {};

    if (scope.repositories && scope.repositories.length > 0) {
      filters.repos = { include: scope.repositories };
    }
    if (scope.projects && scope.projects.length > 0) {
      filters.projects = { include: scope.projects };
    }

    const apiRequest = {
      ...rest,
      scope: scopeString,
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      webhookUrl: webhookUrl || '',
      prComment: commentOnPullRequest,
      blockPr: blockPullRequest,
      emailRecipientOrgMemberIds,
      mailingListEmails,
      msTeamsEmails,
    };

    const result = await this.cloudApiClient.createGuardrail(orgSlug, apiRequest);

    if (!result.success) {
      throw new Error(result.error || 'Create guardrail request failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output || 'Guardrail created successfully',
        },
      ],
    };
  }

  async handleUploadCustomProperties(args: z.infer<typeof UploadCustomPropertiesSchema>) {
    if (!this.cloudApiClient) {
      throw new Error('INFRACOST_SERVICE_TOKEN is not configured for Infracost Cloud API operations');
    }

    const orgSlug = args.orgSlug || this.config.orgSlug;
    if (!orgSlug) {
      throw new Error('Organization slug is required. Provide it via orgSlug parameter or set INFRACOST_ORG environment variable');
    }

    const { csvData } = args;
    const result = await this.cloudApiClient.uploadCustomProperties(orgSlug, { csvData });

    if (!result.success) {
      throw new Error(result.error || 'Upload custom properties request failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output || 'Custom properties uploaded successfully',
        },
      ],
    };
  }

  async handleListTaggingPolicies(args: z.infer<typeof ListTaggingPoliciesSchema>) {
    if (!this.cloudApiClient) {
      throw new Error('INFRACOST_SERVICE_TOKEN is not configured for Infracost Cloud API operations');
    }

    const orgSlug = args.orgSlug || this.config.orgSlug;
    if (!orgSlug) {
      throw new Error('Organization slug is required. Provide it via orgSlug parameter or set INFRACOST_ORG environment variable');
    }

    const result = await this.cloudApiClient.listTaggingPolicies(orgSlug);

    if (!result.success) {
      throw new Error(result.error || 'List tagging policies request failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output || 'Tagging policies retrieved successfully',
        },
      ],
    };
  }

  async handleGetTaggingPolicy(args: z.infer<typeof GetTaggingPolicySchema>) {
    if (!this.cloudApiClient) {
      throw new Error('INFRACOST_SERVICE_TOKEN is not configured for Infracost Cloud API operations');
    }

    const orgSlug = args.orgSlug || this.config.orgSlug;
    if (!orgSlug) {
      throw new Error('Organization slug is required. Provide it via orgSlug parameter or set INFRACOST_ORG environment variable');
    }

    const { policyId } = args;
    const result = await this.cloudApiClient.getTaggingPolicy(orgSlug, policyId);

    if (!result.success) {
      throw new Error(result.error || 'Get tagging policy request failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output || 'Tagging policy retrieved successfully',
        },
      ],
    };
  }

  async handleCreateTaggingPolicy(args: z.infer<typeof CreateTaggingPolicySchema>) {
    if (!this.cloudApiClient) {
      throw new Error('INFRACOST_SERVICE_TOKEN is not configured for Infracost Cloud API operations');
    }

    const orgSlug = args.orgSlug || this.config.orgSlug;
    if (!orgSlug) {
      throw new Error('Organization slug is required. Provide it via orgSlug parameter or set INFRACOST_ORG environment variable');
    }

    const { orgSlug: _, ...policyData } = args;
    const result = await this.cloudApiClient.createTaggingPolicy(orgSlug, policyData);

    if (!result.success) {
      throw new Error(result.error || 'Create tagging policy request failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output || 'Tagging policy created successfully',
        },
      ],
    };
  }

  async handleDeleteTaggingPolicy(args: z.infer<typeof DeleteTaggingPolicySchema>) {
    if (!this.cloudApiClient) {
      throw new Error('INFRACOST_SERVICE_TOKEN is not configured for Infracost Cloud API operations');
    }

    const orgSlug = args.orgSlug || this.config.orgSlug;
    if (!orgSlug) {
      throw new Error('Organization slug is required. Provide it via orgSlug parameter or set INFRACOST_ORG environment variable');
    }

    const { policyId } = args;
    const result = await this.cloudApiClient.deleteTaggingPolicy(orgSlug, policyId);

    if (!result.success) {
      throw new Error(result.error || 'Delete tagging policy request failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output || 'Tagging policy deleted successfully',
        },
      ],
    };
  }

  async handleListGuardrails(args: z.infer<typeof ListGuardrailsSchema>) {
    if (!this.cloudApiClient) {
      throw new Error('INFRACOST_SERVICE_TOKEN is not configured for Infracost Cloud API operations');
    }

    const orgSlug = args.orgSlug || this.config.orgSlug;
    if (!orgSlug) {
      throw new Error('Organization slug is required. Provide it via orgSlug parameter or set INFRACOST_ORG environment variable');
    }

    const result = await this.cloudApiClient.listGuardrails(orgSlug);

    if (!result.success) {
      throw new Error(result.error || 'List guardrails request failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output || 'Guardrails retrieved successfully',
        },
      ],
    };
  }

  async handleGetGuardrail(args: z.infer<typeof GetGuardrailSchema>) {
    if (!this.cloudApiClient) {
      throw new Error('INFRACOST_SERVICE_TOKEN is not configured for Infracost Cloud API operations');
    }

    const orgSlug = args.orgSlug || this.config.orgSlug;
    if (!orgSlug) {
      throw new Error('Organization slug is required. Provide it via orgSlug parameter or set INFRACOST_ORG environment variable');
    }

    const { guardrailId } = args;
    const result = await this.cloudApiClient.getGuardrail(orgSlug, guardrailId);

    if (!result.success) {
      throw new Error(result.error || 'Get guardrail request failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output || 'Guardrail retrieved successfully',
        },
      ],
    };
  }

  async handleUpdateGuardrail(args: z.infer<typeof UpdateGuardrailSchema>) {
    if (!this.cloudApiClient) {
      throw new Error('INFRACOST_SERVICE_TOKEN is not configured for Infracost Cloud API operations');
    }

    const orgSlug = args.orgSlug || this.config.orgSlug;
    if (!orgSlug) {
      throw new Error('Organization slug is required. Provide it via orgSlug parameter or set INFRACOST_ORG environment variable');
    }

    const {
      orgSlug: _,
      guardrailId,
      scope,
      blockPullRequest,
      commentOnPullRequest,
      emailRecipientOrgMemberIds,
      mailingListEmails,
      msTeamsEmails,
      ...rest
    } = args;

    const apiRequest: any = {
      ...rest,
    };

    if (scope) {
      if (scope.type === 'ALL_PROJECTS' || scope.type === 'REPO') {
        apiRequest.scope = 'REPO';
      } else {
        apiRequest.scope = 'PROJECT';
      }
      const filters: any = {};

      if (scope.repositories && scope.repositories.length > 0) {
        filters.repos = { include: scope.repositories };
      }
      if (scope.projects && scope.projects.length > 0) {
        filters.projects = { include: scope.projects };
      }

      if (Object.keys(filters).length > 0) {
        apiRequest.filters = filters;
      }
    }

    if (commentOnPullRequest !== undefined) {
      apiRequest.prComment = commentOnPullRequest;
    }
    if (blockPullRequest !== undefined) {
      apiRequest.blockPr = blockPullRequest;
    }
    if (emailRecipientOrgMemberIds !== undefined) {
      apiRequest.emailRecipientOrgMemberIds = emailRecipientOrgMemberIds;
    }
    if (mailingListEmails !== undefined) {
      apiRequest.mailingListEmails = mailingListEmails;
    }
    if (msTeamsEmails !== undefined) {
      apiRequest.msTeamsEmails = msTeamsEmails;
    }

    const result = await this.cloudApiClient.updateGuardrail(orgSlug, guardrailId, apiRequest);

    if (!result.success) {
      throw new Error(result.error || 'Update guardrail request failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output || 'Guardrail updated successfully',
        },
      ],
    };
  }

  async handleDeleteGuardrail(args: z.infer<typeof DeleteGuardrailSchema>) {
    if (!this.cloudApiClient) {
      throw new Error('INFRACOST_SERVICE_TOKEN is not configured for Infracost Cloud API operations');
    }

    const orgSlug = args.orgSlug || this.config.orgSlug;
    if (!orgSlug) {
      throw new Error('Organization slug is required. Provide it via orgSlug parameter or set INFRACOST_ORG environment variable');
    }

    const { guardrailId } = args;
    const result = await this.cloudApiClient.deleteGuardrail(orgSlug, guardrailId);

    if (!result.success) {
      throw new Error(result.error || 'Delete guardrail request failed');
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output || 'Guardrail deleted successfully',
        },
      ],
    };
  }
}
