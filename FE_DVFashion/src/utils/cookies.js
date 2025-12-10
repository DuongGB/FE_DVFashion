// Get cookie by name
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// Set cookie với các thuộc tính bảo mật cho mobile
export function setCookie(name, value, days = 7) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  // Xác định môi trường
  const isProduction = window.location.protocol === "https:";
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Thiết lập cookie với các thuộc tính phù hợp
  let cookieString = `${name}=${value || ""}${expires}; path=/`;

  // Thêm SameSite=Lax cho tất cả môi trường (tương thích với mobile)
  cookieString += `; SameSite=Lax`;

  // Chỉ thêm Secure khi dùng HTTPS (production)
  if (isProduction) {
    cookieString += `; Secure`;
  }

  document.cookie = cookieString;

  // Log để debug
  console.log(
    "Cookie set:",
    name,
    value,
    "Protocol:",
    window.location.protocol
  );
}

// Delete cookie
export function deleteCookie(name) {
  // Xóa với tất cả các biến thể có thể
  const isProduction = window.location.protocol === "https:";

  document.cookie = `${name}=; Max-Age=-99999999; path=/`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;

  if (isProduction) {
    document.cookie = `${name}=; Max-Age=-99999999; path=/; Secure; SameSite=Lax`;
  }
}
