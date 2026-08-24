/** Education and certification, verbatim from docs/ui/README.md. */

export type Credential = {
  readonly range: string;
  readonly title: string;
  readonly detail?: string;
};

export const credentials: readonly Credential[] = [
  { range: '2004 — 2009', title: 'Florida Gulf Coast University', detail: 'Bachelors of Science' },
  { range: '2021 — 2024', title: 'AWS Certified Solutions Architect Professional' },
];
