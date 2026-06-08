interface DataTableProps {
 columns: string[];
 rows: (string | number)[][];
}

export function DataTable({ columns, rows }: DataTableProps) {
 return (
 <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-muted/60">
 <tr>
 {columns.map((column) => (
 <th key={column} className="text-left font-semibold text-foreground px-4 py-3 whitespace-nowrap">
 {column}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {rows.map((row, rowIndex) => (
 <tr key={rowIndex} className="border-t border-border hover:bg-muted/30">
 {row.map((cell, cellIndex) => (
 <td key={cellIndex} className="px-4 py-3 text-foreground whitespace-nowrap">
 {cell}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
}
