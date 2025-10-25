import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllReviewsForAdmin,
  moderateReview,
  getProductReviewsFilter,
  createReview,
  updateReview,
  canReviewProduct,
  canEditReview,
} from "../services/reviewAPI";
import { toast } from "react-toastify";

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
  return useMutation({
    mutationFn: ({ reviewId, request }) => moderateReview(reviewId, request),
    onSuccess: () => {
      toast.success("Cập nhật trạng thái đánh giá thành công!");
      queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
      queryClient.invalidateQueries({ queryKey: ["productReviews"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật!"
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

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      toast.success("Gửi đánh giá thành công!");
      queryClient.invalidateQueries({ queryKey: ["productReviews"] });
      queryClient.invalidateQueries({ queryKey: ["myOrders"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá!"
      );
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateReview,
    onSuccess: () => {
      toast.success("Cập nhật đánh giá thành công!");
      queryClient.invalidateQueries({ queryKey: ["productReviews"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật!"
      );
    },
  });
};

export const useCanReviewProduct = (params, options) => {
  return useQuery({
    queryKey: ["canReview", params],
    queryFn: () => canReviewProduct(params),
    ...options,
  });
};

export const useCanEditReview = (reviewId, options) => {
  return useQuery({
    queryKey: ["canEditReview", reviewId],
    queryFn: () => canEditReview(reviewId),
    ...options,
  });
};
