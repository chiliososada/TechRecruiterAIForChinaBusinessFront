
import { ToasterToast, Action, actionTypes } from "./toast-types"
import { dispatchFunction } from "./toast-provider"

// A map of toast ids to their timeout ids
export const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// Update the reducer to handle state as an object with toasts array
export function reducer(state: { toasts: ToasterToast[] }, action: Action): { toasts: ToasterToast[] } {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return { toasts: [...state.toasts, action.toast] }
    case actionTypes.UPDATE_TOAST:
      return { 
        toasts: state.toasts.map((t) => 
          (t.id === action.toast.id ? { ...t, ...action.toast } : t)
        ) 
      }
    case actionTypes.DISMISS_TOAST:
      return { 
        toasts: state.toasts.map((t) => 
          (t.id === action.toastId ? { ...t, open: false } : t)
        ) 
      }
    case actionTypes.REMOVE_TOAST:
      return { 
        toasts: state.toasts.filter((t) => t.id !== action.toastId) 
      }
    default:
      return state
  }
}

export function addToRemoveQueue(toastId: string) {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    if (dispatchFunction.current) {
      dispatchFunction.current({
        type: actionTypes.REMOVE_TOAST,
        toastId: toastId,
      })
    }
  }, 1000)

  toastTimeouts.set(toastId, timeout)
}

export function genId() {
  return Math.random().toString(36).substring(2, 9)
}
