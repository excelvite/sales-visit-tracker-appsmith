
import { Store, StoreCategory, Species, PaymentTerms } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/dateUtils";
import { CalendarPlus } from "lucide-react";

interface StoreInfoCardProps {
  store: Store;
  visitCount: number;
  lastVisitDate: string | null;
  canAddVisit: boolean;
  onLogVisit: () => void;
}

export function StoreInfoCard({
  store,
  visitCount,
  lastVisitDate,
  canAddVisit,
  onLogVisit
}: StoreInfoCardProps) {
  const getSpeciesDisplayName = (species?: Species, otherSpecies?: string) => {
    if (!species) return "Not specified";
    if (species === Species.OTHERS && otherSpecies) return otherSpecies;
    
    switch (species) {
      case Species.CAT_ONLY: return "Cat only";
      case Species.DOG_ONLY: return "Dog only";
      case Species.MAJORITY_DOG: return "Majority dog";
      case Species.MAJORITY_CAT: return "Majority cat";
      case Species.FIFTY_FIFTY: return "50/50";
      case Species.OTHERS: return "Others";
      default: return species;
    }
  };

  const getPaymentTermsDisplayName = (terms?: PaymentTerms, otherTerms?: string) => {
    if (!terms) return "Not specified";
    if (terms === PaymentTerms.OTHERS && otherTerms) return otherTerms;
    
    switch (terms) {
      case PaymentTerms.CONSIGNMENT: return "Consignment";
      case PaymentTerms.ADVANCED_PAYMENT: return "Advanced Payment";
      case PaymentTerms.THIRTY_DAYS: return "30 days Payment terms";
      case PaymentTerms.SIXTY_DAYS: return "60 days Payment terms";
      case PaymentTerms.NINETY_DAYS: return "90 days Payment terms";
      case PaymentTerms.OTHERS: return "Others";
      default: return terms;
    }
  };

  const isVeterinaryClinic = store.category === StoreCategory.VET;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{isVeterinaryClinic ? "Clinic" : "Store"} Information</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          <div className="flex justify-between">
            <dt className="font-medium text-muted-foreground">Category:</dt>
            <dd>
              <Badge variant="outline">
                {store.category === StoreCategory.VET ? "Veterinary" : "Pet Store"}
              </Badge>
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-muted-foreground">Region:</dt>
            <dd>{store.region || "-"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-muted-foreground">Area:</dt>
            <dd>{store.area || "-"}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-muted-foreground">State:</dt>
            <dd>{store.state}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-muted-foreground">Species:</dt>
            <dd>{getSpeciesDisplayName(store.species, store.otherSpecies)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-muted-foreground">Payment Terms:</dt>
            <dd>{getPaymentTermsDisplayName(store.paymentTerms, store.otherPaymentTerms)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-muted-foreground">Added On:</dt>
            <dd>{formatDate(new Date(store.createdAt))}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-muted-foreground">Total Visits:</dt>
            <dd>{visitCount}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-muted-foreground">Last Visit:</dt>
            <dd>{lastVisitDate || "No visits yet"}</dd>
          </div>
        </dl>
        
        {canAddVisit && (
          <Button 
            className="w-full mt-6 bg-sales-blue hover:bg-blue-800"
            onClick={onLogVisit}
          >
            <CalendarPlus className="h-4 w-4 mr-2" /> Log Visit
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
