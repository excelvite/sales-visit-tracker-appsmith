
import { StoreForm } from "@/components/stores/StoreForm";
import { useLocation } from "react-router-dom";
import { StoreCategory } from "@/types";

export function StoreNew() {
  const location = useLocation();
  const category = location.state?.category;
  const isVetClinic = category === StoreCategory.VET;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {isVetClinic ? "Add New Clinic" : "Add New Store"}
        </h1>
        <p className="text-muted-foreground">
          {isVetClinic ? "Add a new clinic to the master list" : "Add a new store to the master list"}
        </p>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <StoreForm preSelectedCategory={category} />
      </div>
    </div>
  );
}

export default StoreNew;
