import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

/**
 * Clean minimal form dialog using shadcn components
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls dialog visibility
 * @param {function} props.onClose - Callback when dialog closes
 * @param {string} props.title - Dialog title
 * @param {string} props.description - Optional description
 * @param {React.ReactNode} props.children - Form fields content
 * @param {function} props.onSubmit - Form submit handler
 * @param {string} props.submitText - Submit button text
 * @param {string} props.cancelText - Cancel button text
 * @param {boolean} props.isSubmitting - Loading state for submit button
 * @param {string} props.size - Dialog size (sm, md, lg, xl, 2xl)
 */
export default function FormModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  onSubmit,
  submitText = "Save",
  cancelText = "Cancel",
  isSubmitting = false,
  size = "lg",
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={sizeClasses[size]}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">{children}</div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {cancelText}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
