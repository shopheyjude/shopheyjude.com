export async function resolve(spec, ctx, next) {
  if (spec === "cloudflare:email") return { url: "data:text/javascript,export class EmailMessage{constructor(f,t,r){this.from=f;this.to=t;this.raw=r}}", shortCircuit: true };
  return next(spec, ctx);
}
export async function load(url, ctx, next) {
  if (url.endsWith(".json")) return { format: "json", source: (await import("node:fs")).readFileSync(new URL(url)), shortCircuit: true };
  return next(url, ctx);
}
