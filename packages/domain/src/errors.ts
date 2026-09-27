// What can go wrong in the business logic, as values. The http layer turns these into responses.
import { Data } from "effect"
import type { ListId } from "./list.ts"
import type { SubtaskId, TaskId } from "./task.ts"

export class TaskNotFound extends Data.TaggedError("TaskNotFound")<{ readonly id: TaskId }> {}

export class SubtaskNotFound extends Data.TaggedError("SubtaskNotFound")<{
  readonly taskId: TaskId
  readonly id: SubtaskId
}> {}

export class ListNotFound extends Data.TaggedError("ListNotFound")<{ readonly id: ListId }> {}

/** The last list can't be deleted: every task needs a list. */
export class LastListRemaining extends Data.TaggedError("LastListRemaining")<{ readonly id: ListId }> {}
