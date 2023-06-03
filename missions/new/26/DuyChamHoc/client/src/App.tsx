import { useEffect, useState } from "react";
import "./App.css";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import Body from "./components/Body/Body";

function App() {
  const [windowSize, setWindowSize] = useState({
    width: undefined || -1,
    height: undefined || -1,
  });
  const [isMobile, setMobile] = useState(false);
  const [accounts, setAccounts] = useState("");

  useEffect(() => {
    const handleSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleSize);
    handleSize();
    return () => window.removeEventListener("resize", handleSize);
  }, []);

  useEffect(() => {
    if (windowSize.width < 500) {
      setMobile(true);
    } else {
      setMobile(false);
    }
  }, [windowSize]);

  return (
    <div className="font-sora overflow-y-auto overflow-x-hidden h-screen px-4 py-8 bg-gradient-to-b dark:from-purple-900 dark:to-purple-700 from-white to-pink-500  dark:text-white text-black md:px-20">
      <Header isMobile={isMobile} setAccounts={setAccounts} />
      <Body accounts={accounts} />
      <Footer />
    </div>
  );
}

export default App;
