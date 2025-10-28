import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllReviewsForAdmin,
  moderateReview,
  getProductReviewsFilter,
  createReview,
  updateReview,
  getMyReviews,
  // canReviewProduct,
  // canEditReview,
} from "../services/reviewAPI";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

// For Admin
export const useAdminReviews = (params) => {
  return useQuery({
    queryKey: ["adminReviews", params],
    queryFn: () => getAllReviewsForAdmin(params),
    keepPreviousData: true,
  });
};

export const useModerateReview = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ reviewId, request }) => moderateReview(reviewId, request),
    onSuccess: () => {
      toast.success("Cập nhật trạng thái đánh giá thành công!");
      queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
      queryClient.invalidateQueries({ queryKey: ["productReviews"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || t("toast.review.update_failed")
      );
    },
  });
};

// For Customer/Public
export const useProductReviews = (productId, params) => {
  return useQuery({
    queryKey: ["productReviews", productId, params],
    queryFn: () => getProductReviewsFilter(productId, params),
    enabled: !!productId,
  });
};

export const useCreateReview = (options) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: createReview,
    onSuccess: (data, variables, context) => {
      toast.success(t("toast.review.create_success"));
      queryClient.invalidateQueries({ queryKey: ["productReviews"] });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      toast.error(
        error.response?.data?.message || t("toast.review.create_failed")
      );
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
    onSettled: (data, error, variables, context) => {
      if (options?.onSettled) {
        options.onSettled(data, error, variables, context);
      }
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: updateReview,
    onSuccess: () => {
      toast.success(t("toast.review.update_success"));
      queryClient.invalidateQueries({ queryKey: ["productReviews"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || t("toast.review.update_failed")
      );
    },
  });
};

export const useGetMyReviews = (params = {}, options) => {
  return useQuery({
    queryKey: ["myReviews", params],
    queryFn: () => getMyReviews(params),
    ...options,
  });
};

// export const useCanReviewProduct = (params, options) => {
//   return useQuery({
//     queryKey: ["canReview", params],
//     queryFn: () => canReviewProduct(params),
//     ...options,
//   });
// };

// export const useCanEditReview = (reviewId, options) => {
//   return useQuery({
//     queryKey: ["canEditReview", reviewId],
//     queryFn: () => canEditReview(reviewId),
//     ...options,
//   });
// };
