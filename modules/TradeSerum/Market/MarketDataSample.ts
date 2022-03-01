import currency from 'currency.js'
import { MarketSide } from '../Enums'
import { ExchangeOrder } from './ExchangeOrder'
import { MarketDataSampler } from './MarketDataSampler'
import { OrderBook } from './OrderBook'
import { OrderBookEntry } from './OrderBookEntry'
import { TradeHistory } from './TradeHistory'
// import { QuoteBucket } from './QuoteBucket';

export class MarketDataSample {
  //implements IMarketDataSample, IExchangeTraded, IMarketDataSamplerClient
  public spread: currency
  public midPrice: currency
  public insideBidPrice: currency = currency(0)
  public insideAskPrice: currency = currency(0)
  public orderImbalance = 0
  public offset = 0
  public maxQuantityInSample = 0

  public orders: OrderBook
  public trades: TradeHistory

  public isLoaded = false

  constructor(
    public symbol: string,
    public sampler: MarketDataSampler,
    public maxQuantity: number
  ) {
    this.midPrice = currency(0)
    this.spread = currency(0)

    this.orders = new OrderBook(symbol, sampler)
    this.trades = new TradeHistory(symbol, sampler)
  }

  public addOrderBookEntry(
    side: MarketSide,
    price: currency,
    quantity: number
  ) {
    this.orders.addEntry(side, price, quantity)
  }

  private getSampleMaxQuantity(): number {
    const bidQuantities = this.orders.bids.map(
      (bid: OrderBookEntry) => bid.quantity
    )
    const askQuantities = this.orders.asks.map(
      (ask: OrderBookEntry) => ask.quantity
    )
    return Math.max(...bidQuantities, ...askQuantities)
  }

  public refresh() {
    //Logger.log("MarketDataSample : Refreshing Order Book");
    this.orders.refresh()

    if (
      this.orders.bucketedOrderBook.insideAsk &&
      this.orders.bucketedOrderBook.insideBid
    ) {
      this.spread = this.sampler.quantizePrice(
        this.orders.bucketedOrderBook.insideAsk.insidePrice.subtract(
          this.orders.bucketedOrderBook.insideBid.insidePrice
        )
      )
      //this.midPrice = this.orders.bucketedOrderBook.insideBid.insidePrice.add(this.orders.bucketedOrderBook.insideAsk.insidePrice).divide(2);
    } else {
      this.spread = currency(0)
      //this.midPrice = currency(0);
    }

    this.maxQuantityInSample = this.getSampleMaxQuantity()
    this.isLoaded = true
  }

  // Rebuild MarketDataSample with current division
  public buildNewSample() {
    this.orders.rebuildBuckets()
    if (
      this.orders.bucketedOrderBook.insideAsk &&
      this.orders.bucketedOrderBook.insideBid
    ) {
      this.spread = this.sampler.quantizePrice(
        this.orders.bucketedOrderBook.insideAsk.insidePrice.subtract(
          this.orders.bucketedOrderBook.insideBid.insidePrice
        )
      )
    }
    //this.midPrice = this.orders.bucketedOrderBook.insideBid.insidePrice.add(this.orders.bucketedOrderBook.insideAsk.insidePrice).divide(2);
  }

  calculateRatio(a, b) {
    return b === 0 ? a : this.calculateRatio(b, a % b)
  }

  public addTrade(trade: ExchangeOrder) {
    this.trades.addTrade(trade)
  }

  public clear() {
    this.orders.clear()
    this.trades.trades = []
  }

  public clone(): MarketDataSample {
    const clonedOrderBook: OrderBook = this.orders.clone()
    const clonedMarketDataSample: MarketDataSample = new MarketDataSample(
      this.symbol,
      this.sampler,
      this.maxQuantity
    )
    clonedMarketDataSample.orders = clonedOrderBook
    clonedMarketDataSample.trades = new TradeHistory(this.symbol, this.sampler)
    clonedMarketDataSample.spread = this.spread
    clonedMarketDataSample.midPrice = this.midPrice
    clonedMarketDataSample.insideBidPrice = this.insideBidPrice
    clonedMarketDataSample.insideAskPrice = this.insideAskPrice
    clonedMarketDataSample.isLoaded = true
    //clonedMarketDataSample.refresh();

    return clonedMarketDataSample
  }

  public getSerializedOrders(): string {
    return this.orders.serialize()
  }

  public getSerializedTrades(): string {
    return this.trades.serialize()
  }
}
