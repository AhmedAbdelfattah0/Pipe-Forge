export interface StepConfig {
  number: number;
  label: string;
  /** When true the step is rendered greyed out with a "(skipped)" label. */
  skipped?: boolean;
}
