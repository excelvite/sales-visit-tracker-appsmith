
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subWeeks, subMonths } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DateRangeOption = "this-week" | "last-week" | "this-month" | "last-month" | "this-year" | "last-year" | "custom";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeFilterProps {
  value: DateRangeOption;
  customRange?: DateRange;
  onValueChange: (value: DateRangeOption, customRange?: DateRange) => void;
}

export function DateRangeFilter({ value, customRange, onValueChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(customRange);

  const getDateRange = (option: DateRangeOption): DateRange => {
    const now = new Date();
    
    switch (option) {
      case "this-week":
        return {
          from: startOfWeek(now, { weekStartsOn: 1 }), // Monday
          to: endOfWeek(now, { weekStartsOn: 1 }) // Sunday
        };
      case "last-week":
        const lastWeek = subWeeks(now, 1);
        return {
          from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
          to: endOfWeek(lastWeek, { weekStartsOn: 1 })
        };
      case "this-month":
        return {
          from: startOfMonth(now),
          to: endOfMonth(now)
        };
      case "last-month":
        const lastMonth = subMonths(now, 1);
        return {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth)
        };
      case "this-year":
        return {
          from: startOfYear(now),
          to: endOfYear(now)
        };
      case "last-year":
        const lastYear = new Date(now.getFullYear() - 1, 0, 1);
        return {
          from: startOfYear(lastYear),
          to: endOfYear(lastYear)
        };
      case "custom":
        return customRange || { from: now, to: now };
      default:
        return { from: now, to: now };
    }
  };

  const formatDateRange = (option: DateRangeOption): string => {
    if (option === "custom" && customRange) {
      return `${format(customRange.from, "MMM d")} - ${format(customRange.to, "MMM d, yyyy")}`;
    }
    
    const range = getDateRange(option);
    return `${format(range.from, "MMM d")} - ${format(range.to, "MMM d, yyyy")}`;
  };

  const handlePresetChange = (newValue: DateRangeOption) => {
    if (newValue === "custom") {
      setIsOpen(true);
    } else {
      onValueChange(newValue);
    }
  };

  const handleCustomRangeApply = () => {
    if (tempRange) {
      onValueChange("custom", tempRange);
      setIsOpen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="this-week">This Week</SelectItem>
          <SelectItem value="last-week">Last Week</SelectItem>
          <SelectItem value="this-month">This Month</SelectItem>
          <SelectItem value="last-month">Last Month</SelectItem>
          <SelectItem value="this-year">This Year</SelectItem>
          <SelectItem value="last-year">Last Year</SelectItem>
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      <div className="text-sm text-muted-foreground">
        {formatDateRange(value)}
      </div>

      {/* Custom Date Range Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              value === "custom" ? "border-sales-blue" : "",
              !isOpen && value !== "custom" && "hidden"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">From Date</label>
              <Calendar
                mode="single"
                selected={tempRange?.from}
                onSelect={(date) => date && setTempRange(prev => ({ ...prev!, from: date }))}
                className="pointer-events-auto"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">To Date</label>
              <Calendar
                mode="single"
                selected={tempRange?.to}
                onSelect={(date) => date && setTempRange(prev => ({ ...prev!, to: date }))}
                className="pointer-events-auto"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCustomRangeApply}
                disabled={!tempRange?.from || !tempRange?.to}
                className="bg-sales-blue hover:bg-blue-800"
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
