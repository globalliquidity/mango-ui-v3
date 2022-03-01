import currency from 'currency.js'

// const ccxt = require ('ccxt');
import ccxt, { OrderBook } from 'ccxt'
import { MarketDataSource } from './MarketDataSource'
import { MarketSide, OrderSide, OrderState } from '../Enums'
import { ExchangeOrder } from './ExchangeOrder'
import Logger from '@/modules/SceneGraph/Logger'
// import { MarketDataSampler } from "./MarketDataSampler";
// import { MarketDataSample } from "./MarketDataSample";
import { CandleStick } from './CandleStick'

type CCXTExchange =
  | ccxt.binance
  | ccxt.huobipro
  | ccxt.kraken
  | ccxt.coinbasepro
  | ccxt.ftx

export class BinanceMarketDataSource extends MarketDataSource {
  private lastTradeId = 0
  private feedWebSocket?: WebSocket
  private tradeWebSocket?: WebSocket

  // private ccxtExchangeBinance : ccxt.binance;// = new ccxt.binance ({ enableRateLimit: true });
  // private ccxtExchangeHuobi : ccxt.huobipro;// = new ccxt.huobipro ({ enableRateLimit: true });
  // private ccxtExchangeKraken : ccxt.kraken;// = new ccxt.kraken ({ enableRateLimit: true });
  // private ccxtExchangeCoinbasePro : ccxt.coinbasepro;// = new ccxt.coinbasepro ({ enableRateLimit: true });
  // private ccxtExchangeFtx : ccxt.ftx;// = new ccxt.coinbasepro ({ enableRateLimit: true });

  private ccxtExchange?: CCXTExchange

  // private exchange : string = "";

  constructor(public symbol: string) {
    super(symbol)
    this.useWebSocket = true

    this.exchange = process.env.EXCHANGE ?? 'Binance'
    this.symbol = process.env.CCXT_SYMBOL ?? 'SOL/USDT'

    this.updateExchangeSource()

    Logger.log('Constructing CCXT Feed For: ' + this.exchange)
  }

  async openOrderBookFeed() {
    //await this.loadBook(this.sampler.currentSample);
    //await this.loadTrades(this.sampler.currentSample);
    Logger.log('Binance Feed        |   Opening Feed Socket')

    const symbol = this.getUsableSymbol(false)
    let url =
      (process.env.BINANCE_BTCUSDT_SOCKET_URL ??
        'wss://stream.binance.com:9443/ws/') +
      symbol +
      '@depth'

    this.feedWebSocket = new WebSocket(url)

    if (this.feedWebSocket) {
      this.feedWebSocket.addEventListener('open', (_event) => {})
      this.feedWebSocket.onmessage = async (event: any) => {
        const feedData: any = JSON.parse(event.data)

        // Calculation for max quantity from original feed data
        const bidQuantities: Array<number> = feedData.b.map((bid: any) =>
          Number(bid[1])
        )
        const askQuantities: Array<number> = feedData.a.map((ask: any) =>
          Number(ask[1])
        )
        const quantities: Array<number> = [...askQuantities, ...bidQuantities]
        const maxQuantity = Math.max(...quantities)
        const minQuantity = Math.min(...quantities)

        let quantitySum = 0

        quantities.forEach((qty) => {
          quantitySum = quantitySum + qty
        })
        // const avgQantity = quantitySum / quantities.length;

        if (this.sampler) {
          this.sampler.minQuantity = minQuantity
          if (maxQuantity > 0) {
            this.sampler.addMaxQuantity(maxQuantity)
          }

          this.sampler.currentSample.orders.clear()

          feedData.b.forEach((bid: any) => {
            // console.log('this.sampler.current: ', this.sampler.current);
            // console.log('converted price: ', Number(bid.price));
            this.sampler?.addOrderBookEntry(
              MarketSide.Bid,
              currency(bid[0]),
              Number(bid[1])
            )
          })

          feedData.a.forEach((ask: any) => {
            this.sampler?.addOrderBookEntry(
              MarketSide.Ask,
              currency(ask[0]),
              Number(ask[1])
            )
          })
        }

        //EventBus.Instance.emit('CAPTURED_ORDERBOOK_DATA');
      }
    }

    // Binance Trade Integration
    url =
      (process.env.BINANCE_TRADE_SOCKET_URL ??
        'wss://stream.binance.com:9443/ws/') +
      symbol +
      '@trade'

    this.tradeWebSocket = new WebSocket(url)

    if (this.tradeWebSocket) {
      this.tradeWebSocket.addEventListener('open', (_event) => {})
      this.tradeWebSocket.onmessage = async (event: any) => {
        const feedData: any = JSON.parse(event.data)

        const price = parseFloat(feedData.p)
        const quantity = parseFloat(feedData.q)
        const id = feedData.t
        const time = feedData.T
        let direction: OrderSide = OrderSide.Buy

        if (feedData.m) direction = OrderSide.Buy
        else direction = OrderSide.Sell

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
          this.sampler?.addTrade(exchangeOrder)
        }
      }
    }
  }

  async openTradesFeed() {
    Logger.log('Binance Feed        |   Opening Trades Feed Socket')

    // Binance Trade Integration
    const symbol = this.getUsableSymbol(false)
    const url =
      (process.env.BINANCE_TRADE_SOCKET_URL ??
        'wss://stream.binance.com:9443/ws/') +
      symbol +
      '@trade'

    this.tradeWebSocket = new WebSocket(url)

    if (this.tradeWebSocket) {
      this.tradeWebSocket.addEventListener('open', (_event) => {})
      this.tradeWebSocket.onmessage = async (event: any) => {
        const feedData: any = JSON.parse(event.data)

        const price = parseFloat(feedData.p)
        const quantity = parseFloat(feedData.q)
        const id = feedData.t
        const time = feedData.T
        let direction: OrderSide = OrderSide.Buy

        if (feedData.m) direction = OrderSide.Buy
        else direction = OrderSide.Sell

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
          this.sampler?.addTrade(exchangeOrder)
        }
      }
    }
  }

  closeOrderBookFeed() {
    throw new Error('Implement in subclass')
  }

  async loadBook(): Promise<void> {
    //Logger.log("MarketDataSource : Loading Order Book")
    try {
      // let symbol : string = process.env.CCXT_SYMBOL as string;
      const orderbook: OrderBook | undefined =
        await this.ccxtExchange?.fetchOrderBook(this.symbol)

      if (this.sampler && orderbook) {
        const insideAskPrice: number = orderbook['asks'][0][0]
        const insideBidPrice: number = orderbook['bids'][0][0]
        this.sampler.currentSample.insideBidPrice = currency(insideBidPrice)
        this.sampler.currentSample.insideAskPrice = currency(insideAskPrice)
        this.sampler.currentSample.midPrice = currency(
          (insideBidPrice + insideAskPrice) / 2
        )

        //Logger.log("Binance Feed : Adding Order Book  : " + insideBidPrice+ " : "  + insideAskPrice);

        this.sampler.currentSample.orders.clear()

        orderbook['bids'].forEach((bid: any) => {
          //Logger.log("Binance Feed : Adding Bid : " + bid[0] + " " + bid[1]);
          //sample.addOrderBookEntry(MarketSide.Bid,currency(Number(bid[0])),Number(bid[1]));
          this.sampler?.addOrderBookEntry(
            MarketSide.Bid,
            currency(Number(bid[0])),
            Number(bid[1])
          )
        })

        orderbook['asks'].forEach((ask: any) => {
          //Logger.log("Binance Feed : Adding Ask : " + ask[0] + " " + ask[1]);
          //sample.addOrderBookEntry(MarketSide.Ask,currency(Number(ask[0])),Number(ask[1]))
          this.sampler?.addOrderBookEntry(
            MarketSide.Ask,
            currency(Number(ask[0])),
            Number(ask[1])
          )
        })

        //sample.refresh();
        //this.orderBook.logOrderBook(10);
      }
    } catch (exception) {
      console.error(exception)
    }
  }

  async loadCandles(): Promise<void> {
    //Logger.log("BinanceMarketDataSource : Loading CandleData");
    // let proxyUrl:string = window.location.protocol === 'http:' ? 'http://52.14.231.154:8080/' : 'https://proxy.bionictrader.io/';
    // const url: string = "https://dev-api.shrimpy.io/v1/exchanges/binance/candles?quoteTradingSymbol=USDT&baseTradingSymbol=BTC&interval=1M";
    // const requestUrl = '/v1/exchanges/binance/candles?quoteTradingSymbol=USDT&baseTradingSymbol=BTC&interval=1M';

    const symbol = this.getUsableSymbol()
    const url =
      (process.env.BINANCE_CANDLE_DATA_API_URL ??
        'https://api.binance.com/api/v3/klines') +
      '?symbol=' +
      symbol +
      '&interval=1m'
    let candleData: any[] = []

    try {
      // const headers = shrimpyHeaderGenerator(requestUrl, 'GET');
      const response: Response = await fetch(url, {
        method: 'GET',
      })
      candleData = await response.json()
      //console.log(candleData);
    } catch (error) {
      console.log('Failed to get candles data:')
      console.log(error)
    }
    // console.log("BinanceMarketDataSource : Got candle data");
    for (let i = candleData.length - 1; i >= 0; i--) {
      const candle = candleData[i]
      const candleStick: CandleStick = new CandleStick(
        candle[1], // Open
        candle[2], // High
        candle[3], // Low
        candle[4], // Close
        candle[5], // Volume
        candle[7], // Quote Volume
        candle[10], // BTC Volume
        candle[9], // USD Volume
        new Date(candle[0]) // Open Time
      )

      this.sampler?.addCandle(candleStick)
    }

    //EventBus.Instance.emit('CAPTURED_CANDLE_DATA');
  }

  processUpdate() {
    throw new Error('Implement in subclass')
  }

  updateExchangeSource() {
    switch (this.exchange) {
      case 'Binance':
        // this.ccxtExchangeBinance =  new ccxt.binance ({ enableRateLimit: true });
        this.ccxtExchange = new ccxt.binance({ enableRateLimit: true })
        break
      case 'Kraken':
        // this.ccxtExchangeKraken = new ccxt.kraken ({ enableRateLimit: true });
        this.ccxtExchange = new ccxt.kraken({ enableRateLimit: true })
        break
      case 'Huobi':
        // this.ccxtExchangeHuobi = new ccxt.huobipro ({ enableRateLimit: true });
        this.ccxtExchange = new ccxt.huobipro({ enableRateLimit: true })
        break
      case 'CoinbasePro':
        // this.ccxtExchangeCoinbasePro = new ccxt.coinbasepro ({ enableRateLimit: true });
        this.ccxtExchange = new ccxt.coinbasepro({ enableRateLimit: true })
        break
      case 'FTX':
        // this.ccxtExchangeFtx = new ccxt.ftx ({ enableRateLimit: true });
        this.ccxtExchange = new ccxt.ftx({ enableRateLimit: true })
        break
    }
  }

  setExchangeInfo(dataSource: string, exchangePair: string) {
    this.exchange = dataSource
    this.symbol = exchangePair

    this.updateExchangeSource()
  }

  getUsableSymbol(isUppercase = true) {
    const data = this.symbol.split('/')
    const usableSymbol = data[0] + data[1]
    return isUppercase ? usableSymbol.toUpperCase() : usableSymbol.toLowerCase()
  }
}
