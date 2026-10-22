// Lightweight, dependency-free export helpers for the transparency reports.
// CSV opens natively in Excel/Sheets; the "PDF" export uses the browser's
// native print-to-PDF via a printable view, avoiding a heavy PDF library.

export function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function printAsPdf(elementId, title) {
  const content = document.getElementById(elementId)?.innerHTML;
  if (!content) return;
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Georgia, serif; padding: 32px; color: #111; }
          h1 { color: #D32F2F; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { text-align: left; padding: 6px 10px; border-bottom: 1px solid #ddd; font-size: 13px; }
          th { background: #FFC107; color: #111; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${content}
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}
