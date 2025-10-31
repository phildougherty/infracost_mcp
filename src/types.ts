export interface InfracostConfig {
  serviceToken?: string;
  apiKey?: string;
  orgSlug?: string;
}

export interface BreakdownOptions {
  path: string;
  format?: 'json' | 'table' | 'html';
  outFile?: string;
  terraformVarFile?: string[];
  terraformVar?: Record<string, string>;
}

export interface DiffOptions {
  path: string;
  compareTo: string;
  format?: 'json' | 'diff';
  outFile?: string;
}

export interface OutputOptions {
  path: string;
  format?: 'json' | 'table' | 'html' | 'diff' | 'github-comment' | 'gitlab-comment' | 'azure-repos-comment' | 'bitbucket-comment';
  outFile?: string;
  fields?: string[];
  showSkipped?: boolean;
}

export interface UploadOptions {
  path: string;
}

export interface CommentOptions {
  path: string;
  platform: 'github' | 'gitlab' | 'azure-repos' | 'bitbucket';
  repo?: string;
  pullRequest?: string;
  commit?: string;
  tag?: string;
  behavior?: 'update' | 'new' | 'delete-and-new';
}

export interface TaggingPolicyTag {
  key: string;
  mandatory: boolean;
  valueType: 'ANY' | 'LIST' | 'REGEX';
  allowedValues?: string[];
  allowedRegex?: string;
  message?: string;
}

export interface TaggingPolicyFilterSet {
  include?: string[];
  exclude?: string[];
}

export interface TaggingPolicyFilters {
  repos?: TaggingPolicyFilterSet;
  projects?: TaggingPolicyFilterSet;
  baseBranches?: TaggingPolicyFilterSet;
  resources?: TaggingPolicyFilterSet;
}

export interface TaggingPolicyAttributes {
  name: string;
  message?: string;
  filters?: TaggingPolicyFilters;
  prComment?: boolean;
  blockPr?: boolean;
  tags: TaggingPolicyTag[];
}

export interface TaggingPolicy {
  id: string;
  type: 'tagging-policies';
  attributes: TaggingPolicyAttributes;
}

export interface TaggingPolicyList {
  data: TaggingPolicy[];
}

export interface CreateTaggingPolicyRequest {
  name: string;
  message?: string;
  filters?: TaggingPolicyFilters;
  prComment?: boolean;
  blockPr?: boolean;
  tags: TaggingPolicyTag[];
}

export interface UpdateTaggingPolicyRequest {
  name?: string;
  message?: string;
  filters?: TaggingPolicyFilters;
  prComment?: boolean;
  blockPr?: boolean;
  tags?: TaggingPolicyTag[];
}

export interface GuardrailFilterSet {
  include?: string[];
  exclude?: string[];
}

export interface GuardrailFilters {
  repos?: GuardrailFilterSet;
  projects?: GuardrailFilterSet;
  baseBranches?: GuardrailFilterSet;
  resources?: GuardrailFilterSet;
}

export interface GuardrailAttributes {
  name: string;
  scope: string;
  filters?: GuardrailFilters;
  increaseThreshold?: number;
  increasePercentThreshold?: number;
  totalThreshold?: number;
  message?: string;
  webhookUrl?: string;
  prComment?: boolean;
  blockPr?: boolean;
  emailRecipientOrgMemberIds?: string[];
  mailingListEmails?: string[];
  msTeamsEmails?: string[];
}

export interface Guardrail {
  id: string;
  type: 'guardrail';
  attributes: GuardrailAttributes;
}

export interface GuardrailList {
  data: Guardrail[];
}

export interface CreateGuardrailRequest {
  name: string;
  scope: string;
  filters?: GuardrailFilters;
  increaseThreshold?: number;
  increasePercentThreshold?: number;
  totalThreshold?: number;
  message?: string;
  webhookUrl: string; // Required by API (use empty string if not needed)
  prComment?: boolean;
  blockPr?: boolean;
  emailRecipientOrgMemberIds?: string[];
  mailingListEmails?: string[];
  msTeamsEmails?: string[];
}

export interface UpdateGuardrailRequest {
  name?: string;
  scope?: string;
  filters?: GuardrailFilters;
  increaseThreshold?: number;
  increasePercentThreshold?: number;
  totalThreshold?: number;
  message?: string;
  webhookUrl?: string;
  prComment?: boolean;
  blockPr?: boolean;
  emailRecipientOrgMemberIds?: string[];
  mailingListEmails?: string[];
  msTeamsEmails?: string[];
}

export interface UploadCustomPropertiesRequest {
  csvData: string;
}

export interface CommandResult {
  success: boolean;
  output?: string;
  error?: string;
  data?: unknown;
}
