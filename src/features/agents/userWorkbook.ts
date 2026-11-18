import { CSV_PHOTO_FIELDS } from './csv';

const mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

async function photoPreview(source: string): Promise<string | null> {
  if (!/^data:image\/(jpeg|png|webp);base64,/i.test(source)) return null;
  try {
    const image = new Image();
    image.src = source;
    await image.decode();
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, 96 / Math.max(image.naturalWidth, image.naturalHeight));
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) return null;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch {
    return null;
  }
}

export async function buildUserWorkbook([headers, ...users]: string[][]) {
  const { default: ExcelJS } = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Registered users', {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  const columns = headers.map((field, index) => ({ field, index }))
    .filter(({ field }) => field !== 'password');
  const photoFields = new Set<string>(CSV_PHOTO_FIELDS);
  sheet.columns = columns.map(({ field }) => ({
    header: field,
    width: photoFields.has(field) ? 16 : field === 'bio' ? 44 : ['accountId', 'email'].includes(field) ? 39 : 24,
  }));
  const heading = sheet.getRow(1);
  heading.height = 25;
  heading.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  heading.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF893356' } };
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };

  for (const user of users) {
    const row = sheet.addRow(columns.map(({ field, index }) => {
      const value = user[index] || '';
      return photoFields.has(field) && value.startsWith('data:') ? '' : value;
    }));
    row.alignment = { vertical: 'middle', wrapText: true };
    for (const [column, { field, index }] of columns.entries()) {
      if (!photoFields.has(field) || !user[index]?.startsWith('data:')) continue;
      const base64 = await photoPreview(user[index]);
      if (!base64) {
        row.getCell(column + 1).value = 'Photo unavailable';
        continue;
      }
      row.height = 65;
      const id = workbook.addImage({ base64, extension: 'jpeg' });
      sheet.addImage(id, { tl: { col: column + 0.05, row: row.number - 0.95 }, ext: { width: 76, height: 76 }, editAs: 'oneCell' });
    }
  }
  return workbook.xlsx.writeBuffer();
}

export async function downloadUserWorkbook(rows: string[][]) {
  const buffer = await buildUserWorkbook(rows);
  const url = URL.createObjectURL(new Blob([new Uint8Array(buffer)], { type: mime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'connectlove-registered-users.xlsx';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
