import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useInvoice, useInvoicePreview } from "../../../hooks/useInvoice";
import { useState, useEffect, useRef } from "react";
import Modal from "../../../utils/Modal";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function InvoicePreview() {
  const { t } = useTranslation();
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoPrint = searchParams.get("autoprint") === "1";
  const renderAs = (searchParams.get("as") || "pdf").toLowerCase();
  const didAutoPrint = useRef(false);
  const location = useLocation();
  const backgroundLocation = location.state?.background;

  const {
    invoice,
    loading: loadingJson,
    error: errorJson,
  } = useInvoice(orderNumber);
  const {
    pdfUrl,
    loading: loadingPdf,
    error: errorPdf,
  } = useInvoicePreview(orderNumber);

  const [showPdf, setShowPdf] = useState(renderAs !== "html");

  const closeModal = () => {
    if (backgroundLocation) {
      navigate(backgroundLocation);
    } else {
      navigate("/account");
    }
  };

  const handlePrint = () => {
    if (showPdf && pdfUrl) {
      const iframeEl = document.getElementById("invoice-pdf-frame");
      if (iframeEl?.contentWindow) {
        iframeEl.contentWindow.focus();
        iframeEl.contentWindow.print();
        return;
      }
      const w = window.open(pdfUrl);
      w?.addEventListener("load", () => w.print());
      return;
    }
    const printable = document.getElementById("invoice-print-area");
    if (!printable) return;
    const w = window.open("", "_blank", "width=900,height=1000");
    w.document.write(`
  <html><head><title>${invoice?.invoiceNumber || "invoice"}</title><style>
    @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;700&display=swap');
    @page { size: A4; margin: 18mm 10mm 18mm 10mm; }
    body { 
      font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0; 
      padding: 0; 
      background: #e0e7ef;
      color: #333;
      font-size: 9pt;
    }
    .invoice-container {
      background: rgba(255,255,255,0.65);
      border-radius: 24px;
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
      border: 1.5px solid rgba(255,255,255,0.35);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      padding: 28px 32px;
      margin: 0 auto;
      max-width: 700px;
    }
    /* ...giữ nguyên các class khác... */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
    .header .shop-info { text-align: left; }
    .header .shop-info h1 { font-size: 18pt; margin: 0; color: #000; }
    .header .shop-info p { margin: 2px 0; font-size: 9pt; color: #555; }
    .header .invoice-title { text-align: right; }
    .header .invoice-title h2 { font-size: 24pt; margin: 0; color: #000; font-weight: 700; }
    .header .invoice-title p { margin: 2px 0; font-size: 9pt; color: #555; }
    .details { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; font-size: 9pt; }
    .details div h3 { font-size: 11pt; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; color: #000; }
    .details div p { margin: 4px 0; }
    .details div p b { color: #000; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .items-table thead { background-color: #f9f9f9; }
    .items-table th { padding: 12px; text-align: left; font-weight: 700; font-size: 9pt; border-bottom: 2px solid #ddd; }
    .items-table td { padding: 12px; border-bottom: 1px solid #eee; }
    .items-table .text-right { text-align: right; }
    .summary { display: flex; justify-content: flex-end; }
    .summary-table { width: 40%; }
    .summary-table td { padding: 8px 12px; }
    .summary-table tr.total td { font-size: 14pt; font-weight: 700; color: #000; border-top: 2px solid #333; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 8pt; color: #888; }
  </style></head><body><div class="invoice-container">${
    printable.innerHTML
  }</div></body></html>
`);
    w.document.close();
    w.focus();
    w.print();
  };

  useEffect(() => {
    // Chỉ auto print 1 lần duy nhất khi vào trang với autoprint=1
    if (!autoPrint || didAutoPrint.current) return;
    if (showPdf) {
      if (!loadingPdf && pdfUrl) {
        handlePrint();
        didAutoPrint.current = true;
      }
    } else {
      if (!loadingJson && invoice) {
        handlePrint();
        didAutoPrint.current = true;
      }
    }
    // eslint-disable-next-line
  }, [autoPrint, showPdf, loadingPdf, pdfUrl, loadingJson, invoice]);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `${invoice?.invoiceNumber || orderNumber}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const loading = loadingJson || (showPdf && loadingPdf);
  const loadError =
    (showPdf && errorPdf && !invoice && errorPdf) ||
    (!invoice && errorJson && errorJson);

  return (
    <Modal isOpen={true}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={closeModal}
              className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title={t("invoice_preview.close")}
            >
              ✕
            </button>
            <div className="font-semibold text-gray-800">
              {t("invoice_preview.title", { orderNumber })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPdf((p) => !p)}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors text-sm font-medium"
              disabled={loadingPdf}
            >
              {showPdf
                ? t("invoice_preview.view_html")
                : t("invoice_preview.view_pdf")}
            </button>
            {showPdf && pdfUrl && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
              >
                {t("invoice_preview.download_pdf")}
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {t("invoice_preview.print")}
            </button>
          </div>
        </div>

        {/* Nội dung */}
        <div className="flex-grow bg-gray-100">
          {loading ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              {t("common.loading")}...
            </div>
          ) : loadError ? (
            <div className="h-full flex items-center justify-center text-red-600 p-8 text-center">
              {loadError}
            </div>
          ) : showPdf && pdfUrl ? (
            <iframe
              id="invoice-pdf-frame"
              title="Invoice PDF Preview"
              src={pdfUrl}
              className="w-full h-full border-none"
            />
          ) : (
            <div className="h-full overflow-y-auto p-8">
              <div
                id="invoice-print-area"
                className="max-w-4xl mx-auto bg-white/60 backdrop-blur-lg border border-white/40 shadow-2xl rounded-3xl p-10"
              >
                {/* Header */}
                <div className="header">
                  <div className="shop-info">
                    <h1>DVFASHION</h1>
                    <p>12 Nguyễn Văn Bảo, P.4, Q.Gò Vấp, TP.HCM</p>
                    <p>dvfashion@gmail.com | 0123456789</p>
                  </div>
                  <div className="invoice-title">
                    <h2>HÓA ĐƠN</h2>
                    <p>#{invoice.invoiceNumber}</p>
                  </div>
                </div>

                {/* Thông tin chi tiết */}
                <div className="details">
                  <div>
                    <h3>Đơn hàng</h3>
                    <p>
                      <b>Số đơn hàng:</b> {invoice.orderNumber}
                    </p>
                    <p>
                      <b>Ngày đặt:</b>{" "}
                      {new Date(invoice.orderDate).toLocaleDateString("vi-VN")}
                    </p>
                    <p>
                      <b>Ngày xuất hóa đơn:</b>{" "}
                      {new Date(invoice.invoiceDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                  <div>
                    <h3>Khách hàng</h3>
                    <p>
                      <b>{invoice.customerName}</b>
                    </p>
                    <p>{invoice.customerEmail}</p>
                    <p>{invoice.shippingInfo.address}</p>
                  </div>
                </div>

                {/* Bảng sản phẩm */}
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th className="text-right">Số lượng</th>
                      <th className="text-right">Đơn giá</th>
                      <th className="text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((it, i) => (
                      <tr key={i}>
                        <td>
                          <div className="font-medium">{it.productName}</div>
                          <div className="text-xs text-gray-500">
                            {it.variantColor} / {it.size}
                          </div>
                        </td>
                        <td className="text-right">{it.quantity}</td>
                        <td className="text-right">
                          {Number(it.unitPrice).toLocaleString()}đ
                        </td>
                        <td className="text-right font-medium">
                          {Number(it.totalPrice).toLocaleString()}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Tổng kết */}
                <div className="summary">
                  <table className="summary-table">
                    <tbody>
                      <tr>
                        <td className="text-gray-600">Tạm tính</td>
                        <td className="text-right">
                          {Number(invoice.subtotal).toLocaleString()}đ
                        </td>
                      </tr>
                      <tr>
                        <td className="text-gray-600">Phí vận chuyển</td>
                        <td className="text-right">
                          {Number(invoice.shippingFee).toLocaleString()}đ
                        </td>
                      </tr>
                      {invoice.voucherDiscount > 0 && (
                        <tr>
                          <td className="text-gray-600">
                            Giảm giá (
                            <span className="font-mono">
                              {invoice.voucherCode}
                            </span>
                            )
                          </td>
                          <td className="text-right">
                            -{Number(invoice.voucherDiscount).toLocaleString()}đ
                          </td>
                        </tr>
                      )}
                      <tr className="total">
                        <td>TỔNG CỘNG</td>
                        <td className="text-right">
                          {Number(invoice.total).toLocaleString()}đ
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="footer">
                  <p>
                    Cảm ơn quý khách đã mua sắm tại DVFASHION! / Thank you for
                    shopping with us!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
