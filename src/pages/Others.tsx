
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole, StoreCategory, Store as StoreType } from "@/types";
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { formatDate } from "@/utils/dateUtils";
import { getStores, getVisitLogsByStoreId, addStore, deleteStore, exportToCSV, addVisitLogFromImport } from "@/services/mockDataService";
import { Store as StoreIcon, Search, FileUp, CalendarPlus, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImportDialog } from "@/components/ImportDialog";
import { BulkSelectActions } from "@/components/BulkSelectActions";
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

export function Others() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [stores, setStores] = useState<StoreType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Get stores with category OTHER, GROOMING, or BREEDING
    const allStores = getStores();
    const otherStores = allStores.filter(store => 
      store.category === StoreCategory.OTHER || 
      store.category === StoreCategory.GROOMING || 
      store.category === StoreCategory.BREEDING
    );
    setStores(otherStores);
  }, []);
  
  // Get unique states
  const states = ["ALL", ...new Set(stores.map(store => store.state))];

  const filteredStores = stores.filter(store => {
    // Filter by search term
    if (searchTerm && !store.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !store.region.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !store.area.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by state
    if (selectedState !== "ALL" && store.state !== selectedState) {
      return false;
    }
    
    return true;
  });
  
  const getLastVisitDate = (storeId: string) => {
    const visits = getVisitLogsByStoreId(storeId);
    if (visits.length === 0) return null;
    
    return new Date(Math.max(...visits.map(v => v.date.getTime())));
  };

  const canAddStore = currentUser?.role === UserRole.ADMIN;
  const canAddVisit = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SALES;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStores(new Set(filteredStores.map(store => store.id)));
    } else {
      setSelectedStores(new Set());
    }
  };

  const handleSelectStore = (storeId: string, checked: boolean) => {
    const newSelected = new Set(selectedStores);
    if (checked) {
      newSelected.add(storeId);
    } else {
      newSelected.delete(storeId);
    }
    setSelectedStores(newSelected);
  };

  const handleBulkDelete = () => {
    selectedStores.forEach(storeId => {
      deleteStore(storeId);
    });
    
    const allStores = getStores();
    const otherStores = allStores.filter(store => 
      store.category === StoreCategory.OTHER || 
      store.category === StoreCategory.GROOMING || 
      store.category === StoreCategory.BREEDING
    );
    setStores(otherStores);
    setSelectedStores(new Set());
    
    toast({
      title: "Stores deleted",
      description: `${selectedStores.size} store(s) have been removed from the system.`,
    });
  };

  const handleBulkExport = () => {
    const selectedStoreData = stores.filter(store => selectedStores.has(store.id));
    const result = exportToCSV(selectedStoreData, "selected-other-stores");
    
    toast({
      title: "Export successful",
      description: result,
    });
  };

  const handleImportSuccess = (data: any[]) => {
    data.forEach((item) => {
      const newStore: StoreType = {
        id: String(Date.now() + Math.random()),
        name: item.name || "Unknown Store",
        category: item.category || StoreCategory.OTHER,
        region: item.region || "",
        area: item.area || "",
        state: item.state || "Kuala Lumpur",
        address: item.address || "",
        city: item.city || "",
        zipCode: item.zipCode || "",
        phone: item.phone || "",
        email: item.email || "",
        picInfo: item.picInfo || "",
        salesperson: item.salesperson || "",
        isNew: true,
        createdAt: new Date(),
      };
      addStore(newStore);
    });
    
    const allStores = getStores();
    const otherStores = allStores.filter(store => 
      store.category === StoreCategory.OTHER || 
      store.category === StoreCategory.GROOMING || 
      store.category === StoreCategory.BREEDING
    );
    setStores(otherStores);
    
    toast({
      title: "Import successful",
      description: `${data.length} stores have been imported.`,
    });
    setImportDialogOpen(false);
  };

  const handleDeleteStore = (storeId: string, storeName: string) => {
    deleteStore(storeId);
    const allStores = getStores();
    const otherStores = allStores.filter(store => 
      store.category === StoreCategory.OTHER || 
      store.category === StoreCategory.GROOMING || 
      store.category === StoreCategory.BREEDING
    );
    setStores(otherStores);
    
    toast({
      title: "Store deleted",
      description: `${storeName} has been removed from the system.`,
    });
  };

  const isAllSelected = filteredStores.length > 0 && selectedStores.size === filteredStores.length;
  const isIndeterminate = selectedStores.size > 0 && selectedStores.size < filteredStores.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Other Stores</h1>
          <p className="text-muted-foreground">
            Master list of grooming salons, breeding farms, and other pet-related businesses
          </p>
        </div>
        <div className="flex gap-2">
          {canAddVisit && (
            <Button 
              className="bg-sales-teal hover:bg-teal-800"
              onClick={() => navigate("/visits/new")}
            >
              <CalendarPlus className="h-4 w-4 mr-2" /> Log Visit
            </Button>
          )}
          {canAddStore && (
            <>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setImportDialogOpen(true)}
              >
                <FileUp className="h-4 w-4" />
                Import
              </Button>
              <Button 
                className="bg-sales-blue hover:bg-blue-800"
                onClick={() => navigate("/stores/new", { state: { category: StoreCategory.OTHER } })}
              >
                <StoreIcon className="h-4 w-4 mr-2" /> Add New Store
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-[300px]"
          />
        </div>
        
        <Tabs defaultValue="ALL" value={selectedState} onValueChange={setSelectedState} className="w-full md:w-auto">
          <TabsList className="h-auto flex-wrap">
            {states.slice(0, 5).map(state => (
              <TabsTrigger key={state} value={state} className="py-1.5 px-3">
                {state}
              </TabsTrigger>
            ))}
            {states.length > 5 && (
              <Select value={states.length > 5 && !states.slice(0, 5).includes(selectedState) ? selectedState : undefined} onValueChange={setSelectedState}>
                <SelectTrigger className="h-8 border-0 px-2 py-1 text-sm">
                  <SelectValue placeholder="More..." />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {states.slice(5).map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </TabsList>
        </Tabs>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all stores"
                  {...(isIndeterminate ? { 'data-state': 'indeterminate' } : {})}
                />
              </TableHead>
              <TableHead>Store Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStores.length > 0 ? (
              filteredStores.map((store) => {
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
                        onCheckedChange={(checked) => handleSelectStore(store.id, checked as boolean)}
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
                    <TableCell>
                      <Badge variant="outline">
                        {store.category === StoreCategory.OTHER && store.otherCategoryName 
                          ? store.otherCategoryName 
                          : store.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{store.region}</TableCell>
                    <TableCell>{store.area}</TableCell>
                    <TableCell>{store.state}</TableCell>
                    <TableCell>
                      {lastVisitDate ? formatDate(lastVisitDate) : "No visits"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        {canAddVisit && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-sales-blue hover:text-blue-800 hover:bg-sales-blue/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/visits/new`, { state: { storeId: store.id } });
                              }}
                            >
                              Log Visit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-sales-teal hover:text-teal-800 hover:bg-sales-teal/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/stores/${store.id}/edit`);
                              }}
                            >
                              Edit
                            </Button>
                            {canAddStore && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Store</AlertDialogTitle>
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
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                  No stores found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <BulkSelectActions
        selectedCount={selectedStores.size}
        onClearSelection={() => setSelectedStores(new Set())}
        onBulkDelete={handleBulkDelete}
        onBulkExport={handleBulkExport}
        itemType="store"
      />

      <ImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        type="stores"
        onImport={handleImportSuccess}
      />
    </div>
  );
}

export default Others;
