import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight, BadgeHelp, CalendarRange, Store, X, TrendingUp, FileText,
  DollarSign, ArrowUpRight, Clock, Award, BarChart, Target, Settings, ChevronDown, Calendar
} from "lucide-react";
import { NavLink } from "react-router-dom";
import axios from "axios";

const Leftbar = () => {
  const [isTradesMenuOpen, setTradesMenuOpen] = useState(false);
  const [isMarketMenuOpen, setMarketMenuOpen] = useState(false);
  const [isEventsMenuOpen, setEventsMenuOpen] = useState(false);
  const [isHelpMenuOpen, setHelpMenuOpen] = useState(false);
  const [expandedTrade, setExpandedTrade] = useState(null);
  const [tradeLogs, setTradeLogs] = useState([]);
  const [liveTrade, setLiveTrade] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [liveDuration, setLiveDuration] = useState("");
  const [activeMarketOption, setActiveMarketOption] = useState(""); // Added state for active market option
  let intervalRef = null;

  const menus = [
    { name: "Trades", icon: <ArrowLeftRight className="h-6 w-6" /> },
    { name: "Market", icon: <Store className="h-6 w-6" /> },
    { name: "Events", icon: <CalendarRange className="h-6 w-6" /> },
    { name: "Help", icon: <BadgeHelp className="h-6 w-6" /> },
  ];

  const toggleTradesMenu = () => setTradesMenuOpen((prev) => !prev);
  const toggleMarketMenu = () => setMarketMenuOpen((prev) => !prev);
  const toggleEventsMenu = () => setEventsMenuOpen((prev) => !prev);
  const toggleHelpMenu = () => setHelpMenuOpen((prev) => !prev);

  const handleMenusClick = (menuName) => {
    if (menuName === "Trades") {
      toggleTradesMenu();
    } else if (menuName === "Market") {
      toggleMarketMenu();
    } else if (menuName === "Events") {
      toggleEventsMenu();
    } else if (menuName === "Help") {
      toggleHelpMenu();
    }
  };

  const fetchTradeLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("https://live-trade-api-zinoova-to3d7.ondigitalocean.app/trades/logs");
      setTradeLogs(response.data.data || []);
    } catch (err) {
      setError("Failed to load trade logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isTradesMenuOpen) fetchTradeLogs();
  }, [isTradesMenuOpen]);

  useEffect(() => {
    const ws = new WebSocket("ws://live-trade-api-zinoova-to3d7.ondigitalocean.app");
    ws.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = (message) => {
      const data = JSON.parse(message.data);
      if (data.trade && data.trade.status === "live") {
        setLiveTrade(data.trade);
        setLiveDuration("0m 0s");
        const placedAt = new Date(data.trade.createdAt).getTime();
        
        if (intervalRef) clearInterval(intervalRef);  // Clear existing interval

        intervalRef = setInterval(() => {
          const now = Date.now();
          const durationInSeconds = Math.floor((now - placedAt) / 1000);
          const minutes = Math.floor(durationInSeconds / 60);
          const seconds = Math.floor(durationInSeconds % 60);
          setLiveDuration(`${minutes}m ${seconds}s`);
        }, 1000);
      } else if (data.trade && data.trade.status === "completed") {
        setLiveTrade(null);
        setTradeLogs((prevLogs) => [data.trade, ...prevLogs]);
        clearInterval(intervalRef);  // Clear interval once trade is completed
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket server");
      clearInterval(intervalRef);  // Ensure interval is cleared on disconnect
    };

    return () => {
      ws.close();
      clearInterval(intervalRef);  // Cleanup on component unmount
    };
  }, []);

  const calculateDuration = (trade) => {
    const placedAtTime = new Date(trade.createdAt).getTime();
    const closedAtTime = new Date(trade.completedAt).getTime();
    const durationInSeconds = (closedAtTime - placedAtTime) / 1000;
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    return `${minutes}m ${seconds}s`;
  };

  const toggleTradeDetails = (tradeId) => {
    setExpandedTrade(expandedTrade === tradeId ? null : tradeId);
  };

  const handleMarketOptionChange = (option) => {
    setActiveMarketOption(option); // Set active market option
  };

  return (
    <div className="flex h-full bg-primary text-gray-300 shadow-lg font-poppins">
      <div className="flex flex-col justify-between w-20 sm:w-24 bg-primary text-gray-400 shadow-lg">
        <div className="flex items-center justify-center h-20">
          <NavLink to="/" className="hover:scale-105 transform transition duration-300">
            <img src="logo-main.png" alt="Logo" className="h-12 w-auto" />
          </NavLink>
        </div>
        <nav className="flex-1 pt-4">
          <ul className="space-y-6 flex flex-col items-center">
            {menus.map((menu) => (
              <li
                key={menu.name}
                className="hover:text-white transition-transform duration-200"
              >
                <button
                  className="flex flex-col items-center"
                  onClick={() => handleMenusClick(menu.name)}
                >
                  {menu.icon}
                  <p className="text-sm mt-1">{menu.name}</p>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Trades Menu */}
      <AnimatePresence>
        {isTradesMenuOpen && (
          <motion.div
            className="fixed top-0 left-0 h-full w-full sm:w-[400px] bg-primary text-gray-200 shadow-2xl z-50"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 600, damping: 30, duration: 0.15 }}
          >
            <div className="flex justify-between items-center px-4 py-4 border-b border-gray-600 bg-primary">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-green-400" />
                <span>Trades</span>
              </h3>
              <motion.button
                onClick={toggleTradesMenu}
                aria-label="Close Trades Menu"
                className="focus:outline-none"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6 text-gray-300 hover:text-red-500 transition-colors" />
              </motion.button>
            </div>

            <motion.div
              className="p-4 max-h-full overflow-y-auto space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Live Trade Section */}
              <h4 className="text-base font-semibold text-white">Live Trade</h4>
              {liveTrade ? (
                <motion.div
                  className="p-4 bg-secondary rounded-lg border border-gray-700 hover:border-gray-500 transition-all duration-75"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.1, ease: "easeOut" }}
                >
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <p className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                      Amount: ${liveTrade.amount}
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-gray-400">
                    <p className="flex items-center">
                      <ArrowUpRight className="h-4 w-4 mr-2 text-yellow-400" />
                      Direction: {liveTrade.direction}
                    </p>
                    <p className="flex items-center mt-2">
                      <Clock className="h-4 w-4 mr-2 text-purple-400" />
                      Duration: {liveDuration}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="text-sm text-gray-400">No live trade running.</div>
              )}

              {/* Trade Logs Section */}
              <h4 className="text-base font-semibold text-white mt-6">Trade Logs</h4>
              {loading ? (
                <motion.div
                  className="flex items-center justify-center h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-gray-400"></div>
                    <p className="text-sm text-white">Loading trades...</p>
                  </div>
                </motion.div>
              ) : error ? (
                <div className="text-center text-red-500">{error}</div>
              ) : tradeLogs.length > 0 ? (
                <div className="space-y-4">
                  {tradeLogs.map((trade, index) => (
                    <motion.div
                      key={trade._id}
                      onClick={() => toggleTradeDetails(trade._id)}
                      className="p-4 bg-secondary rounded-lg cursor-pointer transition-all duration-100 hover:shadow-md"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ delay: index * 0.05, duration: 0.05 }}
                    >
                      <h4 className="text-base font-medium text-white flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-blue-400" />
                        <span>Trade - {index + 1}</span>
                      </h4>
                      <div className="flex items-center justify-between mt-2 text-sm text-gray-300">
                        <p className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                          Amount: ${trade.amount}
                        </p>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-500 transition-transform ${
                            expandedTrade === trade._id ? "rotate-180" : ""
                          }`}
                          transition={{ duration: 0.1 }}
                        />
                      </div>

                      <AnimatePresence>
                        {expandedTrade === trade._id && (
                          <motion.div
                            className="mt-4 text-sm text-gray-400 space-y-2"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.1 }}
                          >
                            <p className="flex items-center">
                              <ArrowUpRight className="h-4 w-4 mr-2 text-yellow-400" />
                              Direction: {trade.direction}
                            </p>
                            <p className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-purple-400" />
                              Placed At: {new Date(trade.createdAt).toLocaleString()}
                            </p>
                            <p className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-red-500" />
                              Duration: {calculateDuration(trade)}
                            </p>
                            <p className="flex items-center">
                              <Award
                                className={`h-4 w-4 mr-2 ${
                                  trade.outcome === "won" ? "text-green-400" : "text-red-500"
                                }`}
                              />
                              Result: {trade.outcome === "won" ? "Won" : "Lost"}
                            </p>
                            <p className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-green-500" />
                              Closed At: {new Date(trade.completedAt).toLocaleString()}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-white">No trade logs available</div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Market Menu */}
      <AnimatePresence>
        {isMarketMenuOpen && (
          <motion.div
            className="fixed top-0 left-0 h-full w-full sm:w-[400px] bg-primary text-gray-300 shadow-xl z-50"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 600, damping: 30, duration: 0.15 }}
          >
            <div className="flex justify-between items-center px-4 py-4 border-b border-gray-700 bg-primary shadow-lg">
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <BarChart className="h-6 w-6 text-blue-400" />
                <span>Market</span>
              </h3>
              <motion.button
                onClick={toggleMarketMenu}
                aria-label="Close Market Menu"
                className="focus:outline-none"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6 text-gray-400 hover:text-red-500 transition-colors" />
              </motion.button>
            </div>

            <motion.div
              className="p-6 space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              {[
                { label: "Trading Conditions", icon: <TrendingUp className="h-5 w-5 mr-2 text-green-400" /> },
                { label: "Signals", icon: <Target className="h-5 w-5 mr-2 text-yellow-400" /> },
                { label: "Strategies", icon: <Settings className="h-5 w-5 mr-2 text-purple-400" /> },
                { label: "Indicators", icon: <BarChart className="h-5 w-5 mr-2 text-blue-400" /> },
              ].map((option, index) => (
                <motion.div
                  key={option.label}
                  className={`mb-6 p-4 rounded-lg bg-secondary text-center text-white transition-all duration-100 cursor-pointer flex items-center justify-center ${
                    activeMarketOption === option.label ? "border-l-4 border-blue-500" : "hover:bg-gray-700"
                  }`}
                  onClick={() => handleMarketOptionChange(option.label)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.1, ease: "easeOut" }}
                >
                  {option.icon}
                  <div>
                    <h4 className="text-lg font-semibold">{option.label}</h4>
                    <p className="text-gray-400 mt-2">feature for  {option.label} coming soon.</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

  {/* Events Menu */}
<AnimatePresence>
  {isEventsMenuOpen && (
    <motion.div
      className="fixed top-0 left-0 h-full w-full sm:w-[400px] bg-primary text-gray-300 shadow-2xl z-50"
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", stiffness: 600, damping: 30, duration: 0.15 }}
    >
      <div className="flex justify-between items-center px-4 py-4 border-b border-gray-700 bg-secondary shadow-md">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <CalendarRange className="h-6 w-6 text-green-400" />
          <span>Events</span>
        </h3>
        <motion.button
          onClick={toggleEventsMenu}
          aria-label="Close Events Menu"
          className="focus:outline-none"
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-6 w-6 text-gray-400 hover:text-red-500 transition-colors duration-200 ease-in-out" />
        </motion.button>
      </div>

      <motion.div
        className="p-6 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {/* Upcoming Events Card */}
        <motion.div
          className="bg-secondary p-4 rounded-lg shadow-lg transition-all hover:shadow-xl hover:bg-tertiary"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05, duration: 0.1, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-lg font-semibold text-white">Upcoming Events</p>
          <p className="text-gray-400 mt-2">Details about upcoming events will appear here.</p>
        </motion.div>

        {/* Past Events Card */}
        <motion.div
          className="bg-secondary p-4 rounded-lg shadow-lg transition-all hover:shadow-xl hover:bg-tertiary"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05, duration: 0.1, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-lg font-semibold text-white">Past Events</p>
          <p className="text-gray-400 mt-2">Details about past events will appear here.</p>
        </motion.div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

{/* Help Menu */}
<AnimatePresence>
  {isHelpMenuOpen && (
    <motion.div
      className="fixed top-0 left-0 h-full w-full sm:w-[400px] bg-primary text-gray-300 shadow-2xl z-50"
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ type: "spring", stiffness: 600, damping: 30, duration: 0.15 }}
    >
      <div className="flex justify-between items-center px-4 py-4 border-b border-gray-700 bg-gray-800 shadow-md">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <BadgeHelp className="h-6 w-6 text-purple-400" />
          <span>Help</span>
        </h3>
        <motion.button
          onClick={toggleHelpMenu}
          aria-label="Close Help Menu"
          className="focus:outline-none"
          whileHover={{ rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X className="h-6 w-6 text-gray-400 hover:text-red-500 transition-colors duration-200 ease-in-out" />
        </motion.button>
      </div>

      <motion.div
        className="p-6 space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        {/* Need Assistance Card */}
        <motion.div
          className="bg-secondary p-4 rounded-lg shadow-lg transition-all hover:shadow-xl hover:bg-tertiary"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-lg font-semibold text-white">Need Assistance?</p>
          <p className="text-gray-400 mt-2">
            You can reach out to our support team for help or refer to our detailed documentation.
          </p>
        </motion.div>

        {/* FAQs Card */}
        <motion.div
          className="bg-secondary p-4 rounded-lg shadow-lg transition-all hover:shadow-xl hover:bg-tertiary"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.1, ease: "easeOut" }}
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-lg font-semibold text-white">Frequently Asked Questions</p>
          <p className="text-gray-400 mt-2">
            Check out our FAQs for common issues and resolutions.
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

    </div>
  );
};

export default Leftbar;
