/**
 * Utilities for exporting system data to CSV for external reporting.
 */

interface TimestampObject {
  toMillis(): number;
}

interface DataRow {
  [key: string]: any;
}

/**
 * Export data to CSV file
 */
export const exportToCSV = (data: DataRow[], filename: string = 'export'): void => {
  if (!data || !data.length) {
    console.warn("No data to export.");
    return;
  }

  const allKeys = new Set<string>();
  data.forEach(item => Object.keys(item).forEach(k => allKeys.add(k)));
  const headers = Array.from(allKeys);

  const csvRows: string[] = [];
  csvRows.push(headers.join(','));

  data.forEach(row => {
    const values = headers.map(header => {
      const val = row[header];

      if (val && typeof val === 'object') {
        if ((val as TimestampObject).toMillis) {
          return `"${new Date((val as TimestampObject).toMillis()).toLocaleString()}"`;
        }
        return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
      }

      const escaped = ('' + (val ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
