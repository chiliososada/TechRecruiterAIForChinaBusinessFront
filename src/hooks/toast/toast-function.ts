
import { ToasterToast } from "./toast-types";
import { dispatchFunction } from "./toast-provider";
import { actionTypes } from "./toast-types";
import { genId } from "./toast-reducer";

// Export the toast function for use outside the provider
export const toast = (props: Omit<ToasterToast, "id">) => {
  // Create a unique id for this toast
  const id = genId();
  
  // Use the dispatchFunction directly instead of the hook
  if (dispatchFunction.current) {
    dispatchFunction.current({
      type: actionTypes.ADD_TOAST,
      toast: {
        ...props,
        id,
        onOpenChange: (open) => {
          if (!open) {
            // Dismiss the toast if onOpenChange is called with open=false
            dispatchFunction.current({
              type: actionTypes.DISMISS_TOAST,
              toastId: id,
            });
          }
        },
      },
    });
  }
  
  // Return object with id, dismiss and update functions
  return {
    id,
    dismiss: () => {
      if (dispatchFunction.current) {
        dispatchFunction.current({
          type: actionTypes.DISMISS_TOAST,
          toastId: id,
        });
      }
    },
    update: (props: Omit<Partial<ToasterToast>, "id">) => {
      if (dispatchFunction.current) {
        dispatchFunction.current({
          type: actionTypes.UPDATE_TOAST,
          toast: { ...props, id },
        });
      }
    },
  };
};
