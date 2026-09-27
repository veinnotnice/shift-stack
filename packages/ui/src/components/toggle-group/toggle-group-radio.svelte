<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { toggleVariants } from "#ui/toggle/index.js";
	import { cn } from "#lib/utils.js";
	import { getToggleGroupCtx } from "./toggle-group.svelte";

	// One choice of a RadioGroup: a label drawn as the toggle, around a visually hidden radio that holds the state.
	let {
		class: className,
		style,
		children,
		"aria-label": ariaLabel,
		...inputProps
	}: Omit<HTMLInputAttributes, "type" | "children"> & { children?: Snippet } = $props();

	const ctx = getToggleGroupCtx();
</script>

<label
	data-slot="toggle-group-item"
	data-variant={ctx.variant}
	data-size={ctx.size}
	data-spacing={ctx.spacing}
	{style}
	class={cn("shrink-0 cursor-pointer", toggleVariants({ variant: ctx.variant, size: ctx.size }), className)}
>
	<input type="radio" class="sr-only" aria-label={ariaLabel} {...inputProps} />
	{@render children?.()}
</label>
