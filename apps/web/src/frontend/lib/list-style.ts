// How a list looks: its colour as an iOS system colour, its symbol as an icon.
import Book from "@lucide/svelte/icons/book-open"
import Briefcase from "@lucide/svelte/icons/briefcase"
import Dumbbell from "@lucide/svelte/icons/dumbbell"
import Gift from "@lucide/svelte/icons/gift"
import GraduationCap from "@lucide/svelte/icons/graduation-cap"
import Heart from "@lucide/svelte/icons/heart"
import House from "@lucide/svelte/icons/house"
import List from "@lucide/svelte/icons/list"
import PawPrint from "@lucide/svelte/icons/paw-print"
import Plane from "@lucide/svelte/icons/plane"
import ShoppingCart from "@lucide/svelte/icons/shopping-cart"
import Star from "@lucide/svelte/icons/star"
import type { Component } from "svelte"
import type { ListColor, ListIcon } from "@testin/domain/list"

/** The CSS colour of a list, following light and dark. */
export const listColor = (color: ListColor): string => `var(--ios-${color})`

export const listIcons: Record<ListIcon, Component<any>> = {
  list: List,
  cart: ShoppingCart,
  briefcase: Briefcase,
  house: House,
  heart: Heart,
  book: Book,
  plane: Plane,
  star: Star,
  gift: Gift,
  dumbbell: Dumbbell,
  graduation: GraduationCap,
  paw: PawPrint
}
