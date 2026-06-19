export interface TermsField { name: string; type: string; offset?: number }
export interface TermsSchema {
  encoding: string;
  status: "verified" | "partial" | string;
  termsLength: number | string;
  fields: TermsField[];
  source?: string;
}
export interface Deployment {
  chainId: number;
  network: string;
  address: string;
  caip10: string;
  bytecodeVerified: boolean;
  note?: string;
}
export interface Enforcer {
  name: string;
  restricts: string[];
  termsSchema?: TermsSchema;
  deployments?: Deployment[];
}
export interface Seed {
  $comment?: string;
  class: string;
  sourceBase: string;
  enforcers: Enforcer[];
}
export interface Relationship { subject: string; predicate: string; object: string; reason?: string }
export interface Preset { name: string; intent: string; members: string[]; optional?: string[] }
export interface Composability {
  predicates: Record<string, string>;
  relationships: Relationship[];
  presets: Preset[];
}
