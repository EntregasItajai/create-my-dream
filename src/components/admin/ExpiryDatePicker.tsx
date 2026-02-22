import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ExpiryDatePickerProps {
  currentDate: string | null;
  onDateChange: (date: Date) => void;
  disabled?: boolean;
}

export const ExpiryDatePicker = ({ currentDate, onDateChange, disabled }: ExpiryDatePickerProps) => {
  const [open, setOpen] = useState(false);
  const selected = currentDate ? new Date(currentDate) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className={cn(
            'text-xs font-normal gap-1.5',
            !selected && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="w-3.5 h-3.5" />
          {selected ? format(selected, 'dd/MM/yyyy') : 'Expiração'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) {
              onDateChange(date);
              setOpen(false);
            }
          }}
          disabled={(date) => date < new Date()}
          initialFocus
          className={cn('p-3 pointer-events-auto')}
        />
      </PopoverContent>
    </Popover>
  );
};
