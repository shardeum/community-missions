import { MULTICALL_ADDRESS } from "./../config/addresses";
import { Interface } from "@ethersproject/abi";
import multiAbi from "../config/abis/Multicall.json";
import Web3 from "web3";

export const genericMulticall = async <T = any>(
  abi: any[],
  calls: Call[]
): Promise<T> => {
  const web3 = new Web3("https://liberty20.shardeum.org");
  const multicontract = new web3.eth.Contract(multiAbi, MULTICALL_ADDRESS);

  const itf = new Interface(abi);

  const calldata = calls.map((call) => {
    return {
      target: call.address.toLowerCase(),
      callData: itf.encodeFunctionData(call.name, call.params),
    };
  });

  const { returnData } = await multicontract.methods.aggregate(calldata).call();
  console.log({ returnData });

  const res = returnData.map((call, i) => {
    return itf.decodeFunctionResult(calls[i].name, call);
  });

  return res;
};
