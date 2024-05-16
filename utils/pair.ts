import { IPair, Address, IRowType, IToken, TradeType } from '@/types';

export class Pair implements IPair {
  public address: Address;
  public baseToken: Address;
  public quoteToken: Address;
  public baseVault: Address;
  public quoteVault: Address;
  public marketId: Address;
  public baseAmount: number = 0;
  public quoteAmount: number = 0;
  public birthTime: number;
  public buys: number;
  public sells: number;

  public baseTokenInfo: IToken;
  public quoteTokenInfo: IToken;

  constructor(pair: IPair, baseInfo: IToken, quoteInfo: IToken) {
    Object.keys(pair).forEach(key => {
      this[key] = pair[key];
    })
    if (baseInfo)
      this.baseTokenInfo = { ...baseInfo };
    if (quoteInfo)
      this.quoteTokenInfo = { ...quoteInfo };
  }

  static renderAddress(address: Address) {
    let length = address.length;
    return `${address.slice(0, 4)}...${address.slice(length - 3)}`;
  }

  static renderTime(time: number) {
    let diff = new Date().getTime() - time * 1000;
    diff = diff < 0 ? 0 : diff;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return days + 'd';
    } else if (hours > 0) {
      return hours + 'h';
    } else if (minutes > 0) {
      return minutes + 'm';
    } else {
      return seconds + 's';
    }
  }

  newTrade(type: TradeType): void {
    if (type == TradeType.Buy) this.buys++;
    if (type == TradeType.Sell) this.sells++;
  }

  setBaseAmount(amount: string | number | undefined): this {
    amount = Number(amount);
    if (amount === this.baseAmount || amount === 0 || amount === undefined) return this;
    this.baseAmount = amount;
    return this;
  }
  setQuoteAmount(amount: string | number | undefined): this {
    amount = Number(amount);
    if (amount === this.quoteAmount || amount === 0 || amount === undefined) return this;
    this.quoteAmount = amount;
    return this;
  }

  static showMoney(value: number): string | string[] {
    if (value === 0 || Number.isNaN(value)) return 'N/A';
    if (value < 1) {
      const numStr = Number(value).toFixed(20);
      let strMatches: RegExpMatchArray = numStr.match(/0.(0+)?([0-9]+)/);
      let zeroCount: number = 0;
      if (strMatches[1] !== undefined) zeroCount = strMatches[1].length;
      let fractionalDigits: string = strMatches[2].slice(0, Math.min(strMatches[2].length, 4));

      let ret: string | string[] = [];

      if (zeroCount >= 5) {
        ret = ['$0.0', zeroCount.toString(), fractionalDigits];
      } else {
        ret = ['$0.', '0'.repeat(zeroCount), fractionalDigits].join('');
      }

      return ret;

    } else {
      const USDollar = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 2,
      });

      return USDollar.format(value);
    }
  }

  static showTokenName(token: IToken): string {
    if (token.metaData.symbol === "")
      return Pair.renderAddress(token.metaData.mintAddress);
    return token.metaData.symbol;
  }

  row(): IRowType {
    //    let baseTokenData: IToken = tokenInfos.get(this.baseToken);
    //    let quoteTokenData: IToken = tokenInfos.get(this.quoteToken);

    let trow: IRowType = {
      age: Pair.renderTime(this.birthTime),
      buys: this.buys,
      mcap: 0,
      key: this.address ?? "N/A",
      liquidity: 0,
      makers: 0,
      price: this.baseTokenInfo?.price ?? 0,
      sells: this.sells,
      token: "N/A",
      volume: 0,
    };

    trow.token = `${Pair.showTokenName(this.baseTokenInfo)} / ${Pair.showTokenName(this.quoteTokenInfo)}`;
    trow.mcap = (this.baseTokenInfo?.price ?? 0) * (this.baseTokenInfo?.totalSupply ?? 0) / (10 ** this.baseTokenInfo?.decimals ?? 0);

    trow.liquidity = (this.baseTokenInfo?.price ?? 0) * (this.baseAmount) / (10 ** (this.baseTokenInfo?.decimals ?? 0))
      + (this.quoteTokenInfo?.price ?? 0) * (this.quoteAmount) / (10 ** (this.quoteTokenInfo?.decimals ?? 0));

    // console.log(baseTokenData, quoteTokenData);

    return trow;
  }
}