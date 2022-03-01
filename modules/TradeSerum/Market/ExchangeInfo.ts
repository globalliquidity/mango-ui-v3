import { IExchangeInfo } from '../TradeSerumInterface'

export class ExchangeInfo implements IExchangeInfo {
  constructor(
    public exchange: string,
    public bestCaseFee: number,
    public worstCaseFee: number,
    public icon: string
  ) {}
}
