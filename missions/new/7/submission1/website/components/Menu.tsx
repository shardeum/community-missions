import React, { useEffect, useState } from "react";
import { getBase64FromUri } from "../utils";
import useWeb3 from "../hooks/useWeb3";
import ERC721 from "../config/abis/ERC721.json";
import {
  NFT_CONTRACTS_LIST_BY_TYPE,
  NFT_CONTRACT_ADDRESS_T1,
} from "../config/addresses";
import { useWeb3React } from "@web3-react/core";
const Menu = ({
  setLineColor,
  setLineWidth,
  setLineOpacity,
  typeIndex,
  canvasRef,
}) => {
  const [rgbState, setRgbState] = useState({
    r: 255,
    g: 255,
    b: 255,
  });
  const { account, activate, chainId, deactivate } = useWeb3React();
  const { web3 } = useWeb3();

  useEffect(() => {
    setRgbState({
      r: 255,
      g: 255,
      b: 255,
    });
    setLineColor(`rgb(255,255,255)`);
  }, [typeIndex]);
  // const _base64ToArrayBuffer = (base64) => {
  //   var binary_string = window?.atob(base64);
  //   var len = binary_string.length;
  //   var bytes = new Uint8Array(len);
  //   for (var i = 0; i < len; i++) {
  //     bytes[i] = binary_string.charCodeAt(i);
  //   }
  //   return bytes.buffer;
  // };
  const handleMint = async () => {
    const nftType1Contract = new web3.eth.Contract(
      ERC721,
      NFT_CONTRACTS_LIST_BY_TYPE[typeIndex]
    );

    const dataURL = canvasRef.toDataURL("image/svg+xml");
    const base64Data = getBase64FromUri(dataURL);
    // const bytesArray = _base64ToArrayBuffer(base64Data);
    const myBuffer = Buffer.from(base64Data, "base64");

    console.log("====================================");
    console.log({
      canvasRef,
      dataURL,
      base64Data,
      myBuffer: JSON.stringify(myBuffer),
    });
    console.log("====================================");

    try {
      if (base64Data) {
        const txn = await nftType1Contract.methods
          .mint(account, base64Data)
          .send({
            from: account,
          });
        console.log("====================================");
        console.log({ txn });
        console.log("====================================");
        if (txn?.status) {
          alert("Transaction Success!!");
        } else {
          alert("Transaction Failed!!");
        }
      }
    } catch (error) {
      alert("Transaction Failed!!");
      console.log({ error });
    }
  };
  if (typeIndex == 0) {
    return (
      <div className="grid items-center w-full grid-cols-5 gap-5 mb-5 align-middle">
        <div
          className="w-full h-full rounded-lg"
          style={{
            backgroundColor: `rgb(${rgbState.r},${rgbState.g},${rgbState.b})`,
          }}
        ></div>

        <button className="btn btn-primary" onClick={handleMint}>
          Mint
        </button>
      </div>
    );
  }
  if (typeIndex == 1) {
    return (
      <div className="grid items-center w-full grid-cols-5 gap-5 mb-5 align-middle">
        <div
          className="w-full h-full rounded-lg"
          style={{
            backgroundColor: `rgb(${rgbState.r},${rgbState.g},${rgbState.b})`,
          }}
        ></div>
        <button
          className="bg-black btn hover:bg-black"
          onClick={() => {
            setRgbState({
              r: 0,
              g: 0,
              b: 0,
            });
            setLineColor(`rgb(0,0,0)`);
          }}
        >
          Black
        </button>
        <button
          className="bg-gray-500 btn hover:bg-gray-500"
          onClick={() => {
            setRgbState({
              r: 128,
              g: 128,
              b: 128,
            });
            setLineColor(`rgb(128,128,128)`);
          }}
        >
          Gray
        </button>
        <button
          className="text-black bg-white btn hover:bg-white"
          onClick={() => {
            setRgbState({
              r: 255,
              g: 255,
              b: 255,
            });
            setLineColor(`rgb(255,255,255)`);
          }}
        >
          White
        </button>

        <button className="btn btn-primary" onClick={handleMint}>
          Mint
        </button>
      </div>
    );
  }

  return (
    <div className="grid items-center w-full grid-cols-5 gap-5 mb-5 align-middle">
      <div
        className="w-full h-full rounded-lg"
        style={{
          backgroundColor: `rgb(${rgbState.r},${rgbState.g},${rgbState.b})`,
        }}
      ></div>

      <div className="flex items-center gap-5 p-5 rounded-lg bg-gray-100/10">
        <label>Red </label>
        <input
          type="range"
          min="0"
          max="255"
          value={rgbState.r}
          onChange={(e) => {
            setRgbState({
              ...rgbState,
              r: parseInt(e.target.value),
            });
            setLineColor(
              `rgb(${parseInt(e.target.value)},${rgbState.g},${rgbState.b})`
            );
          }}
        />
      </div>
      <div className="flex items-center gap-5 p-5 rounded-lg bg-gray-100/10">
        <label>Green </label>
        <input
          type="range"
          min="0"
          max="255"
          value={rgbState.g}
          onChange={(e) => {
            setRgbState({
              ...rgbState,
              g: parseInt(e.target.value),
            });
            setLineColor(
              `rgb(${rgbState.r},${parseInt(e.target.value)},${rgbState.b})`
            );
          }}
        />
      </div>
      <div className="flex items-center gap-5 p-5 rounded-lg bg-gray-100/10">
        <label>Blue </label>
        <input
          type="range"
          min="0"
          max="255"
          value={rgbState.b}
          onChange={(e) => {
            setRgbState({
              ...rgbState,
              b: parseInt(e.target.value),
            });
            setLineColor(
              `rgb(${rgbState.r},${rgbState.g},${parseInt(e.target.value)})`
            );
          }}
        />
      </div>

      <button className="btn btn-primary" onClick={handleMint}>
        Mint
      </button>
    </div>
  );
};

export default Menu;
