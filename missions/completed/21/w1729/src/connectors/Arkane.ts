import { ConnectorUpdate } from '@web3-react/types';
import { AbstractConnector } from '@web3-react/abstract-connector';
import invariant from 'tiny-invariant';
import { ChainId } from '@uniswap/sdk';
import { Arkane } from '@arkane-network/web3-arkane-provider';
import { ArkaneConnect, SecretType } from '@arkane-network/arkane-connect';
import Web3 from 'web3';

type ArkaneSupportedChains = Extract<ChainId, ChainId.MATIC | ChainId.MUMBAI>;

const CHAIN_ID_NETWORK_ARGUMENT: {
  readonly [chainId in ArkaneSupportedChains]: string | undefined;
} = {
  [ChainId.MUMBAI]: 'mumbai',
  [ChainId.MATIC]: 'matic',
};

interface ArkaneConnectorArguments {
  clientID: string;
  chainId: number;
}

export class ArkaneConnector extends AbstractConnector {
  private readonly clientID: string;
  private readonly chainId: number;

  public arkane: any;

  constructor({ clientID, chainId }: ArkaneConnectorArguments) {
    invariant(
      Object.keys(CHAIN_ID_NETWORK_ARGUMENT).includes(chainId.toString()),
      `Unsupported chainId ${chainId}`,
    );
    super({ supportedChainIds: [chainId] });

    this.clientID = clientID;
    this.chainId = chainId;
  }

  public async activate(): Promise<ConnectorUpdate> {
    const options = {
      clientId: this.clientID,
      secretType: SecretType.MATIC,
      signMethod: 'POPUP',
      skipAuthentication: false,
    };
    const arkaneProvider = await Arkane.createArkaneProviderEngine(options);
    if (!this.arkane) {
      this.arkane = new ArkaneConnect(this.clientID);
    }

    const web3 = new Web3(arkaneProvider as any);
    const accounts = await web3.eth.getAccounts();

    return {
      provider: arkaneProvider,
      chainId: this.chainId,
      account: accounts[0],
    };
  }

  public async getProvider(): Promise<any> {
    const options = {
      clientId: this.clientID,
      secretType: SecretType.MATIC,
      signMethod: 'POPUP',
      skipAuthentication: false,
    };
    return Arkane.createArkaneProviderEngine(options);
  }

  public async getChainId(): Promise<number | string> {
    return this.chainId;
  }

  public async getAccount(): Promise<null | string> {
    return this.arkane.flows
      .getAccount(SecretType.MATIC)
      .then((accounts: any): string => accounts.wallets[0].address);
  }

  public deactivate(): void {
    console.log('deactivate');
  }

  public async close(): Promise<void> {
    await this.arkane.logout();
    this.emitDeactivate();
  }
}
