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
import { useAuth } from "../../hooks/useAuth";

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

  const { data, isLoading, isError, error, refetch } = useAdminReviews(params);
  const { mutate: moderateReview, isLoading: isModerating } =
    useModerateReview();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

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
            setModerationState({
              isOpen: false,
              review: null,
              newStatus: "",
              actionText: "",
            });
            // Refetch để cập nhật danh sách
            refetch();
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
    const { review, newStatus } = moderationState;
    const request = { newStatus, adminComment };
    moderateReview(
      { reviewId: review.id, request },
      {
        onSuccess: () => {
          setModerationState({
            isOpen: false,
            review: null,
            newStatus: "",
            actionText: "",
          });
          refetch();
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
          value={stats.averageRating?.toFixed(1) || "0.0"}
          icon={<IconStarFilled className="h-8 w-8 text-yellow-400" />}
        />
      </div>

      {/* Filters */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder={t("admin.review.search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
            className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
      <div className="backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg rounded-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-400">
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
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">{t("admin.review.loading")}</span>
                  </div>
                </td>
              </tr>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <tr
                  key={review.id}
                  className="border-b hover:bg-white/80 transition-colors"
                >
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
                  <td className="p-3">
                    <p className="max-w-xs truncate">
                      {review.comment || (
                        <span className="text-gray-400 italic">
                          {t("admin.review.no_comment")}
                        </span>
                      )}
                    </p>
                  </td>
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
                        className="hover:text-blue-600 transition-colors cursor-pointer"
                        title={t("admin.review.actions.view_detail")}
                      >
                        <IconEye size={20} />
                      </button>
                      {isAdmin && (
                        <>
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
                                className="hover:text-green-600 transition-colors cursor-pointer"
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
                                className="hover:text-orange-600 transition-colors cursor-pointer"
                              >
                                <IconX size={20} />
                              </button>
                            </>
                          )}
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
                              className="hover:text-orange-600 transition-colors cursor-pointer"
                            >
                              <IconMessage size={20} />
                            </button>
                          )}
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
                                className="hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <IconBan size={20} />
                              </button>
                            )}
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
                              className="hover:text-green-600 transition-colors cursor-pointer"
                            >
                              <IconRestore size={20} />
                            </button>
                          )}
                        </>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage + 1}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page - 1)}
        />
      )}

      {/* Review Detail Modal */}
      <ReviewDetailModal
        review={selectedReview}
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedReview(null);
        }}
      />

      {/* Moderation Comment Modal */}
      <ModerationCommentModal
        open={moderationState.isOpen}
        actionText={moderationState.actionText}
        isModerating={isModerating}
        onClose={() =>
          setModerationState({
            isOpen: false,
            review: null,
            newStatus: "",
            actionText: "",
          })
        }
        onSubmit={handleModerationSubmit}
      />
    </div>
  );
}

const StatCard = ({ title, value, icon }) => (
  <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
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
    onSubmit(comment.trim());
    setComment("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="backdrop-blur-xl bg-white/80 border border-white/30 rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <h2 className="text-xl font-bold">
            {t("admin.review.moderate.comment_title", {
              action: actionText?.toLowerCase(),
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
              className="w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder={t("admin.review.moderate.reason_placeholder")}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {comment.length}/500
            </div>
          </div>
          <div className="flex justify-end gap-4 p-6 border-t border-white/30 bg-white/60 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isModerating}
              className="px-4 py-2 text-gray-700 backdrop-blur-sm bg-white/70 border border-white/30 rounded-lg hover:bg-white/90 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={isModerating || !comment.trim()}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              {isModerating ? t("common.processing") : t("common.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
