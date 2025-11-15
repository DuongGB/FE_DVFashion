import {
  IconBan,
  IconCheck,
  IconClock,
  IconEye,
  IconEyeOff,
  IconMessage,
  IconRestore,
  IconStarFilled,
  IconX,
  IconRefresh,
} from "@tabler/icons-react";
import { useEffect, useState, useMemo } from "react";
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
  const [searchInput, setSearchInput] = useState("");
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

  // Fetch all reviews without filters (server will handle basic filtering)
  const { data, isLoading, isError, error, refetch } = useAdminReviews({
    page: 0,
    size: 1000, // Get all reviews
    sort: "createdAt,desc",
  });

  const { mutate: moderateReview, isLoading: isModerating } =
    useModerateReview();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  // Debounce searchInput -> setSearch sau 1.5s không gõ
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
      setCurrentPage(0);
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Extract data from API response
  const allReviews = data?.data?.reviews || [];
  const stats = data?.data?.statistics || {};

  // Client-side filtering
  const filteredReviews = useMemo(() => {
    let filtered = [...allReviews];

    // Filter by search (keyword) with null/undefined checks
    if (debouncedSearch) {
      const keyword = debouncedSearch.toLowerCase();
      filtered = filtered.filter((review) => {
        const fullName = review.user?.fullName?.toLowerCase() || "";
        const email = review.user?.email?.toLowerCase() || "";
        const productName = review.productName?.toLowerCase() || "";
        const variantName = review.variantName?.toLowerCase() || "";
        const comment = review.comment?.toLowerCase() || "";
        const orderNumber = review.orderNumber?.toLowerCase() || "";

        return (
          fullName.includes(keyword) ||
          email.includes(keyword) ||
          productName.includes(keyword) ||
          variantName.includes(keyword) ||
          comment.includes(keyword) ||
          orderNumber.includes(keyword)
        );
      });
    }

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter((review) => review.status === statusFilter);
    }

    // Filter by rating
    if (ratingFilter) {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(ratingFilter)
      );
    }

    return filtered;
  }, [allReviews, debouncedSearch, statusFilter, ratingFilter]);

  // Calculate pagination from filtered results
  const totalElements = filteredReviews.length;
  const totalPages = Math.ceil(totalElements / pageSize);

  // Get paginated reviews
  const paginatedReviews = useMemo(() => {
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredReviews.slice(startIndex, endIndex);
  }, [filteredReviews, currentPage, pageSize]);

  // Tính toán lại averageRating từ filteredReviews (nếu cần filter)
  const filteredAverageRating = useMemo(() => {
    if (filteredReviews.length === 0) return 0;
    const totalRating = filteredReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    return totalRating / filteredReviews.length;
  }, [filteredReviews]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, statusFilter, ratingFilter]);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

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
        },
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
        <StatCard
          title={t("admin.review.stats.total")}
          value={stats.totalReviews || 0}
          icon={<IconMessage size={24} />}
          color="text-blue-600"
        />
        <StatCard
          title={t("admin.review.stats.pending")}
          value={stats.statusCounts?.PENDING || 0}
          icon={<IconClock size={24} />}
          color="text-yellow-600"
        />
        <StatCard
          title={t("admin.review.status.AUTO_APPROVED")}
          value={stats.statusCounts?.AUTO_APPROVED || 0}
          icon={<IconCheck size={24} />}
          color="text-cyan-600"
        />
        <StatCard
          title={t("admin.review.stats.approved")}
          value={stats.statusCounts?.APPROVED || 0}
          icon={<IconCheck size={24} />}
          color="text-green-600"
        />
        <StatCard
          title={t("admin.review.status.NEED_REVIEW")}
          value={stats.statusCounts?.NEED_REVIEW || 0}
          icon={<IconMessage size={24} />}
          color="text-orange-600"
        />
        <StatCard
          title={t("admin.review.status.REJECTED")}
          value={stats.statusCounts?.REJECTED || 0}
          icon={<IconX size={24} />}
          color="text-red-600"
        />
        <StatCard
          title={t("admin.review.status.HIDDEN")}
          value={stats.statusCounts?.HIDDEN || 0}
          icon={<IconEyeOff size={24} />}
          color="text-gray-600"
        />
        <StatCard
          title={t("admin.review.stats.average_rating")}
          value={filteredAverageRating?.toFixed(1) || "0.0"}
          icon={<IconStarFilled size={24} />}
          color="text-yellow-400"
        />
      </div>

      {/* Filters */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 mb-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t("admin.review.search_placeholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearch(searchInput);
                }
              }}
              className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-xl"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg px-4 py-2 md:w-48 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-xl"
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
            className="backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg px-4 py-2 md:w-48 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-xl"
          >
            <option value="">{t("admin.review.all_ratings")}</option>
            {[5, 4, 3, 2, 1].map((star) => (
              <option key={star} value={star}>
                {star} {t("admin.review.rating_star", { count: star })}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow cursor-pointer"
            title={t("common.refresh") || "Làm mới"}
          >
            <IconRefresh size={18} />
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="text-sm text-gray-600">
        {t("admin.review.showing_results", {
          current: paginatedReviews.length,
          total: totalElements,
        })}
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
            ) : paginatedReviews.length > 0 ? (
              paginatedReviews.map((review) => (
                <tr
                  key={review.id}
                  className="border-b hover:bg-white/80 transition-colors"
                >
                  <td className="p-3">
                    <p className="font-semibold text-sm">
                      {review.user?.fullName || "N/A"}
                    </p>
                  </td>
                  <td className="p-3">
                    <p className="font-semibold text-sm">
                      {review.productName || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {review.variantName || "N/A"}
                    </p>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{review.rating}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <IconStarFilled
                            key={i}
                            size={14}
                            className={
                              i < review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <p className="truncate overflow-hidden whitespace-nowrap max-w-xs">
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
                  <td className="p-3">
                    <div className="text-sm">
                      <div>{formatDate(review.createdAt)}</div>
                      {review.verifiedPurchase && (
                        <span className="inline-flex items-center text-xs text-green-600 mt-1">
                          <IconCheck size={12} className="mr-1" />
                          {t("admin.review.verified_purchase")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 items-center">
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
                                className="hover:text-red-600 transition-colors cursor-pointer"
                              >
                                <IconX size={20} />
                              </button>
                              <button
                                onClick={() =>
                                  handleModerate(
                                    review,
                                    "HIDDEN",
                                    t("admin.review.actions.hide")
                                  )
                                }
                                title={t("admin.review.actions.hide")}
                                className="hover:text-gray-600 transition-colors cursor-pointer"
                              >
                                <IconBan size={20} />
                              </button>
                            </>
                          )}
                          {review.status === "AUTO_APPROVED" && (
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
                                    "NEED_REVIEW",
                                    t("admin.review.actions.need_review")
                                  )
                                }
                                title={t("admin.review.actions.need_review")}
                                className="hover:text-orange-600 transition-colors cursor-pointer"
                              >
                                <IconMessage size={20} />
                              </button>
                              <button
                                onClick={() =>
                                  handleModerate(
                                    review,
                                    "HIDDEN",
                                    t("admin.review.actions.hide")
                                  )
                                }
                                title={t("admin.review.actions.hide")}
                                className="hover:text-gray-600 transition-colors cursor-pointer"
                              >
                                <IconBan size={20} />
                              </button>
                            </>
                          )}
                          {review.status === "APPROVED" && (
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
                          {review.status === "REJECTED" && (
                            <span className="text-xs text-gray-500 italic">
                              {t("admin.review.final_state")}
                            </span>
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

const StatCard = ({ title, value, icon, color = "text-gray-900" }) => (
  <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center min-w-[110px] min-h-[110px]">
    <div className={`mb-2 p-2 rounded-full bg-gray-100 shadow ${color}`}>
      {icon}
    </div>
    <p className="text-xs font-medium text-gray-700 text-center">{title}</p>
    <p className={`text-xl font-bold ${color} text-center`}>{value}</p>
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
