/**
 * diagnose.model.ts
 *
 * Data shapes for the AI Error Diagnosis feature (Task 23).
 */

/** Shape returned by POST /api/diagnose */
export interface DiagnoseResult {
  errorType: string;
  rootCause: string;
  fix: string;
  canAutoFix: boolean;
  updatedConfig?: Record<string, unknown>;
}

/** Shape sent to POST /api/diagnose */
export interface DiagnoseRequest {
  generationId: string;
  errorLog: string;
}

/** Shape sent to POST /api/diagnose/regenerate */
export interface RegenerateRequest {
  generationId: string;
  updatedConfig: Record<string, unknown>;
}
