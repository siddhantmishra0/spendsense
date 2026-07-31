import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import GettingStarted from "./components/GettingStarted";
import Dashboard from "./components/Dashboard";
import Budget from "./components/Budget";
import Expenses from "./components/Expenses";
import Report from "./components/Report";
import Insights from "./components/Insights";
import Goals from "./components/Goals";
import Subscriptions from "./components/Subscriptions";
import Rewards from "./components/Rewards";
import NetWorth from "./components/NetWorth";
import ExpenseSplitter from "./components/ExpenseSplitter";
import { useEffect } from "react";
import useAppStore from "./store/useAppStore";

function App() {
    const { isDarkMode } = useAppStore();

    useEffect(() => {
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }, [isDarkMode]);
    // const navigate = useNavigate();

    useEffect(() => {
      const handlePopState = () => {
        // Clear access token from cookies/localStorage
        // localStorage.removeItem("accessToken"); // if you’re storing it in localStorage
        document.cookie = "accessToken=; Max-Age=0; path=/;"; // if in cookies

        // Redirect to GettingStarted page
        // navigate("/");
        window.location.href ="/"
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }, []);
  return (
    <>
      <Toaster position="bottom-right" toastOptions={{ duration: 2000 }} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<GettingStarted />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Navbar />}>
            <Route index element={<Dashboard />} />
            <Route path="budget" element={<Budget />} />
            <Route path="expense" element={<Expenses />} />
            <Route path="report" element={<Report />} />
            <Route path="insight" element={<Insights />} />
            <Route path="goals" element={<Goals />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="rewards" element={<Rewards />} />
            <Route path="networth" element={<NetWorth />} />
            <Route path="split" element={<ExpenseSplitter />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
