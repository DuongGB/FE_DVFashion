import {
  IconBan,
  IconCheck,
  IconClock,
  IconEye,
  IconMessage,
  IconRestore,
  IconStarFilled,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDebounce } from "use-debounce";
import Pagination from "../../components/common/Pagination";
import ReviewDetailModal from "../../components/ui/review/ReviewDetailModal";
import { useAdminReviews, useModerateReview } from "../../hooks/useReview";
import { showConfirmationToast } from "../../utils/showConfirmationToast";
import { toast } from "react-toastify";

const statusKeys = [
  "PENDING",
  "AUTO_APPROVED",
  "APPROVED",
  "NEED_REVIEW",
  "REJECTED",
  "HIDDEN",
];

export default function ReviewPage() {
  const { t } = useTranslation();

  const statusConfig = statusKeys.reduce((acc, key) => {
    acc[key] = {
      label: t(`admin.review.status.${key}`),
      color: {
        PENDING: "bg-yellow-100 text-yellow-800",
        AUTO_APPROVED: "bg-cyan-100 text-cyan-800",
        APPROVED: "bg-green-100 text-green-800",
        NEED_REVIEW: "bg-orange-100 text-orange-800",
        REJECTED: "bg-red-100 text-red-800",
        HIDDEN: "bg-gray-100 text-gray-800",
      }[key],
    };
    return acc;
  }, {});

  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [moderationState, setModerationState] = useState({
    isOpen: false,
    review: null,
    newStatus: "",
    actionText: "",
  });
  const pageSize = 10;

  const params = {
    page: currentPage,
    size: pageSize,
    keyword: debouncedSearch,
    status: statusFilter || null,
    rating: ratingFilter || null,
    sort: "createdAt,desc",
  };

  const { data, isLoading, isError, error } = useAdminReviews(params);
  const { mutate: moderateReview, isLoading: isModerating } =
    useModerateReview();

  const reviews = data?.data?.reviews || [];
  const stats = data?.data?.statistics || {};
  const totalPages = data?.data?.totalPages || 0;
  const totalElements = data?.data?.totalElements || 0;

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, statusFilter, ratingFilter]);

  const handleModerate = (review, newStatus, actionText) => {
    const needsComment = newStatus === "REJECTED" || newStatus === "HIDDEN";

    const performModeration = (adminComment = null) => {
      const request = { newStatus };
      if (needsComment && adminComment) {
        request.adminComment = adminComment;
      }
      moderateReview(
        { reviewId: review.id, request },
        {
          onSuccess: () => {
            setModerationState({ isOpen: false, review: null });
          },
        }
      );
    };

    if (needsComment) {
      setModerationState({ isOpen: true, review, newStatus, actionText });
    } else {
      showConfirmationToast({
        title: t("admin.review.moderate.confirm_title", {
          action: actionText,
        }),
        message: t("admin.review.moderate.confirm_message", {
          action: actionText.toLowerCase(),
          customerName: review.user.fullName,
        }),
        confirmText: actionText,
        onConfirm: () => performModeration(),
      });
    }
  };

  const handleModerationSubmit = (adminComment) => {
    const { review, newStatus, actionText } = moderationState;
    const request = { newStatus, adminComment };
    moderateReview(
      { reviewId: review.id, request },
      {
        onSuccess: () => {
          setModerationState({ isOpen: false, review: null });
        },
      }
    );
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN");

  if (isError) {
    return (
      <div className="text-center text-red-500">
        {t("admin.review.error_loading", {
          message: error.response?.data?.message || error.message,
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        {" "}
        {t("admin.review.title")}
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title={t("admin.review.stats.total")}
          value={stats.totalReviews || 0}
          icon={<IconMessage className="h-8 w-8 text-blue-600" />}
        />
        <StatCard
          title={t("admin.review.stats.pending")}
          value={stats.statusCounts?.PENDING || 0}
          icon={<IconClock className="h-8 w-8 text-yellow-600" />}
        />
        <StatCard
          title={t("admin.review.stats.approved")}
          value={stats.statusCounts?.APPROVED || 0}
          icon={<IconCheck className="h-8 w-8 text-green-600" />}
        />
        <StatCard
          title={t("admin.review.stats.average_rating")}
          value={stats.averageRating?.toFixed(1) || 0}
          icon={<IconStarFilled className="h-8 w-8 text-purple-600" />}
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder={t("admin.review.search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">{t("admin.review.all_status")}</option>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">{t("admin.review.all_ratings")}</option>
            {[5, 4, 3, 2, 1].map((star) => (
              <option key={star} value={star}>
                {t("admin.review.rating_option", { star })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">{t("admin.review.columns.customer")}</th>
              <th className="p-3">{t("admin.review.columns.product")}</th>
              <th className="p-3">{t("admin.review.columns.rating")}</th>
              <th className="p-3">{t("admin.review.columns.comment")}</th>
              <th className="p-3">{t("admin.review.columns.status")}</th>
              <th className="p-3">{t("admin.review.columns.created_at")}</th>
              <th className="p-3">{t("admin.review.columns.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="7" className="text-center p-6">
                  {t("admin.review.loading")}
                </td>
              </tr>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <tr key={review.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <p className="font-semibold">{review.user.fullName}</p>
                    <p className="text-sm text-gray-500">{review.user.email}</p>
                  </td>
                  <td className="p-3">
                    <p className="font-semibold">{review.productName}</p>
                    <p className="text-sm text-gray-500">
                      {review.variantName}
                    </p>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 font-semibold">
                      {review.rating}
                      <IconStarFilled size={16} className="text-yellow-400" />
                    </div>
                  </td>
                  <td className="p-3 max-w-xs truncate">{review.comment}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        statusConfig[review.status]?.color
                      }`}
                    >
                      {statusConfig[review.status]?.label}
                    </span>
                  </td>
                  <td className="p-3">{formatDate(review.createdAt)}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setShowDetailModal(true);
                        }}
                        className="hover:text-blue-600 cursor-pointer"
                        title={t("admin.review.actions.view_detail")}
                      >
                        <IconEye size={20} />
                      </button>
                      {/* Actions for PENDING or NEED_REVIEW reviews */}
                      {(review.status === "PENDING" ||
                        review.status === "NEED_REVIEW") && (
                        <>
                          <button
                            onClick={() =>
                              handleModerate(
                                review,
                                "APPROVED",
                                t("admin.review.actions.approve")
                              )
                            }
                            title={t("admin.review.actions.approve")}
                            className="hover:text-green-600 cursor-pointer"
                          >
                            <IconCheck size={20} />
                          </button>
                          <button
                            onClick={() =>
                              handleModerate(
                                review,
                                "REJECTED",
                                t("admin.review.actions.reject")
                              )
                            }
                            title={t("admin.review.actions.reject")}
                            className="hover:text-orange-600 cursor-pointer"
                          >
                            <IconX size={20} />
                          </button>
                        </>
                      )}

                      {/* Actions for AUTO_APPROVED reviews */}
                      {review.status === "AUTO_APPROVED" && (
                        <button
                          onClick={() =>
                            handleModerate(
                              review,
                              "NEED_REVIEW",
                              t("admin.review.actions.need_review")
                            )
                          }
                          title={t("admin.review.actions.need_review")}
                          className="hover:text-orange-600 cursor-pointer"
                        >
                          <IconMessage size={20} />
                        </button>
                      )}

                      {/* Hide action is available for non-rejected/hidden reviews */}
                      {review.status !== "REJECTED" &&
                        review.status !== "HIDDEN" && (
                          <button
                            onClick={() =>
                              handleModerate(
                                review,
                                "HIDDEN",
                                t("admin.review.actions.hide")
                              )
                            }
                            title={t("admin.review.actions.hide")}
                            className="hover:text-red-600 cursor-pointer"
                          >
                            <IconBan size={20} />
                          </button>
                        )}

                      {/* Restore action for hidden reviews */}
                      {review.status === "HIDDEN" && (
                        <button
                          onClick={() =>
                            handleModerate(
                              review,
                              "APPROVED",
                              t("admin.review.actions.restore")
                            )
                          }
                          title={t("admin.review.actions.restore")}
                          className="hover:text-green-600 cursor-pointer"
                        >
                          <IconRestore size={20} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center p-6 text-gray-500">
                  {t("admin.review.no_reviews")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage + 1}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page - 1)}
      />

      <ReviewDetailModal
        review={selectedReview}
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedReview(null);
        }}
      />

      <ModerationCommentModal
        open={moderationState.isOpen}
        actionText={moderationState.actionText}
        isModerating={isModerating}
        onClose={() => setModerationState({ isOpen: false, review: null })}
        onSubmit={handleModerationSubmit}
      />
    </div>
  );
}

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow border">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      {icon}
    </div>
  </div>
);

const ModerationCommentModal = ({
  open,
  onClose,
  onSubmit,
  actionText,
  isModerating,
}) => {
  const [comment, setComment] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    if (open) {
      setComment("");
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error(t("admin.review.moderate.comment_required"));
      return;
    }
    onSubmit(comment);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {t("admin.review.moderate.comment_title", {
              action: actionText.toLowerCase(),
            })}
          </h2>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <label
              htmlFor="adminComment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("admin.review.moderate.reason_label")}
            </label>
            <textarea
              id="adminComment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={t("admin.review.moderate.reason_placeholder")}
            />
          </div>
          <div className="flex justify-end gap-4 p-6 bg-gray-50 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              disabled={isModerating}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isModerating}
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-blue-400 cursor-pointer"
            >
              {isModerating ? t("common.processing") : t("common.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
