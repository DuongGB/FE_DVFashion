import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getMyReviews } from "../../../services/reviewAPI";
import { IconStarFilled } from "@tabler/icons-react";

export default function MyReviews({ onUpdateClick }) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReviews().then((data) => {
      setReviews(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="py-10 text-center">{t("loading")}...</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">
        {t("account.sidebar.reviews_feedback")}
      </h2>
      <div className="flex flex-col gap-6">
        {reviews.length === 0 && (
          <div className="text-center text-gray-500">
            {t("review.no_reviews")}
          </div>
        )}
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-gray-100 rounded-xl p-6 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <IconStarFilled
                  key={i}
                  size={22}
                  className={
                    i <= Math.floor(review.rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
              {review.rating % 1 >= 0.5 && (
                <IconStarFilled
                  size={22}
                  className="text-yellow-400 opacity-50"
                />
              )}
            </div>
            <div className="mb-2">
              <span className="font-semibold">{t("review.comment")}:</span>{" "}
              {review.comment}
            </div>
            <div className="flex gap-4 items-center">
              <img
                src={review.productImage}
                alt={review.productName}
                className="w-20 h-20 object-cover rounded-md border"
              />
              <div>
                <div className="font-bold">{review.productName}</div>
                <div className="text-gray-500 text-sm">
                  {review.color} / {review.size}
                </div>
              </div>
            </div>
            <button
              className="border rounded-full px-6 py-2 font-bold mt-4 w-fit"
              onClick={() => onUpdateClick(review)}
            >
              {t("review.update")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
