
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeeklySummary } from "@/types";
import { formatDate } from "@/utils/dateUtils";

interface WeeklySummaryCardProps {
  summary: WeeklySummary;
}

export function WeeklySummaryCard({ summary }: WeeklySummaryCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">
          Weekly Summary
          <span className="text-sm font-normal text-muted-foreground ml-2">
            ({formatDate(summary.weekStartDate)} - {formatDate(summary.weekEndDate)})
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
            <p className="text-sm font-medium text-muted-foreground">Stores Visited</p>
            <p className="text-2xl font-bold">{summary.storesVisited}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">New Accounts</p>
            <p className="text-2xl font-bold">{summary.newAccounts}</p>
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
              <p className="text-sm text-muted-foreground">No visits this week</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default WeeklySummaryCard;
