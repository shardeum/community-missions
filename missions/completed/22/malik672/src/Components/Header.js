import React, { useEffect } from "react";
import { Link, NavLink, Switch, Route, HashRouter as Router } from "react-router-dom";
import Pools from "./Pools.js";
import Swap from "./Swap.js";
import AddLiquidity from "./Liquidity.js";
import AddLiquiditys from "./AddLiquidity.js";
import RemoveLIquidity from "./RemoveLIquidity.js";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header = () => {
  useEffect(() => {
    let oldHref = document.location.href;
    window.onload = () => new MutationObserver(mutations => mutations.forEach(() => oldHref !== document.location.href && (oldHref = document.location.href,  window.location.reload()))).observe(document.querySelector("body"), { childList: true, subtree: true })
  }, []);

  return (
    <Router>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <NavLink
                to="/Swap"
                exact
                activeClassName="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Swap
              </NavLink>
              <NavLink
                to="/pools"
                activeClassName="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Pools
              </NavLink>
              <NavLink
                to="/add"
                activeClassName="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Mint Position
              </NavLink>
              <NavLink
                to="/adds"
                activeClassName="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Add Liquidity
              </NavLink>
              <NavLink
                to="/remove"
                activeClassName="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Remove Liquidity
              </NavLink>
            </div>
            <ConnectButton />
          </div>
        </div>
      </div>
      <Switch>
        <Route exact path="/Swap">
          <Swap/>
        </Route>
        <Route path="/pools">
          <Pools />
        </Route>
        <Route path="/add">
          <AddLiquidity />
        </Route>
        <Route path="/adds">
          <AddLiquiditys />
        </Route>
        <Route path="/remove">
          <RemoveLIquidity />
        </Route>
      </Switch>
    </Router>
  );
};

export default Header;
