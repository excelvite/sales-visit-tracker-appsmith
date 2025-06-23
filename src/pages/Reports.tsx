
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportToCSV, getStores, getVisitLogs, getMonthlySummary, getWeeklySummary, getProductsList } from "@/services/mockDataService";
import { useToast } from "@/hooks/use-toast";
import { FileText, Download, FileIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ExportFormat, StoreCategory } from "@/types";

export function Reports() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("visits");
  const [exportFormat, setExportFormat] = useState<ExportFormat>(ExportFormat.CSV);
  const [productFilter, setProductFilter] = useState<string>("");
  
  // Get products list from service
  const productsList = getProductsList();
  
  const handleExport = (type: string) => {
    let data;
    let fileName;
    
    switch (type) {
      case "visits":
        data = getVisitLogs();
        if (productFilter && productFilter !== "all-products") {
          data = data.filter(log => log.productsPromoted?.includes(productFilter));
        }
        fileName = "visit-logs";
        break;
      case "stores":
        data = getStores();
        fileName = "stores-master-list";
        break;
      case "stores-vet":
        data = getStores().filter(store => store.category === StoreCategory.VET);
        fileName = "veterinary-stores";
        break;
      case "stores-pet":
        data = getStores().filter(store => store.category === StoreCategory.PET_STORE);
        fileName = "pet-stores";
        break;
      case "weekly":
        data = [getWeeklySummary()];
        fileName = "weekly-summary";
        break;
      case "monthly":
        data = [getMonthlySummary()];
        fileName = "monthly-summary";
        break;
      default:
        data = [];
        fileName = "report";
    }
    
    const result = exportToCSV(data, fileName);
    
    toast({
      title: `Export to ${exportFormat} Successful`,
      description: result,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and export reports
        </p>
      </div>
      
      <Tabs defaultValue="visit-logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visit-logs">Visit Logs</TabsTrigger>
          <TabsTrigger value="master-list">Master Store List</TabsTrigger>
          <TabsTrigger value="summaries">Summaries</TabsTrigger>
          <TabsTrigger value="this-week">This Week's Updates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="visit-logs" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Export Visit Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-6">
                <div>
                  <p className="mb-2">Select export options:</p>
                  <div className="flex flex-col md:flex-row gap-4">
                    <Select onValueChange={setReportType} defaultValue="visits">
                      <SelectTrigger className="w-full md:w-[280px]">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50">
                        <SelectItem value="visits">All Visit Logs</SelectItem>
                        <SelectItem value="visits-weekly">This Week's Visits</SelectItem>
                        <SelectItem value="visits-monthly">This Month's Visits</SelectItem>
                        <SelectItem value="new-accounts">New Accounts Only</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={productFilter} 
                      onValueChange={setProductFilter}
                    >
                      <SelectTrigger className="w-full md:w-[230px]">
                        <SelectValue placeholder="Filter by product" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50">
                        <SelectItem value="all-products">All Products</SelectItem>
                        {productsList && productsList.length > 0 ? (
                          productsList.map(product => (
                            <SelectItem key={product} value={product}>{product}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-products">No products available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={exportFormat} 
                      onValueChange={(value) => setExportFormat(value as ExportFormat)}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50">
                        <SelectItem value={ExportFormat.CSV}>CSV</SelectItem>
                        <SelectItem value={ExportFormat.EXCEL}>Excel</SelectItem>
                        <SelectItem value={ExportFormat.PDF}>PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button
                  className="w-fit flex items-center gap-2"
                  onClick={() => handleExport("visits")}
                >
                  {exportFormat === ExportFormat.CSV && <Download className="h-4 w-4" />}
                  {exportFormat === ExportFormat.EXCEL && <FileIcon className="h-4 w-4" />}
                  {exportFormat === ExportFormat.PDF && <FileText className="h-4 w-4" />}
                  Export to {exportFormat}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="master-list" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Export Master Store List</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-6">
                <div>
                  <p className="mb-2">Select export options:</p>
                  <div className="flex flex-col md:flex-row gap-4">
                    <Select onValueChange={setReportType} defaultValue="stores">
                      <SelectTrigger className="w-full md:w-[280px]">
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50">
                        <SelectItem value="stores">All Stores</SelectItem>
                        <SelectItem value="stores-vet">Veterinary Stores Only</SelectItem>
                        <SelectItem value="stores-pet">Pet Stores Only</SelectItem>
                        <SelectItem value="stores-other">Other Categories</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={exportFormat} 
                      onValueChange={(value) => setExportFormat(value as ExportFormat)}
                    >
                      <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50">
                        <SelectItem value={ExportFormat.CSV}>CSV</SelectItem>
                        <SelectItem value={ExportFormat.EXCEL}>Excel</SelectItem>
                        <SelectItem value={ExportFormat.PDF}>PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button
                  className="w-fit flex items-center gap-2"
                  onClick={() => handleExport("stores")}
                >
                  {exportFormat === ExportFormat.CSV && <Download className="h-4 w-4" />}
                  {exportFormat === ExportFormat.EXCEL && <FileIcon className="h-4 w-4" />}
                  {exportFormat === ExportFormat.PDF && <FileText className="h-4 w-4" />}
                  Export to {exportFormat}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summaries" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Export Summary Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-end mb-4">
                <Select 
                  value={exportFormat} 
                  onValueChange={(value) => setExportFormat(value as ExportFormat)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent className="bg-white z-50">
                    <SelectItem value={ExportFormat.CSV}>CSV</SelectItem>
                    <SelectItem value={ExportFormat.EXCEL}>Excel</SelectItem>
                    <SelectItem value={ExportFormat.PDF}>PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-sales-blue" />
                    <h3 className="font-medium">Weekly Summary</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export the current week's performance metrics including visits, 
                    new accounts, and salesperson activity.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleExport("weekly")}
                  >
                    {exportFormat === ExportFormat.CSV && <Download className="h-4 w-4 mr-2" />}
                    {exportFormat === ExportFormat.EXCEL && <FileIcon className="h-4 w-4 mr-2" />}
                    {exportFormat === ExportFormat.PDF && <FileText className="h-4 w-4 mr-2" />}
                    Export Weekly Summary
                  </Button>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-5 w-5 text-sales-teal" />
                    <h3 className="font-medium">Monthly Summary</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export the current month's performance metrics including visits, 
                    revisited stores, new accounts, and salesperson activity.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleExport("monthly")}
                  >
                    {exportFormat === ExportFormat.CSV && <Download className="h-4 w-4 mr-2" />}
                    {exportFormat === ExportFormat.EXCEL && <FileIcon className="h-4 w-4 mr-2" />}
                    {exportFormat === ExportFormat.PDF && <FileText className="h-4 w-4 mr-2" />}
                    Export Monthly Summary
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="this-week" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>This Week's Store Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <WeeklyUpdatesContent />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// New component to display this week's updates
function WeeklyUpdatesContent() {
  const weekSummary = getWeeklySummary();
  const thisWeekVisits = getVisitLogs().filter(
    visit => visit.date >= weekSummary.weekStartDate && visit.date <= weekSummary.weekEndDate
  );
  
  if (thisWeekVisits.length === 0) {
    return <p className="text-muted-foreground">No store updates recorded this week.</p>;
  }
  
  // Group visits by store
  const visitsByStore: Record<string, typeof thisWeekVisits> = {};
  thisWeekVisits.forEach(visit => {
    if (!visitsByStore[visit.storeId]) {
      visitsByStore[visit.storeId] = [];
    }
    visitsByStore[visit.storeId].push(visit);
  });
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">
            Week of {weekSummary.weekStartDate.toLocaleDateString()} - {weekSummary.weekEndDate.toLocaleDateString()}
          </p>
          <p className="font-medium">Total Updates: {thisWeekVisits.length}</p>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => exportToCSV(thisWeekVisits, "weekly-store-updates")}
        >
          <FileIcon className="h-4 w-4" />
          Export Week's Updates
        </Button>
      </div>
      
      <div className="space-y-4">
        {Object.keys(visitsByStore).map(storeId => {
          const store = getStores().find(s => s.id === storeId);
          const visits = visitsByStore[storeId];
          
          return (
            <Card key={storeId} className="bg-muted/20">
              <CardHeader className="py-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-medium">{store?.name}</CardTitle>
                  <Badge>{store?.category === StoreCategory.VET ? "Veterinary" : "Pet Store"}</Badge>
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
                        {visit.visitStatus && visit.visitStatus.map(status => (
                          <Badge key={status} variant="outline" className="text-xs">
                            {status.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {visit.notes && (
                      <p className="text-sm mt-1 border-l-2 border-sales-blue pl-2">{visit.notes}</p>
                    )}
                    {visit.productsPromoted && visit.productsPromoted.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">Products Promoted:</p>
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
    </div>
  );
}

export default Reports;
