import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Login from "./components/auth/login";
import SingUp from "./components/auth/signUp";
import { AuthProvider } from "./contexts/authContext";
import './index.css';
function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Home />} path="/" />
        <Route element={<Login />} path="/login" />
        <Route element={<SingUp />} path="/signup" />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
