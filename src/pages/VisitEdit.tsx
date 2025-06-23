
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { VisitForm } from "@/components/visits/VisitForm";
import { getVisitLogs, getStores } from "@/services/mockDataService";
import { VisitLog, Store } from "@/types";

export function VisitEdit() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<VisitLog | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visitId) {
      const visits = getVisitLogs();
      const visitData = visits.find(v => v.id === visitId);
      if (visitData) {
        setVisit(visitData);
      } else {
        navigate("/visits");
      }
    }
    setStores(getStores());
    setLoading(false);
  }, [visitId, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!visit) {
    return <div>Visit not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Visit</h1>
        <p className="text-muted-foreground">Update visit information</p>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <VisitForm stores={stores} visit={visit} isEditing={true} />
      </div>
    </div>
  );
}

export default VisitEdit;
