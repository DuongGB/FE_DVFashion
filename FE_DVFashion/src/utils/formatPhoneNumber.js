function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber || typeof phoneNumber !== "string") {
    throw new Error("Invalid phone number");
  }

  const formattedPhone = phoneNumber.startsWith("+84")
    ? phoneNumber
    : `+84${phoneNumber.startsWith("0") ? phoneNumber.slice(1) : phoneNumber}`;

  return formattedPhone;
}

export default formatPhoneNumber;
