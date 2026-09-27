<script lang="ts" module>
	import { type VariantProps, tv } from "tailwind-variants";
	import { cn, type WithElementRef } from "#lib/utils.js";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";

	// The one button primitive, drawn the iOS way. Every size is a capsule, so no two buttons ever disagree on
	// their rounding; variants only change the fill. A press shrinks it a touch and dims it, like UIKit.
	export const buttonVariants = tv({
		base: "group/button inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-[-0.025em] outline-none select-none transition-[transform,filter,opacity,background-color] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.97] active:brightness-90 focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-40 motion-reduce:active:scale-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
		variants: {
			variant: {
				// Filled: the one prominent action on a screen.
				default: "bg-primary text-primary-foreground",
				// Grey fill, blue label: every other action (UIButton.Configuration.gray).
				secondary: "bg-muted text-primary",
				// Blue wash, blue label (UIButton.Configuration.tinted).
				tinted: "bg-primary/15 text-primary",
				// A grey glyph and nothing around it: quiet bar controls that should not pull the eye. Dims when pressed.
				neutral: "text-muted-foreground active:scale-100 active:brightness-100 active:opacity-40",
				// Material, for controls floating over content.
				glass: "glass text-foreground",
				// Text only (UIButton.Configuration.plain): dims instead of shrinking.
				plain: "text-primary active:scale-100 active:brightness-100 active:opacity-40",
				destructive: "bg-destructive/15 text-destructive",
				// shadcn names other components use, mapped onto the above.
				outline: "bg-muted text-primary",
				ghost: "text-foreground active:scale-100 active:brightness-100 active:opacity-40",
				link: "text-primary active:scale-100 active:brightness-100 active:opacity-40",
			},
			size: {
				// Large (50pt): the size of a screen's actions.
				default: "h-[50px] px-6 text-[17px]",
				lg: "h-[50px] px-6 text-[17px]",
				sm: "h-[34px] px-4 text-[15px]",
				xs: "h-7 px-3 text-[13px] [&_svg:not([class*='size-'])]:size-4",
				icon: "size-[50px]",
				"icon-lg": "size-[50px]",
				"icon-sm": "size-9",
				"icon-xs": "size-8 [&_svg:not([class*='size-'])]:size-4",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];
	export type ButtonSize = VariantProps<typeof buttonVariants>["size"];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = "default",
		size = "default",
		ref = $bindable(null),
		href = undefined,
		type = "button",
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? "link" : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
