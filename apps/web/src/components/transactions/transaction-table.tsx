import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { TransactionItem } from "@personal-finance/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const formatter = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

interface Props {
  items: TransactionItem[];
  onEdit: (transaction: TransactionItem) => void;
  onDelete: (transaction: TransactionItem) => void;
}

export function TransactionTable({ items, onEdit, onDelete }: Props) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-border bg-secondary/40 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium">{item.category}</p>
                <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString("es-ES")}</p>
                {item.bankAccountId && <p className="text-xs text-muted-foreground">Cuenta vinculada</p>}
              </div>
              <Badge variant={item.type}>{item.type === "income" ? "Ingreso" : "Gasto"}</Badge>
            </div>
            <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Cantidad</p>
                <p className="mt-1 font-semibold">{formatter.format(item.amount)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Descripción</p>
                <p className="mt-1 truncate">{item.description || "Sin descripción"}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-danger flex" onClick={() => onDelete(item)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Cantidad</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{new Date(item.date).toLocaleDateString("es-ES")}</TableCell>
                <TableCell>
                  <Badge variant={item.type}>{item.type === "income" ? "Ingreso" : "Gasto"}</Badge>
                </TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.bankAccountId ? "Vinculada" : "-"}</TableCell>
                <TableCell>{item.description || "Sin descripción"}</TableCell>
                <TableCell className="text-right font-semibold">{formatter.format(item.amount)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(item)} className="flex">
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-danger flex" onClick={() => onDelete(item)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
