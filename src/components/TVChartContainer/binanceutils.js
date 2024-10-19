export function getBinanceInterval(resolution) {
  const resolutionsMap = {
    "1S": "1s", // Use 1-second data for aggregation
    "5S": "1s", // Stream 1-second data and aggregate manually for 5 seconds
    "10S": "1s", // Stream 1-second data and aggregate manually for 10 seconds
    "1": "1s",
    "5": "1s",
    "15": "1s",
    "30": "1s",
    "60": "1s"
  };
  return resolutionsMap[resolution] || "1s";
}

export function formatBinanceSymbol(symbol) {
  return symbol.toLowerCase().replace('/', '');
}
