export function downloadTable(filename: string, rows: Record<string, unknown>[], delimiter = ",") {
  if (!rows.length) return;
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const escape = (value: unknown) => {
    const text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };
  const content = [headers.map(escape).join(delimiter), ...rows.map((row) => headers.map((key) => escape(row[key])).join(delimiter))].join("\n");
  const blob = new Blob([content], { type: delimiter === "\t" ? "application/vnd.ms-excel" : "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function printCurrentPage() {
  window.print();
}
