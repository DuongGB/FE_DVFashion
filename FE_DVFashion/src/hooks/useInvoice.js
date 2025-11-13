import { useState, useEffect } from "react";
import { getInvoicePdfPreview, getInvoice } from "../services/invoicesAPI";

export function useInvoicePreview(orderNumber) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let url;
    if (!orderNumber) return;
    setLoading(true);
    setError("");
    getInvoicePdfPreview(orderNumber)
      .then((blob) => {
        url = URL.createObjectURL(blob);
        setPdfUrl(url);
      })
      .catch(() => setError("Không thể xem trước hóa đơn"))
      .finally(() => setLoading(false));
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [orderNumber]);

  return { pdfUrl, loading, error };
}

export function useInvoice(orderNumber) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!orderNumber) return;
    setLoading(true);
    setError("");
    getInvoice(orderNumber)
      .then(setInvoice)
      .catch(() => setError("Không thể tải hóa đơn"))
      .finally(() => setLoading(false));
  }, [orderNumber]);
  return { invoice, loading, error };
}
