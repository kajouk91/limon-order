import { APP_CONFIG } from "../config/appConfig.js";

export class PdfExportService {
  printDeliveryReceipt(order) {
    const rows = (order.itemsText || "")
      .split("|")
      .map((line, i) => `
        <tr>
          <td style="border:1px solid #cbd5e1; padding:8px; text-align:center;">${i + 1}</td>
          <td style="border:1px solid #cbd5e1; padding:8px;">${line.trim()}</td>
        </tr>
      `).join("");

    const win = window.open("", "_blank", "width=780,height=840");
    win.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8" />
        <title>إيصال تسليم - ${order.orderId}</title>
        <style>
          body { font-family: Tahoma, Arial, sans-serif; padding: 24px; color: #0f172a; }
          .sheet { border: 2px solid #0f766e; border-radius: 12px; padding: 22px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th { background: #0f766e; color: #fff; padding: 9px; border: 1px solid #0f766e; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <h2 style="margin:0; color:#0f766e;">${APP_CONFIG.COMPANY_NAME_AR}</h2>
          <div style="font-size:12px; color:#475569; margin-bottom:14px;">${APP_CONFIG.COMPANY_NAME_EN}</div>
          <p><strong>رقم الطلب:</strong> ${order.orderId} &nbsp;|&nbsp; <strong>التاريخ:</strong> ${order.createdAt}</p>
          <p><strong>المخبر / الزبون:</strong> ${order.customerName} &nbsp;|&nbsp; <strong>الهاتف:</strong> ${order.customerPhone}</p>
          <p><strong>المنطقة:</strong> ${order.area} &nbsp;|&nbsp; <strong>الأولوية:</strong> ${order.priority}</p>
          <table>
            <thead><tr><th style="width:50px;">#</th><th>المادة المطلوبة والكمية</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
          <p><strong>إجمالي العبوات:</strong> ${order.totalQty}</p>
          <p><strong>ملاحظات:</strong> ${order.notes || "-"}</p>
          <div style="display:flex; justify-content:space-between; margin-top:45px; padding-top:14px; border-top:1px dashed #94a3b8; font-size:13px;">
            <div>أمين المستودع: ....................</div>
            <div>مندوب التوصيل: ....................</div>
            <div>توقيع المستلم: ....................</div>
          </div>
        </div>
        <script>window.onload = () => window.print();<\/script>
      </body>
      </html>
    `);
    win.document.close();
  }
}
