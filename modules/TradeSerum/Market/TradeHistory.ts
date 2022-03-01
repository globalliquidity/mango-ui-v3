import { ITradeHistory, IExchangeTraded } from '../TradeSerumInterface'
import { ExchangeOrder } from './ExchangeOrder'
import { MarketDataSampler } from './MarketDataSampler'
// import Logger from "@/modules/SceneGraph/Logger";

// export class TradeHistory implements ITradeHistory, IExchangeTraded
export class TradeHistory implements ITradeHistory, IExchangeTraded {
  public trades: Array<ExchangeOrder> = new Array<ExchangeOrder>()

  get tradeCount(): number {
    return this.trades.length
  }

  constructor(public symbol: string, public sampler: MarketDataSampler) {}

  addTrade(trade: ExchangeOrder) {
    //see if we already have an entry at this price
    const i = this.trades.findIndex(
      (p: ExchangeOrder) => p.price.value === trade.price.value
    )

    if (i > -1) {
      ///Logger.log("TradeHistory : Adding quantity to trade: " + trade.quantity );
      this.trades[i].quantity += trade.quantity
    } else {
      this.trades.push(trade)
    }
  }

  clone(): TradeHistory {
    const clonedTradeHistory: TradeHistory = new TradeHistory(
      this.symbol,
      this.sampler
    )
    clonedTradeHistory.trades = this.trades
    return clonedTradeHistory
  }

  public serialize(): string {
    if (this.trades.length > 0) {
      let tradesAsString = ''

      for (let i = 0; i < this.trades.length; i++) {
        const trade: ExchangeOrder = this.trades[i]

        if (trade) {
          tradesAsString += trade.price.value.toFixed(2)
          tradesAsString += ','
          tradesAsString += trade.quantity.toFixed(2)
        }

        if (i < this.trades.length - 1) tradesAsString += '/'
      }

      return tradesAsString
    }
    return ''
  }
}
