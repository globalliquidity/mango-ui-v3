import * as bjs from '@babylonjs/core/Legacy/legacy'

import { SceneElementPresenter } from '@/modules/SceneGraph/SceneElementPresenter'
import { PresenterUpdateMessage } from '@/modules/SceneGraph/PresenterUpdateMessage'
import { CandleStick } from '@/modules/TradeSerum/Market/CandleStick'
import { CandleChartUpdateMessage } from './CandleChartUpdateMessage'
import { CandleStickItem } from './CandleStickItem'
import { EventDispatcher } from 'strongly-typed-events'
import { CandleType } from '@/modules/TradeSerum/Enums'

const moment = require('moment')

export class CandleChartPresenter extends SceneElementPresenter<PresenterUpdateMessage> {
  public candles: Array<CandleStickItem>

  public titleScale: bjs.Vector3 = new bjs.Vector3(0.4, 0.4, 0.4)
  public headHeight = 1

  public marginX = 3.5
  public marginY = 1

  public maximumX = 0
  public maximumY = 0

  public unitX = 1 //horizontalScaleFactor
  public unitY = 1 //verticalScaleFactor

  public barUnitY = 1

  public bgOffsetX = 0.5
  public bgOffsetY = 0.5

  public chartWidth = 1
  public chartHeight = 1

  public candleChartHeight = 1
  public barChartHeight = 2.5

  public originX = 0
  public originY = 0

  // public candleOriginX: number = 0;
  public candleOriginY = 0

  // public barOriginX: number = 0;
  public barOriginY = 0

  public highestPrice = 0
  public lowestPrice = 0
  public visiblePriceRange = 0

  public highestVolume = 0
  public lowestVolume = 0
  public visibleVolumeRange = 0

  public xTickCount = 4
  public yTickCount = 3
  public xValues: Array<string> = new Array<string>()
  public yValues: Array<string> = new Array<string>()

  public barTickCount = 1
  public barValues: Array<string> = new Array<string>()

  public bodyHeight = 1

  public verticalScaleFactor = 1 //2.5; // 1 / 0.4 (height of initial candle)

  public currentGeneration = 0
  private _addedNewCandle = new EventDispatcher<
    CandleChartPresenter,
    CandleStick
  >()

  isReady = false
  isAddingCandle = false
  isInitialized = false

  get onAddedNewCandle() {
    return this._addedNewCandle.asEvent()
  }

  constructor(
    public width: number,
    public height: number,
    public candleCount: number
  ) {
    super()

    this.candles = new Array<CandleStickItem>()

    this.bodyHeight = this.height - this.headHeight
    this.chartWidth = this.width - this.marginX
    this.chartHeight = this.bodyHeight - this.marginY

    this.candleChartHeight = this.chartHeight - this.barChartHeight

    if (this.candleCount > 0) {
      this.unitX = this.chartWidth / this.candleCount
    }

    // this.originX = -(this.chartWidth) / 2 - (this.marginX / 2);
    this.originX = -this.width / 2 + this.bgOffsetX
    this.originY =
      -this.chartHeight / 2 +
      (this.marginY - this.headHeight) / 2 -
      this.bgOffsetY
    this.candleOriginY = this.originY + this.barChartHeight

    for (let i = 0; i < this.xTickCount; i++) {
      this.xValues[i] = '0'
    }

    for (let i = 0; i < this.yTickCount; i++) {
      this.yValues[i] = '0'
    }

    for (let i = 0; i < this.barTickCount; i++) {
      this.barValues[i] = '0'
    }
  }

  protected processMessage(message: CandleChartUpdateMessage): void {
    //TODO : In subclass transform message into data
    this.isAddingCandle = true
    this.addCandle(message.candles)
    this._addedNewCandle.dispatch(this, this.candles[0])
    this.currentGeneration++
    this.isAddingCandle = false
  }

  getCandle(candleIndex: number): CandleStick | undefined {
    if (candleIndex >= 0 && candleIndex < this.candles.length) {
      return this.candles[candleIndex]
    }

    return undefined
  }

  getCurrentCandle(): CandleStick | undefined {
    return this.getCandle(0)
  }

  getPriceRange() {
    let lowest: number = Number.POSITIVE_INFINITY
    let highest: number = Number.NEGATIVE_INFINITY

    let lowestVolume: number = Number.POSITIVE_INFINITY
    let highestVolume: number = Number.NEGATIVE_INFINITY

    const len = Math.min(this.candles.length, this.candleCount)

    for (let i = 0; i < len; i++) {
      const candle: CandleStickItem = this.candles[i]

      if (candle.low < lowest) lowest = candle.low
      if (candle.high > highest) highest = candle.high

      if (candle.quoteVolume < lowestVolume) lowestVolume = candle.quoteVolume
      if (candle.quoteVolume > highestVolume) highestVolume = candle.quoteVolume
    }

    this.highestPrice = highest
    this.lowestPrice = lowest
    this.visiblePriceRange = Math.abs(highest - lowest)
    //this.verticalScaleFactor = 0.5;//this.visiblePriceRange * .0025;

    this.highestVolume = highestVolume
    this.lowestVolume = lowestVolume
    this.visibleVolumeRange = Math.abs(highestVolume - lowestVolume)
  }

  protected addCandle(candles: CandleStick[]) {
    for (let i = 0; i < candles.length; i++) {
      const candleItem = new CandleStickItem(
        Number(candles[i].open),
        Number(candles[i].high),
        Number(candles[i].low),
        Number(candles[i].close),
        Number(candles[i].volume),
        Number(candles[i].quoteVolume),
        Number(candles[i].btcVolume),
        Number(candles[i].usdVolume),
        candles[i].time
      )
      this.candles.unshift(candleItem)
    }

    // console.log('all candles in presenter');
    // console.log(this.candles);

    if (this.candles.length >= this.candleCount) {
      this.isInitialized = true
    }

    this.getPriceRange()

    // console.log('highest:', this.highestPrice);
    // console.log('lowest:', this.lowestPrice);
    // console.log('price range', this.visiblePriceRange);

    this.unitY = this.candleChartHeight / this.visiblePriceRange
    this.barUnitY = this.barChartHeight / this.visibleVolumeRange
    // this.originY = -(this.chartHeight) / 2 - (this.headHeight / 2) + (this.unitY / 2);

    const len = Math.min(this.candles.length, this.candleCount)

    for (let i = 0; i < len; i++) {
      const candleItem = this.candles[i]
      let bodyScale = 1
      const bodyPosition = new bjs.Vector3(0, 0, 0)
      let wickScale = 1
      const wickPosition = new bjs.Vector3(0, 0, 0)
      let barScale = 1
      const barPosition = new bjs.Vector3(0, 0, 0)

      if (candleItem.close > candleItem.open) {
        candleItem.candleType = CandleType.Bullish

        // bodyScale = this.unitY * (candleItem.close - candleItem.open);
        // bodyPosition.y = this.originY + ((candleItem.open - this.lowestPrice) + (candleItem.close - candleItem.open) / 2) * this.unitY;
      } else {
        candleItem.candleType = CandleType.Bearish

        // bodyScale = this.unitY * (candleItem.open - candleItem.close);
        // bodyPosition.y = this.originY + ((candleItem.close - this.lowestPrice) + (candleItem.open - candleItem.close) / 2) * this.unitY;
      }

      bodyScale =
        this.unitY *
        Math.abs(candleItem.close - candleItem.open) *
        this.verticalScaleFactor
      bodyPosition.y =
        this.candleOriginY +
        ((candleItem.close + candleItem.open) / 2 - this.lowestPrice) *
          this.unitY

      wickScale =
        this.unitY *
        (candleItem.high - candleItem.low) *
        this.verticalScaleFactor
      wickPosition.y =
        this.candleOriginY +
        ((candleItem.high + candleItem.low) / 2 - this.lowestPrice) * this.unitY

      barScale =
        this.barUnitY *
        (candleItem.quoteVolume - this.lowestVolume) *
        this.verticalScaleFactor
      barPosition.y = this.originY + barScale / 2

      candleItem.setCandlePosition(
        new bjs.Vector3(this.originX + this.unitX * (len - i - 1), 0, 0)
      )

      candleItem.setBodyScale(bodyScale)
      candleItem.setBodyPosition(bodyPosition)

      candleItem.setWickScale(wickScale)
      candleItem.setWickPosition(wickPosition)

      candleItem.setBarScale(barScale)
      candleItem.setBarPosition(barPosition)
    }

    // Initialize label values
    for (let i = 0; i < this.xTickCount; i++) {
      const xTickVal: string = moment(this.candles[0].time)
        .subtract(15, 'minutes')
        .add(i * 5, 'minutes')
        .format('HH.mm')
      this.xValues[i] = xTickVal
    }

    for (let i = 0; i < this.yTickCount; i++) {
      const yTickVal =
        this.lowestPrice +
        ((this.highestPrice - this.lowestPrice) / (this.yTickCount - 1)) * i
      this.yValues[i] = yTickVal.toFixed(2)
    }

    for (let i = 0; i < this.barTickCount; i++) {
      const barTickVal =
        this.lowestVolume +
        ((this.highestVolume - this.lowestVolume) / (this.barTickCount + 1)) *
          (i + 1)
      this.barValues[i] = barTickVal.toFixed(2)
    }

    if (!this.isReady) this.isReady = true
  }
}
