
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileUp, Download } from "lucide-react";
import { StoreCategory, VisitStatus, PotentialLevel, VisitType, Species } from "@/types";

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "stores" | "visits" | "store-updates" | "vet-updates" | "store-visits";
  onImport: (data: any[]) => void;
}

export function ImportDialog({ open, onOpenChange, type, onImport }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
      ];
      
      if (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an Excel (.xlsx, .xls) or CSV file.",
          variant: "destructive",
        });
      }
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    // Enhanced CSV parsing to handle quoted fields with line breaks
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      let i = 0;
      
      while (i < line.length) {
        const char = line[i];
        
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            // Escaped quote
            current += '"';
            i += 2;
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
            i++;
          }
        } else if (char === ',' && !inQuotes) {
          // Field separator
          result.push(current.trim());
          current = '';
          i++;
        } else {
          current += char;
          i++;
        }
      }
      
      // Add the last field
      result.push(current.trim());
      return result;
    };

    // Parse header row
    const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, '').trim());
    const data = [];
    
    // Parse data rows - handle multi-line cells
    let i = 1;
    while (i < lines.length) {
      let currentLine = lines[i];
      
      // Check if this line has unmatched quotes (indicates multi-line field)
      let quoteCount = (currentLine.match(/"/g) || []).length;
      
      // If odd number of quotes, we need to continue reading until we find the closing quote
      while (quoteCount % 2 !== 0 && i + 1 < lines.length) {
        i++;
        currentLine += '\n' + lines[i];
        quoteCount = (currentLine.match(/"/g) || []).length;
      }
      
      const values = parseCSVLine(currentLine).map(v => v.replace(/^"|"$/g, '').trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
      i++;
    }
    
    return data;
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to import.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const text = await file.text();
      const data = parseCSV(text);
      
      if (data.length === 0) {
        toast({
          title: "Empty file",
          description: "The file appears to be empty or invalid.",
          variant: "destructive",
        });
        return;
      }

      console.log("Parsed CSV data:", data);

      // Process data based on type
      if (type === "stores") {
        const processedData = data.map(item => ({
          ...item,
          category: item.category === "VET" || item.category === "VET_CLINIC" || 
                   item.category?.toUpperCase() === "VET" || 
                   item.category?.toUpperCase() === "VET_CLINIC" ||
                   item.category?.toLowerCase() === "vet clinic" ||
                   item.category?.toLowerCase() === "veterinary clinic"
                   ? StoreCategory.VET 
                   : StoreCategory.PET_STORE
        }));
        
        onImport(processedData);
      } else if (type === "store-visits") {
        // Process combined store and visit data - preserve line breaks in text fields
        const processedData = data.map(item => ({
          // Store data
          storeName: item.storeName || item.name || '',
          category: item.category === "VET" || item.category === "VET_CLINIC" || 
                   item.category?.toUpperCase() === "VET" || 
                   item.category?.toUpperCase() === "VET_CLINIC" ||
                   item.category?.toLowerCase() === "vet clinic" ||
                   item.category?.toLowerCase() === "veterinary clinic"
                   ? StoreCategory.VET 
                   : StoreCategory.PET_STORE,
          region: item.region || '',
          area: item.area || '',
          state: item.state || 'Kuala Lumpur',
          address: item.address || '',
          city: item.city || '',
          zipCode: item.zipCode || '',
          phone: item.phone || '',
          email: item.email || '',
          picInfo: item.picInfo || '',
          salesperson: item.salesperson || '',
          species: item.species || Species.FIFTY_FIFTY,
          // Visit data - preserve line breaks and multi-line content
          latestUpdate: item.latestUpdate || item.notes || '',
          nextSteps: item.nextSteps || '',
          visitStatus: typeof item.visitStatus === 'string' ? 
                      item.visitStatus.split(';').map(s => s.trim()).filter(s => s) : 
                      (Array.isArray(item.visitStatus) ? item.visitStatus : [VisitStatus.COMPLETED]),
          potentialLevel: item.potentialLevel || PotentialLevel.MEDIUM,
          productsPromoted: typeof item.productsPromoted === 'string' ? 
                           item.productsPromoted.split(';').map(p => p.trim()).filter(p => p) : 
                           (Array.isArray(item.productsPromoted) ? item.productsPromoted : []),
          visitType: VisitType.INITIAL,
          visitDate: item.visitDate ? new Date(item.visitDate) : new Date()
        }));
        
        console.log("Processed store-visits data:", processedData);
        onImport(processedData);
      } else if (type === "store-updates" || type === "vet-updates") {
        // For updates, process them as visit logs - preserve formatting
        const processedData = data.map(item => ({
          storeName: item.storeName || item.clinicName || '',
          latestUpdate: item.latestUpdate || '',
          nextSteps: item.nextSteps || '',
          visitStatus: Array.isArray(item.visitStatus) ? item.visitStatus : 
                      typeof item.visitStatus === 'string' ? [item.visitStatus] : [VisitStatus.COMPLETED],
          potentialLevel: item.potentialLevel || PotentialLevel.MEDIUM,
          productsPromoted: typeof item.productsPromoted === 'string' ? 
                           item.productsPromoted.split(';').map(p => p.trim()).filter(p => p) : 
                           (Array.isArray(item.productsPromoted) ? item.productsPromoted : []),
          visitType: VisitType.FOLLOW_UP,
          date: new Date()
        }));
        
        onImport(processedData);
      } else {
        onImport(data);
      }
      
      onOpenChange(false);
      setFile(null);
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: "There was an error processing the file. Please check the file format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    let csvContent = "";
    let filename = "";
    
    if (type === "stores") {
      csvContent = "name,category,region,area,state,address,city,zipCode,phone,email,picInfo,salesperson,species\n";
      csvContent += "Sample Pet Store,PET_STORE,North Region,Area 1,Kuala Lumpur,123 Main St,Kuala Lumpur,50000,+60123456789,store@example.com,John Doe - Manager,sales1@example.com,50_50\n";
      csvContent += "City Veterinary Clinic,VET,South Region,Area 2,Selangor,456 Vet St,Shah Alam,40000,+60123456790,vet@example.com,Dr. Jane Smith,sales2@example.com,majority_dog\n";
      filename = "stores_template";
    } else if (type === "store-visits") {
      csvContent = "storeName,category,region,area,state,address,city,zipCode,phone,email,picInfo,salesperson,species,latestUpdate,nextSteps,visitStatus,potentialLevel,productsPromoted,visitDate\n";
      csvContent += '"Pet Paradise Store",PET_STORE,North Region,Area 1,Kuala Lumpur,123 Main St,Kuala Lumpur,50000,+60123456789,store@example.com,John Doe - Manager,sales1@example.com,50_50,"Discussed new product lines and pricing\nCustomer showed interest in bulk orders","Follow up with bulk order pricing\nSchedule demo next week",COMPLETED,HIGH,"Premium Dog Food;Cat Toys",2024-01-15\n';
      csvContent += '"City Veterinary Clinic",VET,South Region,Area 2,Selangor,456 Vet St,Shah Alam,40000,+60123456790,vet@example.com,Dr. Jane Smith,sales2@example.com,majority_dog,"Presented veterinary supplies catalog\nPositive response from head vet","Schedule equipment demonstration\nSend detailed proposal",PENDING,MEDIUM,"Surgical Instruments;Medical Supplies",2024-01-16\n';
      filename = "stores_visits_template";
    } else if (type === "visits") {
      csvContent = "storeName,latestUpdate,nextSteps,visitStatus,potentialLevel\n";
      csvContent += "Pet Paradise,Discussed new product lines,Follow up with pricing,COMPLETED,HIGH\n";
      csvContent += "City Vets,Samples provided,Await feedback,PENDING,MEDIUM\n";
      filename = "visits_template";
    } else if (type === "store-updates") {
      csvContent = "storeName,latestUpdate,nextSteps,visitStatus,potentialLevel,productsPromoted\n";
      csvContent += '"Pet Paradise Store","Discussed premium pet food line and new accessories\nManager very interested in partnership","Follow up with bulk pricing next week\nSchedule staff training session",COMPLETED,HIGH,"Premium Dog Food;Cat Toys;Pet Supplements"\n';
      csvContent += '"Happy Pets Emporium","Introduced new product catalog and samples\nPositive feedback from store owner","Schedule demo session for staff training\nSend pricing proposal by Friday",PENDING,MEDIUM,"Training Treats;Grooming Supplies"\n';
      filename = "import_store_updates_template";
    } else if (type === "vet-updates") {
      csvContent = "clinicName,latestUpdate,nextSteps,visitStatus,potentialLevel,productsPromoted\n";
      csvContent += '"City Veterinary Clinic","Presented new veterinary supplies and equipment\nDr. Smith showed strong interest","Schedule equipment demonstration next month\nPrepare detailed proposal",COMPLETED,HIGH,"Surgical Instruments;Diagnostic Equipment;Medical Supplies"\n';
      csvContent += '"Animal Care Center","Discussed partnership opportunities and bulk orders\nHead veterinarian reviewing our catalog","Await feedback from head veterinarian\nFollow up next week",PENDING,MEDIUM,"Vaccines;Prescription Medications"\n';
      filename = "import_vet_updates_template";
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getDialogTitle = () => {
    switch (type) {
      case "stores": return "Import Stores";
      case "visits": return "Import Visit Updates";
      case "store-updates": return "Import Store Updates";
      case "vet-updates": return "Import Veterinary Clinic Updates";
      case "store-visits": return "Import Stores & Visit Logs";
      default: return "Import Data";
    }
  };

  const getDialogDescription = () => {
    switch (type) {
      case "stores": return "Upload an Excel (.xlsx, .xls) or CSV file to import stores. Existing stores will be updated, not duplicated.";
      case "visits": return "Upload an Excel (.xlsx, .xls) or CSV file to import visit updates.";
      case "store-updates": return "Upload an Excel (.xlsx, .xls) or CSV file to import store visit updates. Current date will be used for all entries.";
      case "vet-updates": return "Upload an Excel (.xlsx, .xls) or CSV file to import veterinary clinic visit updates. Current date will be used for all entries.";
      case "store-visits": return "Upload an Excel (.xlsx, .xls) or CSV file to import both store details and visit logs together. Line breaks in cells will be preserved. Existing stores will be updated, not duplicated.";
      default: return "Upload a file to import data.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">Select File</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            onClick={downloadTemplate}
            className="w-full"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || isLoading}
          >
            <FileUp className="h-4 w-4 mr-2" />
            {isLoading ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
