import { Trade } from './Trade'
import currency from 'currency.js'
import { TradeStatus } from '../Enums'

export class TradeBlotter {
  trades: Array<Trade> = new Array<Trade>()
  closedPnL: currency = currency(0)

  constructor(public tradingPair: string) {}

  addTrade(trade: Trade) {
    console.log('TradeBlotter : Adding Trade')
    this.trades.push(trade)
    this.calculateClosedPnL()
  }

  calculateClosedPnL() {
    this.closedPnL = currency(0)
    this.trades.forEach((trade) => {
      if (trade.closedPnL) this.closedPnL.add(trade.closedPnL.value)
    })
  }

  getCurrentTrade(): Trade | undefined {
    if (this.trades.length > 0) {
      const currentTrade: Trade = this.trades[this.trades.length - 1]

      if (currentTrade.status === TradeStatus.Open) return currentTrade
    }

    return undefined
  }
}
