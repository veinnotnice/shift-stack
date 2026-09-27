<script lang="ts">
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAttributes } from "svelte/elements";

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();
</script>

<div
	bind:this={ref}
	data-slot="drawer-header"
	class={cn(
		"gap-0.5 px-4 pt-3 pb-2 md:gap-0.5 md:text-left flex flex-col group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center",
		className
	)}
	{...restProps}
>
	{@render children?.()}
</div>
