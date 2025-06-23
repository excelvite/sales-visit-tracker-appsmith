import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole, StoreCategory, Store as StoreType } from "@/types";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/dateUtils";
import { getStores, getVisitLogsByStoreId, addStore, deleteStore, exportToCSV, addVisitLogFromImport } from "@/services/mockDataService";
import { Store as StoreIcon, CalendarPlus, FileUp } from "lucide-react";
import { ImportDialog } from "@/components/ImportDialog";
import { BulkSelectActions } from "@/components/BulkSelectActions";
import { useToast } from "@/hooks/use-toast";
import { StoresFilters } from "@/components/stores/StoresFilters";
import { StoresTable } from "@/components/stores/StoresTable";

const Stores = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [stores, setStores] = useState<StoreType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSalesperson, setSelectedSalesperson] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("ALL");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importType, setImportType] = useState<"stores" | "store-updates">("stores");
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set());

  useEffect(() => {
    const allStores = getStores();
    const petStores = allStores.filter(store => store.category === StoreCategory.PET_STORE);
    // Sort alphabetically by default
    petStores.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    setStores(petStores);
  }, []);
  
  // Get unique states - ensure we filter out undefined/null values
  const states = ["ALL", ...new Set(stores.map(store => store.state).filter(state => state && state.trim() !== ""))];

  const filteredStores = stores.filter(store => {
    // Filter by search term
    if (searchTerm && !store.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !(store.region || "").toLowerCase().includes(searchTerm.toLowerCase()) &&
        !(store.area || "").toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by state
    if (selectedState !== "ALL" && store.state !== selectedState) {
      return false;
    }

    // Filter by category
    if (selectedCategory !== "all" && store.category !== selectedCategory) {
      return false;
    }

    // Filter by salesperson
    if (selectedSalesperson !== "all" && store.salesperson !== selectedSalesperson) {
      return false;
    }

    // Filter by region
    if (selectedRegion !== "all" && store.region !== selectedRegion) {
      return false;
    }
    
    return true;
  });

  const canAddStore = currentUser?.role === UserRole.ADMIN;
  const canAddVisit = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SALES;

  const hasActiveFilters = selectedCategory !== "all" || selectedSalesperson !== "all" || selectedRegion !== "all" || selectedState !== "ALL";

  const handleClearFilters = () => {
    setSelectedCategory("all");
    setSelectedSalesperson("all");
    setSelectedRegion("all");
    setSelectedState("ALL");
  };

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

  const handleStoreDeleted = () => {
    const allStores = getStores();
    const petStores = allStores.filter(store => store.category === StoreCategory.PET_STORE);
    petStores.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    setStores(petStores);
    setSelectedStores(new Set());
  };

  const handleBulkDelete = () => {
    selectedStores.forEach(storeId => {
      deleteStore(storeId);
    });
    
    handleStoreDeleted();
    
    toast({
      title: "Stores deleted",
      description: `${selectedStores.size} store(s) have been removed from the system.`,
    });
  };

  const handleBulkExport = () => {
    const selectedStoreData = stores.filter(store => selectedStores.has(store.id));
    const result = exportToCSV(selectedStoreData, "selected-pet-stores");
    
    toast({
      title: "Export successful",
      description: result,
    });
  };

  const handleImportSuccess = (data: any[]) => {
    if (importType === "stores") {
      let addedCount = 0;
      let updatedCount = 0;
      
      data.forEach((item) => {
        const existingStores = getStores();
        const existingStore = existingStores.find(s => 
          s.name.toLowerCase().trim() === item.name.toLowerCase().trim() &&
          s.category === item.category
        );
        
        if (existingStore) {
          updatedCount++;
        } else {
          addedCount++;
        }
        
        const newStore: StoreType = {
          id: existingStore ? existingStore.id : String(Date.now() + Math.random()),
          name: item.name || "Unknown Store",
          category: item.category || StoreCategory.PET_STORE,
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
          isNew: !existingStore,
          createdAt: existingStore ? existingStore.createdAt : new Date()
        };
        addStore(newStore);
      });
      
      const allStores = getStores();
      const petStores = allStores.filter(store => store.category === StoreCategory.PET_STORE);
      petStores.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
      setStores(petStores);
      
      toast({
        title: "Import successful",
        description: `${addedCount} stores added, ${updatedCount} stores updated.`,
      });
    } else if (importType === "store-updates") {
      data.forEach((visitData) => {
        addVisitLogFromImport(visitData);
      });
      
      toast({
        title: "Store updates imported",
        description: `${data.length} visit logs have been created from store updates.`,
      });
    }
    
    setImportDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pet Stores</h1>
          <p className="text-muted-foreground">
            Master list of pet stores and retailers in your territory
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
                onClick={() => {
                  setImportType("stores");
                  setImportDialogOpen(true);
                }}
              >
                <FileUp className="h-4 w-4" />
                Import Stores
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => {
                  setImportType("store-updates");
                  setImportDialogOpen(true);
                }}
              >
                <FileUp className="h-4 w-4" />
                Import Updates
              </Button>
              <Button 
                className="bg-sales-blue hover:bg-blue-800"
                onClick={() => navigate("/stores/new", { state: { category: StoreCategory.PET_STORE } })}
              >
                <StoreIcon className="h-4 w-4 mr-2" /> Add Store
              </Button>
            </>
          )}
        </div>
      </div>

      <StoresFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedSalesperson={selectedSalesperson}
        onSalespersonChange={setSelectedSalesperson}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        selectedState={selectedState}
        onStateChange={setSelectedState}
        states={states}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />
      
      <StoresTable
        stores={filteredStores}
        selectedStores={selectedStores}
        onSelectAll={handleSelectAll}
        onSelectStore={handleSelectStore}
        onStoreDeleted={handleStoreDeleted}
        canAddVisit={canAddVisit}
        canAddStore={canAddStore}
        isVeterinaryPage={false}
      />

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
        type={importType}
        onImport={handleImportSuccess}
      />
    </div>
  );
};

export default Stores;
