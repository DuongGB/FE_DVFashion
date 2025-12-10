// Get cookie by name
export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

// Set cookie với các thuộc tính bảo mật cho mobile và HTTPS
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

  // SameSite=None với Secure cho cross-site cookies (vì BE và FE khác domain)
  // Hoặc SameSite=Lax nếu cùng domain
  if (isProduction && !isLocalhost) {
    // Production với HTTPS: dùng Secure và SameSite=None để cho phép cross-site
    cookieString += `; Secure; SameSite=None`;
  } else if (isLocalhost) {
    // Localhost: chỉ dùng SameSite=Lax
    cookieString += `; SameSite=Lax`;
  } else {
    // Development khác: dùng SameSite=Lax
    cookieString += `; SameSite=Lax`;
  }

  document.cookie = cookieString;

  // Log để debug trên mobile
  console.log("Cookie set:", {
    name,
    value,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    cookieString,
  });
}

// Delete cookie
export function deleteCookie(name) {
  const isProduction = window.location.protocol === "https:";
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  // Xóa với tất cả các biến thể có thể
  document.cookie = `${name}=; Max-Age=-99999999; path=/`;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;

  // Xóa với Secure và SameSite nếu là production
  if (isProduction && !isLocalhost) {
    document.cookie = `${name}=; Max-Age=-99999999; path=/; Secure; SameSite=None`;
  } else {
    document.cookie = `${name}=; Max-Age=-99999999; path=/; SameSite=Lax`;
  }

  console.log("Cookie deleted:", name);
}
