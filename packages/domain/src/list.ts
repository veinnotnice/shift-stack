// A task list: a name, one of the iOS system colours, and a symbol.
import { Schema } from "effect"

export const ListId = Schema.String.pipe(Schema.brand("ListId"))
export type ListId = typeof ListId.Type

export const listColors = ["red", "orange", "yellow", "green", "mint", "teal", "blue", "indigo", "purple", "pink", "brown", "gray"] as const
export const ListColor = Schema.Literal(...listColors)
export type ListColor = typeof ListColor.Type

export const listIcons = ["list", "cart", "briefcase", "house", "heart", "book", "plane", "star", "gift", "dumbbell", "graduation", "paw"] as const
export const ListIcon = Schema.Literal(...listIcons)
export type ListIcon = typeof ListIcon.Type

export const ListName = Schema.Trim.pipe(Schema.minLength(1), Schema.maxLength(60))

export const TaskList = Schema.Struct({
  id: ListId,
  name: ListName,
  color: ListColor,
  icon: ListIcon,
  /** Order among the lists, ascending. */
  position: Schema.Number
})
export type TaskList = typeof TaskList.Type
