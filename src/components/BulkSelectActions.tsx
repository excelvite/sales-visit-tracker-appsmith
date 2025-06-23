
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Download, X } from "lucide-react";
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

interface BulkSelectActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  itemType: string;
}

export function BulkSelectActions({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkExport,
  itemType
}: BulkSelectActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center gap-4 z-50">
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        {selectedCount} {itemType}{selectedCount > 1 ? 's' : ''} selected
      </Badge>
      
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onBulkExport}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Download className="h-4 w-4 mr-1" />
          Export
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {itemType}s</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {selectedCount} {itemType}{selectedCount > 1 ? 's' : ''}? 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={onBulkDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete {selectedCount} {itemType}{selectedCount > 1 ? 's' : ''}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
