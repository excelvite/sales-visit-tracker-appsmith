
import { VisitLog, VisitStatus, VisitType, PotentialLevel } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeDate } from "@/utils/dateUtils";
import { CalendarPlus, ArrowUpDown } from "lucide-react";
import { VisitLogActions } from "@/components/visits/VisitLogActions";
import { useState } from "react";

interface StoreVisitHistoryProps {
  visits: VisitLog[];
  storeName: string;
  canAddVisit: boolean;
  canEdit: boolean;
  onLogVisit: () => void;
  onEditVisit: (visitId: string) => void;
  onVisitDeleted: () => void;
  isVeterinaryClinic?: boolean;
}

export function StoreVisitHistory({
  visits,
  storeName,
  canAddVisit,
  canEdit,
  onLogVisit,
  onEditVisit,
  onVisitDeleted,
  isVeterinaryClinic = false
}: StoreVisitHistoryProps) {
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedVisits = [...visits].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "date":
        aValue = a.date.getTime();
        bValue = b.date.getTime();
        break;
      case "salesperson":
        aValue = a.userName.toLowerCase();
        bValue = b.userName.toLowerCase();
        break;
      case "potential":
        aValue = a.potentialLevel;
        bValue = b.potentialLevel;
        break;
      default:
        aValue = a.date.getTime();
        bValue = b.date.getTime();
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

  return (
    <Card className="lg:col-span-3">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Visit History</CardTitle>
        {canAddVisit && (
          <Button 
            className="bg-sales-blue hover:bg-blue-800"
            onClick={onLogVisit}
          >
            <CalendarPlus className="h-4 w-4 mr-2" /> Log Visit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {sortedVisits.length > 0 ? (
          <div className="rounded-md border max-h-[400px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white">
                <TableRow>
                  <SortableHeader field="date">Date</SortableHeader>
                  <SortableHeader field="salesperson">Salesperson</SortableHeader>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <SortableHeader field="potential">Potential</SortableHeader>
                  <TableHead className="min-w-[300px]">Update/Remarks</TableHead>
                  <TableHead className="min-w-[300px]">Next Steps</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedVisits.map((visit) => (
                  <TableRow key={visit.id}>
                    <TableCell>{formatRelativeDate(visit.date)}</TableCell>
                    <TableCell>{visit.userName}</TableCell>
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
                        {visit.visitType === VisitType.FOLLOW_UP 
                          ? "Non-Physical Follow Up" 
                          : visit.visitType.replace(/_/g, " ")}
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
                    <TableCell className="max-w-[300px]">
                      <div className="whitespace-pre-wrap break-words">
                        {visit.notes || <span className="text-muted-foreground">No remarks</span>}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="whitespace-pre-wrap break-words">
                        {visit.nextSteps || <span className="text-muted-foreground">No next steps</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <VisitLogActions
                        visitId={visit.id}
                        storeName={storeName}
                        canEdit={canEdit}
                        onEdit={() => onEditVisit(visit.id)}
                        onDelete={onVisitDeleted}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-10 text-center text-muted-foreground">
            <p>No visit history for this {isVeterinaryClinic ? "clinic" : "store"} yet.</p>
            {canAddVisit && (
              <Button 
                className="mt-4 bg-sales-blue hover:bg-blue-800"
                onClick={onLogVisit}
              >
                <CalendarPlus className="h-4 w-4 mr-2" /> Log First Visit
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
