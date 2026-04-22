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

    const paperSizes: Record<string, { w: number, h: number }> = {
      'A4': { w: 210, h: 297 },
      'A5': { w: 148, h: 210 },
      'A3': { w: 297, h: 420 },
      'LETTER': { w: 216, h: 279 },
    };
    const size = paperSizes[metadata.config?.paperSize || 'A4'] || paperSizes['A4'];
    const isLandscape = metadata.config?.orientation === 'landscape';
    const pageWidth = isLandscape ? size.h : size.w;
    const pageHeight = isLandscape ? size.w : size.h;

    printWindow.document.write(`
      <html>
        <head>
          <title>${metadata.name} - ${resourceId}</title>
          <style>
            ${css}
            @media print {
              html, body { 
                margin: 0; 
                padding: 0; 
                height: ${pageHeight}mm; 
                width: ${pageWidth}mm; 
              }
              body { 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact;
              }
              @page { 
                margin: 0; 
                size: ${metadata.config?.paperSize || 'A4'} ${metadata.config?.orientation || 'portrait'}; 
              }
              .report-page {
                width: ${pageWidth}mm !important;
                height: ${pageHeight}mm !important;
                min-height: ${pageHeight}mm !important;
                page-break-after: always !important;
                break-after: page !important;
                overflow: hidden !important;
                box-sizing: border-box !important;
              }
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

export async function bulkPrintDocuments(
  templateId: string,
  resourceIds: string[],
  onPartialFailure?: (failedIds: string[], successCount: number) => void,
) {
    try {
      const results: any[] = [];
      const failed: string[] = [];

      for (const id of resourceIds) {
        const res = await backendApiClient.get<any>(`/templates/render/${templateId}/${id}`);
        if (res.data) {
          results.push(res.data);
        } else {
          failed.push(id);
          console.error(`Failed to render document for resource: ${id}`, res.error);
        }
      }

      if (failed.length > 0) {
        console.error(`Bulk print: ${failed.length} document(s) failed to render.`, failed);
        if (onPartialFailure) {
          onPartialFailure(failed, results.length);
        }
        if (results.length === 0) {
          throw new Error(`All ${failed.length} document(s) failed to render. Check console for details.`);
        }
        // Continue printing the successfully rendered documents
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
  
      const paperSizes: Record<string, { w: number, h: number }> = {
        'A4': { w: 210, h: 297 },
        'A5': { w: 148, h: 210 },
        'A3': { w: 297, h: 420 },
        'LETTER': { w: 216, h: 279 },
      };
      const size = paperSizes[results[0]?.metadata?.config?.paperSize || 'A4'] || paperSizes['A4'];
      const isLandscape = results[0]?.metadata?.config?.orientation === 'landscape';
      const pageWidth = isLandscape ? size.h : size.w;
      const pageHeight = isLandscape ? size.w : size.h;

      printWindow.document.write(`
        <html>
          <head>
            <title>Bulk Generation</title>
            <style>
              ${combinedCss}
              @media print {
                html, body { 
                  margin: 0; 
                  padding: 0; 
                  height: ${pageHeight}mm; 
                  width: ${pageWidth}mm; 
                }
                body { 
                  -webkit-print-color-adjust: exact; 
                  print-color-adjust: exact;
                }
                @page { 
                  margin: 0; 
                  size: ${results[0]?.metadata?.config?.paperSize || 'A4'} ${results[0]?.metadata?.config?.orientation || 'portrait'}; 
                }
                .report-page {
                    width: ${pageWidth}mm !important;
                    height: ${pageHeight}mm !important;
                    min-height: ${pageHeight}mm !important;
                    page-break-after: always !important;
                    break-after: page !important;
                    overflow: hidden !important;
                    box-sizing: border-box !important;
                    display: block !important;
                }
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
