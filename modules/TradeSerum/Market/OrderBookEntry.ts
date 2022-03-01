import { IOrderBookEntry } from '../TradeSerumInterface'
import { MarketSide } from '../Enums'
import currency from 'currency.js'

export class OrderBookEntry implements IOrderBookEntry {
  constructor(
    public side: MarketSide,
    public price: currency,
    public quantity: number,
    public index: number = 0
  ) {}
}
