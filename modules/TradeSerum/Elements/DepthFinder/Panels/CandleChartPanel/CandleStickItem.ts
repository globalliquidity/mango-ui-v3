import * as bjs from '@babylonjs/core/Legacy/legacy'

import { CandleType } from '@/modules/TradeSerum/Enums'
import { CandleStick } from '@/modules/TradeSerum/Market/CandleStick'

export class CandleStickItem extends CandleStick {
  public candleType: CandleType = CandleType.Bullish

  public bodyScale = 1
  public wickScale = 1
  public barScale = 1

  public candlePosition: bjs.Vector3 = new bjs.Vector3(0, 0, 0)
  public bodyPosition: bjs.Vector3 = new bjs.Vector3(0, 0, 0)
  public wickPosition: bjs.Vector3 = new bjs.Vector3(0, 0, 0)
  public barPosition: bjs.Vector3 = new bjs.Vector3(0, 0, 0)

  constructor(
    public open: number,
    public high: number,
    public low: number,
    public close: number,
    public volume: number,
    public quoteVolume: number,
    public btcVolume: number,
    public usdVolume: number,
    public time: Date
  ) {
    super(
      open,
      high,
      low,
      close,
      volume,
      quoteVolume,
      btcVolume,
      usdVolume,
      time
    )
    // console.log("Constructing CandleStick");
  }

  public init(
    candleType: CandleType,
    bodyPosition: bjs.Vector3,
    bodyScale: number,
    bodyColor: bjs.Color3,
    wickPosition: bjs.Vector3,
    wickScale: number,
    _wickColor: bjs.Color3
  ) {
    this.candleType = candleType

    this.bodyPosition = bodyPosition
    this.bodyScale = bodyScale

    this.wickPosition = wickPosition
    this.wickScale = wickScale
  }

  public getCandleType() {
    return this.candleType
  }

  public setCandleType(candleType: CandleType) {
    this.candleType = candleType
  }

  public getCandlePosition() {
    return this.candlePosition
  }

  public setCandlePosition(candlePosition: bjs.Vector3) {
    this.candlePosition = candlePosition
  }

  public getBodyPosition() {
    return this.bodyPosition
  }

  public setBodyPosition(bodyPosition: bjs.Vector3) {
    this.bodyPosition = bodyPosition
  }

  public getBodyScale() {
    return this.bodyScale
  }

  public setBodyScale(bodyScale: number) {
    this.bodyScale = bodyScale
  }

  public getWickPosition() {
    return this.wickPosition
  }

  public setWickPosition(wickPosition: bjs.Vector3) {
    this.wickPosition = wickPosition
  }

  public getWickScale() {
    return this.wickScale
  }

  public setWickScale(wickScale: number) {
    this.wickScale = wickScale
  }

  public setBarPosition(barPosition: bjs.Vector3) {
    this.barPosition = barPosition
  }

  public setBarScale(barScale: number) {
    this.barScale = barScale
  }
}
