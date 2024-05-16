export type Address = string;

export interface IMetadata {
  name: string;
  symbol: string;
  mintAddress: Address;
};

export interface IToken {
  price: number;
  totalSupply: number;
  decimals: number;
  metaData: IMetadata;
};


export const EMPTY_TOKEN: IToken = {
  price: 0,
  totalSupply: 0,
  decimals: 0,
  metaData: {
    mintAddress: "N/A",
    name: "N/A",
    symbol: "N/A",
  },
};

export interface IPair {
  address: Address;

  baseToken: Address;
  quoteToken: Address;

  baseVault: Address;
  quoteVault: Address;

  baseAmount: number;
  quoteAmount: number;

  birthTime: number;
  marketId: Address;
  buys?: number;
  sells?: number;
}

export enum TradeType {
  Buy = 0,
  Sell
}

export interface IBlock {
  block: number;
  time: number;
  hash: string;
  slot: number;
  height: number;
  parentHash: number;
  parentSlot: number;
}

export interface ITrade {
  amount: number;
  amountInUSD: number;
  amountQuote: number;
  time: number;
  trader: Address;
  fee: number;
  type: TradeType;
  signature: string;
}



//#region Frontend Types & Interfaces

export interface IRowType {
  key: Address;
  token: string;
  price: number;
  age: string;
  buys: number;
  sells: number;
  volume: number;
  makers: number;
  liquidity: number;
  mcap: number;
}



//#endregion