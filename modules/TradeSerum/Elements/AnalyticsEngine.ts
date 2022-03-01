import * as bjs from '@babylonjs/core/Legacy/legacy'
import { LocalTradingSession } from './LocalTradingSession'
import { DepthFinderPresenter } from './DepthFinder/DepthFinderPresenter'
import { DepthFinderRow } from './DepthFinder/DepthFinderRow'
import currency from 'currency.js'
import * as technicalindicators from 'technicalindicators'
import { Scene } from '@/modules/SceneGraph/Scene'
import { LocalTradingSessionElement } from './LocalTradingSessionElement'
import { PriceDivisionManager } from '../PriceDivision/PriceDivisionManager'

export class AnalyticsEngine extends LocalTradingSessionElement {
  currentMidPrice: currency = currency(0)
  previousMidPrice: currency = currency(0)
  midPriceDelta = 0

  private prices: Array<number> = new Array<number>()
  private rateOfChange: Array<number> = new Array<number>()
  deltaFive: Array<number> = new Array<number>()
  private deltaTen: Array<number> = new Array<number>()

  private samplingWindowSize = 60

  get midPriceDeltaString(): string {
    return this.midPriceDelta.toFixed(0)
  }

  set midPriceDeltaString(value: string) {
    this.midPriceDelta = +value
  }

  get rateOfChangeString(): string {
    if (this.rateOfChange.length > 0) return this.rateOfChange[0].toFixed(1)
    return '0'
  }

  get deltaFiveString(): string {
    if (this.deltaFive.length > 0) return this.deltaFive[0].toFixed(1)
    return '0'
  }

  get deltaTenString(): string {
    if (this.deltaTen.length > 0) return this.deltaTen[0].toFixed(1)
    return '0'
  }

  get deltaFiveValue(): number {
    if (this.deltaFive.length > 0) return this.deltaFive[0]
    return 0
  }

  get deltaTenValue(): number {
    if (this.deltaTen.length > 0) return this.deltaTen[0]
    return 0
  }

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: Scene,
    public session: LocalTradingSession
  ) {
    super(name, x, y, z, scene, session)
    this.initialize()
  }

  initialize() {
    //technicalindicators
  }

  protected onAddCustomProperties() {
    this.inspectableCustomProperties = [
      {
        label: 'MidPrice Delta (BPS)',
        propertyName: 'midPriceDeltaString',
        type: bjs.InspectableType.String,
      },
      {
        label: 'Five Second Delta (BPS)',
        propertyName: 'deltaFiveString',
        type: bjs.InspectableType.String,
      },
      {
        label: 'Ten Second Delta (BPS)',
        propertyName: 'deltaTenString',
        type: bjs.InspectableType.String,
      },
    ]
  }

  public start() {
    this.session.presenter.onAddedNewRow.subscribe(
      this.evaluateMarket.bind(this)
    )
  }

  public stop() {
    this.session.presenter.onAddedNewRow.unsubscribe(
      this.evaluateMarket.bind(this)
    )
  }

  evaluateMarket(presenter: DepthFinderPresenter, _row: DepthFinderRow) {
    const newMidprice: currency = presenter.midPrice
    this.previousMidPrice = this.currentMidPrice
    this.currentMidPrice = newMidprice

    if (this.previousMidPrice.value !== 0) {
      this.calculateMidPriceDelta()
    }

    this.rateOfChange = technicalindicators.ROC.calculate({
      period: 1,
      values: this.prices,
      reversedInput: true,
    })

    this.deltaFive = technicalindicators.SMA.calculate({
      period: 10,
      values: this.prices,
      reversedInput: false,
    })
    this.deltaTen = technicalindicators.SMA.calculate({
      period: 20,
      values: this.prices,
      reversedInput: false,
    })
  }

  calculateMidPriceDelta() {
    const priceDivisionManager: PriceDivisionManager =
      PriceDivisionManager.Instance

    if (priceDivisionManager.currentPriceDivisionSetting) {
      const quantizedPrice: currency = this.session.presenter.quantizePrice(
        this.currentMidPrice.subtract(this.previousMidPrice)
      )
      this.midPriceDelta =
        quantizedPrice.value *
        priceDivisionManager.currentPriceDivisionSetting.priceDivisionMultiplier
          .value
      this.midPriceDelta = Math.round(this.midPriceDelta)
      this.prices.unshift(this.midPriceDelta)

      if (this.prices.length > this.samplingWindowSize)
        this.prices = this.prices.splice(0, this.samplingWindowSize)
    }
  }
}
