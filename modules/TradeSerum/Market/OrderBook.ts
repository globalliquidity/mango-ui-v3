// import { IOrderBook, IOrderBookEntry, IMarketDataSamplerClient } from "../TradeSerumInterface";
import { MarketSide } from '../Enums'
import { OrderBookEntry } from './OrderBookEntry'
import { MarketDataSampler } from './MarketDataSampler'
import currency from 'currency.js'
import Logger from '@/modules/SceneGraph/Logger'
import { QuoteBucket } from './QuoteBucket'
import BTree from 'sorted-btree'
import { PriceDivisionManager } from '../PriceDivision/PriceDivisionManager'
import { BucketedOrderBook } from './BucketedOrderBook'

const ORDERBOOK_MAX_LEN = 500

export class OrderBook {
  bids: Array<OrderBookEntry> = new Array<OrderBookEntry>()
  asks: Array<OrderBookEntry> = new Array<OrderBookEntry>()

  public bucketedOrderBook: BucketedOrderBook = new BucketedOrderBook()

  constructor(public symbol: string, public sampler: MarketDataSampler) {
    //Logger.log("Constructing OrderBook");
  }

  public clear() {
    //Logger.log("OrderBook : Clearing OrderBook");
    this.bids = []
    this.asks = []
    //Logger.log("OrderBook : Cleared");
    //Logger.log("OrderBook : " + this.bids.length + " bids " + this.asks.length + " asks" );
  }

  sort(): void {
    this.bids = this.bids.sort(this.compareBids)
    this.asks = this.asks.sort(this.compareAsks)
  }

  getEntries(side: MarketSide): QuoteBucket[] {
    return this.bucketedOrderBook.getEntries(side)
  }

  getEntry(side: MarketSide, depth: number): QuoteBucket {
    return this.getEntries(side)[depth]
  }

  addEntry(side: MarketSide, price: currency, quantity: number): void {
    //Logger.log("Order Book Adding Entry " + price + "|" + quantity);

    //choose the correct array, based on the side of the market
    let array: OrderBookEntry[] =
      side === MarketSide.Bid ? this.bids : this.asks

    //see if we already have an entry at this price
    const i = array.findIndex(
      (p: OrderBookEntry) => p.price.value === price.value
    )

    //if we do have one and the incoming quantity is zero
    //we delete the element at that price.
    // if we have once and the quantity is more than zero
    // we update that entry's price.
    // If we don't have one at this price, we add a new entry
    if (i > -1 && quantity === 0) {
      //Logger.log("Order Book: removing entry at price : " + price);
      array = array.splice(i, 1)
    } else if (i > -1) {
      array[i].quantity = quantity
      array[i].index = array.length
    } else if (quantity > 0.0) {
      // add to book
      array.push(new OrderBookEntry(side, price, quantity, array.length))
    }
    // array.push(new OrderBookEntry(this.symbol,side,price,quantity));

    ///populate buckets

    const quantizedQuotePrice: currency = this.sampler.quantizePrice(price)
    const bucketMap: BTree<number, QuoteBucket> =
      side === MarketSide.Bid
        ? this.bucketedOrderBook.bidBuckets
        : this.bucketedOrderBook.askBuckets

    //let bucketIndex = bucketArray.findIndex((p: QuoteBucket) => p.insidePrice.value === price.value);

    // if (bucketMap.has(quantizedQuotePrice.value))
    //  {
    const bucket: QuoteBucket | undefined = bucketMap.get(
      quantizedQuotePrice.value
    )
    if (bucket) {
      bucket.addQuote(new OrderBookEntry(side, price, quantity, 0))
    }
    // }
    else {
      const priceRange: currency | undefined =
        PriceDivisionManager.Instance.currentPriceDivisionSetting
          ?.columnPriceRange

      if (priceRange) {
        const newBucket: QuoteBucket = new QuoteBucket(
          quantizedQuotePrice,
          currency(priceRange)
        )
        newBucket.addQuote(new OrderBookEntry(side, price, quantity, 0))
        bucketMap.set(quantizedQuotePrice.value, newBucket)
      }
    }
  }

  //
  // Calculate values derived from the state of the order book
  // We call refresh() once after we load the book and then
  // once each time we add a new entry to the boo from the feed.
  //
  refresh(): void {
    this.sort()

    this.bucketedOrderBook.insideBid = this.getEntry(MarketSide.Bid, 0)
    this.bucketedOrderBook.insideAsk = this.getEntry(MarketSide.Ask, 0)

    //TODO : Fix inside prices
    /*
      //this.quantize();

      

      */

    if (this.bids.length > ORDERBOOK_MAX_LEN) this.truncate(MarketSide.Bid)

    if (this.asks.length > ORDERBOOK_MAX_LEN) this.truncate(MarketSide.Ask)

    //Logger.log("OrderBook : Refreshing. Bids: " + this.getEntries(MarketSide.Bid).length + " Asks: " + this.getEntries(MarketSide.Ask).length);
    //Logger.log("OrderBook : Inside Bid/Ask : " + this.insideBid.price + "," + this.insideAsk.price);
  }

  truncate(side: MarketSide): void {
    //if (side === MarketSide.Bid)
    //Logger.log("OrderBook: Truncating Bid")
    //else
    //Logger.log("OrderBook: Truncating Ask")

    const newArray: OrderBookEntry[] = [
      ...(side === MarketSide.Bid ? this.bids : this.asks),
    ]
    let array: OrderBookEntry[] = []

    if (newArray.length > ORDERBOOK_MAX_LEN) {
      // for (let i=0; i< ORDERBOOK_MAX_LEN; i ++) {
      //     array.push(newArray[i]);
      // }
      newArray.map((arr) => {
        arr.index = arr.index - newArray.length + ORDERBOOK_MAX_LEN
        return arr
      })
    }

    array = newArray.filter((na) => na.index >= 0)

    if (side === MarketSide.Bid) {
      this.bids = array
    } else {
      this.asks = array
    }
  }

  public clone(): OrderBook {
    const newOrderBook: OrderBook = new OrderBook(this.symbol, this.sampler)

    for (let i = 0; i < this.bids.length; i++) {
      newOrderBook.addEntry(
        MarketSide.Bid,
        this.bids[i].price,
        this.bids[i].quantity
      )
    }

    for (let i = 0; i < this.asks.length; i++) {
      newOrderBook.addEntry(
        MarketSide.Ask,
        this.asks[i].price,
        this.asks[i].quantity
      )
    }
    return newOrderBook
  }

  rebuildBuckets() {
    this.bucketedOrderBook.askBuckets = new BTree<number, QuoteBucket>()

    this.asks.forEach((ask) => {
      const quantizedQuotePrice: currency = this.sampler.quantizePrice(
        ask.price
      )

      if (this.bucketedOrderBook.askBuckets.has(quantizedQuotePrice.value)) {
        const bucket: QuoteBucket | undefined =
          this.bucketedOrderBook.askBuckets.get(quantizedQuotePrice.value)
        if (bucket) {
          bucket.addQuote(
            new OrderBookEntry(MarketSide.Ask, ask.price, ask.quantity, 0)
          )
        }
      } else {
        const priceRange: currency | undefined =
          PriceDivisionManager.Instance.currentPriceDivisionSetting
            ?.columnPriceRange

        if (priceRange) {
          const newBucket: QuoteBucket = new QuoteBucket(
            quantizedQuotePrice,
            currency(priceRange)
          )
          newBucket.addQuote(
            new OrderBookEntry(MarketSide.Ask, ask.price, ask.quantity, 0)
          )
          this.bucketedOrderBook.askBuckets.set(
            quantizedQuotePrice.value,
            newBucket
          )
        }
      }
    })

    this.bucketedOrderBook.bidBuckets = new BTree<number, QuoteBucket>()

    this.bids.forEach((bid) => {
      const quantizedQuotePrice: currency = this.sampler.quantizePrice(
        bid.price
      )

      if (this.bucketedOrderBook.bidBuckets.has(quantizedQuotePrice.value)) {
        const bucket: QuoteBucket | undefined =
          this.bucketedOrderBook.bidBuckets.get(quantizedQuotePrice.value)
        if (bucket) {
          bucket.addQuote(
            new OrderBookEntry(MarketSide.Bid, bid.price, bid.quantity, 0)
          )
        }
      } else {
        const priceRange: currency | undefined =
          PriceDivisionManager.Instance.currentPriceDivisionSetting
            ?.columnPriceRange

        if (priceRange) {
          const newBucket: QuoteBucket = new QuoteBucket(
            quantizedQuotePrice,
            currency(priceRange)
          )
          newBucket.addQuote(
            new OrderBookEntry(MarketSide.Bid, bid.price, bid.quantity, 0)
          )
          this.bucketedOrderBook.bidBuckets.set(
            quantizedQuotePrice.value,
            newBucket
          )
        }
      }
    })

    //TODO :fix inside prices
    this.bucketedOrderBook.insideBid = this.getEntry(MarketSide.Bid, 0)
    this.bucketedOrderBook.insideAsk = this.getEntry(MarketSide.Ask, 0)

    if (this.bids.length > ORDERBOOK_MAX_LEN) this.truncate(MarketSide.Bid)

    if (this.asks.length > ORDERBOOK_MAX_LEN) this.truncate(MarketSide.Ask)
  }

  compareBids(a: OrderBookEntry, b: OrderBookEntry): number {
    return b.price.value - a.price.value
  }

  compareAsks(a: OrderBookEntry, b: OrderBookEntry): number {
    return a.price.value - b.price.value
  }

  public trim(side: MarketSide, toPrice: currency): void {
    if (side === MarketSide.Bid) {
      let array: OrderBookEntry[] = this.bids
      const i = array.findIndex((p: OrderBookEntry) => p.price <= toPrice)
      array = array.splice(0, i)
    } else {
      let array: OrderBookEntry[] = this.bids
      const i = array.findIndex((p: OrderBookEntry) => p.price >= toPrice)
      array = array.splice(0, i)
    }
  }

  logOrderBook(_levels: number): void {
    Logger.log('OrderBook : logOrderBook()')

    let level = 0
    //this.bids.splice(0,this.bids.length);
    Logger.log('BTC/USDT')
    Logger.log(this.bids.length + ' bids. ' + this.asks.length + ' asks.')
    for (level = 0; level < 5; level++) {
      Logger.log(
        this.bids[level].quantity +
          ' ' +
          this.bids[level].price +
          ' | ' +
          this.asks[level].price +
          ' ' +
          this.asks[level].quantity
      )
    }
  }

  calculateLen(priceQuantizeDivision: number): number {
    const n: number = priceQuantizeDivision
    if (n % 1 > 0) {
      const nS = n.toString().split('.')
      return nS[1].length
    }
    return 0
  }

  calDividedResult(value: number, len: number): string {
    let s = value.toString()
    const ss = s.split('.')
    if (len === 0) {
      // s = s;
      return s
    } else if (ss[0].length > len) {
      s =
        ss[0].substring(0, ss[0].length - 1 - len) +
        '.' +
        ss[0].substring(ss[0].length - len, ss[0].length - 1) +
        (ss[1] != null ? ss[1] : '')
      return s
    } else if (ss[0].length === len) {
      s = '0.' + s
      return s
    } else {
      let temp = '0.'
      for (let i = 0; i < len - ss[0].length; i++) {
        temp += '0'
      }
      s = temp + s
      return s
    }
  }

  public serialize(): string {
    return this.bucketedOrderBook.serialize()
  }
}
