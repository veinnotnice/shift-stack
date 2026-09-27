<script lang="ts">
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: CalendarPrimitive.CellProps = $props();
</script>

<CalendarPrimitive.Cell
	bind:ref
	class={cn(
		"relative flex w-(--cell-size) flex-col items-center gap-1 p-0 text-center focus-within:z-20",
		className
	)}
	{...restProps}
/>
