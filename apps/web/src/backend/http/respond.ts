// Toasts: an HX-Trigger event the Toaster island listens for.
import { trigger } from "@shift-stack/core/server"

export interface Toast {
  readonly kind?: "success" | "info" | "error"
  readonly message: string
  /** A button on the toast that posts to `url` (Undo). */
  readonly action?: { readonly label: string; readonly url: string }
}

/** Shows a toast in the browser, through the Toaster island. */
export const withToast = (toast: Toast) => trigger({ toast })
