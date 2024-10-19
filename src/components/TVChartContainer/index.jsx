
import React, { useEffect, useRef } from "react";
import "./index.css";
import { widget } from "../../charting_library";
import Datafeed from "./datafeed.js"; // Import getLatestBar
import { getLatestBar } from "./streaming";

function getLanguageFromURL() {
  const regex = new RegExp("[\\?&]lang=([^&#]*)");
  const results = regex.exec(window.location.search);
  return results === null
    ? null
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

let tvWidget = null; // Reference the widget instance itself, not the container

export const TVChartContainer = () => {
  const chartContainerRef = useRef();

  const defaultProps = {
    symbol: "BTC/USDT",
    interval: "1",
    datafeedUrl: "https://demo_feed.tradingview.com",
    libraryPath: "/charting_library/",
    chartsStorageUrl: "https://saveload.tradingview.com",
    chartsStorageApiVersion: "1.1",
    clientId: "tradingview.com",
    userId: "public_user_id",
    fullscreen: false,
    autosize: true,
    studiesOverrides: {},
    theme: "Dark",
  };

  useEffect(() => {
    const widgetOptions = {
      symbol: defaultProps.symbol,
      datafeed: Datafeed,
      interval: defaultProps.interval,
      container: chartContainerRef.current,
      library_path: defaultProps.libraryPath,
      locale: getLanguageFromURL() || "en",
      disabled_features: ["use_localstorage_for_settings"],
      enabled_features: ["study_templates", "seconds_resolution"],
      charts_storage_url: defaultProps.chartsStorageUrl,
      charts_storage_api_version: defaultProps.chartsStorageApiVersion,
      client_id: defaultProps.clientId,
      user_id: defaultProps.userId,
      timezone: "Asia/Kolkata",
      supported_resolutions: ["1S", "1", "5", "15", "30", "60", "D"],
      fullscreen: defaultProps.fullscreen,
      autosize: defaultProps.autosize,
      studies_overrides: defaultProps.studiesOverrides,
      theme: defaultProps.theme,
    };

    tvWidget = new widget(widgetOptions); 

    return () => {
      tvWidget.remove();
    };
  }, []);

  return <div ref={chartContainerRef} className={"TVChartContainer"} />;
};

// Updated plotExpiryLine function to "lock" price and time immediately when a trade happens
export const plotExpiryLine = (tradeTime, isUpTrade) => {
  const expiryTime = tradeTime * 1000; // Ensure it's in milliseconds
  const lineColor = isUpTrade ? "green" : "red";
  const labelText = isUpTrade ? "Up Trade" : "Down Trade";

  if (tvWidget) {
    const chart = tvWidget.activeChart();
    const latestBar = getLatestBar(); // Get the latest bar (time and price)

    if (latestBar !== null) {
      // Immediately lock the current time and price when the trade is initiated
      const { time: currentTime, price: lockedPrice } = latestBar;
      console.log(`Trade initiated. Locked time: ${currentTime}, Locked price: ${lockedPrice}, Expiry time: ${currentTime + (expiryTime / 1000)}`);

      // Set endPrice equal to lockedPrice to make the line horizontal
      const endPrice = lockedPrice;

      // Handling the time series information correctly for both up and down trades
      const startTime = currentTime;
      const endTime = currentTime + (expiryTime / 1000);  // Add the trade duration to the current time for the end time

      // Create a trend line using locked price and time data
      chart.createMultipointShape(
        [
          { time: startTime, price: lockedPrice }, // Start point (locked current time and price)
          { time: endTime, price: endPrice }, // End point (expiry time and same price for horizontal line)
        ],
        {
          shape: "trend_line",
          lock: true, // Temporarily unlock to see if the issue is with locking
          disableSelection: true,
          disableSave: true,
          text: labelText,
          overrides: {
            color: lineColor,
            linewidth: 4,
            linestyle: 0, // Solid line
            textcolor: lineColor,
            showLabel: true,
          },
        }
      );
    } else {
      console.error("Latest bar not available.");
    }
  } else {
    console.error("Chart widget is not ready");
  }
};
