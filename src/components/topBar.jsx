import React, { useState } from "react";
import { Plus, UserRound, X, Wallet, User, Mail, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

const TopBar = ({ walletData, isLoadingWallet, refreshWallet }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogin = () => navigate("/login");
  const handleSignup = () => navigate("/signup");

  return (
    <div className="relative">
      <div className="flex items-center justify-between p-3 pb-1 font-maven">
        <div className="flex items-center gap-3">
          <Plus className="bg-slate-800 p-2 rounded-md w-fit" size={42} />
          {/* Additional elements like indexList can be placed here */}
        </div>

        <div className="flex items-center gap-4">
          <div className="wallet py-1 px-3 hover:bg-slate-800 cursor-pointer rounded-md transition duration-300 ease-in-out">
            <p className="text-sm">
              {isLoadingWallet ? (
                <span className="animate-pulse text-gray-500">Loading...</span>
              ) : walletData?.balance ? (
                `$${walletData.balance.toLocaleString()}`
              ) : (
                "N/A"
              )}
            </p>
            <p className="text-yellow-500 text-sm">Demo Wallet</p>
          </div>

          <button
  onClick={toggleMenu}
  className="bg-slate-800 p-3 rounded-full hover:bg-slate-700 transition duration-300 ease-in-out"
>
  <UserRound size={24} />
</button>
</div>
</div>

{isMenuOpen && (
  <>
    <div className="fixed top-0 right-0 h-full w-80 bg-gray-900 shadow-lg transition-transform duration-300 ease-in-out z-50 p-4 transform translate-x-0 rounded-l-lg">

      <button
        onClick={toggleMenu}
        className="absolute top-4 right-4 text-gray-400 hover:text-white transition duration-300 ease-in-out"
      >
        <X size={24} />
      </button>

      <div className="mt-6 space-y-4">
        {isAuthenticated ? (
          <>
            <h2 className="text-white text-xl font-semibold flex items-center">
              <User className="mr-2" /> User Details
            </h2>
            <div className="flex flex-col space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-md transition hover:bg-gray-700">
                <User className="text-white" />
                <p className="text-gray-300">
                  Name: <span className="font-medium">{user?.name || "N/A"}</span>
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-md transition hover:bg-gray-700">
                <Mail className="text-white" />
                <p className="text-gray-300">
                  Email: <span className="font-medium">{user?.email || "N/A"}</span>
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-md transition hover:bg-gray-700">
                <Wallet className="text-white" />
                <p className="text-gray-300">
                  Wallet Balance:{" "}
                  {isLoadingWallet ? (
                    <span className="animate-pulse text-gray-500">Loading...</span>
                  ) : (
                    <span className="font-medium">
                      {`$${walletData?.balance?.toLocaleString() || "N/A"}`}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="bg-red-600 text-white py-2 px-4 rounded-md w-full hover:bg-red-700 transition duration-300 ease-in-out mt-4 flex items-center justify-center gap-2"
            >
              <LogOut size={20} /> Logout
            </button>
          </>
        ) : (
          <>
            <h2 className="text-white text-xl font-semibold mb-2">Welcome</h2>
            <p className="text-gray-300 mb-4">
              Please log in to access your account or create a new account to get started.
            </p>
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white py-2 px-4 rounded-md w-full hover:bg-blue-700 transition duration-300 ease-in-out mb-2"
            >
              Login
            </button>
            <button
              onClick={handleSignup}
              className="bg-green-600 text-white py-2 px-4 rounded-md w-full hover:bg-green-700 transition duration-300 ease-in-out"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </div>

   
    <div
      onClick={toggleMenu}
      className="fixed inset-0 bg-black opacity-50 z-40"
    ></div>
        </>
      )}
    </div>
  );
};

export default TopBar;
