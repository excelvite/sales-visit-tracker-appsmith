
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlySummary } from "@/types";
import { format } from "date-fns";

interface MonthlySummaryCardProps {
  summary: MonthlySummary;
}

export function MonthlySummaryCard({ summary }: MonthlySummaryCardProps) {
  const monthName = format(new Date(summary.year, summary.month), "MMMM yyyy");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Monthly Summary
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({monthName})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Visits</p>
            <p className="text-2xl font-bold">{summary.totalVisits}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Revisited Stores</p>
            <p className="text-2xl font-bold">{summary.totalRevisitedStores}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">New Accounts</p>
            <p className="text-2xl font-bold">{summary.newAccounts.length}</p>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Visits by Salesperson</h4>
          <div className="space-y-2">
            {Object.entries(summary.visitsBySalesperson).map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm">{name}</span>
                <span className="text-sm font-medium">{count} visits</span>
              </div>
            ))}
            {Object.keys(summary.visitsBySalesperson).length === 0 && (
              <p className="text-sm text-muted-foreground">No visits this month</p>
            )}
          </div>
        </div>
        
        {summary.newAccounts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">New Accounts This Month</h4>
            <ul className="space-y-1 text-sm">
              {summary.newAccounts.map((store) => (
                <li key={store.id}>{store.name}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MonthlySummaryCard;
