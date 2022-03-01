import { ITradingPair } from '../TradeSerumInterface'

export class TradingPair implements ITradingPair {
  constructor(
    public baseTradingSymbol: string,
    public quoteTradingSymbol: string
  ) {}
}
