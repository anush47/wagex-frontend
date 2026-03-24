const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function printDocument(templateId: string, resourceId: string) {
  try {
    const res = await fetch(`${API_URL}/templates/render/${templateId}/${resourceId}`);
    if (!res.ok) throw new Error("Failed to render template");
    
    const { html, css, metadata } = await res.json();
    
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print documents");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${metadata.name} - ${resourceId}</title>
          <style>
            ${css}
            @media print {
              body { margin: 0; padding: 0; }
              @page { margin: 0; size: auto; }
            }
          </style>
        </head>
        <body>
          ${html}
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => {
                // Optional: window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (e) {
    console.error("Print Error:", e);
    alert("An error occurred while preparing the document for print.");
  }
}

export async function bulkPrintDocuments(templateId: string, resourceIds: string[]) {
    try {
      const results = await Promise.all(
        resourceIds.map(id => fetch(`${API_URL}/templates/render/${templateId}/${id}`).then(r => r.json()))
      );
  
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups to print documents");
        return;
      }
  
      const combinedHtml = results.map(r => `
        <div class="page-break">
          ${r.html}
        </div>
      `).join("");
  
      const combinedCss = results[0]?.css || "";
  
      printWindow.document.write(`
        <html>
          <head>
            <title>Bulk Generation</title>
            <style>
              ${combinedCss}
              @media print {
                .page-break { page-break-after: always; break-after: page; }
                body { margin: 0; padding: 0; }
              }
            </style>
          </head>
          <body>
            ${combinedHtml}
            <script>
              window.onload = () => {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (e) {
      console.error("Bulk Print Error:", e);
      alert("An error occurred while preparing bulk documents.");
    }
  }
