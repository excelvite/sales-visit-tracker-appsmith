
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

interface FilterOption {
  key: string;
  label: string;
  options: string[];
}

interface FilterDropdownProps {
  filters: FilterOption[];
  activeFilters: Record<string, string[]>;
  onFilterChange: (filterKey: string, selectedValues: string[]) => void;
  hasActiveFilters?: boolean;
}

export function FilterDropdown({ 
  filters, 
  activeFilters, 
  onFilterChange, 
  hasActiveFilters = false 
}: FilterDropdownProps) {
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  const handleFilterToggle = (filterKey: string, value: string, checked: boolean) => {
    const currentValues = activeFilters[filterKey] || [];
    let newValues: string[];
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }
    
    onFilterChange(filterKey, newValues);
  };

  const getFilteredOptions = (filterKey: string, options: string[]) => {
    const searchTerm = searchTerms[filterKey]?.toLowerCase() || "";
    return options.filter(option => 
      option.toLowerCase().includes(searchTerm)
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Filter className="h-4 w-4 mr-2" /> 
          Filter
          {hasActiveFilters && (
            <span className="ml-2 w-2 h-2 bg-sales-blue rounded-full"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {filters.map((filter, index) => (
          <div key={filter.key}>
            <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
            <div className="px-2 pb-2">
              <Input
                placeholder={`Search ${filter.label.toLowerCase()}...`}
                value={searchTerms[filter.key] || ""}
                onChange={(e) => setSearchTerms(prev => ({
                  ...prev,
                  [filter.key]: e.target.value
                }))}
                className="h-8"
              />
            </div>
            {getFilteredOptions(filter.key, filter.options).map(option => (
              <DropdownMenuCheckboxItem
                key={option}
                checked={(activeFilters[filter.key] || []).includes(option)}
                onCheckedChange={(checked) => 
                  handleFilterToggle(filter.key, option, checked)
                }
              >
                {option}
              </DropdownMenuCheckboxItem>
            ))}
            {index < filters.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={Object.values(activeFilters).every(values => values.length === 0)}
          onCheckedChange={() => {
            filters.forEach(filter => {
              onFilterChange(filter.key, []);
            });
          }}
        >
          Clear All Filters
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
