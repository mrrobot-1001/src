// TradeContext.js
import React, { createContext, useState } from 'react';

export const TradeContext = createContext();

export const TradeProvider = ({ children }) => {
  const [duration, setDuration] = useState(null); // Trade duration from Sidebar
  const [liveTrade, setLiveTrade] = useState(null); // Active live trade
  const [tradeLogs, setTradeLogs] = useState([]); // All completed trade logs

  const startLiveTrade = (tradeDetails) => {
    const newTrade = {
      ...tradeDetails,
      _id: "liveTrade_" + Date.now(), // Unique ID for live trade
      time: new Date().toISOString(),
      won: null, // No result until completed
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    setLiveTrade(newTrade);
    
    // Simulate trade completion after the set duration
    setTimeout(() => {
      const completedTrade = {
        ...newTrade,
        updatedAt: new Date().toISOString(),
        won: Math.random() > 0.5 ? 2 : 0, // Randomly win or lose
      };
      setLiveTrade(null); // Remove live trade
      setTradeLogs((prevLogs) => [completedTrade, ...prevLogs]); // Move to trade logs
    }, duration * 1000); // Use duration from the context
  };

  return (
    <TradeContext.Provider
      value={{
        duration,
        setDuration,
        liveTrade,
        tradeLogs,
        startLiveTrade,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
};
