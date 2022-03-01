import { PriceDivisionSetting } from './PriceDivisionSetting'
import { EventDispatcher } from 'strongly-typed-events'
import { PriceRangePercentage } from '../Enums'
import * as Tone from 'tone/build/esm'
import OnlineAssets from '@/assets/OnlineAssets'
import currency from 'currency.js'
import Logger from '@/modules/SceneGraph/Logger'

export class PriceDivisionManager {
  private static _instance: PriceDivisionManager

  public static get Instance() {
    // Do you need arguments? Make it a regular static method instead.
    return this._instance || (this._instance = new this())
  }

  priceDivisionList?: Map<PriceRangePercentage, PriceDivisionSetting>
  currentPriceRangePercentage: PriceRangePercentage =
    PriceRangePercentage.OnePercent
  private _priceDivisionChanged = new EventDispatcher<
    PriceDivisionManager,
    PriceDivisionSetting
  >()
  currentDivisionLevel = 0
  _currentPriceDivisionSettings?: PriceDivisionSetting
  _columntCount = 0

  private priceZoomInSound: Tone.Player | undefined
  private priceZoomOutSound: Tone.Player | undefined
  private priceZoomNoneSound: Tone.Player | undefined

  private constructor() {}

  initialize(priceDivisionSetting: PriceDivisionSetting, columnCount: number) {
    this._columntCount = columnCount
    this.currentPriceRangePercentage = priceDivisionSetting.priceRangePercentage
    this.priceDivisionList = new Map<
      PriceRangePercentage,
      PriceDivisionSetting
    >()
    this.priceDivisionList.set(
      priceDivisionSetting.priceRangePercentage,
      priceDivisionSetting
    )
    this._currentPriceDivisionSettings = priceDivisionSetting

    this.priceZoomInSound = new Tone.Player(
      OnlineAssets.Sounds.WavPriceZoomInSound
    ).toDestination()
    this.priceZoomOutSound = new Tone.Player(
      OnlineAssets.Sounds.WavPriceZoomOutSound
    ).toDestination()
    this.priceZoomNoneSound = new Tone.Player(
      OnlineAssets.Sounds.WavPriceZoomNoneSound
    ).toDestination()
  }

  public setMidprice(midPrice: currency, precision: number) {
    Logger.log(
      'PriceDivisionManager    |   Setting Midprice    |   ' +
        midPrice.toString()
    )
    Logger.log(
      'PriceDivisionManager    |   Setting Precision    |   ' +
        precision.toString()
    )

    if (this.currentPriceDivisionSetting)
      this.currentPriceDivisionSetting.calculatePriceRange(
        midPrice,
        precision,
        this._columntCount
      )
  }

  addPriceDivisionSetting(priceDivisionSetting: PriceDivisionSetting) {
    this.priceDivisionList?.set(
      priceDivisionSetting.priceRangePercentage,
      priceDivisionSetting
    )
  }

  setCurrentPriceRangePercentage(percentage: PriceRangePercentage) {
    this.currentPriceRangePercentage = percentage
    this.changeCurrentSettingByCurrentDivision()

    if (this.currentPriceDivisionSetting) {
      this.currentPriceDivisionSetting.numDecimalPlaces = Math.max(
        0,
        this.currentPriceDivisionSetting.numDecimalPlaces -
          this.currentDivisionLevel
      )
    }
  }

  larger() {
    const newPriceDivision: PriceRangePercentage = (this
      .currentPriceRangePercentage + 1) as PriceRangePercentage

    if (newPriceDivision > 2) {
      this.priceZoomNoneSound?.start(Tone.now())
    } else {
      this.priceZoomOutSound?.start(Tone.now())
      this.currentPriceRangePercentage = newPriceDivision

      this.changeCurrentSettingByCurrentDivision()

      if (this.currentPriceDivisionSetting) {
        this.currentPriceDivisionSetting.numDecimalPlaces = Math.max(
          0,
          this.currentPriceDivisionSetting.numDecimalPlaces -
            this.currentDivisionLevel
        )
        // this.currentPriceDivisionSettings.divisionLevel = this.currentDivisionLevel;
        this._priceDivisionChanged.dispatch(
          this,
          this.currentPriceDivisionSetting
        )
      }
    }
  }

  smaller() {
    const newPriceDivision = this.currentPriceRangePercentage - 1

    if (newPriceDivision < 0) {
      this.priceZoomNoneSound?.start(Tone.now())
    } else {
      this.priceZoomInSound?.start(Tone.now())
      this.currentPriceRangePercentage = newPriceDivision

      this.changeCurrentSettingByCurrentDivision()

      if (this.currentPriceDivisionSetting) {
        this.currentPriceDivisionSetting.numDecimalPlaces = Math.max(
          0,
          this.currentPriceDivisionSetting.numDecimalPlaces -
            this.currentDivisionLevel
        )
        this._priceDivisionChanged.dispatch(
          this,
          this.currentPriceDivisionSetting
        )
      }
    }
  }

  changeCurrentSettingByCurrentDivision() {
    const newPriceDivisionSettings = new PriceDivisionSetting()
    const originalSetting = this.priceDivisionList?.get(
      this.currentPriceRangePercentage
    )

    if (originalSetting) {
      newPriceDivisionSettings.copy(originalSetting)
      this._currentPriceDivisionSettings = newPriceDivisionSettings
    }
  }

  get currentPriceDivisionSetting() {
    return this._currentPriceDivisionSettings
  }

  get onPriceDivsionChanged() {
    return this._priceDivisionChanged.asEvent()
  }
}
