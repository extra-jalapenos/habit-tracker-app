import type { Issue } from '@jetbrains/youtrack-workflow-types/workflowTypeScriptStubs';

/**
 * App-specific extension properties for Issue
 */
export type IssueExtensionProperties = {
  customNote?: string;
};

/**
 * Extended Issue with app-specific extension properties
 */
export type ExtendedIssue = Omit<Issue, 'extensionProperties'> & {
  extensionProperties: IssueExtensionProperties;
};

declare module '@jetbrains/youtrack-workflow-types/workflowTypeScriptStubs' {
  interface ExtensionPropertiesRegistry {
    Issue: IssueExtensionProperties;
  }
}

/**
 * Map of entity types to their extended versions
 * Extended types have extension properties, others are 'never'
 */
export type ExtendedProperties = {
  Issue: ExtendedIssue;
  Project: never;
  Article: never;
  User: never;
  AppGlobalStorage: never;
};