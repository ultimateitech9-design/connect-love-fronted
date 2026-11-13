import { emptyDraft, type UserDraft } from './api';

export const CSV_FIELDS = ['name', 'email', 'password', 'birthDate', 'gender', 'city', 'phone', 'profession', 'bio'] as const;
export function csvText(rows: string[][]) { return '\uFEFF' + rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n'); }
export function downloadCsv(filename: string, rows: string[][]) {
  const url = URL.createObjectURL(new Blob([csvText(rows)], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function parseUsersCsv(input: string): UserDraft[] {
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let quoted = false;
  const text = input.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') { if (quoted && text[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; }
    else if (char === ',' && !quoted) { row.push(cell); cell = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) { if (char === '\r' && text[i + 1] === '\n') i++; row.push(cell); if (row.some(value => value.trim())) rows.push(row); row = []; cell = ''; }
    else cell += char;
  }
  if (quoted) throw new Error('CSV has an unclosed quote. Please use the template.');
  row.push(cell); if (row.some(value => value.trim())) rows.push(row);
  const headers = rows.shift()?.map(value => value.trim()) || [];
  if (!CSV_FIELDS.slice(0, 6).every(field => headers.includes(field))) throw new Error('CSV must include name, email, password, birthDate, gender and city. Download the template to get started.');
  if (!rows.length || rows.length > 25) throw new Error('Import between 1 and 25 accounts at a time.');
  return rows.map(values => {
    if (values.length !== headers.length) throw new Error('Some CSV rows have a different number of columns. Please check the file.');
    const draft = emptyDraft();
    CSV_FIELDS.forEach(field => { const index = headers.indexOf(field); if (index !== -1) draft[field] = field === 'password' ? values[index] : values[index].trim(); });
    draft.email = draft.email.toLowerCase(); draft.gender = draft.gender.toLowerCase(); return draft;
  });
}
