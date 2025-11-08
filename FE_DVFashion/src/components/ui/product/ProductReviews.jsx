import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  IconStarFilled,
  IconChevronDown,
  IconChevronUp,
  IconFilter,
  IconMessageCircle2,
} from "@tabler/icons-react";
import Pagination from "../../common/Pagination";
import { useProductReviews } from "../../../hooks/useReview";

const StarBar = ({ star, count, total, active, onClick }) => {
  const percent = total ? Math.round((count / total) * 100) : 0;
  return (
    <button
      type="button"
      onClick={() => onClick(star === active ? null : star)}
      className={`flex items-center gap-2 w-full text-left group transition-all ${
        active === star
          ? "font-semibold text-blue-600"
          : "text-gray-700 hover:text-blue-500"
      }`}
    >
      <span className="w-4">{star}</span>
      <IconStarFilled
        size={16}
        className={active === star ? "text-yellow-400" : "text-gray-300"}
      />
      <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            percent > 0 ? "bg-yellow-400" : "bg-transparent"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-10 text-xs text-gray-500">{count}</span>
    </button>
  );
};

const Stars = ({ value, size = 18 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <IconStarFilled
        key={i}
        size={size}
        className={i <= Math.round(value) ? "text-yellow-400" : "text-gray-300"}
      />
    ))}
  </div>
);

const ReplyThread = ({ reply, depth = 0 }) => {
  const created = reply.createdAt
    ? new Date(reply.createdAt).toLocaleString("vi-VN")
    : "";
  return (
    <div className={`mt-3 ${depth > 0 ? "ml-8" : ""}`}>
      <div className="rounded-xl bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-sm border border-blue-100/50 p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800">
            {reply.userName}
          </span>
          <span className="text-[11px] text-gray-400">{created}</span>
        </div>
        <div className="mt-1 text-sm text-gray-700 whitespace-pre-line">
          {reply.content}
        </div>
      </div>
      {reply.childReplies?.length > 0 &&
        reply.childReplies.map((child) => (
          <ReplyThread key={child.id} reply={child} depth={depth + 1} />
        ))}
    </div>
  );
};

const ReviewItem = ({ review, t }) => {
  const [openImages, setOpenImages] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const createdStr = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "";

  const images = review.imageUrls || [];

  return (
    <div className="p-5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex flex-col gap-2">
        <Stars value={review.rating || 0} />
        <div className="text-sm text-gray-500">
          {createdStr}
          {review.variantName && (
            <span className="ml-2 text-gray-400">• {review.variantName}</span>
          )}
        </div>
        <div className="text-sm font-semibold">
          {review.user?.fullName || review.userName}
        </div>
        <p className="mt-1 text-gray-800 whitespace-pre-line">
          {review.comment}
        </p>

        {images.length > 0 && (
          <div className="mt-2">
            <button
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1 transition-colors"
              onClick={() => setOpenImages((s) => !s)}
            >
              {openImages ? (
                <IconChevronUp size={14} />
              ) : (
                <IconChevronDown size={14} />
              )}
              {openImages
                ? t("review.hide_images")
                : t("review.view_images", { count: images.length })}
            </button>
            {openImages && (
              <div className="flex gap-2 flex-wrap mt-2">
                {images.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`rv-${review.id}-${idx}`}
                    className="w-20 h-20 object-cover rounded-lg border border-white/60 shadow-md hover:scale-105 transition-transform cursor-pointer"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {review.replies?.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setShowReplies((s) => !s)}
              className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
            >
              <IconMessageCircle2 size={14} />
              {showReplies
                ? t("review.hide_replies")
                : t("review.view_replies", { count: review.replies.length })}
            </button>
            {showReplies && (
              <div className="mt-1">
                {review.replies.map((rep) => (
                  <ReplyThread key={rep.id} reply={rep} t={t} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function ProductReviews({ productId }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [onlyWithImages, setOnlyWithImages] = useState(false);
  const [sort, setSort] = useState("NEWEST");

  const queryParams = useMemo(
    () => ({
      page: page - 1,
      size: 5,
      rating: ratingFilter || undefined,
      hasImage: onlyWithImages || undefined,
      sort,
    }),
    [page, ratingFilter, onlyWithImages, sort]
  );

  const { data, isLoading, isError } = useProductReviews(
    productId,
    queryParams
  );

  const payload = data?.data || data;
  const reviews = payload?.reviews || [];
  const stats = payload?.statistics || {};
  const totalReviews = stats.totalReviews ?? reviews.length;
  const avg = stats.averageRating ?? 0;
  const ratingCounts = stats.ratingCounts || {};

  const totalPages =
    payload?.totalPages || Math.max(1, Math.ceil(totalReviews / 5));

  if (isLoading)
    return (
      <div className="mt-10 p-6 text-center bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg">
        {t("common.loading")}...
      </div>
    );

  if (isError)
    return (
      <div className="mt-10 p-6 text-center bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl text-red-600 shadow-lg">
        {t("common.error")}
      </div>
    );

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">{t("review.title")}</h2>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
        {/* Rating Summary */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center justify-center px-6 py-5 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl">
            <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {avg?.toFixed(1)}
            </span>
            <Stars value={avg || 0} size={20} />
            <span className="text-xs text-gray-500 mt-2">
              {t("review.total_reviews", { count: totalReviews })}
            </span>
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 grid grid-cols-1 gap-1.5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 p-4 shadow-lg">
            {[5, 4, 3, 2, 1].map((s) => (
              <StarBar
                key={s}
                star={s}
                count={ratingCounts[s] || 0}
                total={totalReviews}
                active={ratingFilter}
                onClick={setRatingFilter}
              />
            ))}
            <button
              type="button"
              onClick={() => {
                setRatingFilter(null);
                setOnlyWithImages(false);
                setSort("NEWEST");
                setPage(1);
              }}
              className="text-xs mt-1 text-gray-500 hover:text-blue-600 underline transition-colors"
            >
              {t("review.clear_filters")}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm bg-white/60 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/60 shadow-lg hover:shadow-xl transition-shadow">
            <IconFilter size={16} className="text-gray-500" />
            <select
              className="bg-transparent outline-none cursor-pointer font-medium"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
            >
              <option value="NEWEST">{t("review.sort.newest")}</option>
              <option value="HIGHEST">{t("review.sort.highest")}</option>
              <option value="LOWEST">{t("review.sort.lowest")}</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm bg-white/60 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/60 shadow-lg hover:shadow-xl cursor-pointer transition-all">
            <input
              type="checkbox"
              className="cursor-pointer accent-blue-600"
              checked={onlyWithImages}
              onChange={(e) => {
                setOnlyWithImages(e.target.checked);
                setPage(1);
              }}
            />
            {t("review.with_images")}
          </label>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="p-8 text-center bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 text-gray-600 shadow-lg">
          {t("review.no_reviews")}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rv) => (
            <ReviewItem key={rv.id} review={rv} t={t} />
          ))}
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </div>
      )}
    </section>
  );
}
