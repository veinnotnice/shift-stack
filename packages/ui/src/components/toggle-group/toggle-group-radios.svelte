<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import type { ToggleVariants } from "#ui/toggle/index.js";
	import { cn } from "#lib/utils.js";
	import { setToggleGroupCtx, toggleGroupClass } from "./toggle-group.svelte";

	// The toggle group as native radios: it looks the same, and works in a server-rendered form without JavaScript
	// (the form posts the checked value under the items' name). Use it for a choice the server should receive.
	let {
		class: className,
		size = "default",
		spacing = 0,
		variant = "default",
		children,
		...restProps
	}: HTMLAttributes<HTMLDivElement> & ToggleVariants & { spacing?: number } = $props();

	setToggleGroupCtx({
		get variant() {
			return variant;
		},
		get size() {
			return size;
		},
		get spacing() {
			return spacing;
		},
		orientation: "horizontal",
	});
</script>

<div
	role="radiogroup"
	data-slot="toggle-group"
	data-variant={variant}
	data-size={size}
	data-spacing={spacing}
	style={`--gap: ${spacing}`}
	class={cn(toggleGroupClass, className)}
	{...restProps}
>
	{@render children?.()}
</div>
