
'use client';

import * as React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox'; // Added Checkbox
import { cn } from '@/lib/utils'; // Added this line

interface ColumnDef<T> {
  accessorKey: keyof T | string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  size?: number;
}

interface DataTableProps<T extends { id: string }> { // Ensure T has an id
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  noResultsMessage?: string;
  isSelectable?: boolean;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (selection: Record<string, boolean>) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  noResultsMessage = "No results found.",
  isSelectable = false,
  rowSelection = {},
  onRowSelectionChange,
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectAllClick = (checked: boolean | 'indeterminate') => {
    if (!onRowSelectionChange) return;
    const newSelection = { ...rowSelection };
    paginatedData.forEach(row => {
      if (checked === true) {
        newSelection[row.id] = true;
      } else {
        delete newSelection[row.id]; // If unchecking, remove from selection
      }
    });
    onRowSelectionChange(newSelection);
  };
  
  const handleRowSelectClick = (rowId: string, checked: boolean) => {
    if (!onRowSelectionChange) return;
    const newSelection = { ...rowSelection };
    if (checked) {
      newSelection[rowId] = true;
    } else {
      delete newSelection[rowId];
    }
    onRowSelectionChange(newSelection);
  };

  const paginatedDataIds = paginatedData.map(row => row.id);
  const numSelectedOnPage = paginatedDataIds.filter(id => rowSelection[id]).length;
  const allSelectedOnPage = paginatedData.length > 0 && numSelectedOnPage === paginatedData.length;
  const someSelectedOnPage = numSelectedOnPage > 0 && !allSelectedOnPage;


  const tableColumns = React.useMemo(() => {
    if (!isSelectable) return columns;
    
    const selectionColumn: ColumnDef<T> = {
      accessorKey: 'select',
      header: () => (
        <Checkbox
          checked={allSelectedOnPage}
          data-state={someSelectedOnPage ? 'indeterminate' : allSelectedOnPage ? 'checked' : 'unchecked'}
          onCheckedChange={(checked) => handleSelectAllClick(checked)}
          aria-label="Select all rows on this page"
        />
      ),
      cell: (row: T) => (
        <Checkbox
          checked={!!rowSelection[row.id]}
          onCheckedChange={(checked) => handleRowSelectClick(row.id, !!checked)}
          aria-label={`Select row ${row.id}`}
          onClick={(e) => e.stopPropagation()} // Prevent row click when interacting with checkbox
        />
      ),
      size: 50,
    };
    return [selectionColumn, ...columns];
  }, [columns, isSelectable, rowSelection, paginatedData, allSelectedOnPage, someSelectedOnPage, handleSelectAllClick, handleRowSelectClick]);


  return (
    <div className="w-full space-y-4">
      <ScrollArea className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {tableColumns.map((column, index) => (
                <TableHead key={String(column.accessorKey) + index} style={{ width: column.size ? `${column.size}px` : undefined }}>
                  {typeof column.header === 'function' ? column.header(null as any) : column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow
                  key={`row-${row.id || rowIndex}`}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    onRowClick ? 'cursor-pointer hover:bg-muted/50' : '',
                    rowSelection[row.id] ? 'bg-muted/50' : ''
                  )}
                  data-state={rowSelection[row.id] ? 'selected' : undefined}
                >
                  {tableColumns.map((column, colIndex) => (
                    <TableCell key={`cell-${row.id || rowIndex}-${colIndex}`}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  {noResultsMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

DataTable.displayName = "DataTable";
