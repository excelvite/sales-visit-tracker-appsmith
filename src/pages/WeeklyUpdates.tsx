import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileIcon } from "lucide-react";
import { StoreCategory } from "@/types";
import { getStores, getVisitLogs, getWeeklySummary, exportToCSV } from "@/services/mockDataService";
import { useToast } from "@/hooks/use-toast";

export function WeeklyUpdates() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const weekSummary = getWeeklySummary();
  const [thisWeekVisits, setThisWeekVisits] = useState<ReturnType<typeof getVisitLogs>>([]);
  
  useEffect(() => {
    // Get all visits from this week
    const visits = getVisitLogs().filter(
      visit => visit.date >= weekSummary.weekStartDate && visit.date <= weekSummary.weekEndDate
    );
    setThisWeekVisits(visits);
    setIsLoading(false);
  }, []);
  
  const handleExport = () => {
    const result = exportToCSV(thisWeekVisits, "weekly-store-updates");
    
    toast({
      title: "Export Successful",
      description: result,
    });
  };
  
  // Group visits by store
  const visitsByStore: Record<string, typeof thisWeekVisits> = {};
  thisWeekVisits.forEach(visit => {
    if (!visitsByStore[visit.storeId]) {
      visitsByStore[visit.storeId] = [];
    }
    visitsByStore[visit.storeId].push(visit);
  });
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">This Week's Updates</h1>
        <p className="text-muted-foreground">
          All store visits and updates for the current week
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center">
              <span className="inline-block w-3 h-3 bg-sales-blue rounded-full mr-2"></span>
              Total Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{thisWeekVisits.length}</div>
            <p className="text-sm text-muted-foreground">
              {weekSummary.weekStartDate.toLocaleDateString()} - {weekSummary.weekEndDate.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center">
              <span className="inline-block w-3 h-3 bg-sales-green rounded-full mr-2"></span>
              Stores Visited
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Object.keys(visitsByStore).length}</div>
            <p className="text-sm text-muted-foreground">Unique locations</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-lg flex items-center">
              <span className="inline-block w-3 h-3 bg-sales-teal rounded-full mr-2"></span>
              New Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{weekSummary.newAccounts}</div>
            <p className="text-sm text-muted-foreground">Opened this week</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleExport}
        >
          <FileIcon className="h-4 w-4" />
          Export Week's Updates
        </Button>
      </div>
      
      {Object.keys(visitsByStore).length > 0 ? (
        <div className="space-y-4">
          {Object.keys(visitsByStore).map(storeId => {
            const store = getStores().find(s => s.id === storeId);
            const visits = visitsByStore[storeId];
            
            return (
              <Card key={storeId} className="bg-muted/20">
                <CardHeader className="py-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base font-medium">{store?.name}</CardTitle>
                    <Badge>{store?.category === StoreCategory.VET ? "Veterinary" : 
                           store?.category === StoreCategory.PET_STORE ? "Pet Store" : 
                           store?.category === StoreCategory.GROOMING ? "Grooming" : 
                           "Other"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {store?.region}, {store?.area}, {store?.state}
                  </p>
                </CardHeader>
                <CardContent className="py-0">
                  {visits.map(visit => (
                    <div key={visit.id} className="border-t py-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{visit.visitType.replace('_', ' ')}</p>
                          <p className="text-sm text-muted-foreground">By {visit.userName} on {visit.date.toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {visit.visitStatus.map(status => (
                            <Badge key={status} variant="outline" className="text-xs">
                              {status.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      {visit.notes && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">Update/Remarks:</p>
                          <p className="text-sm mt-1 border-l-2 border-sales-blue pl-2">{visit.notes}</p>
                        </div>
                      )}
                      
                      {visit.nextSteps && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">Next Steps:</p>
                          <p className="text-sm mt-1 border-l-2 border-sales-green pl-2">{visit.nextSteps}</p>
                        </div>
                      )}
                      
                      {visit.productsPromoted.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">Products:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {visit.productsPromoted.map(product => (
                              <Badge key={product} variant="secondary" className="text-xs">
                                {product}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No store updates recorded this week.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default WeeklyUpdates;
