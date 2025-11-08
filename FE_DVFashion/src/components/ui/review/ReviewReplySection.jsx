import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IconMessageCircle,
  IconSend,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconUser,
  IconDots,
  IconClock,
} from "@tabler/icons-react";
import {
  useReviewRepliesForCustomer,
  useReviewRepliesForAdmin,
  useCreateReviewReply,
  useUpdateReviewReply,
  useDeleteReviewReply,
  useModerateReviewReply,
} from "../../../hooks/useReview";
import { useAuth } from "../../../hooks/useAuth";
import { showConfirmationToast } from "../../../utils/showConfirmationToast";

const ReplyItem = ({
  reply,
  isAdmin,
  onEdit,
  onDelete,
  onModerate,
  onReply,
  depth = 0,
  isCreating,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const isOwner = user?.id === reply.userId;
  const maxDepth = 3;
  const canReply = depth < maxDepth;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      APPROVED: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      REJECTED: "bg-red-100 text-red-800",
      HIDDEN: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleReplySubmit = (content) => {
    onReply(reply.id, content, () => {
      setShowReplyForm(false);
    });
  };

  return (
    <div className={`${depth > 0 ? "ml-8" : ""}`}>
      <div className="border-l-2 border-gray-200 pl-4 py-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
              <IconUser size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800">
                  {reply.userName}
                </span>
                {reply.edited && (
                  <span className="text-xs text-gray-500 italic">
                    ({t("review_reply.edited")})
                  </span>
                )}
                {isAdmin && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(
                      reply.status
                    )}`}
                  >
                    {t(`review_reply.status.${reply.status}`)}
                  </span>
                )}
              </div>
              <p className="text-gray-700 text-sm mb-1 break-words whitespace-pre-wrap">
                {reply.content}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{formatDate(reply.createdAt)}</span>
                {reply.editedAt && (
                  <span>
                    {t("review_reply.edited_at")}: {formatDate(reply.editedAt)}
                  </span>
                )}
                {canReply && user && (
                  <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    {t("common.reply")}
                  </button>
                )}
              </div>
            </div>
          </div>

          {(isOwner || isAdmin) && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <IconDots size={16} className="text-gray-600" />
              </button>
              {showActions && (
                <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-[150px]">
                  {/* Owner Actions */}
                  {isOwner && (
                    <>
                      <button
                        onClick={() => {
                          onEdit(reply);
                          setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                      >
                        <IconEdit size={14} />
                        {t("common.edit")}
                      </button>
                      <button
                        onClick={() => {
                          onDelete(reply.id);
                          setShowActions(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600 cursor-pointer"
                      >
                        <IconTrash size={14} />
                        {t("common.delete")}
                      </button>
                    </>
                  )}

                  {/* Admin Actions */}
                  {isAdmin && (
                    <>
                      {/* PENDING Status Actions */}
                      {reply.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => {
                              onModerate(reply.id, "APPROVED");
                              setShowActions(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600 cursor-pointer"
                          >
                            <IconCheck size={14} />
                            {t("review_reply.approve")}
                          </button>
                          <button
                            onClick={() => {
                              onModerate(reply.id, "HIDDEN");
                              setShowActions(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600 cursor-pointer"
                          >
                            <IconX size={14} />
                            {t("review_reply.hide")}
                          </button>
                        </>
                      )}

                      {/* APPROVED Status Actions */}
                      {reply.status === "APPROVED" && (
                        <>
                          <button
                            onClick={() => {
                              onModerate(reply.id, "HIDDEN");
                              setShowActions(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600 cursor-pointer"
                          >
                            <IconX size={14} />
                            {t("review_reply.hide")}
                          </button>
                          <button
                            onClick={() => {
                              onModerate(reply.id, "PENDING");
                              setShowActions(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-orange-600 cursor-pointer"
                          >
                            <IconClock size={14} />
                            {t("review_reply.mark_pending")}
                          </button>
                        </>
                      )}

                      {/* HIDDEN Status Actions */}
                      {reply.status === "HIDDEN" && (
                        <>
                          <button
                            onClick={() => {
                              onModerate(reply.id, "APPROVED");
                              setShowActions(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-green-600 cursor-pointer"
                          >
                            <IconCheck size={14} />
                            {t("review_reply.restore")}
                          </button>
                          <button
                            onClick={() => {
                              onModerate(reply.id, "PENDING");
                              setShowActions(false);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-orange-600 cursor-pointer"
                          >
                            <IconClock size={14} />
                            {t("review_reply.mark_pending")}
                          </button>
                        </>
                      )}

                      {/* Always show delete for admin if not owner */}
                      {!isOwner && (
                        <button
                          onClick={() => {
                            onDelete(reply.id);
                            setShowActions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600 cursor-pointer border-t mt-1"
                        >
                          <IconTrash size={14} />
                          {t("common.delete")}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-3 ml-11">
            <ReplyForm
              onSubmit={handleReplySubmit}
              onCancel={() => setShowReplyForm(false)}
              placeholder={t("review_reply.placeholder")}
              isLoading={isCreating}
            />
          </div>
        )}
      </div>

      {/* Child replies */}
      {reply.childReplies && reply.childReplies.length > 0 && (
        <div className="mt-2">
          {reply.childReplies.map((childReply) => (
            <ReplyItem
              key={childReply.id}
              reply={childReply}
              isAdmin={isAdmin}
              onEdit={onEdit}
              onDelete={onDelete}
              onModerate={onModerate}
              onReply={onReply}
              depth={depth + 1}
              isCreating={isCreating}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ReplyForm = ({
  onSubmit,
  onCancel,
  placeholder,
  initialValue = "",
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [content, setContent] = useState(initialValue);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!content.trim() || isLoading) return;
    onSubmit(content.trim());
    setContent(""); // Clear input after submit
  };

  const handleKeyDown = (e) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    // Allow Shift+Enter for new line
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        disabled={isLoading}
        className="w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        placeholder={placeholder}
      />
      <div className="flex gap-2 items-center">
        <button
          type="submit"
          disabled={!content.trim() || isLoading}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {t("common.sending")}
            </>
          ) : (
            <>
              <IconSend size={16} />
              {t("review_reply.submit")}
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 backdrop-blur-sm bg-white/70 border border-white/30 rounded-lg hover:bg-white/90 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("common.cancel")}
          </button>
        )}
        <span className="text-xs text-gray-500">
          {t("review_reply.hint_enter")}
        </span>
      </div>
    </form>
  );
};

export default function ReviewReplySection({ reviewId, isAdmin = false }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [editingReply, setEditingReply] = useState(null);

  const { data: repliesData, isLoading } = isAdmin
    ? useReviewRepliesForAdmin(reviewId)
    : useReviewRepliesForCustomer(reviewId);

  const { mutate: createReply, isLoading: isCreating } = useCreateReviewReply();
  const { mutate: updateReply, isLoading: isUpdating } = useUpdateReviewReply();
  const { mutate: deleteReply } = useDeleteReviewReply();
  const { mutate: moderateReply } = useModerateReviewReply();

  const replies = repliesData?.data || [];

  const handleSubmitReply = (content) => {
    createReply({
      reviewId,
      parentReplyId: null,
      content,
    });
  };

  const handleReplyToReply = (parentReplyId, content, onSuccess) => {
    createReply(
      {
        reviewId,
        parentReplyId,
        content,
      },
      {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  const handleEditReply = (reply) => {
    setEditingReply(reply);
  };

  const handleUpdateReply = (content) => {
    if (!editingReply) return;

    updateReply(
      {
        replyId: editingReply.id,
        request: { content },
      },
      {
        onSuccess: () => {
          setEditingReply(null);
        },
      }
    );
  };

  const handleDeleteReply = (replyId) => {
    showConfirmationToast({
      title: t("review_reply.delete_confirm_title"),
      message: t("review_reply.delete_confirm_message"),
      confirmText: t("common.delete"),
      onConfirm: () => deleteReply(replyId),
    });
  };

  const handleModerateReply = (replyId, newStatus) => {
    moderateReply({
      replyId,
      request: { newStatus },
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-4 text-gray-500">
        {t("common.loading")}...
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl shadow-lg overflow-hidden">
      {/* Header - Sticky */}
      <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 flex items-center gap-2 z-10">
        <IconMessageCircle size={20} />
        <h3 className="text-lg font-semibold">
          {t("review_reply.title")} ({replies.length})
        </h3>
      </div>

      {/* Scrollable Reply List */}
      <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
        {replies.length > 0 ? (
          replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              isAdmin={isAdmin}
              onEdit={handleEditReply}
              onDelete={handleDeleteReply}
              onModerate={handleModerateReply}
              onReply={handleReplyToReply}
              isCreating={isCreating}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 py-8">
            {t("review_reply.no_replies")}
          </p>
        )}
      </div>

      {/* Reply Form - Sticky Bottom */}
      {user && (
        <div className="sticky bottom-0 border-t border-white/30 bg-white/80 backdrop-blur-sm p-4">
          {editingReply ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("review_reply.edit_reply")}
              </label>
              <ReplyForm
                initialValue={editingReply.content}
                onSubmit={handleUpdateReply}
                onCancel={() => setEditingReply(null)}
                placeholder={t("review_reply.edit_placeholder")}
                isLoading={isUpdating}
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("review_reply.write_reply")}
              </label>
              <ReplyForm
                onSubmit={handleSubmitReply}
                placeholder={t("review_reply.placeholder")}
                isLoading={isCreating}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
