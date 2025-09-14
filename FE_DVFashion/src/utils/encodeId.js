export function encodeId(id) {
  return btoa(String(id));
}

export function decodeId(encoded) {
  try {
    return atob(encoded);
  } catch {
    return null;
  }
}
