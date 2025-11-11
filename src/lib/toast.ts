import { toast } from "@/hooks/use-toast"

type ToastType = "success" | "error" | "warning" | "info"

export const showToast = ({
  type = "info",
  title,
  description,
  duration = 5000,
}: {
  type?: ToastType
  title: string
  description?: string
  duration?: number
}) => {
  const variant = type === "error" ? "destructive" : "default"
  
  toast({
    title,
    description,
    variant,
    duration,
  })
}

// Convenience methods for different toast types
export const toastSuccess = (title: string, description?: string) =>
  showToast({ type: "success", title, description })

export const toastError = (title: string, description?: string) =>
  showToast({ type: "error", title, description })

export const toastWarning = (title: string, description?: string) =>
  showToast({ type: "warning", title, description })

export const toastInfo = (title: string, description?: string) =>
  showToast({ type: "info", title, description })
