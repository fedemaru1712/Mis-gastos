import { allCategories, expenseCategories, incomeCategories } from "@/domain";
import { TransactionQuery } from "@/types/api";
import { MonthPickerField } from "@/components/forms/month-picker-field";
import { Select } from "@/components/ui/select";

interface Props {
  filters: TransactionQuery;
  onChange: (filters: TransactionQuery) => void;
}

export function TransactionFilters({ filters, onChange }: Props) {
  const categories =
    filters.type === "income" ? incomeCategories : filters.type === "expense" ? expenseCategories : allCategories;

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <Select
        value={filters.category ?? "all"}
        onChange={(event) => onChange({ ...filters, category: event.target.value })}
      >
        <option value="all">Todas las categorías</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </Select>
      <MonthPickerField
        value={filters.month ?? ""}
        onChange={(value) => onChange({ ...filters, month: value || undefined })}
        allowClear
      />
    </div>
  );
}
