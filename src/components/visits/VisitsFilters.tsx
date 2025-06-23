
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { FilterDropdown } from "@/components/FilterDropdown";

interface VisitsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterOptions: Array<{ key: string; label: string; options: string[] }>;
  activeFilters: Record<string, string[]>;
  onFilterChange: (filterKey: string, selectedValues: string[]) => void;
  hasActiveFilters: boolean;
}

export function VisitsFilters({
  searchTerm,
  onSearchChange,
  filterOptions,
  activeFilters,
  onFilterChange,
  hasActiveFilters
}: VisitsFiltersProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by store or salesperson..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      <FilterDropdown
        filters={filterOptions}
        activeFilters={activeFilters}
        onFilterChange={onFilterChange}
        hasActiveFilters={hasActiveFilters}
      />
    </div>
  );
}
