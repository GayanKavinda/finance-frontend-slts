/**
 * Export JSON array of objects to CSV file in browser
 * @param {Array<Object>} data Array of objects to export
 * @param {string} filename Output file name without extension
 * @param {Array<{key: string, label: string}>} columns Optional custom column mappings
 */
export function exportToCSV(data, filename = "export", columns = null) {
  if (!data || !data.length) {
    alert("No data available to export.");
    return;
  }

  const headers = columns
    ? columns.map((col) => col.label)
    : Object.keys(data[0]);

  const keys = columns ? columns.map((col) => col.key) : Object.keys(data[0]);

  const csvRows = [];

  // Add header row
  csvRows.push(headers.map((header) => `"${header.replace(/"/g, '""')}"`).join(","));

  // Add data rows
  for (const row of data) {
    const values = keys.map((key) => {
      // Handle nested property access e.g., 'customer.name'
      const val = key.split(".").reduce((obj, i) => (obj ? obj[i] : null), row);
      if (val === null || val === undefined) return '""';
      const strVal = typeof val === "object" ? JSON.stringify(val) : String(val);
      return `"${strVal.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + csvRows.join("\n");
  const encodedUri = encodeURI(csvContent);

  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
