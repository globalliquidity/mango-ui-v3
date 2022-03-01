import { IExchangeAsset } from '../TradeSerumInterface'

export class ExchangeAsset implements IExchangeAsset {
  constructor(
    public id: number,
    public name: string,
    public symbol: string,
    public tradingSymbol: string
  ) {}
}
