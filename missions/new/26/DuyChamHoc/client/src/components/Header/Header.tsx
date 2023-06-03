import { useEffect, useState } from "react";
import { BsSunFill } from "react-icons/bs";
import { FaMoon } from "react-icons/fa";
import { HiOutlineMenu } from "react-icons/hi";
import { MdOutlineClose } from "react-icons/md";
import useDarkMode from "../../useDarkMode";
import { ethers } from "ethers";
export default function Header(props: any) {
  const { isMobile, setAccounts } = props;
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [openMenu, setOpenMenu] = useState(false);
  const [address, setAddress] = useState("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const handleMenu = () => {
    setOpenMenu(!openMenu);
  };
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      const accounts = await provider.send("eth_requestAccounts", []);
      setAddress(accounts[0]);
      setAccounts(accounts[0]);
    } else {
      console.log("Metamask is not installed.");
    }
  };

  useEffect(() => {
    const reload = async () => {
      if (window.ethereum) {
        const accounts = await provider.send("eth_accounts", []);
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setAccounts(accounts[0]);
        }
      } else {
        console.log("MetaMask don't install.");
      }
    };
    reload();
  }, [provider, setAccounts]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: any) => {
        setAddress(accounts[0]);
        setAccounts(accounts[0]);
      });
    } else {
      console.log("MetaMask don't install.");
    }
  }, [setAccounts]);

  return (
    <nav className="flex items-center">
      <div className="flex items-center mt-[-8px]">
        <div className="text-20 font-bold mr-2 ">Word Mixer</div>
        {isDarkMode ? (
          <BsSunFill
            size={"24px"}
            color="#e9c46a"
            className="cursor-pointer"
            onClick={() => toggleDarkMode(!isDarkMode)}
          />
        ) : (
          <FaMoon
            size={"24px"}
            color="#e9c46a"
            className="cursor-pointer"
            onClick={() => toggleDarkMode(!isDarkMode)}
          />
        )}
      </div>
      <ul className="md:flex md:gap-10 ml-auto text-16 font-semibold">
        {openMenu && isMobile ? (
          <MdOutlineClose
            size={"24px"}
            className="cursor-pointer"
            onClick={handleMenu}
          />
        ) : !openMenu && isMobile ? (
          <HiOutlineMenu
            size={"24px"}
            className="cursor-pointer"
            onClick={handleMenu}
          />
        ) : (
          <>
            <li className="btn-hover ml-16 mt-[-10px]">
              {address ? (
                <div className="mt-[10px]">
                  Connected to {address.slice(0, 6)}...
                  {address.slice(address.length - 4)}
                </div>
              ) : (
                <button
                  className="connect-button"
                  onClick={() => {
                    connectWallet();
                  }}
                >
                  Connect Metamask
                </button>
              )}
            </li>
          </>
        )}
        {openMenu && (
          <div className="absolute right-8 bg-white p-8 text-center z-10 text-black text-13">
            <li className="cursor-pointer">Connect Metamask</li>
          </div>
        )}
      </ul>
    </nav>
  );
}
