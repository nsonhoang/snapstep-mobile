export const extractProvinceName = (address: string): string => {
  if (!address || address === "Vị trí không xác định") return "";

  const parts = address.split(",").map((s) => s.trim());
  const lastPart = parts[parts.length - 1];

  return lastPart.replace(/^(Thành phố|Tỉnh|TP\.)\s+/i, "").trim();
};
