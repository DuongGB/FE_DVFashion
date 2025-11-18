import { reportTaxAPI } from "../services/reportTaxAPI";

export function useExportTaxReport() {
  // Hàm export từng loại báo cáo
  const exportVATForm011 = async ({ startDate, endDate }) => {
    return await reportTaxAPI.exportVATForm011({ startDate, endDate });
  };
  const exportVATForm04 = async ({ startDate, endDate }) => {
    return await reportTaxAPI.exportVATForm04({ startDate, endDate });
  };
  const exportVATForm014A = async ({ startDate, endDate }) => {
    return await reportTaxAPI.exportVATForm014A({ startDate, endDate });
  };
  return { exportVATForm011, exportVATForm04, exportVATForm014A };
}
