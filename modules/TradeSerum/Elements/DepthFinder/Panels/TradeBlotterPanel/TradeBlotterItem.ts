import currency from 'currency.js'
import { TextItem } from '@/modules/SceneGraph/TextItem'

export class TradeBlotterItem extends TextItem {
  public buyPrice?: currency
  public sellPrice?: currency

  public openingPrice?: currency
  public closingPrice?: currency

  public openPnL?: currency
  public closedPnL?: currency

  public pnl: currency = currency(0)

  public score = 0

  constructor(public columnName: string, public columnIndex: number) {
    super(columnName, columnIndex)
  }

  public setOpeningPrice(openingPrice: currency) {
    this.openingPrice = openingPrice
    this.text = openingPrice.format()
  }

  public getOpeningPrice(): currency | undefined {
    return this.openingPrice
  }

  public setClosingPrice(closingPrice: currency) {
    this.closingPrice = closingPrice
    this.text = closingPrice.format()
  }

  public getClosingPrice(): currency | undefined {
    return this.closingPrice
  }

  public setOpenPnL(openPnL: currency) {
    this.openPnL = openPnL
    this.pnl = openPnL
    this.text = openPnL.value.toFixed(0)
  }

  public getOpenPnL(): currency | undefined {
    return this.openPnL
  }

  public setClosedPnL(closedPnL: currency) {
    this.closedPnL = closedPnL
    this.pnl = closedPnL
    this.text = closedPnL.value.toFixed(0)
  }

  public getClosedPnL(): currency | undefined {
    return this.closedPnL
  }

  public setScore(score: number) {
    this.score = score
    this.text = score.toString()
  }

  public getScore(): number | undefined {
    return this.score
  }

  protected onInitialize() {}
}
