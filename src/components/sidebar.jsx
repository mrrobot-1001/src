import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/authContext";
import { Toaster, toast } from 'sonner';
import { LucideArrowUp, LucideArrowDown, X } from "lucide-react";
import { plotExpiryLine } from "./TVChartContainer";

const Sidebar = ({ onWalletUpdate, walletData }) => {
  const { token } = useAuth();
  const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://live-trade-api-zinoova-to3d7.ondigitalocean.app';  // Default to localhost:5000
  const [amount, setAmount] = useState(0);
  const [duration, setDuration] = useState("5 min"); // Set default duration
  const [orderBy, setOrderBy] = useState("Select Order By");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isDurationOpen, setIsDurationOpen] = useState(false);
  const [isOrderByOpen, setIsOrderByOpen] = useState(false);
  const [subOptions, setSubOptions] = useState(null);
  const [priceOption, setPriceOption] = useState("");
  const [profitabilityOption, setProfitabilityOption] = useState("");
  const [tradeStatus, setTradeStatus] = useState(null);
  const [tradeProfit, setTradeProfit] = useState(0); 

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (!isNaN(value) && Number(value) >= 0) {
      if (Number(value) > walletData?.balance) {
        toast.warning("Amount can't exceed wallet balance!", { duration: 3000 });
      } else {
        setAmount(Number(value));
      }
    }
  };

  const incrementAmount = () => {
    if (walletData?.balance && amount + 1 > walletData.balance) {
      toast.warning("Amount can't exceed wallet balance!", { duration: 3000 });
    } else {
      setAmount((prevAmount) => prevAmount + 1);
    }
  };

  const decrementAmount = () => {
    if (amount === 0) {
      toast.warning("Amount can't be zero!", { duration: 3000 });
    } else {
      setAmount((prevAmount) => (prevAmount > 0 ? prevAmount - 1 : 0));
    }
  };

  const toggleDurationOptions = () => {
    setIsDurationOpen(!isDurationOpen);
    setSubOptions(null);
  };

  const handleMainDurationSelect = (option) => {
    setSubOptions(option);
  };

  const handleSubOptionSelect = (subOption) => {
    setDuration(subOption);
    setIsDurationOpen(false);
    setSubOptions(null);
  };

  const toggleOrderByOptions = () => {
    setIsOrderByOpen(!isOrderByOpen);
    setSubOptions(null);
  };

  const handleOrderBySelect = (option) => {
    setSubOptions(option);
  };

  const handleProfitabilitySelect = (option) => {
    setProfitabilityOption(option);
    setIsOrderByOpen(false);
  };

  const convertDurationToSeconds = (durationStr) => {
    if (durationStr.includes("sec")) {
      return parseInt(durationStr) || 0;
    } else if (durationStr.includes("min")) {
      return (parseInt(durationStr) || 0) * 60;
    } else {
      return 300; 
    }
  };

  const placeTrade = async (bid) => {

    if (amount === 0) {
      toast.warning("Amount can't be zero!", { duration: 3000 });
      return;
    }
    if (amount > walletData?.balance) {
      toast.warning("Amount can't exceed wallet balance!", { duration: 3000 });
      return;
    }

    const expiryTimeInSeconds = convertDurationToSeconds(duration);
    console.log(expiryTimeInSeconds);
    console.log(duration);

    if (expiryTimeInSeconds === 0) {
      toast.warning("Please select a valid duration!", { duration: 3000 });
      return;
    }

    const expiryTime = Math.floor(Date.now() / 1000) + expiryTimeInSeconds;

  try {
    await plotExpiryLine(expiryTimeInSeconds, bid === "up");

  } catch (error) {
    console.error("Error plotting expiry line:", error);
    toast.error("Failed to plot expiry line. Continuing with trade placement.");
  }

    const tradeResult = Math.random() < 0.5 ? 'up' : 'down';  
    const isWin = tradeResult === bid;

    const profitPercentage = 0.8; 
    const calculatedProfit = isWin ? amount * profitPercentage : -amount;
    setTradeProfit(calculatedProfit);  
    setTradeStatus('live');

    try {
      // Execute both requests to baseUrl and localhost:5000 simultaneously
      await Promise.all([
        axios.post(
          `${baseUrl}/trades/new`,  // Request to baseUrl
          {
            expiryTime: expiryTimeInSeconds,
            amount,
            direction: bid,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
        axios.post(
          'https://live-trade-api-zinoova-to3d7.ondigitalocean.app/trades/new',  // Request to localhost:5000
          {
            expiryTime: expiryTimeInSeconds,
            amount,
            direction: bid,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      ]);
    
      toast.success("Trade placed!", { duration: 3000 });
    
      setTimeout(async () => {
        setTradeStatus(isWin ? 'win' : 'loss');
    
        if (onWalletUpdate) {
          await onWalletUpdate();
        }
      }, expiryTimeInSeconds * 1000);
    
    } catch (error) {
      console.error("Error placing trade:", error);
      toast.error("Failed to place trade. Please try again.", { duration: 3000 });
    }
  };

  return (
    <div
      className={`relative top-0 right-0 h-full transition-all duration-300 bg-primary shadow-lg ${isCollapsed ? "w-16" : "w-64"} sm:w-full p-6 font-poppins`}
    >
      <Toaster />
      <div className="flex justify-end">
        <button
          className="text-gray-500 focus:outline-none sm:hidden"
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 24 24"
              stroke="currentColor"
              fill="none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </button>
      </div>

      <div className={`${isCollapsed ? "hidden" : ""} sm:block`}>
        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-gray-400 mb-2 text-base font-poppins">Amount</label>
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            className="w-full text-center border border-gray-600 py-3 bg-primary text-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-tertiary transition-colors duration-300"
          />
        </div>
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={decrementAmount}
            className="bg-secondary w-16 h-10 flex items-center justify-center rounded-md text-white text-xl shadow-lg hover:bg-tertiary hover:shadow-md transition-all duration-200 ease-in-out"
          >
            <span className="font-bold">−</span>
          </button>
          <button
            onClick={incrementAmount}
            className="bg-secondary w-16 h-10 flex items-center justify-center rounded-md text-white text-xl shadow-lg hover:bg-tertiary hover:shadow-md transition-all duration-200 ease-in-out"
          >
            <span className="font-bold">+</span>
          </button>
        </div>

        {/* Duration Selection */}
        <div className="relative mb-6">
          <label className="block text-gray-400 mb-2 text-base font-poppins">Duration</label>
          <div
            onClick={toggleDurationOptions}
            className={`cursor-pointer border border-gray-600 p-3 rounded-md bg-primary text-gray-200 hover:bg-secondary transition-colors duration-200 ease-in-out ${isDurationOpen ? 'ring-2 ring-teal-500' : ''}`}
          >
            {duration}
          </div>

          {isDurationOpen && (
            <>
              <div
                onClick={toggleDurationOptions}
                className="fixed inset-0 bg-black opacity-50 z-40"
              ></div>

              <div
                className="absolute top-0 -left-72 w-64 bg-gray-900 shadow-lg transition-transform duration-200 ease-in-out z-50 p-4 rounded-md transform translate-x-0 overflow-hidden"
              >
                <button
                  onClick={toggleDurationOptions}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>

                <div className="p-2">
                  <h2 className="text-white text-lg font-semibold mb-4">Select Duration</h2>
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    {["Quick", "Timer", "Clock"].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleMainDurationSelect(option.toLowerCase())}
                        className={`relative text-gray-300 py-1 px-3 rounded-md hover:bg-gray-700 hover:text-white transition-colors duration-100 ease-out 
                          ${subOptions === option.toLowerCase() ? 'underline-animation' : ''}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Duration Options */}
                {subOptions === "quick" && (
                  <div className="bg-gray-900 mt-2 p-2 rounded-lg shadow-sm">
                    <h3 className="text-gray-400 text-xs font-medium mb-2">Quick Options</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {["5 sec", "15 sec", "30 sec", "45 sec"].map((option) => (
                        <button
                          key={option}
                          onClick={() => handleSubOptionSelect(option)}
                          className="relative text-gray-300 py-2 px-3 rounded-md text-center hover:bg-gray-700 hover:text-white transition-colors duration-150 ease-in-out"
                        >
                          {option}
                          {duration === option && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timer Duration Options */}
                {subOptions === "timer" && (
                  <div className="bg-gray-900 mt-2 p-2 rounded-lg shadow-sm">
                    <h3 className="text-gray-400 text-xs font-medium mb-2">Timer Options</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {["1 min", "5 min", "10 min", "15 min", "20 min", "25 min"].map((option) => (
                        <button
                          key={option}
                          onClick={() => handleSubOptionSelect(option)}
                          className="relative text-gray-300 py-2 px-3 rounded-md text-center hover:bg-gray-700 hover:text-white transition-colors duration-150 ease-in-out"
                        >
                          {option}
                          {duration === option && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clock Duration Options */}
                {subOptions === "clock" && (
                  <div className="bg-gray-900 mt-2 p-2 rounded-lg shadow-sm">
                    <h3 className="text-gray-400 text-xs font-medium mb-2">Clock Options</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {getCurrentTimeWithIntervals().map((time) => (
                        <button
                          key={time}
                          onClick={() => handleSubOptionSelect(time)}
                          className="relative text-gray-300 py-2 px-3 rounded-md text-center hover:bg-gray-700 hover:text-white transition-colors duration-150 ease-in-out"
                        >
                          {time}
                          {duration === time && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Order By Selection */}
        <div className="relative mb-6">
          <label className="block text-gray-400 mb-2 text-base font-poppins">Order By</label>
          <div
            onClick={toggleOrderByOptions}
            className={`cursor-pointer border border-gray-600 p-3 rounded-md bg-primary text-gray-200 hover:bg-secondary transition-colors duration-200 ease-in-out ${isOrderByOpen ? 'ring-2 ring-tertiary' : ''}`}
          >
            {orderBy}
          </div>

          {isOrderByOpen && (
            <>
              <div
                onClick={toggleOrderByOptions}
                className="fixed inset-0 bg-black opacity-50 z-40"
              ></div>

              <div
                className="absolute top-0 -left-72 w-64 bg-gray-900 shadow-lg transition-transform duration-200 ease-in-out z-50 p-4 rounded-md transform translate-x-0 overflow-hidden"
              >
                <button
                  onClick={toggleOrderByOptions}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>

                <div className="p-2">
                  <h2 className="text-white text-lg font-semibold mb-4">Select Order By</h2>
                  <div className="flex justify-between border-b border-gray-700 pb-2">
                    {["By Price", "By Time"].map((option) => (
                      <button
                        key={option}
                        onClick={() => handleOrderBySelect(option.toLowerCase())}
                        className={`relative text-gray-300 py-1 px-3 rounded-md hover:bg-gray-700 hover:text-white transition-colors duration-100 ease-out 
                          ${subOptions === option.toLowerCase() ? 'underline-animation' : ''}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-menu for "By Price" */}
                {subOptions === "by price" && (
                  <div className="bg-secondary rounded-md mt-2 p-3 shadow-md">
                    <div className="mb-4">
                      <label className="block text-gray-300 mb-2">Profitability</label>
                      <select
                        onChange={(e) => setProfitabilityOption(e.target.value)}
                        className="w-full bg-gray-800 text-gray-300 py-2 px-3 rounded-md hover:bg-gray-700"
                      >
                        <option value="">Select Profitability</option>
                        <option value="Above 70%">Above 70%</option>
                        <option value="Above 80%">Above 80%</option>
                        <option value="Above 90%">Above 90%</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Opening Price</label>
                      <input
                        type="text"
                        placeholder="Enter Opening Price"
                        className="w-full bg-gray-800 text-gray-300 py-2 px-3 rounded-md hover:bg-gray-700"
                        onChange={(e) => setPriceOption(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Sub-menu for "By Time" */}
                {subOptions === "by time" && (
                  <div className="bg-secondary rounded-md mt-2 p-3 shadow-md">
                    <div className="text-gray-300">Time-based sorting options...</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Up and Down Buttons */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <button
              className="bg-gradient-to-r from-green-500 to-green-700 text-white w-full py-3 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105"
              onClick={() => placeTrade("up")}
            >
              <span className="mr-2 font-poppins">Up</span>
              <LucideArrowUp size={20} />
            </button>
          </div>

          <div className="flex justify-between">
            <button
              className="bg-gradient-to-r from-red-500 to-red-700 text-white w-full py-3 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105"
              onClick={() => placeTrade("down")}
            >
              <span className="mr-2 font-poppins">Down</span>
              <LucideArrowDown size={20} />
            </button>
          </div>

          {/* Profit/Loss Display */}
          <div className="mt-4">
            {tradeStatus === 'win' && (
              <div className="bg-green-500 text-white py-3 px-4 rounded-lg text-center shadow-md">
                You won! Profit: ${(tradeProfit).toFixed(2)}
              </div>
            )}
            {tradeStatus === 'loss' && (
              <div className="bg-red-500 text-white py-3 px-4 rounded-lg text-center shadow-md">
                You lost. Loss: ${(Math.abs(tradeProfit)).toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
