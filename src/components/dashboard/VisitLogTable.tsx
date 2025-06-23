
import { VisitLog, Store, VisitStatus } from "@/types";
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
import { useNavigate } from "react-router-dom";

interface VisitLogTableProps {
  visits: VisitLog[];
  stores: Store[];
  title?: string;
  limit?: number;
}

export function VisitLogTable({
  visits,
  stores,
  title = "Recent Visits",
  limit = 5,
}: VisitLogTableProps) {
  const navigate = useNavigate();
  
  // Get store names
  const getStoreName = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    return store ? store.name : "Unknown Store";
  };
  
  // Check if store is an ex-customer
  const getIsExCustomer = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    return store?.isExCustomer || false;
  };

  // Sort visits by date (newest first) and limit
  const sortedVisits = [...visits]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{title}</h3>
        <button 
          className="text-sm text-sales-blue hover:underline"
          onClick={() => navigate("/visits")}
        >
          View all
        </button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>Salesperson</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedVisits.length > 0 ? (
              sortedVisits.map((visit) => (
                <TableRow 
                  key={visit.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/stores/${visit.storeId}`)}
                >
                  <TableCell className="font-medium">
                    {getStoreName(visit.storeId)}
                    {getIsExCustomer(visit.storeId) && (
                      <Badge variant="outline" className="ml-2 bg-sales-red/10 text-sales-red border-sales-red/20">
                        Ex-Customer
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{visit.userName}</TableCell>
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
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No visits recorded yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default VisitLogTable;
