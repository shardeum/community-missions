import { Injectable } from "@nestjs/common";
import { ethers, Signer } from "ethers";
require("dotenv").config();

interface IQuery {
  success: boolean;
  message: string;
}
@Injectable()
export class AppService {
  // init
  provider: ethers.providers.Provider;
  signer: Signer;
  timeout: { [address: string]: number } = { '0x00': 1673849821252 };

  constructor() {
    // 2. Define network configurations
    const providerRPC = {
      shardeum: {
        name: process.env.RPC_NAME,
        rpc: process.env.RPC_URL, // Insert your RPC URL here
        chainId: parseInt(process.env.RPC_CHAIN_ID, 16), // 0x504 in hex,
      },
    };

    // 3. Create ethers provider
    this.provider = new ethers.providers.StaticJsonRpcProvider(
      providerRPC.shardeum.rpc,
      {
        chainId: providerRPC.shardeum.chainId,
        name: providerRPC.shardeum.name,
      }
    );

    const pkey = process.env.PRIVATE_KEY;
    const wallet = new ethers.Wallet(pkey, this.provider);
    this.signer = wallet.connect(this.provider);
  }

  async sendSHM(_address: string): Promise<IQuery> {
    if (!_address) {

      return { success: false, message: "Invalid address1" };
    }

    if (!ethers.utils.isAddress(_address)) {
      return { success: false, message: "Invalid address" };
    }

    if (this.timeout[_address] && this.timeout[_address] > Date.now().valueOf()) {
      return { success: false, message: "Faucet is on cooldown" };
    }

    let balance = await this.signer.getBalance().catch((err) => {
      return { success: false, message: "RPC Error" };
      throw new Error(err);
    });

    // Check some least balance + some gas
    if (balance < ethers.utils.parseEther("13")) {
      return { success: false, message: "Faucet is empty :(" };
      throw new Error("Faucet is empty :(");
    }
    let v;
    let res = await this.signer
      .sendTransaction({
        to: _address,
        value: ethers.utils.parseEther("11"), //sending 11 SHM
      })
      .catch((err) => {
        v = { success: false, message: 'RPC Error' };
        throw new Error(err);
      });
      try {
        let hash = res.hash;
        let time_ = (Date.now() as number) + 60*60*12; //12 hrs
        this.timeout[_address] = time_;
        return { success: true, message: hash };
      } catch(err) { return {success: false, message: "Error"} };
  }
}
