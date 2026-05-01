import { TransactionQuery } from "@/types/api";
import { MonthPickerField } from "@/components/forms/month-picker-field";
import { Select } from "@/components/ui/select";

interface Props {
  filters: TransactionQuery;
  onChange: (filters: TransactionQuery) => void;
}

export function TransactionFilters({ filters, onChange }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Select
        value={filters.type ?? "all"}
        onChange={(event) => onChange({ ...filters, type: event.target.value as TransactionQuery["type"] })}
      >
        <option value="all">Todos</option>
        <option value="income">Ingresos</option>
        <option value="expense">Gastos</option>
      </Select>
      <MonthPickerField
        value={filters.month ?? ""}
        onChange={(value) => onChange({ ...filters, month: value || undefined })}
        allowClear
      />
    </div>
  );
}
