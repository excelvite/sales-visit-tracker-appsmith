
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { VisitLog, Store, VisitStatus, PotentialLevel } from "@/types";
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
import { formatRelativeDate } from "@/utils/dateUtils";
import { VisitLogActions } from "@/components/visits/VisitLogActions";
import { ArrowUpDown } from "lucide-react";

interface VisitsTableProps {
  visits: VisitLog[];
  stores: Store[];
  selectedVisits: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelectVisit: (visitId: string, checked: boolean) => void;
  onVisitDeleted: () => void;
  canEditVisit: boolean;
}

export function VisitsTable({
  visits,
  stores,
  selectedVisits,
  onSelectAll,
  onSelectVisit,
  onVisitDeleted,
  canEditVisit
}: VisitsTableProps) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const getStoreName = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    return store ? store.name : "Unknown Store";
  };

  const getIsExCustomer = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    return store?.isExCustomer || false;
  };

  const getStoreSalesperson = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    return store?.salesperson || "Unassigned";
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedVisits = [...visits].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "store":
        aValue = getStoreName(a.storeId).toLowerCase();
        bValue = getStoreName(b.storeId).toLowerCase();
        break;
      case "salesperson":
        aValue = getStoreSalesperson(a.storeId).toLowerCase();
        bValue = getStoreSalesperson(b.storeId).toLowerCase();
        break;
      case "date":
        aValue = a.date.getTime();
        bValue = b.date.getTime();
        break;
      case "status":
        aValue = a.visitStatus.join(",").toLowerCase();
        bValue = b.visitStatus.join(",").toLowerCase();
        break;
      case "type":
        aValue = a.visitType.toLowerCase();
        bValue = b.visitType.toLowerCase();
        break;
      case "potential":
        aValue = a.potentialLevel.toLowerCase();
        bValue = b.potentialLevel.toLowerCase();
        break;
      default:
        // Default sort by date (newest first)
        aValue = b.date.getTime();
        bValue = a.date.getTime();
        return aValue - bValue;
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

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

  const isAllSelected = sortedVisits.length > 0 && selectedVisits.size === sortedVisits.length;
  const isIndeterminate = selectedVisits.size > 0 && selectedVisits.size < sortedVisits.length;

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onSelectAll}
                aria-label="Select all visits"
                {...(isIndeterminate ? { 'data-state': 'indeterminate' } : {})}
              />
            </TableHead>
            <SortableHeader field="store">Store</SortableHeader>
            <SortableHeader field="salesperson">Salesperson</SortableHeader>
            <SortableHeader field="date">Date</SortableHeader>
            <SortableHeader field="status">Status</SortableHeader>
            <SortableHeader field="type">Type</SortableHeader>
            <SortableHeader field="potential">Potential</SortableHeader>
            <TableHead>Products</TableHead>
            <TableHead>Update/Remarks</TableHead>
            <TableHead>Next Steps</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedVisits.length > 0 ? (
            sortedVisits.map((visit) => {
              const isSelected = selectedVisits.has(visit.id);
              
              return (
                <TableRow 
                  key={visit.id}
                  className={`cursor-pointer hover:bg-muted/50 ${isSelected ? 'bg-blue-50' : ''}`}
                  onClick={() => navigate(`/stores/${visit.storeId}`)}
                >
                  <TableCell onClick={e => e.stopPropagation()}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => onSelectVisit(visit.id, checked as boolean)}
                      aria-label={`Select visit to ${getStoreName(visit.storeId)}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {getStoreName(visit.storeId)}
                    {getIsExCustomer(visit.storeId) && (
                      <Badge variant="outline" className="ml-2 bg-sales-red/10 text-sales-red border-sales-red/20">
                        Ex-Customer
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{getStoreSalesperson(visit.storeId)}</TableCell>
                  <TableCell>{formatRelativeDate(visit.date)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {visit.visitStatus.map((status) => (
                        <Badge
                          key={status}
                          variant="outline"
                          className={
                            status === VisitStatus.OPENED_ACCOUNT
                              ? "bg-sales-green/10 text-sales-green border-sales-green/20"
                              : status === VisitStatus.REJECTED_VISIT
                              ? "bg-sales-red/10 text-sales-red border-sales-red/20"
                              : status === VisitStatus.CLOSED_DOWN
                              ? "bg-sales-red/10 text-sales-red border-sales-red/20"
                              : status === VisitStatus.EX_CUSTOMER
                              ? "bg-sales-red/10 text-sales-red border-sales-red/20"
                              : "bg-sales-blue/10 text-sales-blue border-sales-blue/20"
                          }
                        >
                          {status.replace(/_/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {visit.visitType.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" 
                      className={
                        visit.potentialLevel === PotentialLevel.HIGH
                          ? "bg-sales-green/10 text-sales-green border-sales-green/20"
                          : visit.potentialLevel === PotentialLevel.MEDIUM
                          ? "bg-sales-amber/10 text-sales-amber border-sales-amber/20"
                          : visit.potentialLevel === PotentialLevel.LOW
                          ? "bg-sales-red/10 text-sales-red border-sales-red/20"
                          : ""
                      }
                    >
                      {visit.potentialLevel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {visit.productsPromoted.length > 0 
                      ? <span>{visit.productsPromoted.length} product{visit.productsPromoted.length > 1 ? 's' : ''}</span>
                      : <span className="text-muted-foreground">None</span>
                    }
                  </TableCell>
                  <TableCell>
                    {visit.notes 
                      ? <span className="truncate max-w-xs block">{visit.notes}</span>
                      : <span className="text-muted-foreground">None</span>
                    }
                  </TableCell>
                  <TableCell>
                    {visit.nextSteps 
                      ? <span className="truncate max-w-xs block">{visit.nextSteps}</span>
                      : <span className="text-muted-foreground">None</span>
                    }
                  </TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    <VisitLogActions
                      visitId={visit.id}
                      storeName={getStoreName(visit.storeId)}
                      canEdit={canEditVisit}
                      onEdit={() => navigate(`/visits/${visit.id}/edit`)}
                      onDelete={onVisitDeleted}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={11} className="text-center py-4 text-muted-foreground">
                No visit logs found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
