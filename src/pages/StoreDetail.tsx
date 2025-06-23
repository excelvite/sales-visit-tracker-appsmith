
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole, Store, VisitLog, StoreCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/dateUtils";
import { getStoreById, getVisitLogsByStoreId } from "@/services/mockDataService";
import { ArrowLeft, Edit } from "lucide-react";
import { StoreInfoCard } from "@/components/stores/StoreInfoCard";
import { StoreContactCard } from "@/components/stores/StoreContactCard";
import { StoreProductsCard } from "@/components/stores/StoreProductsCard";
import { StoreVisitHistory } from "@/components/stores/StoreVisitHistory";

export function StoreDetail() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [visits, setVisits] = useState<VisitLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productsCarried, setProductsCarried] = useState<string[]>([]);
  
  useEffect(() => {
    if (storeId) {
      const foundStore = getStoreById(storeId);
      if (foundStore) {
        setStore(foundStore);
        const storeVisits = getVisitLogsByStoreId(storeId);
        setVisits(storeVisits);
        
        // Extract unique products promoted across all visits for this store
        const allProducts = new Set<string>();
        storeVisits.forEach(visit => {
          visit.productsPromoted.forEach(product => {
            allProducts.add(product);
          });
        });
        
        setProductsCarried(Array.from(allProducts));
      }
    }
    setIsLoading(false);
  }, [storeId]);

  const handleProductsUpdate = (newProducts: string[]) => {
    setProductsCarried(newProducts);
    // Here you would typically save to your backend/service
    console.log('Products updated:', newProducts);
  };

  const handleVisitDeleted = () => {
    if (storeId) {
      const storeVisits = getVisitLogsByStoreId(storeId);
      setVisits(storeVisits);
      
      // Update products carried
      const allProducts = new Set<string>();
      storeVisits.forEach(visit => {
        visit.productsPromoted.forEach(product => {
          allProducts.add(product);
        });
      });
      
      setProductsCarried(Array.from(allProducts));
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-sales-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!store) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold">Store not found</h2>
        <p className="text-muted-foreground mt-2">The requested store could not be found.</p>
        <Button onClick={() => navigate("/stores")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Stores
        </Button>
      </div>
    );
  }
  
  const canAddVisit = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SALES;
  const canEdit = currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.SALES;
  const isNewStore = store.isNew && 
    (new Date().getTime() - new Date(store.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 7) < 1;
  
  const isVeterinaryClinic = store.category === StoreCategory.VET;
  
  // Calculate visit stats for StoreInfoCard
  const visitCount = visits.length;
  const lastVisitDate = visits.length > 0 
    ? formatDate(new Date(Math.max(...visits.map(v => v.date.getTime()))))
    : null;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => navigate(isVeterinaryClinic ? "/veterinary-clinics" : "/stores")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight ml-2">{store.name}</h1>
          {isNewStore && (
            <Badge className="bg-sales-green text-white ml-4">New {isVeterinaryClinic ? "Clinic" : "Store"}</Badge>
          )}
        </div>
        {canEdit && (
          <Button
            variant="outline"
            onClick={() => navigate(`/stores/${store.id}/edit`)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit {isVeterinaryClinic ? "Clinic" : "Store"}
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StoreInfoCard 
          store={store} 
          visitCount={visitCount}
          lastVisitDate={lastVisitDate}
          canAddVisit={canAddVisit} 
          onLogVisit={() => navigate("/visits/new", { state: { storeId: store.id } })}
        />

        <StoreContactCard store={store} />
        
        <StoreProductsCard 
          products={productsCarried} 
          storeId={store.id}
          canEdit={canEdit}
          onProductsUpdate={handleProductsUpdate}
        />
        
        <StoreVisitHistory
          visits={visits}
          storeName={store.name}
          canAddVisit={canAddVisit}
          canEdit={canEdit}
          onLogVisit={() => navigate("/visits/new", { state: { storeId: store.id } })}
          onEditVisit={(visitId) => navigate(`/visits/${visitId}/edit`)}
          onVisitDeleted={handleVisitDeleted}
          isVeterinaryClinic={isVeterinaryClinic}
        />
      </div>
    </div>
  );
}

export default StoreDetail;
