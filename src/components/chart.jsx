import { createChart } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

function Chart() {
  const chartRef = useRef();
  const candleSeriesRef = useRef(); // Store the series in a ref to prevent rerendering
  const [binanceData, setBinanceData] = useState([]);
  const [previousCandle, setPreviousCandle] = useState(null); // Track the previous candle

  // Function to animate the update of the candlestick
  function animateCandleUpdate(previousCandle, newCandle) {
    const duration = 1000; // 1 second animation
    const startTime = performance.now();

    function animate(time) {
      const progress = Math.min((time - startTime) / duration, 1);
      const interpolatedClose =
        previousCandle.close +
        (newCandle.close - previousCandle.close) * progress;

      candleSeriesRef.current.update({
        ...newCandle,
        close: interpolatedClose, // Smooth transition of close price
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  // Function to connect to Binance WebSocket and listen for live candlestick data
  const connectBinanceWebSocket = () => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@kline_1m");

    ws.onopen = () => {
      console.log("WebSocket connection established.");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log("WebSocket closed:", event);
      setTimeout(() => {
        console.log("Attempting to reconnect...");
        connectBinanceWebSocket(); // Reconnect
      }, 2000);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const candlestick = message.k;

      const newCandle = {
        time: Math.floor(candlestick.t / 1000), // Convert from ms to seconds
        open: parseFloat(candlestick.o),
        high: parseFloat(candlestick.h),
        low: parseFloat(candlestick.l),
        close: parseFloat(candlestick.c),
      };

      setBinanceData((prevData) => {
        // Check if the last candle has the same timestamp and replace it
        const lastIndex = prevData.length - 1;
        if (lastIndex >= 0 && prevData[lastIndex].time === newCandle.time) {
          const updatedData = [...prevData];
          updatedData[lastIndex] = newCandle; // Update the last candle
          return updatedData;
        }
        // Otherwise, append the new candle
        return [...prevData, newCandle];
      });
    };

    return ws;
  };

  useEffect(() => {
    // Create the chart and store it in the chartRef
    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: chartRef.current.clientHeight,
      layout: {
        background: { color: '#020617' },
        textColor: '#DDD',
      },
      grid: {
        vertLines: { color: '#444' },
        horzLines: { color: '#444' },
      },
    });

    // Add candlestick series
    const newSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    });

    candleSeriesRef.current = newSeries; // Store the series instance

    // WebSocket connection to Binance
    const ws = connectBinanceWebSocket();

    // Cleanup function
    return () => {
      chart.remove();
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (binanceData.length > 0) {
      const lastCandle = binanceData[binanceData.length - 1];

      if (previousCandle) {
        // Animate transition from previous candle to the new one
        animateCandleUpdate(previousCandle, lastCandle);
      } else {
        candleSeriesRef.current.update(lastCandle); // Update without animation for the first data point
      }

      setPreviousCandle(lastCandle);
    }
  }, [binanceData]);

  return <div ref={chartRef} className="w-full h-full"></div>;
}

export default Chart;
