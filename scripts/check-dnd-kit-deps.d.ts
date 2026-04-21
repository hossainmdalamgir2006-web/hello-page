// Allow importing .mjs scripts (e.g. ./scripts/*.mjs) from TS files
// without per-file declarations.
declare module "*.mjs" {
  const value: any;
  export = value;
}
