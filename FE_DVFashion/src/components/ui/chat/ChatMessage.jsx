import React from "react";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import { vi, enUS } from "date-fns/locale";

const ChatMessage = ({ message, isOwn }) => {
  const { i18n } = useTranslation();
  const locale = i18n.language === "vi" ? vi : enUS;
  const getMessageTime = (createdAt) =>
    formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale });
  // ...existing code...

  const renderMessageContent = () => {
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
                className="max-w-xs rounded-lg cursor-pointer hover:opacity-90"
                onClick={() => window.open(attachment.fileUrl, "_blank")}
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
                className="max-w-xs rounded-lg"
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
                className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
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
          className={`px-4 py-2 rounded-lg ${
            isOwn ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
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
