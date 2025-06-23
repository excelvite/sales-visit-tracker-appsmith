
import { useEffect, useState } from "react";
import { VisitForm } from "@/components/visits/VisitForm";
import { getStores } from "@/services/mockDataService";
import { Store } from "@/types";

export function VisitNew() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStores = () => {
      try {
        const fetchedStores = getStores();
        // Ensure we always have an array
        setStores(Array.isArray(fetchedStores) ? fetchedStores : []);
      } catch (error) {
        console.error("Error fetching stores:", error);
        setStores([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-6 h-6 border-2 border-sales-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log New Visit</h1>
        <p className="text-muted-foreground">
          Record details of your store visit
        </p>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <VisitForm stores={stores} />
      </div>
    </div>
  );
}

export default VisitNew;
