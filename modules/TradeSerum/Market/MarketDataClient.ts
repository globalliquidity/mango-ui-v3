import currency from 'currency.js'
import { SimpleEventDispatcher } from 'strongly-typed-events'
import { MarketSide, OrderSide, OrderState } from '../Enums'
// import { MessageBusManager } from '../TradeTheGame/MessageBusManager';
import Logger from '@/modules/SceneGraph/Logger'
import { ExchangeOrder } from './ExchangeOrder'
import { OrderBookEntry } from './OrderBookEntry'

export class MarketDataUpdate {
  public bids: Array<OrderBookEntry> = new Array<OrderBookEntry>()
  public asks: Array<OrderBookEntry> = new Array<OrderBookEntry>()
  public trades: Array<ExchangeOrder> = new Array<ExchangeOrder>()
  public numUpTrades = 0
  public numDownTrades = 0

  public constructor(
    public midPrice: currency,
    public insideBidPrice: currency,
    public insideAskPrice: currency
  ) {}

  /*
    public get insideBidPrice():currency{
        if (this.bids.length > 0)
        {
            return this.bids[0].price;
        }
        return currency(0);
    }

    public get insideAskPrice():currency{
        if (this.asks.length > 0)
        {
            return this.asks[0].price;
        }
        return currency(0);
    }
    */

  public addOrderBookEntry(
    side: MarketSide,
    price: currency,
    quantity: number
  ) {
    if (side === MarketSide.Bid) {
      this.bids.push(new OrderBookEntry(MarketSide.Bid, price, quantity))
    } else {
      this.asks.push(new OrderBookEntry(MarketSide.Ask, price, quantity))
    }
  }

  public addTrade(price: currency, quantity: number) {
    this.trades.push(
      new ExchangeOrder(
        OrderSide.None,
        quantity,
        price,
        OrderState.Filled,
        0,
        0
      )
    )
  }

  public clone(): MarketDataUpdate {
    const newUpdate: MarketDataUpdate = new MarketDataUpdate(
      this.midPrice,
      this.insideBidPrice,
      this.insideAskPrice
    )

    for (let i = 0; i < this.bids.length; i++) {
      newUpdate.bids[i] = new OrderBookEntry(
        MarketSide.Bid,
        this.bids[i].price,
        this.bids[i].quantity
      )
    }

    for (let i = 0; i < this.asks.length; i++) {
      newUpdate.asks[i] = new OrderBookEntry(
        MarketSide.Ask,
        this.asks[i].price,
        this.asks[i].quantity
      )
    }

    for (let i = 0; i < this.trades.length; i++) {
      newUpdate.trades[i] = new ExchangeOrder(
        this.trades[i].side,
        this.trades[i].quantity,
        this.trades[i].price,
        this.trades[i].state,
        this.trades[i].time,
        this.trades[i].id
      )
    }

    return newUpdate
  }

  public clear() {
    this.bids = []
    this.asks = []
    this.trades = []
  }
}

export class MarketDataClient {
  private static _instance: MarketDataClient

  public static get Instance() {
    return this._instance || (this._instance = new this())
  }

  currentMarketDataUpdate: MarketDataUpdate | undefined
  checkHeartbeatTimeout?: NodeJS.Timeout
  checkHeartbeatInterval = 0
  gotHeartbeat = true

  protected _onGotMarketUpdate = new SimpleEventDispatcher<MarketDataUpdate>()

  public get onGotMarketUpdate() {
    return this._onGotMarketUpdate.asEvent()
  }

  private constructor() {}

  public init(updateInterval: number) {
    Logger.log(
      'MarketDataClient        |   Init        | Update Interval: ' +
        updateInterval
    )
    this.checkHeartbeatInterval = updateInterval
    // MessageBusManager.Instance.onMarketDataUpdate.subscribe(this.onMarketDataUpdate.bind(this));
    //this.checkHeartbeatTimeout = setInterval(this.checkHeartbeat.bind(this), this.checkHeartbeatInterval, this);
  }

  checkHeartbeat() {
    if (this.gotHeartbeat === true) {
      this.gotHeartbeat = false
    } else {
      this.currentMarketDataUpdate = new MarketDataUpdate(
        currency(0),
        currency(0),
        currency(0)
      )
    }
  }

  public getCurrentUpdate(): MarketDataUpdate | undefined {
    return this.currentMarketDataUpdate
  }

  public setCurrentUpdate(marketDataUpdate: MarketDataUpdate) {
    this.currentMarketDataUpdate = marketDataUpdate
  }

  public clearCurrentUpdate() {
    if (this.currentMarketDataUpdate) {
      this.currentMarketDataUpdate.clear()
      this.currentMarketDataUpdate = undefined
    }
  }

  onMarketDataUpdate(marketDataUpdate: MarketDataUpdate) {
    //Logger.log("MarketDataClient : Got Server Heartbeat");
    this.gotHeartbeat = true
    this.currentMarketDataUpdate = marketDataUpdate
    this._onGotMarketUpdate.dispatch(this.currentMarketDataUpdate)
  }
}
