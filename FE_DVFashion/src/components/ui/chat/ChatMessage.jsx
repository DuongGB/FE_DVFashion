import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import { vi, enUS } from "date-fns/locale";

const ChatMessage = ({ message, isOwn, isLoading }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.toLowerCase();
  const locale = lang.startsWith("vi") ? vi : enUS;
  const getMessageTime = (createdAt) =>
    t("customer_support.relative_time", {
      time: formatDistanceToNow(new Date(createdAt), {
        addSuffix: true,
        locale,
      }),
    });

  const renderMessageContent = () => {
    if (
      isLoading &&
      (message.messageType === "IMAGE" || message.messageType === "VIDEO")
    ) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[120px] min-w-[120px]">
          <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin mb-2"></div>
          <span className="text-xs text-white">{t("common.sending")}</span>
        </div>
      );
    }
    switch (message.messageType) {
      case "TEXT":
        return <p className="text-sm">{message.content}</p>;

      case "IMAGE":
        return (
          <div className="space-y-2">
            {message.content && <p className="text-sm">{message.content}</p>}
            {message.attachments?.map((attachment) => (
              <img
                key={attachment.id}
                src={attachment.fileUrl}
                alt={attachment.fileName}
                className="max-w-[220px] max-h-[180px] w-auto h-auto rounded-lg cursor-pointer hover:opacity-90 object-contain border border-gray-200"
                onClick={() => window.open(attachment.fileUrl, "_blank")}
                style={{ display: "block" }}
              />
            ))}
          </div>
        );

      case "VIDEO":
        return (
          <div className="space-y-2">
            {message.content && <p className="text-sm">{message.content}</p>}
            {message.attachments?.map((attachment) => (
              <video
                key={attachment.id}
                src={attachment.fileUrl}
                controls
                className="max-w-[220px] max-h-[180px] w-auto h-auto rounded-lg object-contain border border-gray-200"
                style={{ display: "block" }}
              />
            ))}
          </div>
        );

      case "FILE":
        return (
          <div className="space-y-2">
            {message.content && <p className="text-sm">{message.content}</p>}
            {message.attachments?.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-white/60 backdrop-blur-md rounded-lg hover:bg-blue-100/60 shadow transition"
              >
                <i className="fas fa-file text-gray-600"></i>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {attachment.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(attachment.fileSize / 1024).toFixed(2)} KB
                  </p>
                </div>
                <i className="fas fa-download text-gray-600"></i>
              </a>
            ))}
          </div>
        );

      default:
        return <p className="text-sm">{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[70%] ${
          isOwn ? "items-end" : "items-start"
        } flex flex-col`}
      >
        {!isOwn && (
          <span className="text-xs text-gray-500 mb-1">
            {message.senderName}
          </span>
        )}
        <div
          className={`px-4 py-2 rounded-2xl shadow-lg ${
            isOwn
              ? "bg-blue-500/90 text-white backdrop-blur-xl"
              : "bg-white/60 text-gray-800 backdrop-blur-xl border border-white/40"
          }`}
        >
          {renderMessageContent()}
        </div>
        <span className="text-xs text-gray-400 mt-1">
          {getMessageTime(message.createdAt)}
          {isOwn && message.status === "READ" && (
            <i className="fas fa-check-double ml-1 text-blue-500"></i>
          )}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
