import { ChevronLeft, ChevronRight } from "lucide-react";
import { getISODay } from "date-fns";
import { es } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

const weekdayLabels = ["lu", "ma", "mi", "ju", "vi", "sa", "do"];

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      locale={es}
      ISOWeek
      captionLayout="label"
      fixedWeeks
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col gap-4 sm:flex-row",
        month: "space-y-4",
        month_caption: "relative flex items-center justify-center px-8 pt-1",
        caption_label: "text-sm font-semibold",
        nav: "absolute inset-x-0 top-1 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex w-full",
        weekday: "h-8 w-10 p-0 text-center align-middle text-xs font-medium text-muted-foreground",
        weeks: "w-full",
        week: "mt-2 flex w-full",
        cell: "relative h-10 w-10 p-0 text-center text-sm [&:has([aria-selected])]:bg-accent/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "relative h-10 w-10 p-0 text-center text-sm",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 rounded-md p-0 font-normal aria-selected:opacity-100",
        ),
        selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        today: "bg-secondary text-foreground",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "aria-selected:bg-accent aria-selected:text-foreground",
        range_end: "day-range-end",
        hidden: "invisible",
        ...classNames,
      }}
      formatters={{
        formatWeekdayName: (date) => weekdayLabels[getISODay(date) - 1],
      }}
      components={{
        Chevron: ({ orientation, className: iconClassName, ...iconProps }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("h-4 w-4", iconClassName)} {...iconProps} />
          ) : (
            <ChevronRight className={cn("h-4 w-4", iconClassName)} {...iconProps} />
          ),
      }}
      {...props}
    />
  );
}
