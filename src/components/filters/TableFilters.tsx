import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Search, X, Filter } from 'lucide-react';
import { DateRange } from 'react-day-picker';

export interface FilterConfig {
  searchPlaceholder?: string;
  statusOptions?: { label: string; value: string }[];
  dateRangeEnabled?: boolean;
  customFilters?: React.ReactNode;
}

export interface FilterState {
  searchText: string;
  status: string;
  dateRange: DateRange | undefined;
}

interface TableFiltersProps {
  config: FilterConfig;
  state: FilterState;
  onChange: (state: FilterState) => void;
  onReset: () => void;
}

const TableFilters: React.FC<TableFiltersProps> = ({
  config,
  state,
  onChange,
  onReset,
}) => {
  const hasActiveFilters = 
    state.searchText !== '' || 
    state.status !== 'all' || 
    state.dateRange !== undefined;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={config.searchPlaceholder || "Search..."}
            value={state.searchText}
            onChange={(e) => onChange({ ...state, searchText: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        {config.statusOptions && config.statusOptions.length > 0 && (
          <Select
            value={state.status}
            onValueChange={(value) => onChange({ ...state, status: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white z-50">
              <SelectItem value="all">All Status</SelectItem>
              {config.statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Date Range */}
        {config.dateRangeEnabled && (
          <DateRangePicker
            date={state.dateRange}
            onDateChange={(range) => onChange({ ...state, dateRange: range })}
          />
        )}

        {/* Custom Filters */}
        {config.customFilters}

        {/* Reset Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={onReset}
            className="whitespace-nowrap"
          >
            <X className="w-4 h-4 mr-2" />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
};

export default TableFilters;
