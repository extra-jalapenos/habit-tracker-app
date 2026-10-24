import type { ExtendedIssue } from './extended-entities.js';

/**
 * Issue context with extended entity (includes extension properties)
 */
export type ExtendedIssueCtx<T extends import('@jetbrains/youtrack-apps-tools/dx').IssueCtx> =
  Omit<T, 'issue'> & { issue: ExtendedIssue };


