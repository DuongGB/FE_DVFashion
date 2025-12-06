export const LoadingSpinner = ({ size = "large", message = "" }) => {
  const sizes = {
    small: {
      container: "min-h-[200px]",
      outerRing: "w-12 h-12 border-3",
      innerCircle: "w-6 h-6",
    },
    medium: {
      container: "min-h-[300px]",
      outerRing: "w-16 h-16 border-4",
      innerCircle: "w-8 h-8",
    },
    large: {
      container: "min-h-[400px]",
      outerRing: "w-20 h-20 border-4",
      innerCircle: "w-10 h-10",
    },
  };

  const currentSize = sizes[size] || sizes.large;

  return (
    <div
      className={`flex items-center justify-center ${currentSize.container}`}
    >
      <div className="flex flex-col items-center gap-4">
        {/* Animated spinner */}
        <div className="relative">
          {/* Outer rotating ring with gradient */}
          <div
            className={`${currentSize.outerRing} border-blue-200 rounded-full animate-spin border-t-blue-600 border-r-blue-500`}
          ></div>
          {/* Inner pulsing circle */}
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${currentSize.innerCircle} bg-gradient-to-br from-blue-500 to-blue-700 rounded-full animate-pulse shadow-lg`}
          ></div>
          {/* Decorative dots */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
        </div>

        {/* Optional loading message */}
        {message && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-gray-700 animate-pulse">
              {message}
            </p>
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
              <span
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></span>
              <span
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Alternative modern spinner variations
export const LoadingSpinnerDots = ({ size = "medium" }) => {
  const dotSizes = {
    small: "w-2 h-2",
    medium: "w-3 h-3",
    large: "w-4 h-4",
  };

  const dotSize = dotSizes[size] || dotSizes.medium;

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${dotSize} bg-blue-600 rounded-full animate-bounce`}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.6s",
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export const LoadingSpinnerBars = ({ size = "medium" }) => {
  const barHeights = {
    small: "h-8",
    medium: "h-12",
    large: "h-16",
  };

  const barHeight = barHeights[size] || barHeights.medium;

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="flex items-end gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-1.5 ${barHeight} bg-blue-600 rounded-full animate-pulse`}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: "1s",
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export const LoadingSpinnerRing = ({ size = "large", text = "" }) => {
  const sizes = {
    small: { ring: "w-12 h-12 border-3", text: "text-xs" },
    medium: { ring: "w-16 h-16 border-4", text: "text-sm" },
    large: { ring: "w-24 h-24 border-[6px]", text: "text-base" },
  };

  const currentSize = sizes[size] || sizes.large;

  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="relative">
        {/* Double ring animation */}
        <div
          className={`${currentSize.ring} border-blue-200 rounded-full animate-spin border-t-blue-600 border-r-blue-500`}
        ></div>
        <div
          className={`absolute top-2 left-2 right-2 bottom-2 border-3 border-purple-200 rounded-full animate-spin border-b-purple-600 border-l-purple-500`}
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        ></div>
        {text && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`${currentSize.text} font-bold text-blue-600`}>
              {text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple overlay spinner for modals
export const LoadingOverlay = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
        <p className="text-gray-700 font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
