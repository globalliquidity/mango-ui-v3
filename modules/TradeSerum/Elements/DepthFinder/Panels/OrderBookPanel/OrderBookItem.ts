import * as currency from 'currency.js'
import { TextItem } from '@/modules/SceneGraph/TextItem'

export class OrderBookItem extends TextItem {
  //public tradeID: number;

  public buyPrice?: currency
  public buyQuantity?: number

  public sellPrice?: currency
  public sellQuantity?: number

  // public status: TradeStatus;

  constructor(public columnName: string, public columnIndex: number) {
    super(columnName, columnIndex)
  }

  public setBuyPrice(buyPrice: currency) {
    this.buyPrice = buyPrice
    this.text = buyPrice.format()
  }

  public getBuyPrice(): currency | undefined {
    return this.buyPrice
  }

  public setBuyQuantity(buyQuantity: number) {
    this.buyQuantity = buyQuantity
    this.text = buyQuantity.toString()
  }

  public getBuyQuantity(): number | undefined {
    return this.buyQuantity
  }

  public setSellPrice(sellPrice: currency) {
    this.sellPrice = sellPrice
    this.text = sellPrice.format()
  }

  public getSellPrice(): currency | undefined {
    return this.sellPrice
  }

  public setSellQuantity(sellQuantity: number) {
    this.sellQuantity = sellQuantity
    this.text = sellQuantity.toString()
  }

  public getSellQuantity(): number | undefined {
    return this.sellQuantity
  }

  protected onInitialize() {}
}
