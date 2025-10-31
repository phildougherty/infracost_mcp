import type {
  InfracostConfig,
  TaggingPolicyList,
  TaggingPolicy,
  CreateTaggingPolicyRequest,
  UpdateTaggingPolicyRequest,
  GuardrailList,
  Guardrail,
  CreateGuardrailRequest,
  UpdateGuardrailRequest,
  UploadCustomPropertiesRequest,
  CommandResult,
} from './types.js';

const INFRACOST_CLOUD_API_BASE = 'https://api.infracost.io/v1';

export class InfracostCloudAPIClient {
  private serviceToken: string;

  constructor(config: InfracostConfig) {
    if (!config.serviceToken) {
      throw new Error('INFRACOST_SERVICE_TOKEN is required for Infracost Cloud API operations');
    }
    this.serviceToken = config.serviceToken;
  }

  async listTaggingPolicies(orgSlug: string): Promise<CommandResult> {
    try {
      const response = await fetch(
        `${INFRACOST_CLOUD_API_BASE}/orgs/${orgSlug}/tagging-policies`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.serviceToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API request failed with status ${response.status}: ${errorText}`,
        };
      }

      const data = (await response.json()) as TaggingPolicyList;

      return {
        success: true,
        output: JSON.stringify(data, null, 2),
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getTaggingPolicy(orgSlug: string, policyId: string): Promise<CommandResult> {
    try {
      const response = await fetch(
        `${INFRACOST_CLOUD_API_BASE}/orgs/${orgSlug}/tagging-policies/${policyId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.serviceToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API request failed with status ${response.status}: ${errorText}`,
        };
      }

      const data = (await response.json()) as { data: TaggingPolicy };

      return {
        success: true,
        output: JSON.stringify(data, null, 2),
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async createTaggingPolicy(
    orgSlug: string,
    request: CreateTaggingPolicyRequest
  ): Promise<CommandResult> {
    try {
      const response = await fetch(
        `${INFRACOST_CLOUD_API_BASE}/orgs/${orgSlug}/tagging-policies`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.serviceToken}`,
          },
          body: JSON.stringify({ data: { type: 'tagging-policies', attributes: request } }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API request failed with status ${response.status}: ${errorText}`,
        };
      }

      const data = await response.json();

      return {
        success: true,
        output: JSON.stringify(data, null, 2),
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async updateTaggingPolicy(
    orgSlug: string,
    policyId: string,
    request: UpdateTaggingPolicyRequest
  ): Promise<CommandResult> {
    try {
      const response = await fetch(
        `${INFRACOST_CLOUD_API_BASE}/orgs/${orgSlug}/tagging-policies/${policyId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.serviceToken}`,
          },
          body: JSON.stringify({ data: { type: 'tagging-policies', attributes: request } }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API request failed with status ${response.status}: ${errorText}`,
        };
      }

      const data = await response.json();

      return {
        success: true,
        output: JSON.stringify(data, null, 2),
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async deleteTaggingPolicy(orgSlug: string, policyId: string): Promise<CommandResult> {
    try {
      const response = await fetch(
        `${INFRACOST_CLOUD_API_BASE}/orgs/${orgSlug}/tagging-policies/${policyId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.serviceToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API request failed with status ${response.status}: ${errorText}`,
        };
      }

      return {
        success: true,
        output: 'Tagging policy deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async listGuardrails(orgSlug: string): Promise<CommandResult> {
    try {
      const response = await fetch(`${INFRACOST_CLOUD_API_BASE}/orgs/${orgSlug}/guardrails`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${this.serviceToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API request failed with status ${response.status}: ${errorText}`,
        };
      }

      const data = (await response.json()) as GuardrailList;

      return {
        success: true,
        output: JSON.stringify(data, null, 2),
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getGuardrail(orgSlug: string, guardrailId: string): Promise<CommandResult> {
    try {
      const response = await fetch(
        `${INFRACOST_CLOUD_API_BASE}/orgs/${orgSlug}/guardrails/${guardrailId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.serviceToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API request failed with status ${response.status}: ${errorText}`,
        };
      }

      const data = (await response.json()) as { data: Guardrail };

      return {
        success: true,
        output: JSON.stringify(data, null, 2),
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async createGuardrail(
    orgSlug: string,
    request: CreateGuardrailRequest
  ): Promise<CommandResult> {
    try {
      const response = await fetch(`${INFRACOST_CLOUD_API_BASE}/orgs/${orgSlug}/guardrails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.serviceToken}`,
        },
        body: JSON.stringify({ data: { type: 'guardrails', attributes: request } }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API request failed with status ${response.status}: ${errorText}`,
        };
      }

      const data = await response.json();

      return {
        success: true,
        output: JSON.stringify(data, null, 2),
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async updateGuardrail(
    orgSlug: string,
    guardrailId: string,
    request: UpdateGuardrailRequest
  ): Promise<CommandResult> {
    try {
      const response = await fetch(
        `${INFRACOST_CLOUD_API_BASE}/orgs/${orgSlug}/guardrails/${guardrailId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.serviceToken}`,
          },
          body: JSON.stringify({ data: { type: 'guardrails', attributes: request } }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API request failed with status ${response.status}: ${errorText}`,
        };
      }

      const data = await response.json();

      return {
        success: true,
        output: JSON.stringify(data, null, 2),
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async deleteGuardrail(orgSlug: string, guardrailId: string): Promise<CommandResult> {
    try {
      const response = await fetch(
        `${INFRACOST_CLOUD_API_BASE}/orgs/${orgSlug}/guardrails/${guardrailId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.serviceToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API request failed with status ${response.status}: ${errorText}`,
        };
      }

      return {
        success: true,
        output: 'Guardrail deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async uploadCustomProperties(
    orgSlug: string,
    request: UploadCustomPropertiesRequest
  ): Promise<CommandResult> {
    try {
      const response = await fetch(
        `${INFRACOST_CLOUD_API_BASE}/orgs/${orgSlug}/custom-properties`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/csv',
            Authorization: `Bearer ${this.serviceToken}`,
          },
          body: request.csvData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `API request failed with status ${response.status}: ${errorText}`,
        };
      }

      // Handle 204 No Content response (common for uploads)
      if (response.status === 204) {
        return {
          success: true,
          output: 'Custom properties uploaded successfully',
        };
      }

      // Try to parse JSON response if there is content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return {
          success: true,
          output: JSON.stringify(data, null, 2),
          data,
        };
      }

      // Fallback for non-JSON responses
      return {
        success: true,
        output: 'Custom properties uploaded successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
