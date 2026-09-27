// Lets views use hx-* attributes on any element. An app loads it once, from a .d.ts of its own:
//   import "@shift-stack/core/attributes"
import "svelte/elements"

declare module "svelte/elements" {
  export interface HTMLAttributes<T> {
    // `any`, not `string`: components that spread `Record<string, unknown>` props onto elements would no longer
    // type-check against a narrower hx-* signature.
    [attribute: `hx-${string}`]: any
  }
}
