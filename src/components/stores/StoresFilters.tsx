
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StoreCategory } from "@/types";
import { Search, Filter, X } from "lucide-react";
import { getSalespersonList } from "@/services/mockDataService";

interface StoresFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedSalesperson: string;
  onSalespersonChange: (value: string) => void;
  selectedRegion: string;
  onRegionChange: (value: string) => void;
  selectedState: string;
  onStateChange: (value: string) => void;
  states: string[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export const StoresFilters = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSalesperson,
  onSalespersonChange,
  selectedRegion,
  onRegionChange,
  selectedState,
  onStateChange,
  states,
  hasActiveFilters,
  onClearFilters,
}: StoresFiltersProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const salespersonList = getSalespersonList();

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedSalesperson !== "all") count++;
    if (selectedRegion !== "all") count++;
    if (selectedState !== "ALL") count++;
    return count;
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stores..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" size="icon" onClick={onClearFilters}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <label className="text-sm font-medium mb-2 block">State</label>
              <Select value={selectedState} onValueChange={onStateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All states" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state === "ALL" ? "All States" : state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value={StoreCategory.PET_STORE}>Pet Store</SelectItem>
                  <SelectItem value={StoreCategory.VET}>Veterinary</SelectItem>
                  <SelectItem value={StoreCategory.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Salesperson</label>
              <Select value={selectedSalesperson} onValueChange={onSalespersonChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All salesperson" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Salesperson</SelectItem>
                  {salespersonList.map((person) => (
                    <SelectItem key={person} value={person}>
                      {person}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Region</label>
              <Select value={selectedRegion} onValueChange={onRegionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="Kuala Lumpur">Kuala Lumpur</SelectItem>
                  <SelectItem value="Selangor">Selangor</SelectItem>
                  <SelectItem value="Penang">Penang</SelectItem>
                  <SelectItem value="Johor">Johor</SelectItem>
                  <SelectItem value="Perak">Perak</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
