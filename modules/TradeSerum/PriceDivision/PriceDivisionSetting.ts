import { PriceRangePercentage } from '../Enums'
import currency from 'currency.js'
import Logger from '@/modules/SceneGraph/Logger'

export class PriceDivisionSetting {
  priceRangePercentage: PriceRangePercentage
  public numDecimalPlaces: number
  _priceDivisionMultiplier?: currency
  divisionLevel = 0

  private _columnPriceRange: currency = currency(0)
  public get columnPriceRange(): currency {
    return this._columnPriceRange
  }

  private _totalPriceRange: currency = currency(0)
  public get totalPriceRange(): currency {
    return this._totalPriceRange
  }

  private _minimumPrice: currency = currency(0)
  public get minimumPrice(): currency {
    return this._minimumPrice
  }

  private _maximumPrice: currency = currency(0)
  public get maximumPrice(): currency {
    return this._maximumPrice
  }

  private _midPrice: currency = currency(0)

  constructor(
    priceRangePercentage: PriceRangePercentage = PriceRangePercentage.OnePercent,
    numDecimalPlaces = 4
  ) {
    this.priceRangePercentage = priceRangePercentage
    this.numDecimalPlaces = numDecimalPlaces
    //this.calculatePriceRange();
  }

  copy(newSetting: PriceDivisionSetting) {
    this.priceRangePercentage = newSetting.priceRangePercentage
    this.numDecimalPlaces = newSetting.numDecimalPlaces
    this._columnPriceRange = newSetting.columnPriceRange
    this._priceDivisionMultiplier = newSetting.priceDivisionMultiplier
    this.divisionLevel = newSetting.divisionLevel
  }

  calculatePriceRange(
    midPrice: currency,
    precision: number,
    columnCount: number
  ) {
    Logger.log(
      'PriceDivisionSetting    |   Calculating Column Price Range for MidPrice   |   ' +
        midPrice.toString()
    )
    this._midPrice = midPrice
    this.numDecimalPlaces = precision
    //let priceRange : currency = currency(0, { precision: this.numDecimalPlaces +2 });

    switch (this.priceRangePercentage) {
      case PriceRangePercentage.OnePercent:
        //const onePercentOfMidprice : currency = currency(midPrice.divide(currency(100,{precision:8})), {precision: 8});
        this._totalPriceRange = currency(midPrice.value / 100, {
          precision: precision + 2,
        })

        Logger.log(
          'PriceDivisionSetting    |   Setting To One Percent   |   Total Column Range: ' +
            this._totalPriceRange.toString()
        )
        Logger.log(
          'PriceDivisionSetting    |   Setting To One Percent   |   Column Price Range: ' +
            this._columnPriceRange.toString()
        )
        break
      case PriceRangePercentage.TwoPercent:
        this._totalPriceRange = currency(midPrice.value / 50, {
          precision: this.numDecimalPlaces + 2,
        })
        //this._columnPriceRange = currency(this._totalPriceRange.value/columnCount), { precision: this.numDecimalPlaces});
        Logger.log(
          'PriceDivisionSetting    |   Setting To Two Percent   |   Column Price Range: ' +
            this._columnPriceRange.toString()
        )
        break
      case PriceRangePercentage.FivePercent:
        this._totalPriceRange = currency(midPrice.value / 20, {
          precision: this.numDecimalPlaces + 2,
        })
        //this._columnPriceRange = currency(this._totalPriceRange.divide(columnCount), { precision: this.numDecimalPlaces});
        Logger.log(
          'PriceDivisionSetting    |   Setting To Five Percent   |   Column Price Range: ' +
            this._columnPriceRange.toString()
        )
        break
      case PriceRangePercentage.TenPercent:
        this._totalPriceRange = currency(midPrice.value / 10, {
          precision: this.numDecimalPlaces + 2,
        })
        //this._columnPriceRange = currency(this._totalPriceRange.divide(columnCount), { precision: this.numDecimalPlaces});
        Logger.log(
          'PriceDivisionSetting    |   Setting To Ten Percent   |   Column Price Range: ' +
            this._columnPriceRange.toString()
        )

        break
      case PriceRangePercentage.OneHundredPercent:
        break
    }

    this._columnPriceRange = currency(
      this._totalPriceRange.value / columnCount,
      { precision: precision + 4 }
    )

    //this._columnPriceRange = priceRange

    const halfPriceRange: currency = currency(this._totalPriceRange.value / 2, {
      precision: this.numDecimalPlaces + 3,
    })
    Logger.log(
      'PriceDivisionSetting    |   Half Price Range: ' +
        halfPriceRange.toString()
    )
    this._minimumPrice = currency(this._midPrice.subtract(halfPriceRange), {
      precision: this.numDecimalPlaces,
    })
    Logger.log(
      'PriceDivisionSetting    |   Minimum Visibe Price: ' +
        this._minimumPrice.toString()
    )

    this._maximumPrice = currency(this._midPrice.add(halfPriceRange), {
      precision: this.numDecimalPlaces,
    })
    Logger.log(
      'PriceDivisionSetting    |   Maximum Visibe Price: ' +
        this._maximumPrice.toString()
    )

    const oneWithPrecision: currency = currency(1, {
      precision: this.numDecimalPlaces,
    })

    this._priceDivisionMultiplier = currency(
      oneWithPrecision.value / this._columnPriceRange.value,
      { precision: this.numDecimalPlaces }
    )
    Logger.log(
      'PriceDivisionSetting    |   Setting PriceDivisionMultiplier: ' +
        this._priceDivisionMultiplier.toString()
    )
  }

  /*
    get priceRange() {
        const newPriceRange = currency(this._priceRange, { precision: 8 });
        return newPriceRange.multiply(Math.pow(10, this.divisionLevel));
    }
    */

  get priceDivisionMultiplier(): currency {
    if (this.columnPriceRange)
      return currency(1.0).divide(this.columnPriceRange)
    else return currency(0)
  }
}
