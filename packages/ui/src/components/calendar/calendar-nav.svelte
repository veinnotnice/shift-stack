<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<nav
	{...restProps}
	bind:this={ref}
	class={cn("absolute top-0 right-0 z-10 flex items-center gap-1", className)}
>
	{@render children?.()}
</nav>
