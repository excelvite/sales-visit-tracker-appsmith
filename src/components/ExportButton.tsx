
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToCSV } from "@/services/mockDataService";

interface ExportButtonProps {
  data: any[];
  filename: string;
}

export function ExportButton({ data, filename }: ExportButtonProps) {
  const handleExport = () => {
    exportToCSV(data, filename);
  };

  return (
    <Button variant="outline" onClick={handleExport} className="ml-2">
      <Download className="h-4 w-4 mr-2" />
      Export
    </Button>
  );
}
