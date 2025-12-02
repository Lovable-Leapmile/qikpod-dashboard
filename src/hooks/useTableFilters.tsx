import { useState, useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { isWithinInterval, parseISO } from 'date-fns';

export interface FilterState {
  searchText: string;
  status: string;
  dateRange: DateRange | undefined;
}

export const useTableFilters = <T extends Record<string, any>>(
  data: T[],
  searchFields: (keyof T)[],
  statusField?: keyof T,
  dateField?: keyof T
) => {
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    status: 'all',
    dateRange: undefined,
  });

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search filter
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesSearch = searchFields.some((field) => {
          const value = item[field];
          return value?.toString().toLowerCase().includes(searchLower);
        });
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== 'all' && statusField) {
        if (item[statusField]?.toString().toLowerCase() !== filters.status.toLowerCase()) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange?.from && dateField) {
        try {
          const itemDate = parseISO(item[dateField] as string);
          const dateInRange = isWithinInterval(itemDate, {
            start: filters.dateRange.from,
            end: filters.dateRange.to || filters.dateRange.from,
          });
          if (!dateInRange) return false;
        } catch (error) {
          console.error('Error parsing date:', error);
          return false;
        }
      }

      return true;
    });
  }, [data, filters, searchFields, statusField, dateField]);

  const resetFilters = () => {
    setFilters({
      searchText: '',
      status: 'all',
      dateRange: undefined,
    });
  };

  return {
    filters,
    setFilters,
    filteredData,
    resetFilters,
  };
};
