// Hàm map tên màu sang mã màu hex
function getColorHex(colorName) {
  if (!colorName) return "#eee";
  const name = colorName.trim().toLowerCase();
  switch (name) {
    case "trắng":
    case "white":
      return "#fff";
    case "đen":
    case "black":
      return "#000";
    case "đỏ":
    case "red":
      return "#FF0000";
    case "hồng":
    case "pink":
      return "#FF69B4";
    case "tím":
    case "purple":
      return "#A020F0";
    case "xám":
    case "gray":
      return "#808080";
    case "xanh ngọc":
    case "aqua":
    case "ngọc":
      return "#00CED1";
    case "xanh lá":
    case "green":
      return "#228B22";
    case "xanh dương":
    case "blue":
      return "#0074D9";
    case "vàng":
    case "yellow":
      return "#FFD700";
    case "be":
    case "beige":
      return "#F5E9DA";
    case "nâu":
    case "brown":
      return "#8B4513";
    case "cam":
    case "orange":
      return "#FFA500";
    default:
      return "#eee";
  }
}

export default getColorHex;
