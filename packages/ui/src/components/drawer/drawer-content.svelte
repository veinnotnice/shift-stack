<script lang="ts">
	import { Drawer as DrawerPrimitive } from "vaul-svelte";
	import { cn } from "#lib/utils.js";
	import type { WithoutChildrenOrChild } from "#lib/utils.js";
	import DrawerOverlay from "./drawer-overlay.svelte";
	import DrawerPortal from "./drawer-portal.svelte";
	import type { ComponentProps } from "svelte";

	let {
		ref = $bindable(null),
		class: className,
		portalProps,
		children,
		ondragstart,
		...restProps
	}: DrawerPrimitive.ContentProps & {
		portalProps?: WithoutChildrenOrChild<ComponentProps<typeof DrawerPortal>>;
	} = $props();

	// The finger drags the drawer, never a link or an image in it: the browser's own drag and drop would take the pointer
	// away mid-swipe (pointercancel), and the drawer would stay where the finger left it.
	const keepPointer = (event: DragEvent & { currentTarget: EventTarget & HTMLDivElement }) => {
		event.preventDefault();
		ondragstart?.(event);
	};

	// A swipe that ends on a link is a swipe, not a tap: the click the browser sends after it is swallowed before it
	// reaches the link (or HTMX), so the drawer closes without navigating.
	let pressedAt: { x: number; y: number } | null = null;
	const notePress = (event: PointerEvent) => {
		pressedAt = { x: event.clientX, y: event.clientY };
	};
	const swallowSwipe = (event: MouseEvent) => {
		const moved = pressedAt ? Math.hypot(event.clientX - pressedAt.x, event.clientY - pressedAt.y) : 0;
		pressedAt = null;
		if (moved > 10) {
			event.preventDefault();
			event.stopPropagation();
		}
	};
</script>

<DrawerPortal {...portalProps}>
	<DrawerOverlay />
	<DrawerPrimitive.Content
		bind:ref
		data-slot="drawer-content"
		class={cn(
			"text-foreground flex h-auto flex-col text-[15px] outline-none group/drawer-content fixed z-50",
			// From the bottom: the iOS sheet, on the elevated background.
			"data-[vaul-drawer-direction=bottom]:bg-(--elevated-background) data-[vaul-drawer-direction=bottom]:[--card:var(--elevated-card)] data-[vaul-drawer-direction=bottom]:mx-auto data-[vaul-drawer-direction=bottom]:max-w-md data-[vaul-drawer-direction=bottom]:rounded-t-[28px] data-[vaul-drawer-direction=bottom]:pb-[max(env(safe-area-inset-bottom),20px)] data-[vaul-drawer-direction=bottom]:shadow-[0_-8px_32px_-16px_color-mix(in_oklch,var(--shade),transparent_70%)] data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh]",
			// From a side: a floating panel of thick material with continuous corners, as the sidebars of iPadOS float
			// over the app. No border: the material and its shadow set it off.
			"data-[vaul-drawer-direction=left]:inset-y-2.5 data-[vaul-drawer-direction=left]:inset-s-2.5 data-[vaul-drawer-direction=right]:inset-y-2.5 data-[vaul-drawer-direction=right]:inset-e-2.5",
			"data-[vaul-drawer-direction=left]:w-[min(20rem,80vw)] data-[vaul-drawer-direction=right]:w-[min(20rem,80vw)]",
			"data-[vaul-drawer-direction=left]:bg-(--material-thick) data-[vaul-drawer-direction=right]:bg-(--material-thick) data-[vaul-drawer-direction=left]:backdrop-blur-2xl data-[vaul-drawer-direction=right]:backdrop-blur-2xl data-[vaul-drawer-direction=left]:backdrop-saturate-180 data-[vaul-drawer-direction=right]:backdrop-saturate-180",
			"data-[vaul-drawer-direction=left]:rounded-[34px] data-[vaul-drawer-direction=right]:rounded-[34px] supports-[corner-shape:squircle]:data-[vaul-drawer-direction=left]:rounded-[52px] supports-[corner-shape:squircle]:data-[vaul-drawer-direction=right]:rounded-[52px] supports-[corner-shape:squircle]:[corner-shape:squircle]",
			"data-[vaul-drawer-direction=left]:shadow-[inset_0_0_0_0.5px_light-dark(rgb(0_0_0/0.06),rgb(255_255_255/0.1)),0_24px_60px_-20px_rgb(0_0_0/0.35)] data-[vaul-drawer-direction=right]:shadow-[inset_0_0_0_0.5px_light-dark(rgb(0_0_0/0.06),rgb(255_255_255/0.1)),0_24px_60px_-20px_rgb(0_0_0/0.35)]",
			// vaul extends an edge-to-edge panel past the screen edge with an ::after in its background, for when the finger
			// pulls it too far. A floating panel has a gap there, where that extension would show as a bar.
			"data-[vaul-drawer-direction=left]:after:hidden data-[vaul-drawer-direction=right]:after:hidden",
			// vaul keeps the browser's hands off the drawer (touch-action: none), but that stops at a scroll container in
			// it (a long list): there the browser takes a sideways swipe for itself and cancels the drawer's drag halfway.
			// Inside a side drawer the browser may only scroll up and down; sideways belongs to the drawer.
			"data-[vaul-drawer-direction=left]:**:touch-pan-y data-[vaul-drawer-direction=right]:**:touch-pan-y",
			"data-[vaul-drawer-direction=left]:pt-[env(safe-area-inset-top)] data-[vaul-drawer-direction=right]:pt-[env(safe-area-inset-top)] data-[vaul-drawer-direction=left]:pb-[env(safe-area-inset-bottom)] data-[vaul-drawer-direction=right]:pb-[env(safe-area-inset-bottom)]",
			// From the top: the bottom sheet, mirrored.
			"data-[vaul-drawer-direction=top]:bg-(--elevated-background) data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-[28px] data-[vaul-drawer-direction=top]:pt-[env(safe-area-inset-top)]",
			className
		)}
		{...restProps}
		ondragstart={keepPointer}
		onpointerdowncapture={notePress}
		onclickcapture={swallowSwipe}
	>
		<div
			class="bg-muted-foreground/30 mx-auto mt-2 hidden h-[5px] w-9 shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block"
		></div>
		{@render children?.()}
	</DrawerPrimitive.Content>
</DrawerPortal>
