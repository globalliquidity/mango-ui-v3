import currency from 'currency.js'

// const ccxt = require ('ccxt');
// import ccxt, { OrderBook } from 'ccxt';
import { MarketDataSource } from './MarketDataSource'
import { MarketSide, OrderSide, OrderState } from '../Enums'
import { ExchangeOrder } from './ExchangeOrder'
import Logger from '@/modules/SceneGraph/Logger'
// import { MarketDataSampler } from "./MarketDataSampler";
// import { MarketDataSample } from "./MarketDataSample";
// import { CandleStick } from "./CandleStick";
import { EventBus } from '@/modules/SceneGraph/EventBus'

import {
  SERUM_ORDERBOOK_UPDATE,
  SERUM_TRADES_UPDATE,
} from '@/stores/actionTypes'

import { PriceDivisionManager } from '../PriceDivision/PriceDivisionManager'

export class SerumMarketDataSource extends MarketDataSource {
  private lastTradeId = 0
  private tradeWebSocket?: WebSocket

  private isFirstSample = true

  private precision = 0

  constructor(public symbol: string) {
    super(symbol)
    this.useWebSocket = true
  }

  async openOrderBookFeed() {
    Logger.log('Serum Market Data Source : Opening Feed Socket')

    if (this.sampler !== undefined) {
      EventBus.Instance.eventDataHandler.subscribe((p, r) => {
        if (r.type === SERUM_ORDERBOOK_UPDATE) {
          // SERUM_ORDERBOOK_UPDATE

          if (r.data.bids && r.data.asks) {
            const bidQuantities: Array<number> = r.data.bids.map((bid: any) =>
              Number(bid[1])
            )
            const askQuantities: Array<number> = r.data.asks.map((ask: any) =>
              Number(ask[1])
            )
            const quantities: Array<number> = [
              ...askQuantities,
              ...bidQuantities,
            ]
            const maxQuantity = Math.max(...quantities)
            const minQuantity = Math.min(...quantities)

            let quantitySum = 0

            quantities.forEach((qty) => {
              quantitySum = quantitySum + qty
            })

            if (this.sampler) {
              this.sampler.minQuantity = minQuantity
              if (maxQuantity > 0) {
                this.sampler.addMaxQuantity(maxQuantity)
              }

              let insideAskPrice = 0
              let insideBidPrice = 0

              if (r.data.bids.length > 0) insideBidPrice = r.data.bids[0][0]

              if (r.data.asks.length > 0) insideAskPrice = r.data.asks[0][0]

              if (this.isFirstSample) {
                const insideBidAsString: string = insideBidPrice.toString()

                Logger.log(
                  'Serum Market Data Source    |   Raw Inside Bid Price: ' +
                    insideBidAsString
                )

                const insideAskAsString: string = insideAskPrice.toString()

                Logger.log(
                  'Serum Market Data Source    |   Raw Inside Ask Price: ' +
                    insideAskAsString
                )

                this.precision = insideBidAsString.split('.')[1].length
                Logger.log(
                  'Serum Market Data Source    |   Setting Precision to : ' +
                    this.precision
                )
              }

              if (insideBidPrice) {
                this.sampler.currentSample.insideBidPrice = currency(
                  insideBidPrice,
                  { precision: this.precision }
                )
                //Logger.log("Serum Market Data Source    |   Sampler Inside Bid Price: " + this.sampler.currentSample.insideBidPrice);
                //Logger.log("Serum Market Data Source    |   Setting Inside Bid Price: " + this.sampler.currentSample.insideBidPrice.toString());
              }

              if (insideAskPrice) {
                this.sampler.currentSample.insideAskPrice = currency(
                  insideAskPrice,
                  { precision: this.precision }
                )
                //Logger.log("Serum Market Data Source    |   Sampler Inside Ask Price: " + this.sampler.currentSample.insideAskPrice);
                //Logger.log("Serum Market Data Source    |   Setting Inside Ask Price: " + this.sampler.currentSample.insideAskPrice.toString());
              }

              if (insideBidPrice && insideAskPrice) {
                const insideBidPlusInsideAsk: currency = currency(
                  insideBidPrice + insideAskPrice,
                  { precision: this.precision }
                )
                const midPrice: currency = currency(
                  insideBidPlusInsideAsk.divide(2),
                  { precision: this.precision }
                )
                this.sampler.currentSample.midPrice = midPrice

                if (this.isFirstSample) {
                  PriceDivisionManager.Instance.setMidprice(
                    midPrice,
                    this.precision
                  )
                  this.isFirstSample = false
                }
              }

              //Logger.log("Binance Feed : Adding Order Book  : " + insideBidPrice+ " : "  + insideAskPrice);

              this.sampler.currentSample.orders.clear()

              r.data.bids.forEach((bid: any) => {
                this.sampler?.addOrderBookEntry(
                  MarketSide.Bid,
                  currency(bid[0], { precision: this.precision }),
                  Number(bid[1])
                )
              })

              r.data.asks.forEach((ask: any) => {
                this.sampler?.addOrderBookEntry(
                  MarketSide.Ask,
                  currency(ask[0], { precision: this.precision }),
                  Number(ask[1])
                )
              })

              EventBus.Instance.emit('CAPTURED_ORDERBOOK_DATA')
            }
          }
        }
      })
    }
  }

  async openTradesFeed() {
    Logger.log('Binance Feed        |   Opening Trades Feed Socket')

    // Binance Trade Integration
    EventBus.Instance.eventDataHandler.subscribe((p, r) => {
      if (r.type === SERUM_TRADES_UPDATE) {
        // SERUM_TRADES_UPDATE
        if (r.data) {
          const tradesData: any = r.data
            .sort((a, b) => Number(a.time) - Number(b.time))
            .filter((td) => Number(td.time) > this.lastTradeId)

          tradesData.forEach((feedData) => {
            const price = parseFloat(feedData.price)
            const quantity = parseFloat(feedData.size)
            const id = feedData.time
            const time = feedData.time
            let direction: OrderSide = OrderSide.Buy

            if (feedData.side === 'buy') {
              direction = OrderSide.Buy
            } else if (feedData.side === 'sell') {
              direction = OrderSide.Sell
            }

            if (Number(id) > this.lastTradeId) {
              //Logger.log("Ccxt Feed : processing trade id : " + trade.id);
              this.lastTradeId = Number(id)
              const exchangeOrder: ExchangeOrder = new ExchangeOrder(
                direction,
                quantity,
                currency(price),
                OrderState.Filled,
                Number(time),
                Number(id)
              )
              console.log('adding trades data_____________')
              console.log(exchangeOrder)
              this.sampler?.addTrade(exchangeOrder)
            }
          })
        }
      }
    })
    // const symbol = this.getUsableSymbol(false);
    // const url = (process.env.BINANCE_TRADE_SOCKET_URL ?? 'wss://stream.binance.com:9443/ws/') + symbol + '@trade';

    // this.tradeWebSocket = new WebSocket(url);

    // if (this.tradeWebSocket)
    // {
    //     this.tradeWebSocket.addEventListener('open', (event) => {});
    //     this.tradeWebSocket.onmessage = async (event: any) => {
    //         const feedData: any = JSON.parse(event.data);

    //         let price = parseFloat(feedData.p);
    //         let quantity = parseFloat(feedData.q);
    //         let id = feedData.t;
    //         let time = feedData.T;
    //         let direction : OrderSide = OrderSide.Buy;

    //         if (feedData.m)
    //             direction = OrderSide.Buy;
    //         else
    //             direction = OrderSide.Sell;

    //         if (Number(id) > this.lastTradeId) {
    //             //Logger.log("Ccxt Feed : processing trade id : " + trade.id);
    //             this.lastTradeId = Number(id);
    //             let exchangeOrder: ExchangeOrder = new ExchangeOrder(direction,
    //                                                                 quantity,
    //                                                                 currency(price),
    //                                                                 OrderState.Filled,
    //                                                                 Number(time),
    //                                                                 Number(id));
    //             this.sampler?.addTrade(exchangeOrder);
    //         }
    //     }
    // }
  }

  closeOrderBookFeed() {
    throw new Error('Implement in subclass')
  }

  async loadBook(): Promise<void> {}

  async loadCandles(): Promise<void> {}

  processUpdate() {
    throw new Error('Implement in subclass')
  }

  updateExchangeSource() {}

  setExchangeInfo(dataSource: string, exchangePair: string) {
    this.exchange = dataSource
    this.symbol = exchangePair

    //this.updateExchangeSource();
  }

  getUsableSymbol(isUppercase = true) {
    const data = this.symbol.split('/')
    const usableSymbol = data[0] + data[1]
    return isUppercase ? usableSymbol.toUpperCase() : usableSymbol.toLowerCase()
  }
}
