
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { deleteVisitLog } from "@/services/mockDataService";

interface VisitLogActionsProps {
  visitId: string;
  storeName: string;
  canEdit: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function VisitLogActions({ 
  visitId, 
  storeName, 
  canEdit, 
  onEdit, 
  onDelete 
}: VisitLogActionsProps) {
  const { toast } = useToast();

  const handleDelete = () => {
    deleteVisitLog(visitId);
    onDelete();
    
    toast({
      title: "Visit log deleted",
      description: `Visit log for ${storeName} has been removed.`,
    });
  };

  return (
    <div className="flex gap-1">
      {canEdit && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Visit Log</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this visit log for {storeName}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
