
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import FormField from './FormField';
import FormSection from './FormSection';

interface DataFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
}

const DataField: React.FC<DataFieldProps> = ({ 
  value, 
  onChange, 
  error,
  required = false 
}) => {
  // Parse the input date value
  const parseDate = (dateValue: string): Date | undefined => {
    if (!dateValue) return undefined;
    
    try {
      // Handle ISO format dates (with 'T')
      if (dateValue.includes('T')) {
        return new Date(dateValue);
      }
      
      // Handle YYYY-MM-DD format
      if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateValue.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      
      // Handle DD/MM/YYYY format potentially entered by user
      if (dateValue.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const [day, month, year] = dateValue.split('/').map(Number);
        return new Date(year, month - 1, day);
      }
      
      // Last resort, try direct parsing
      return new Date(dateValue);
    } catch (error) {
      console.error('Error parsing date:', error, dateValue);
      return undefined;
    }
  };

  // Format user input as DD/MM/AAAA while typing
  const formatDateInput = (input: string): string => {
    // Remove all non-numeric characters
    const numbersOnly = input.replace(/\D/g, '');
    
    // Add slashes while typing
    if (numbersOnly.length <= 2) return numbersOnly;
    if (numbersOnly.length <= 4) {
      return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2)}`;
    }
    return `${numbersOnly.slice(0, 2)}/${numbersOnly.slice(2, 4)}/${numbersOnly.slice(4, 8)}`;
  };

  // Handle input changes with automatic formatting
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedDate = formatDateInput(e.target.value);
    
    // Create a synthetic event to pass to the onChange handler
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: e.target.name,
        value: formattedDate
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
  };

  // Handle date selection from calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Format the selected date to DD/MM/YYYY
    const formattedDate = format(date, 'dd/MM/yyyy');
    
    // Create a synthetic event to pass to the onChange handler
    const syntheticEvent = {
      target: {
        name: 'data',
        value: formattedDate
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
  };

  const selectedDate = parseDate(value);

  return (
    <FormSection>
      <FormField 
        id="data" 
        label="Data" 
        error={error}
        required={required}
      >
        <div className="flex w-auto inline-flex gap-2">
          <Input
            id="data"
            name="data"
            type="text"
            placeholder="DD/MM/AAAA"
            value={value}
            onChange={handleInputChange}
            className={cn(
              "w-auto min-w-28",
              error ? "border-red-500 bg-red-50" : ""
            )}
            maxLength={10}
            aria-invalid={!!error}
          />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="icon"
                className={cn(
                  "h-10 w-10",
                  error ? "border-red-500" : ""
                )}
                type="button"
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={ptBR}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </FormField>
    </FormSection>
  );
};

export default DataField;
