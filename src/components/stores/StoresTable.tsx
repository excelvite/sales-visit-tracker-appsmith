
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store, StoreCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/dateUtils";
import { getVisitLogsByStoreId, deleteStore } from "@/services/mockDataService";
import { CalendarPlus, Trash2, ArrowUpDown, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

interface StoresTableProps {
  stores: Store[];
  selectedStores: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectStore: (storeId: string, checked: boolean) => void;
  onStoreDeleted: () => void;
  canAddVisit: boolean;
  canAddStore: boolean;
  isVeterinaryPage?: boolean;
}

export function StoresTable({
  stores,
  selectedStores,
  onSelectAll,
  onSelectStore,
  onStoreDeleted,
  canAddVisit,
  canAddStore,
  isVeterinaryPage = false
}: StoresTableProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const getSpeciesDisplayName = (species?: string) => {
    if (!species) return "-";
    switch (species) {
      case "cat_only": return "Cat only";
      case "dog_only": return "Dog only";
      case "majority_dog": return "Majority dog";
      case "majority_cat": return "Majority cat";
      case "50_50": return "50/50";
      case "others": return "Others";
      default: return species;
    }
  };

  const getLastVisitDate = (storeId: string) => {
    const visits = getVisitLogsByStoreId(storeId);
    if (visits.length === 0) return null;
    
    return new Date(Math.max(...visits.map(v => v.date.getTime())));
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedStores = [...stores].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "region":
        aValue = (a.region || "").toLowerCase();
        bValue = (b.region || "").toLowerCase();
        break;
      case "area":
        aValue = (a.area || "").toLowerCase();
        bValue = (b.area || "").toLowerCase();
        break;
      case "state":
        aValue = (a.state || "").toLowerCase();
        bValue = (b.state || "").toLowerCase();
        break;
      case "species":
        aValue = getSpeciesDisplayName(a.species).toLowerCase();
        bValue = getSpeciesDisplayName(b.species).toLowerCase();
        break;
      case "salesperson":
        aValue = (a.salesperson || "Unassigned").toLowerCase();
        bValue = (b.salesperson || "Unassigned").toLowerCase();
        break;
      case "lastVisit":
        const aVisitDate = getLastVisitDate(a.id);
        const bVisitDate = getLastVisitDate(b.id);
        aValue = aVisitDate ? aVisitDate.getTime() : 0;
        bValue = bVisitDate ? bVisitDate.getTime() : 0;
        break;
      case "potential":
        aValue = "-";
        bValue = "-";
        break;
      case "visitStatus":
        aValue = "-";
        bValue = "-";
        break;
      case "updates":
        aValue = "-";
        bValue = "-";
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleDeleteStore = (storeId: string, storeName: string) => {
    deleteStore(storeId);
    onStoreDeleted();
    
    toast({
      title: `${isVeterinaryPage ? 'Clinic' : 'Store'} deleted`,
      description: `${storeName} has been removed from the system.`,
    });
  };

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <ArrowUpDown className="h-4 w-4" />
      </div>
    </TableHead>
  );

  const isAllSelected = sortedStores.length > 0 && selectedStores.size === sortedStores.length;
  const isIndeterminate = selectedStores.size > 0 && selectedStores.size < sortedStores.length;

  return (
    <div className="border rounded-md">
      <div className="max-h-[calc(100vh-300px)] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onSelectAll}
                  aria-label={`Select all ${isVeterinaryPage ? 'clinics' : 'stores'}`}
                  {...(isIndeterminate ? { 'data-state': 'indeterminate' } : {})}
                />
              </TableHead>
              <SortableHeader field="name">
                {isVeterinaryPage ? 'Clinic Name' : 'Store Name'}
              </SortableHeader>
              <SortableHeader field="region">Region</SortableHeader>
              <SortableHeader field="state">State</SortableHeader>
              <SortableHeader field="species">Species</SortableHeader>
              <SortableHeader field="potential">Potential</SortableHeader>
              <SortableHeader field="visitStatus">Visit Status</SortableHeader>
              <SortableHeader field="lastVisit">Last Visit</SortableHeader>
              <SortableHeader field="updates">Updates/Remarks</SortableHeader>
              <SortableHeader field="salesperson">Salesperson</SortableHeader>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStores.length > 0 ? (
              sortedStores.map((store) => {
                const lastVisitDate = getLastVisitDate(store.id);
                const isNewStore = store.isNew && 
                  (new Date().getTime() - new Date(store.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 7) < 1;
                const isSelected = selectedStores.has(store.id);
                
                return (
                  <TableRow 
                    key={store.id}
                    className={`cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-blue-50' : ''}`}
                    onClick={() => navigate(`/stores/${store.id}`)}
                  >
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => onSelectStore(store.id, checked as boolean)}
                        aria-label={`Select ${store.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {store.name}
                        {isNewStore && (
                          <Badge className="bg-sales-green text-white">New</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{store.region || "-"}</TableCell>
                    <TableCell>{store.state || "-"}</TableCell>
                    <TableCell>{getSpeciesDisplayName(store.species)}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      {lastVisitDate ? formatDate(lastVisitDate) : "No visits"}
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>{store.salesperson || "Unassigned"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                        {canAddVisit && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-sales-teal hover:text-teal-800 hover:bg-sales-teal/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/visits/new`, { state: { storeId: store.id } });
                            }}
                          >
                            <CalendarPlus className="h-4 w-4 mr-1" />
                            Log Visit
                          </Button>
                        )}
                        {canAddVisit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-sales-blue hover:text-blue-800 hover:bg-sales-blue/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/stores/${store.id}/edit`);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        )}
                        {canAddStore && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete {isVeterinaryPage ? 'Clinic' : 'Store'}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {store.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeleteStore(store.id, store.name)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-4 text-muted-foreground">
                  No {isVeterinaryPage ? 'clinics' : 'stores'} found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
