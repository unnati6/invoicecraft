'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";

interface DeleteConfirmationDialogProps {
  onConfirm: () => void;
  itemName?: string;
  trigger?: ReactNode;
  triggerVariant?: ButtonProps['variant'];
  triggerSize?: ButtonProps['size'];
}

export function DeleteConfirmationDialog({
  onConfirm,
  itemName = "this item",
  trigger,
  triggerVariant = "destructive",
  triggerSize = "icon",
}: DeleteConfirmationDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant={triggerVariant} size={triggerSize}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete {itemName}</span>
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete {itemName} and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={triggerVariant === 'destructive' ? buttonVariants({variant: "destructive"}) : ""}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
// Helper from button.tsx - Shadcn doesn't export this
const buttonVariants = ({variant}: {variant: ButtonProps['variant']}) => {
    if (variant === "destructive") return "bg-destructive text-destructive-foreground hover:bg-destructive/90";
    return "";
}

DeleteConfirmationDialog.displayName = "DeleteConfirmationDialog";
