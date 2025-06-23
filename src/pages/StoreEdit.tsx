
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { StoreForm } from "@/components/stores/StoreForm";
import { getStoreById } from "@/services/mockDataService";
import { Store } from "@/types";

export function StoreEdit() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (storeId) {
      const storeData = getStoreById(storeId);
      if (storeData) {
        setStore(storeData);
      } else {
        navigate("/stores");
      }
    }
    setLoading(false);
  }, [storeId, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!store) {
    return <div>Store not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Store</h1>
        <p className="text-muted-foreground">Update store information</p>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <StoreForm store={store} isEditing={true} />
      </div>
    </div>
  );
}

export default StoreEdit;
