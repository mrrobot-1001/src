import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Chart from "../components/chart";
import Sidebar from "../components/sidebar";
import Leftbar from "../components/leftbar";
import TopBar from "../components/topBar";
import { useAuth } from "../contexts/authContext";
import { TVChartContainer } from "../components/TVChartContainer";

function Home() {
  const { user, token } = useAuth();
  const [walletData, setWalletData] = useState(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);

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
  }, [user, token]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  return (
    <div className="flex h-screen">
      <div className="ass h-full">
        <Leftbar />
      </div>

      <div className="flex-1 bg-[#020617] flex flex-col">
        <div className="flex-none">
          {/* Pass wallet data and the refresh function to TopBar */}
          <TopBar
            walletData={walletData}
            isLoadingWallet={isLoadingWallet}
            refreshWallet={fetchWalletData}
          />
        </div>
        <div className="flex-1 flex">
          <div className="flex-1">
            <TVChartContainer />
          </div>
          <div className="w-[30%] min-w-[150px] max-w-[200px]">
            {/* Pass wallet update function to Sidebar */}
            <Sidebar onWalletUpdate={fetchWalletData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
