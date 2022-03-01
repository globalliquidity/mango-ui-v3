import currency from 'currency.js'
import { EventDispatcher, SignalDispatcher } from 'strongly-typed-events'
import { MarketSide } from '../Enums'
import Logger from '@/modules/SceneGraph/Logger'
import { ExchangeOrder } from './ExchangeOrder'
import { MarketDataSample } from './MarketDataSample'
import { MarketDataSource } from './MarketDataSource'
import { PriceDivisionSetting } from '../PriceDivision/PriceDivisionSetting'
import { PriceDivisionManager } from '../PriceDivision/PriceDivisionManager'
import { CandleStick } from './CandleStick'
//import { EventBus } from '@/modules/SceneGraph/EventBus';
import { QuoteBucket } from './QuoteBucket'

export class MarketDataSampler {
  //implements IMarketDataSampler, IExchangeTraded
  public originPrice: currency = currency(0)
  public currentGeneration = 0

  //create private event dispatcher
  private _onSampleCaptured = new EventDispatcher<
    MarketDataSampler,
    MarketDataSample
  >()
  private _onCandlesLoaded = new SignalDispatcher()

  public get onCandlesLoaded() {
    return this._onCandlesLoaded.asEvent()
  }

  //tslint:disable-next-line: ban-types
  public onLoad?: () => Record<string, unknown>

  // Quantity sampling
  public midMaxQuantity = 0
  public minQuantity = 0
  public maxQuantities: Array<number> = []
  public maxHeightRate = 1

  public lastTradeId = 0

  updatePresenter(): void {
    throw new Error('Method not implemented.')
  }

  get onSampleCaptured() {
    return this._onSampleCaptured.asEvent()
  }

  get orderImbalance(): number {
    return this.current.orderImbalance
  }

  get spread(): currency {
    return this.current.spread
  }

  get midPrice(): currency {
    return this.current.midPrice
  }

  get insideBidPrice(): currency {
    return this.current.insideBidPrice
  }

  get insideAskPrice(): currency {
    return this.current.insideAskPrice
  }

  get isLoaded(): boolean {
    return this.current.isLoaded
  }

  currentSample: MarketDataSample = new MarketDataSample('', this, 0)
  samples: Array<MarketDataSample> = new Array<MarketDataSample>()
  captureSampleTimeout?: NodeJS.Timeout
  loadMarketDataTimeout?: NodeJS.Timeout

  loadCandlesTimeout?: NodeJS.Timeout
  candles: Array<CandleStick> = new Array<CandleStick>()
  _isCandleDataLoaded = false
  candleSamplingInterval = 30000

  constructor(
    public symbol: string,
    public maxSamples: number,
    public samplingInterval: number,
    public marketDataSource: MarketDataSource
  ) {
    let currentPriceDivision: PriceDivisionSetting | undefined =
      PriceDivisionManager.Instance.currentPriceDivisionSetting

    if (currentPriceDivision) {
      this.originPrice = currency(0, {
        precision: currentPriceDivision.numDecimalPlaces,
      })
      this.currentSample = new MarketDataSample(
        symbol,
        this,
        this.midMaxQuantity
      )

      this.samples.push(this.currentSample)
      marketDataSource.setSampler(this)

      PriceDivisionManager.Instance.onPriceDivsionChanged.subscribe((_p, r) => {
        currentPriceDivision = r
        setTimeout(() => {
          this.refresh()
        }, 1)
        // console.log('start time: ', Date.now());
        // this.refresh();
        // console.log('end time: ', Date.now());
      })
    }
  }
  insideBid?: QuoteBucket | undefined
  insideAsk?: QuoteBucket | undefined

  start(): void {
    throw new Error('Method not implemented.')
  }

  /*
    protected async onStart()
    {
        await this.connect();
    }
    */

  public async connect() {
    //console.log('connect to feed here');
    if (this.onLoad != null) this.onLoad()

    if (this.marketDataSource.useWebSocket) {
      await this.marketDataSource.openOrderBookFeed()
      await this.marketDataSource.openTradesFeed()
      //await this.marketDataSource.loadBook();

      await this.marketDataSource.loadCandles()
      this.loadMarketDataTimeout = setInterval(
        this.loadMarketData.bind(this),
        this.samplingInterval
      )
      this.captureSampleTimeout = setInterval(
        this.captureSample.bind(this),
        this.samplingInterval,
        this
      )
      this.loadCandlesTimeout = setInterval(
        this.loadCandles.bind(this),
        this.candleSamplingInterval,
        this
      )
    } else {
      await this.marketDataSource.loadBook()
      await this.marketDataSource.loadTrades()
      await this.marketDataSource.loadCandles()
      //await this.captureSample();

      this.captureSampleTimeout = setInterval(
        this.captureSample.bind(this),
        this.samplingInterval,
        this
      )
      this.loadCandlesTimeout = setInterval(
        this.loadCandles.bind(this),
        this.candleSamplingInterval,
        this
      )

      //console.log('connect to feed here normal');

      setTimeout(() => {
        this.loadMarketDataTimeout = setInterval(
          this.loadMarketData.bind(this),
          this.samplingInterval,
          this
        )
      }, 1500)
    }
  }

  public stop() {
    //this.marketDataSource.closeOrderBookFeed();
    this.clear()
    if (this.captureSampleTimeout) clearInterval(this.captureSampleTimeout)
    if (this.loadMarketDataTimeout) clearInterval(this.loadMarketDataTimeout)
  }

  public clear() {
    Logger.log('MarketDataSampler: clear()')
    this.samples = new Array<MarketDataSample>()
    this.currentGeneration = 0
    this.currentSample = new MarketDataSample(
      this.symbol,
      this,
      this.midMaxQuantity
    )
  }

  public addMaxQuantity(maxQuantity: number) {
    this.maxQuantities.push(maxQuantity)

    if (this.maxQuantities.length >= 50) {
      this.maxQuantities.shift()
    }

    let sum = 0

    this.maxQuantities.forEach((sample) => {
      if (sample > 0) {
        sum = sum + sample
      }
    })

    this.midMaxQuantity = Math.max(...this.maxQuantities)
  }

  public async loadMarketData() {
    //this.currentSample.clear();
    //this.currentSample.orders.clear();
    // await this.marketDataSource.loadBook();
    this.currentSample.refresh()
    //await this.marketDataSource.loadTrades(this.currentSample);
  }

  public async loadCandles() {
    //Logger.log("MarketDataSampler   |   Load Candles");
    this.candles = [] // new Array<CandleStick>();
    await this.marketDataSource.loadCandles()
    this._isCandleDataLoaded = true
    this._onCandlesLoaded.dispatch()

    // EventBus.Instance.emit('CAPTURED_CANDLE_DATA');
  }

  public addCandle(candle: CandleStick) {
    this.candles.push(candle)
  }

  public getCandle(index: number): CandleStick {
    return this.candles[index]
  }

  public setExchangeInfo(dataSource: string, exchangePair: string) {
    this.marketDataSource.setExchangeInfo(dataSource, exchangePair)
  }

  public captureSample() {
    // : MarketDataSample
    //Logger.log("MarketDataSampler : Capturing Sample")
    this.currentSample.refresh()
    //Logger.log("MarketDataSampler : Capturing Sample...");
    //Logger.log("MarketDataSampler : Current Midprice: " + this.currentSample.midPrice);
    const newMarketDataSample: MarketDataSample = this.currentSample.clone()
    newMarketDataSample.refresh()
    //newMarketDataSample.trades.trades.splice(0,newMarketDataSample.trades.trades.length);
    newMarketDataSample.maxQuantity = this.midMaxQuantity
    const capturedSample: MarketDataSample = this.currentSample

    this.samples.unshift(this.currentSample)
    this.currentSample = newMarketDataSample
    this.currentGeneration++
    this.trimSamples()

    this._onSampleCaptured.dispatch(this, capturedSample)
  }

  public addOrderBookEntry(
    side: MarketSide,
    price: currency,
    quantity: number
  ) {
    this.current.addOrderBookEntry(side, price, quantity)
  }

  public addTrade(trade: ExchangeOrder) {
    const quantizedTradePrice: currency = this.quantizePrice(trade.price)
    trade.price = quantizedTradePrice
    this.current.addTrade(trade)
  }

  private trimSamples() {
    if (this.samples.length > this.maxSamples)
      this.samples = this.samples.splice(0, this.maxSamples)
  }

  get current(): MarketDataSample {
    return this.currentSample
  }

  get numSamples(): number {
    return this.samples.length
  }

  public get(age: number): MarketDataSample | undefined {
    if (age < this.samples.length) return this.samples[age]

    return undefined
  }

  quantizePrice(price: currency, _side?: MarketSide): currency {
    const currentPriceDivsionSettings: PriceDivisionSetting | undefined =
      PriceDivisionManager.Instance.currentPriceDivisionSetting

    if (currentPriceDivsionSettings) {
      const quantizedPrice: currency = currency(
        Math.round(
          price.value *
            currentPriceDivsionSettings.priceDivisionMultiplier.value
        ) / currentPriceDivsionSettings.priceDivisionMultiplier.value,
        { precision: currentPriceDivsionSettings.numDecimalPlaces }
      )
      return quantizedPrice
    } else {
      return currency(0)
    }
  }

  refresh() {
    return new Promise((resolutionFunc, rejectionFunc) => {
      try {
        const newSamples = [...this.samples]
        for (let i = 0; i < newSamples.length; i++) {
          newSamples[i].buildNewSample()
        }

        // this.presenter.rows = [];
        // this.presenter.redrawRows(this.samples);
        resolutionFunc(true)
      } catch (error) {
        rejectionFunc(error)
      }
    })
  }
}
