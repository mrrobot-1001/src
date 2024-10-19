import React, { useState, useCallback, useEffect } from "react";
import axios from "axios";
import TopBar from "../components/topBar";
import Sidebar from "../components/sidebar";
import Leftbar from "../components/leftbar"; // Import Leftbar component
import { useAuth } from "../contexts/authContext";

const WalletDashboard = () => {
  const { user, token } = useAuth();
  const [walletData, setWalletData] = useState(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  const [liveTrade, setLiveTrade] = useState(null); // Manage live trade state

  const fetchWalletData = useCallback(async () => {
    if (user?.userId) {
      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL;

        const res = await axios.get(`${baseUrl}/user/wallet?id=${user.userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 200 && res.data?.data) {
          setWalletData(res.data.data); // Assuming 'res.data.data' contains the wallet info
        } else {
          throw new Error("Failed to fetch wallet data");
        }
      } catch (error) {
        console.error("Error fetching wallet info:", error);
      } finally {
        setIsLoadingWallet(false);
      }
    }
  }, [token, user]);

  const handlePlaceTrade = (trade) => {
    setLiveTrade(trade);
    setTimeout(() => {
      setLiveTrade(null); 
    }, trade.expiryTime * 1000); 
  };

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  return (
    <div className="dashboard">
    
      <TopBar walletData={walletData} isLoadingWallet={isLoadingWallet} refreshWallet={fetchWalletData} />

     
      <Sidebar
        onWalletUpdate={fetchWalletData}
        walletData={walletData}
        onPlaceTrade={handlePlaceTrade} 
      />

 
      <Leftbar liveTrade={liveTrade} />
    </div>
  );
};

export default WalletDashboard;
