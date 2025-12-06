// 1. MODERN CIRCLE SPINNER (Khuyên dùng chính)
// Sử dụng SVG để nét vẽ sắc sảo, không bị răng cưa như border truyền thống
export const LoadingSpinner = ({
  size = "large",
  message = "",
  className = "",
}) => {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-10 h-10",
    large: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const currentSize = sizeClasses[size] || sizeClasses.large;

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 ${className}`}
    >
      <div className="relative">
        {/* Vòng tròn nền mờ */}
        <div
          className={`${currentSize} border-4 border-blue-100 rounded-full`}
        ></div>

        {/* Vòng tròn xoay chính - Dùng Absolute để đè lên */}
        <div
          className={`absolute top-0 left-0 ${currentSize} border-4 border-transparent border-t-blue-600 border-r-blue-400 rounded-full animate-spin shadow-lg shadow-blue-500/20`}
        ></div>

        {/* Hiệu ứng chấm sáng quay quanh (Decor) */}
        <div
          className={`absolute inset-0 animate-spin`}
          style={{ animationDuration: "3s" }}
        >
          <div className="h-full w-full relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full blur-[1px]"></div>
          </div>
        </div>
      </div>

      {message && (
        <div className="mt-4 flex flex-col items-center gap-1">
          <p className="text-sm font-semibold text-gray-600 tracking-wide animate-pulse">
            {message}
          </p>
          {/* Dấu chấm động */}
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. DOTS WAVE (Dùng cho loading nhỏ trong button hoặc khu vực hẹp)
export const LoadingSpinnerDots = ({ color = "bg-blue-600" }) => {
  return (
    <div className="flex items-center justify-center gap-2 min-h-[40px]">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-3 h-3 ${color} rounded-full animate-bounce shadow-sm`}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: "0.8s", // Chậm lại chút cho mượt
          }}
        ></div>
      ))}
    </div>
  );
};

// 3. MUSIC BARS (Dùng cho loading liên quan đến xử lý dữ liệu)
export const LoadingSpinnerBars = ({ size = "medium" }) => {
  const heightMap = { small: "h-6", medium: "h-10", large: "h-16" };
  const h = heightMap[size] || heightMap.medium;

  return (
    <div className="flex items-center justify-center gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-1.5 ${h} bg-gradient-to-b from-blue-500 to-blue-700 rounded-full animate-pulse`}
          style={{
            animationDelay: `${i * 0.1}s`,
            animationDuration: "1s",
          }}
        ></div>
      ))}
    </div>
  );
};

// 4. MODERN RING WITH TEXT (Dùng cho trang dashboard/thống kê)
export const LoadingSpinnerRing = ({ size = "large", text = "" }) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Ring */}
      <div className="w-24 h-24 rounded-full border-[6px] border-gray-100 shadow-inner"></div>

      {/* Spinning Gradient Ring */}
      <div className="absolute w-24 h-24 rounded-full border-[6px] border-transparent border-t-blue-600 border-l-purple-500 animate-spin"></div>

      {/* Inner pulsing content */}
      {text && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
            {text}
          </span>
        </div>
      )}
    </div>
  );
};

// 5. GLASSMORPHISM OVERLAY (Dùng khi chặn toàn màn hình)
export const LoadingOverlay = ({ message = "Đang xử lý..." }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop mờ + tối nhẹ */}
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm transition-all duration-300"></div>

      {/* Card nội dung nổi bật */}
      <div className="relative bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-5 border border-white/50 animate-in fade-in zoom-in duration-300">
        {/* Custom SVG Spinner cực đẹp */}
        <svg
          className="w-16 h-16 animate-spin text-blue-600"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>

        <div className="flex flex-col items-center">
          <p className="text-lg font-semibold text-gray-800">{message}</p>
          <p className="text-xs text-gray-500 mt-1">
            Vui lòng đợi trong giây lát
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
