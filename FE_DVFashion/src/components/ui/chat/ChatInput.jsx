import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { IconImageInPicture, IconSend2 } from "@tabler/icons-react";

const ChatInput = ({ onSendMessage, onSendFile, onTyping, disabled }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const isInputDisabled = disabled || isUploading;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("customer_support.file_size_error"));
      return;
    }

    const allowedTypes = ["image/", "video/"];
    if (!allowedTypes.some((type) => file.type.startsWith(type))) {
      toast.error(t("customer_support.file_type_error"));
      return;
    }

    setIsUploading(true);
    try {
      await onSendFile(file, message.trim());
      setMessage("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    if (onTyping) {
      onTyping();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-white/30 p-3 bg-white/80 backdrop-blur-xl"
    >
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isInputDisabled}
          className={`p-2 rounded-full bg-white shadow border border-gray-200 
            text-blue-600 hover:bg-blue-50 hover:text-blue-700 
            disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
          title={t("customer_support.attach_file")}
          style={{ minWidth: 40, minHeight: 40 }}
        >
          {isUploading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <IconImageInPicture size={22} />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*"
        />

        <input
          type="text"
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={t("customer_support.type_message")}
          disabled={isInputDisabled}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all text-sm bg-white/90 backdrop-blur-xl"
        />

        <button
          type="submit"
          disabled={(!message.trim() && !isUploading) || isInputDisabled}
          className={`p-2 rounded-full bg-blue-600 shadow border border-blue-700 
            text-white hover:bg-blue-700 
            disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
          title={t("customer_support.send")}
          style={{ minWidth: 40, minHeight: 40 }}
        >
          {isUploading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <IconSend2 size={22} />
          )}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
