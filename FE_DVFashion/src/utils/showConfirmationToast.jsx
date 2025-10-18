import { toast } from "react-toastify";
import i18n from "i18next";

/**
 * Hiển thị toast confirmation với custom message và actions
 * @param {Object} options - Cấu hình cho confirmation toast
 * @param {string} options.title - Tiêu đề confirmation
 * @param {string} options.message - Nội dung thông báo
 * @param {Function} options.onConfirm - Callback khi user xác nhận
 * @param {Function} options.onCancel - Callback khi user hủy (optional)
 * @param {string} options.confirmText - Text button xác nhận (default: "Đồng ý")
 * @param {string} options.cancelText - Text button hủy (default: "Hủy")
 * @param {string} options.confirmButtonClass - CSS class cho button xác nhận
 * @param {string} options.cancelButtonClass - CSS class cho button hủy
 * @param {string} options.uniqueId - ID duy nhất cho toast (optional)
 * @returns {string} Toast ID
 */
export const showConfirmationToast = ({
  title = "Xác nhận thao tác",
  message,
  onConfirm,
  onCancel = null,
  confirmText,
  cancelText,
  confirmButtonClass = "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors cursor-pointer",
  cancelButtonClass = "bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition-colors cursor-pointer",
  uniqueId = null,
}) => {
  const toastId = uniqueId || `confirmation-${Date.now()}-${Math.random()}`;

  const t = i18n.t;

  const finalTitle = title || t("confirm.title");
  const finalConfirmText = confirmText || t("common.confirm");
  const finalCancelText = cancelText || t("common.cancel");

  const handleCancel = () => {
    toast.dismiss(toastId);
    if (onCancel) onCancel();
  };

  const handleConfirm = () => {
    toast.dismiss(toastId);
    if (onConfirm) onConfirm();
  };

  const warningToastId = toast.warn(
    <div className="flex flex-col gap-3">
      <div>
        <strong>{finalTitle}</strong>
      </div>
      <div>{message}</div>
      <div className="flex gap-2 justify-end">
        <button className={cancelButtonClass} onClick={handleCancel}>
          {finalCancelText}
        </button>
        <button className={confirmButtonClass} onClick={handleConfirm}>
          {finalConfirmText}
        </button>
      </div>
    </div>,
    {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: false,
      toastId: toastId,
    }
  );

  return warningToastId;
};

/**
 * Hiển thị confirmation toast cho việc xóa/vô hiệu hóa
 * @param {Object} options
 * @param {string} options.itemName - Tên item cần xóa
 * @param {string} options.itemType - Loại item (nhân viên, sản phẩm, etc.)
 * @param {boolean} options.isActive - Trạng thái hiện tại (true = active, false = inactive)
 * @param {Function} options.onConfirm - Callback khi xác nhận
 * @param {Function} options.onCancel - Callback khi hủy (optional)
 * @param {string} options.uniqueId - ID duy nhất (optional)
 * @returns {string} Toast ID
 */
export const showDeleteConfirmationToast = ({
  itemName,
  itemType = "mục",
  isActive = true,
  onConfirm,
  onCancel = null,
  uniqueId = null,
}) => {
  const t = i18n.t;
  const action = isActive
    ? t("confirm.action_deactivate")
    : t("confirm.action_activate");
  const finalItemType = itemType || t("confirm.itemType_default");
  const title = t("confirm.title");
  const message = t("confirm.delete_message", {
    action: action,
    itemType: finalItemType,
    itemName: itemName,
  });

  return showConfirmationToast({
    title,
    message,
    onConfirm,
    onCancel,
    confirmText: t("common.confirm"),
    cancelText: t("common.cancel"),
    confirmButtonClass: isActive
      ? "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors cursor-pointer"
      : "bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors cursor-pointer",
    uniqueId: uniqueId || `delete-${finalItemType}-${Date.now()}`,
  });
};

/**
 * Hiển thị confirmation toast đơn giản với Yes/No
 * @param {string} message - Thông báo cần xác nhận
 * @param {Function} onConfirm - Callback khi user chọn Yes
 * @param {Function} onCancel - Callback khi user chọn No (optional)
 * @returns {string} Toast ID
 */
export const showSimpleConfirmation = (message, onConfirm, onCancel = null) => {
  const t = i18n.t;
  return showConfirmationToast({
    title: t("confirm.simple_title"),
    message,
    onConfirm,
    onCancel,
    confirmText: t("common.yes"),
    cancelText: t("common.no"),
    confirmButtonClass:
      "bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors cursor-pointer",
  });
};

// Export default cho compatibility
export default {
  showConfirmationToast,
  showDeleteConfirmationToast,
  showSimpleConfirmation,
};
