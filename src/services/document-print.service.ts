import { backendApiClient } from '@/lib/api/client';

export async function printDocument(templateId: string, resourceId: string, options: Record<string, any> = {}) {
  try {
    const params: Record<string, string> = {};
    Object.entries(options).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        params[key] = Array.isArray(val) ? val.join(',') : String(val);
      }
    });

    const res = await backendApiClient.get<any>(`/templates/render/${templateId}/${resourceId}`, { params });
    
    if (res.error) throw new Error(res.error.message || "Failed to render template");
    const { html, css, metadata } = res.data;
    
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
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  } catch (e: any) {
    console.error("Print Error:", e);
    alert(`An error occurred while preparing the document for print: ${e.message || 'Unknown error'}`);
  }
}

export async function bulkPrintDocuments(templateId: string, resourceIds: string[]) {
    try {
      const results: any[] = [];
      
      for (const id of resourceIds) {
        const res = await backendApiClient.get<any>(`/templates/render/${templateId}/${id}`);
        if (res.data) {
          results.push(res.data);
        }
      }
  
      if (results.length === 0) return;

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups to print documents");
        return;
      }
  
      const config = results[0]?.metadata?.config || { perPage: 1, orientation: "portrait" };
      const perPage = config.perPage || 1;
      const orientation = config.orientation || "portrait";

      // Helper to chunk array
      const chunk = (arr: any[], size: number) => 
        Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
          arr.slice(i * size, i * size + size)
        );

      let combinedHtml = "";
      
      if (perPage === 1) {
        combinedHtml = results.map(r => `
          <div class="page-break">
            ${r.html}
          </div>
        `).join("");
      } else {
        const pages = chunk(results, perPage);
        combinedHtml = pages.map(page => `
          <div class="page-break print-grid per-${perPage}">
            ${page.map(r => `<div class="grid-item">${r.html}</div>`).join("")}
          </div>
        `).join("");
      }
  
      const combinedCss = results[0]?.css || "";
  
      printWindow.document.write(`
        <html>
          <head>
            <title>Bulk Generation</title>
            <style>
              ${combinedCss}
              @media print {
                body { margin: 0; padding: 0; }
                @page { margin: 0; size: auto; }
                .page-break { page-break-after: always; break-after: page; }
                
                .print-grid {
                  display: grid;
                  gap: 10px;
                  width: 100vw;
                  height: 100vh;
                  padding: 10px;
                  box-sizing: border-box;
                }
                
                .per-2 { grid-template-columns: ${orientation === 'landscape' ? '1fr' : '1fr 1fr'}; grid-template-rows: ${orientation === 'landscape' ? '1fr 1fr' : '1fr'}; }
                .per-4 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; }
                .per-6 { grid-template-columns: 1fr 1fr 1fr; grid-template-rows: 1fr 1fr; }
                
                .grid-item {
                  overflow: hidden;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                }
                
                /* Scale inner content if it's too large for the grid cell */
                .grid-item > * {
                  max-width: 100%;
                  max-height: 100%;
                  object-fit: contain;
                }
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
