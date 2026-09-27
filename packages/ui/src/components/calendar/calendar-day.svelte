<script lang="ts">
	import { Calendar as CalendarPrimitive } from "bits-ui";
	import { cn } from "#lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: CalendarPrimitive.DayProps = $props();
</script>

<CalendarPrimitive.Day
	bind:ref
	class={cn(
		"relative flex size-(--cell-size) items-center justify-center rounded-(--cell-radius) p-0 text-[19px] leading-none tracking-[-0.02em] font-normal whitespace-nowrap select-none outline-none transition-colors duration-150",
		"data-[today]:font-semibold data-[today]:text-destructive",
		"data-[selected]:bg-foreground data-[selected]:font-semibold data-[selected]:text-background",
		"data-[today]:data-[selected]:bg-destructive data-[today]:data-[selected]:text-white",
		"[&[data-outside-month]:not([data-selected])]:text-tertiary-foreground",
		"data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
		"data-[unavailable]:text-tertiary-foreground data-[unavailable]:line-through",
		"focus-visible:ring-3 focus-visible:ring-ring/40",
		className
	)}
	{...restProps}
/>
