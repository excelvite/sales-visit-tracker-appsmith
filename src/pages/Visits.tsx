
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole, VisitLog, Store, VisitStatus, PotentialLevel } from "@/types";
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
import { Input } from "@/components/ui/input";
import { formatRelativeDate } from "@/utils/dateUtils";
import { getVisitLogs, getStores, deleteVisitLog, exportToCSV, importStoreWithVisit } from "@/services/mockDataService";
import { CalendarPlus, Search, Filter, Edit, FileUp } from "lucide-react";
import { BulkSelectActions } from "@/components/BulkSelectActions";
import { ImportDialog } from "@/components/ImportDialog";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Visits() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [visits, setVisits] = useState<VisitLog[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterExCustomer, setFilterExCustomer] = useState<boolean | null>(null);
  const [selectedVisits, setSelectedVisits] = useState<Set<string>>(new Set());
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importType, setImportType] = useState<"visits" | "store-visits">("visits");
  
  useEffect(() => {
    setVisits(getVisitLogs());
    setStores(getStores());
  }, []);
  
  const getStoreName = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    return store ? store.name : "Unknown Store";
  };

  const getIsExCustomer = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    return store?.isExCustomer || false;
  };

  // Filter visits
  let filteredVisits = visits;

  // Apply search filter
  if (searchTerm) {
    filteredVisits = filteredVisits.filter(visit => {
      const storeName = getStoreName(visit.storeId).toLowerCase();
      return storeName.includes(searchTerm.toLowerCase()) ||
             visit.userName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }
  
  // Apply Ex-customer filter if set
  if (filterExCustomer !== null) {
    filteredVisits = filteredVisits.filter(visit => {
      const isExCustomer = getIsExCustomer(visit.storeId);
      return isExCustomer === filterExCustomer;
    });
  }
  
  const sortedVisits = [...filteredVisits].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  const canAddVisit = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SALES;
  const canEditVisit = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SALES;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVisits(new Set(sortedVisits.map(visit => visit.id)));
    } else {
      setSelectedVisits(new Set());
    }
  };

  const handleSelectVisit = (visitId: string, checked: boolean) => {
    const newSelected = new Set(selectedVisits);
    if (checked) {
      newSelected.add(visitId);
    } else {
      newSelected.delete(visitId);
    }
    setSelectedVisits(newSelected);
  };

  const handleBulkDelete = () => {
    selectedVisits.forEach(visitId => {
      deleteVisitLog(visitId);
    });
    
    setVisits(getVisitLogs());
    setSelectedVisits(new Set());
    
    toast({
      title: "Visits deleted",
      description: `${selectedVisits.size} visit(s) have been removed from the system.`,
    });
  };

  const handleBulkExport = () => {
    const selectedVisitData = visits.filter(visit => selectedVisits.has(visit.id));
    const result = exportToCSV(selectedVisitData, "selected-visits");
    
    toast({
      title: "Export successful",
      description: result,
    });
  };

  const handleImportSuccess = (data: any[]) => {
    if (importType === "store-visits") {
      // Import combined store and visit data
      let storesAdded = 0;
      let storesUpdated = 0;
      let visitsCreated = 0;
      
      data.forEach((item) => {
        // Import store data first with duplicate checking
        const result = importStoreWithVisit(item);
        if (result.storeAdded) storesAdded++;
        if (result.storeUpdated) storesUpdated++;
        if (result.visitCreated) visitsCreated++;
      });
      
      // Refresh data
      setVisits(getVisitLogs());
      setStores(getStores());
      
      toast({
        title: "Import successful",
        description: `${storesAdded} stores added, ${storesUpdated} stores updated, ${visitsCreated} visit logs created.`,
      });
    }
    
    setImportDialogOpen(false);
  };

  const isAllSelected = sortedVisits.length > 0 && selectedVisits.size === sortedVisits.length;
  const isIndeterminate = selectedVisits.size > 0 && selectedVisits.size < sortedVisits.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visit Logs</h1>
          <p className="text-muted-foreground">
            View and manage store visit records
          </p>
        </div>
        <div className="flex gap-2">
          {canAddVisit && (
            <>
              <Button 
                variant="outline"
                onClick={() => {
                  setImportType("store-visits");
                  setImportDialogOpen(true);
                }}
              >
                <FileUp className="h-4 w-4 mr-2" />
                Import Stores & Visits
              </Button>
              <Button 
                className="bg-sales-blue hover:bg-blue-800"
                onClick={() => navigate("/visits/new")}
              >
                <CalendarPlus className="h-4 w-4 mr-2" /> Log New Visit
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by store or salesperson..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              <Filter className="h-4 w-4 mr-2" /> 
              Filter
              {filterExCustomer !== null && <span className="ml-2 w-2 h-2 bg-sales-blue rounded-full"></span>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Customer Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filterExCustomer === true}
              onCheckedChange={() => {
                setFilterExCustomer(filterExCustomer === true ? null : true);
              }}
            >
              Ex-Customer
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filterExCustomer === false}
              onCheckedChange={() => {
                setFilterExCustomer(filterExCustomer === false ? null : false);
              }}
            >
              Current Customer
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={filterExCustomer === null}
              onCheckedChange={() => setFilterExCustomer(null)}
            >
              Show All
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all visits"
                  {...(isIndeterminate ? { 'data-state': 'indeterminate' } : {})}
                />
              </TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Salesperson</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Potential</TableHead>
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
                        onCheckedChange={(checked) => handleSelectVisit(visit.id, checked as boolean)}
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
                    <TableCell>{visit.userName}</TableCell>
                    <TableCell>{formatRelativeDate(new Date(visit.date))}</TableCell>
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
                    <TableCell>
                      {canEditVisit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/visits/${visit.id}/edit`);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
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

      <BulkSelectActions
        selectedCount={selectedVisits.size}
        onClearSelection={() => setSelectedVisits(new Set())}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        itemType="visit"
      />

      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        type={importType}
        onImport={handleImportSuccess}
      />
    </div>
  );
}

export default Visits;
