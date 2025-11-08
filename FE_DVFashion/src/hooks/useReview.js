import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllReviewsForAdmin,
  moderateReview,
  getProductReviewsFilter,
  createReview,
  updateReview,
  getMyReviews,
  createReviewReply,
  updateReviewReply,
  deleteReviewReply,
  getReviewRepliesForCustomer,
  getAllReviewRepliesForAdmin,
  moderateReviewReply,
} from "../services/reviewAPI";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

// ==================== REVIEW HOOKS ====================

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
      toast.success(t("toast.review.moderate_success"));
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
      queryClient.invalidateQueries({ queryKey: ["myReviews"] });
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
      queryClient.invalidateQueries({ queryKey: ["myReviews"] });
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

// ==================== REVIEW REPLY HOOKS ====================

export const useCreateReviewReply = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: createReviewReply,
    onSuccess: (data) => {
      toast.success(t("toast.review_reply.create_success"));
      queryClient.invalidateQueries({
        queryKey: ["reviewReplies", data.data.reviewId],
      });
      queryClient.invalidateQueries({ queryKey: ["productReviews"] });
      queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || t("toast.review_reply.create_failed")
      );
    },
  });
};

export const useUpdateReviewReply = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: updateReviewReply,
    onSuccess: (data) => {
      toast.success(t("toast.review_reply.update_success"));
      queryClient.invalidateQueries({
        queryKey: ["reviewReplies", data.data.reviewId],
      });
      queryClient.invalidateQueries({ queryKey: ["productReviews"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || t("toast.review_reply.update_failed")
      );
    },
  });
};

export const useDeleteReviewReply = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: deleteReviewReply,
    onSuccess: () => {
      toast.success(t("toast.review_reply.delete_success"));
      queryClient.invalidateQueries({ queryKey: ["reviewReplies"] });
      queryClient.invalidateQueries({ queryKey: ["productReviews"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || t("toast.review_reply.delete_failed")
      );
    },
  });
};

export const useReviewRepliesForCustomer = (reviewId, options) => {
  return useQuery({
    queryKey: ["reviewReplies", reviewId, "customer"],
    queryFn: () => getReviewRepliesForCustomer(reviewId),
    enabled: !!reviewId,
    ...options,
  });
};

export const useReviewRepliesForAdmin = (reviewId, options) => {
  return useQuery({
    queryKey: ["reviewReplies", reviewId, "admin"],
    queryFn: () => getAllReviewRepliesForAdmin(reviewId),
    enabled: !!reviewId,
    ...options,
  });
};

export const useModerateReviewReply = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: moderateReviewReply,
    onSuccess: (data) => {
      toast.success(t("toast.review_reply.moderate_success"));
      queryClient.invalidateQueries({
        queryKey: ["reviewReplies", data.data.reviewId],
      });
      queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || t("toast.review_reply.moderate_failed")
      );
    },
  });
};
