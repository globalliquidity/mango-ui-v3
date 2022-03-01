import { ExchangeOrder } from './ExchangeOrder'
import { OrderSide, TradeStatus, TradeDirection } from '../Enums'
import currency from 'currency.js'
import { MarketDataUpdate, MarketDataClient } from './MarketDataClient'
import Logger from '@/modules/SceneGraph/Logger'
import { SignalDispatcher } from 'strongly-typed-events'

export class Trade {
  status: TradeStatus = TradeStatus.Created
  direction: TradeDirection
  quantity?: number
  closingOrder?: ExchangeOrder

  costBasis: currency
  markedToMarketValue?: currency
  openPnL: currency
  closedPnL?: currency

  onGotMarketUpdateUnsubscribeFunction: any

  protected _onClosedPnlChanged = new SignalDispatcher()

  public get onClosedPnLChanged() {
    return this._onClosedPnlChanged.asEvent()
  }

  //leverage : number = 1;

  constructor(
    public openingOrder: ExchangeOrder,
    public leverage: number = 100
  ) {
    if (openingOrder.side === OrderSide.Buy) {
      this.direction = TradeDirection.Long
      Logger.log(
        'Trade   |   Creating new Trade  |   LONG @ ' + openingOrder.price
      )
    } else {
      this.direction = TradeDirection.Short
      Logger.log(
        'Trade   |   Creating new Trade  |   SHORT @ ' + openingOrder.price
      )
    }

    this.costBasis = currency(openingOrder.price.value * openingOrder.quantity)
    this.openPnL = currency(0)
    this.onGotMarketUpdateUnsubscribeFunction =
      MarketDataClient.Instance.onGotMarketUpdate.subscribe(
        this.calculateOpenPnl.bind(this)
      )
  }

  public updateOpeningPrice(price: currency) {
    Logger.log(
      'Trade   |  Updating opening price from: ' +
        this.openingOrder.price.value.toFixed(2) +
        ' to: ' +
        price.value.toFixed(2)
    )
    this.openingOrder.price = price
    this.costBasis = currency(
      this.openingOrder.price.value * this.openingOrder.quantity
    )
  }

  public updateClosingPrice(price: currency) {
    if (this.status === TradeStatus.Closed) {
      if (this.closingOrder) {
        const previousClosingPrice: currency = this.closingOrder.price
        this.closingOrder.price = price
        this.calculateClosedPnl()
        this._onClosedPnlChanged.dispatch()

        Logger.log(
          'Trade   |  Updated closing price from: ' +
            previousClosingPrice.value.toFixed(2) +
            ' to: ' +
            price.value.toFixed(2) +
            '     | Actual PnL: ' +
            this.closedPnL?.value.toFixed(2)
        )
      }
    }
  }

  close(closingOrder: ExchangeOrder) {
    this.closingOrder = closingOrder
    this.calculateClosedPnl()

    if (this.direction === TradeDirection.Long) {
      Logger.log(
        'Trade   |   Closing Long Trade  |   SELL @ ' +
          closingOrder.price +
          '     | PnL: ' +
          this.closedPnL?.value.toFixed(2)
      )
    } else {
      Logger.log(
        'Trade   |   Closing Short Trade  |   BUY @ ' +
          closingOrder.price +
          '     | PnL: ' +
          this.closedPnL?.value.toFixed(2)
      )
    }

    this.status = TradeStatus.Closed
    this.onGotMarketUpdateUnsubscribeFunction()
    this.onGotMarketUpdateUnsubscribeFunction = null
    this._onClosedPnlChanged.dispatch()
  }

  cancel() {
    Logger.log('Trade      |   Cancelling Trade')
    this.closedPnL = currency(0)
    this.status = TradeStatus.Cancelled
    this.onGotMarketUpdateUnsubscribeFunction()
    this.onGotMarketUpdateUnsubscribeFunction = null
  }

  /**
   *  Calculate market value of open trade, by comparing to most recent inside price.
   *  Calculate OpenPnl as ((markedToMarketValue - costBasis) * quantity)
   *  Do this every time we get new data (new row)
   *
   * @param {DepthFinderRow} currentRow
   * @memberof Trade
   */
  public calculateOpenPnl(marketDataUpdate: MarketDataUpdate) {
    let currentMarketValueOfPosition: currency

    if (this.direction === TradeDirection.Long)
      currentMarketValueOfPosition = currency(
        marketDataUpdate.insideBidPrice.value * this.openingOrder.quantity
      )
    else
      currentMarketValueOfPosition = currency(
        marketDataUpdate.insideAskPrice.value * this.openingOrder.quantity
      )

    this.markedToMarketValue = currency(currentMarketValueOfPosition)
    this.openPnL = this.markedToMarketValue
      .subtract(this.costBasis)
      .multiply(this.leverage)

    if (this.direction === TradeDirection.Short)
      this.openPnL = this.openPnL.multiply(-1)
  }

  /**
   *
   * Calculate clsoed PnL when trade is closed. User the same approach as when calculating OpenPnL
   * @memberof Trade
   */
  calculateClosedPnl() {
    if (this.closingOrder) {
      this.markedToMarketValue = currency(
        this.closingOrder.price.value * this.closingOrder.quantity
      )
      this.closedPnL = this.markedToMarketValue
        .subtract(this.costBasis)
        .multiply(this.leverage)
    }

    if (this.direction === TradeDirection.Short)
      this.closedPnL = this.closedPnL?.multiply(-1)
  }
}
