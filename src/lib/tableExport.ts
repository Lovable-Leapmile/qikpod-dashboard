import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export type ExportFormat = 'csv' | 'excel' | 'pdf';

interface ExportColumn {
  field: string;
  headerName: string;
}

interface ExportOptions {
  data: any[];
  columns: ExportColumn[];
  filename: string;
  format: ExportFormat;
}

export const exportTableData = ({ data, columns, filename, format }: ExportOptions) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}-${timestamp}`;

  switch (format) {
    case 'csv':
      exportToCSV(data, columns, fullFilename);
      break;
    case 'excel':
      exportToExcel(data, columns, fullFilename);
      break;
    case 'pdf':
      exportToPDF(data, columns, fullFilename);
      break;
  }
};

const exportToCSV = (data: any[], columns: ExportColumn[], filename: string) => {
  const headers = columns.map(col => col.headerName);
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col.field];
      return value !== null && value !== undefined ? String(value) : '';
    })
  );

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  downloadFile(csvContent, `${filename}.csv`, 'text/csv');
};

const exportToExcel = (data: any[], columns: ExportColumn[], filename: string) => {
  const headers = columns.map(col => col.headerName);
  const rows = data.map(item => 
    columns.map(col => item[col.field])
  );

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

  // Auto-size columns
  const maxWidth = 50;
  const colWidths = columns.map((col, i) => {
    const headerWidth = col.headerName.length;
    const dataWidth = Math.max(
      ...rows.map(row => String(row[i] || '').length)
    );
    return { wch: Math.min(Math.max(headerWidth, dataWidth) + 2, maxWidth) };
  });
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

const exportToPDF = (data: any[], columns: ExportColumn[], filename: string) => {
  const doc = new jsPDF('l', 'mm', 'a4');
  
  // Add title
  doc.setFontSize(16);
  doc.text(filename, 14, 15);

  // Prepare table data
  const headers = columns.map(col => col.headerName);
  const rows = data.map(item => 
    columns.map(col => {
      const value = item[col.field];
      return value !== null && value !== undefined ? String(value) : '';
    })
  );

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 25,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [253, 220, 78], textColor: [0, 0, 0], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    margin: { top: 25 },
  });

  doc.save(`${filename}.pdf`);
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
