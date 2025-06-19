
import * as React from "react"
import { ToasterToast } from "./toast-types"

export interface ToastContextType {
  toasts: ToasterToast[]
  toast: (props: Omit<ToasterToast, "id">) => {
    id: string
    dismiss: () => void
    update: (props: Omit<Partial<ToasterToast>, "id">) => void
  }
  dismiss: (toastId?: string) => void
}

export const ToastContext = React.createContext<ToastContextType>({
  toasts: [],
  toast: () => ({
    id: "",
    dismiss: () => {},
    update: () => {},
  }),
  dismiss: () => {},
})

export const useToast = () => {
  const context = React.useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}
