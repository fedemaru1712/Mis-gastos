import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  value: string;
  onChange: (value: string) => void;
  allowClear?: boolean;
  year?: string;
  onYearChange?: (value: string) => void;
}

const monthLabels = Array.from({ length: 12 }, (_, index) => format(new Date(2026, index, 1), "MMM", { locale: es }));

export function MonthPickerField({ className, value, onChange, allowClear = false, year, onYearChange }: Props) {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? new Date(`${value}-01T00:00:00`) : undefined;
  const [displayYear, setDisplayYear] = useState(() =>
    Number(year ?? selectedDate?.getFullYear() ?? new Date().getFullYear()),
  );

  useEffect(() => {
    if (year) {
      setDisplayYear(Number(year));
      return;
    }

    if (selectedDate) setDisplayYear(selectedDate.getFullYear());
  }, [selectedDate, year]);

  const selectedMonth = selectedDate?.getMonth();
  const displayLabel = useMemo(() => {
    if (!selectedDate) return "Selecciona un mes";
    return format(selectedDate, "MMMM 'de' yyyy", { locale: es });
  }, [selectedDate]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-10 w-full justify-between rounded-md border-input bg-background/60 px-3 text-left font-normal hover:bg-background/80",
            !selectedDate && "text-muted-foreground",
            className,
          )}
        >
          <span className="truncate">{displayLabel}</span>
          <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[17.5rem] p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                const nextYear = displayYear - 1;
                setDisplayYear(nextYear);
                onYearChange?.(String(nextYear));
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="text-sm font-semibold">{displayYear}</p>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                const nextYear = displayYear + 1;
                setDisplayYear(nextYear);
                onYearChange?.(String(nextYear));
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {monthLabels.map((label, index) => {
              const monthValue = `${displayYear}-${String(index + 1).padStart(2, "0")}`;
              const isSelected = selectedMonth === index && selectedDate?.getFullYear() === displayYear;

              return (
                <Button
                  key={monthValue}
                  type="button"
                  variant={isSelected ? "default" : "ghost"}
                  className="h-10 rounded-lg capitalize"
                  onClick={() => {
                    onChange(monthValue);
                    onYearChange?.(String(displayYear));
                    setOpen(false);
                  }}
                >
                  {label}
                </Button>
              );
            })}
          </div>
          {allowClear && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Limpiar mes
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
