/**
 * validator.model.ts
 *
 * Data shapes for the Pipeline Validator feature (Task 22).
 */

export type ValidatorPlatform = 'ado' | 'gha';
export type IssueSeverity = 'critical' | 'warning' | 'info' | 'passing';

export interface ValidationIssue {
  severity: IssueSeverity;
  code: string;
  description: string;
  line?: number;
  suggestion: string;
  autoFixable: boolean;
}

/** Shape returned by POST /api/validator */
export interface ValidationResult {
  platform: ValidatorPlatform;
  healthScore: number;
  issues: ValidationIssue[];
}

/** Shape returned by POST /api/validator/fix */
// The endpoint returns a ZIP binary — handled directly in the service.
