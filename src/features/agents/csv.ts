import { emptyDraft, type UserDraft, type ManagedUser } from './api';

export const CSV_FIELDS = ['name', 'email', 'password', 'birthDate', 'gender', 'city', 'phone', 'profession', 'bio'] as const;
export const CSV_PHOTO_FIELDS = ['photo1', 'photo2', 'photo3', 'photo4', 'photo5'] as const;
export const CSV_TEMPLATE_FIELDS = [...CSV_FIELDS, ...CSV_PHOTO_FIELDS];
export const CSV_EXPORT_FIELDS = ['accountId', ...CSV_TEMPLATE_FIELDS, 'status', 'onboarding', 'joinedAt', 'emailChangedAt'];

export function templateRows(drafts: UserDraft[]): string[][] {
  const filled = drafts.filter(draft => Object.entries(draft).some(([field, value]) => field !== 'gender' && (Array.isArray(value) ? value.length : Boolean(value))));
  const users = filled;
  return [[...CSV_TEMPLATE_FIELDS], ...users.map(user => [...CSV_FIELDS.map(field => user[field]), ...CSV_PHOTO_FIELDS.map((_, index) => user.photos[index] || '')])];
}

export function exportUserRow(user: Partial<ManagedUser> & { password?: string }): string[] {
  return [user.id || '', ...CSV_FIELDS.map(field => field === 'birthDate' ? user.birthDate?.slice(0, 10) || '' : String(user[field] ?? '')),
    ...CSV_PHOTO_FIELDS.map((_, index) => user.photos?.[index] || ''),
    user.status || '', user.onboardingCompleted === undefined ? '' : user.onboardingCompleted ? 'Complete' : 'User to complete on login',
    user.createdAt || '', user.agentEmailChangedAt || ''];
}

export function selectedUserExportRows(user: ManagedUser, expectedId: string): string[][] {
  if (!expectedId || user.id !== expectedId) throw new Error('The downloaded account does not match the selected user. Please reopen their details.');
  return [[...CSV_EXPORT_FIELDS], exportUserRow(user)];
}

export async function registeredUserExportRows(fetchPage: (cursor?: string) => Promise<{ users: ManagedUser[]; nextCursor: string | null }>): Promise<string[][]> {
  const users = new Map<string, ManagedUser>();
  const seenCursors = new Set<string>();
  let cursor: string | undefined;
  do {
    const page = await fetchPage(cursor);
    if (!Array.isArray(page.users)) throw new Error('Could not read registered user details.');
    page.users.forEach(user => { if (user.id) users.set(user.id, user); });
    cursor = page.nextCursor || undefined;
    if (cursor && seenCursors.has(cursor)) throw new Error('User export could not finish. Please try again.');
    if (cursor) seenCursors.add(cursor);
  } while (cursor);
  if (!users.size) throw new Error('No registered users to download. Create an account first.');
  return [[...CSV_EXPORT_FIELDS], ...[...users.values()].map(user => exportUserRow(user))];
}
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
  if (new Set(headers).size !== headers.length) throw new Error('CSV has duplicate column headers. Please use the template.');
  if (!CSV_FIELDS.slice(0, 6).every(field => headers.includes(field))) throw new Error('CSV must include name, email, password, birthDate, gender and city. Download the template to get started.');
  if (!rows.length || rows.length > 25) throw new Error('Import between 1 and 25 accounts at a time.');
  return rows.map(values => {
    if (values.length !== headers.length) throw new Error('Some CSV rows have a different number of columns. Please check the file.');
    const draft = emptyDraft();
    CSV_FIELDS.forEach(field => { const index = headers.indexOf(field); if (index !== -1) draft[field] = field === 'password' ? values[index] : values[index].trim(); });
    draft.photos = CSV_PHOTO_FIELDS.flatMap(field => {
      const index = headers.indexOf(field);
      const photo = index < 0 ? '' : values[index].trim();
      if (!photo) return [];
      if (photo.length > 1_500_000 || !/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(photo)) throw new Error(field + ': use JPG/PNG/WebP image data, or leave photo columns blank and upload photos in the form.');
      return [photo];
    });
    draft.email = draft.email.toLowerCase(); draft.gender = draft.gender.toLowerCase(); return draft;
  });
}
