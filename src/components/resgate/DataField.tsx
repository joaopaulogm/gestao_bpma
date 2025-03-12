
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, parse } from 'date-fns';
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
  // Ensure the date is in YYYY-MM-DD format for the input field
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      // If the date already includes a 'T', it's in ISO format and we just need the date part
      if (dateString.includes('T')) {
        return dateString.split('T')[0];
      }
      
      // If it's just a date string, make sure it's in the right format
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date for input:', error, dateString);
      return dateString;
    }
  };

  // Convert YYYY-MM-DD string to Date object for the calendar
  const getDateFromString = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    
    try {
      // Parse the date string into a Date object
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    } catch (error) {
      console.error('Error parsing date string:', error, dateString);
      return undefined;
    }
  };

  // Handle date selection from calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // Format the selected date to YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    // Create a synthetic event to pass to the onChange handler
    const syntheticEvent = {
      target: {
        name: 'data',
        value: formattedDate
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(syntheticEvent);
  };

  const formattedValue = formatDateForInput(value);
  const selectedDate = getDateFromString(formattedValue);

  return (
    <FormSection>
      <FormField 
        id="data" 
        label="Data" 
        error={error}
        required={required}
      >
        <div className="flex w-full gap-2">
          <Input
            id="data"
            name="data"
            type="date"
            value={formattedValue}
            onChange={onChange}
            className={cn(
              "flex-1",
              error ? "border-red-500 bg-red-50" : ""
            )}
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
