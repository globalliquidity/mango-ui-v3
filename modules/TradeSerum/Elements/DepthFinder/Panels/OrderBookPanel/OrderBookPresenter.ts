import * as bjs from '@babylonjs/core/Legacy/legacy'
import { EventDispatcher } from 'strongly-typed-events'

import { GLSGColor } from '@/modules/SceneGraph/Enums'

import { OrderBookRow } from './OrderBookRow'
import { OrderBookItem } from './OrderBookItem'
import { OrderBookUpdateMessage } from './OrderBookUpdateMessage'
import { PanelPresenter } from '@/modules/SceneGraph/PanelPresenter'
import { OrderBook } from '@/modules/TradeSerum/Market/OrderBook'

export class OrderBookPresenter extends PanelPresenter {
  public cellWidth = 3
  public cellHeight = 0.88
  public cellScale: bjs.Vector3 = new bjs.Vector3(0.35, 0.35, 0.35)
  // public headHeight: number = 0.65;

  public startOffsetX = -5.3

  public headStartOffsetY = -0.1
  public bodyStartOffsetY = 3.3

  public currentGeneration = 0

  public pageStart = 0
  public pageEnd = 0

  public fields: Array<string> = [
    'BID QTY',
    'BID PRICE',
    'ASK QTY',
    'ASK PRICE',
  ]
  public fixedRow: OrderBookRow

  private _addedNewRow = new EventDispatcher<OrderBookPresenter, OrderBookRow>()
  private _updatedRow = new EventDispatcher<OrderBookPresenter, OrderBookRow>()
  private _removedLastRow = new EventDispatcher<
    OrderBookPresenter,
    OrderBookRow
  >()

  isReady = false
  isAddingRow = false

  get onAddedNewRow() {
    return this._addedNewRow.asEvent()
  }

  get onRemovedLastRow() {
    return this._removedLastRow.asEvent()
  }

  get onUpdatedRow() {
    return this._updatedRow.asEvent()
  }

  constructor(
    public width,
    public height,
    public rowCount: number,
    public columnCount: number
  ) {
    super(rowCount, columnCount)

    this.fixedRow = new OrderBookRow(columnCount, 0, 0)

    this.cellWidth = this.width / this.columnCount
    this.cellHeight = this.height / (this.rowCount + 1)

    this.bodyStartOffsetY = this.height / 2 - (this.cellHeight * 3) / 2
    this.startOffsetX = -(
      this.width / 2 -
      (this.cellWidth - this.cellScale.x * 4) / 4
    ) //- ((this.width / 2) - ((this.cellWidth - this.cellScale.x * 4) / 2));

    this.pageStart = 0
    this.pageEnd = this.rowCount - 1

    for (let i = 0; i < this.fields.length; i++) {
      const item: OrderBookItem = new OrderBookItem(this.fields[i], i)
      item.initialize()
      item.setItemAsText(this.fields[i])
      item.positionOffset = new bjs.Vector2(
        i * this.cellWidth + this.startOffsetX,
        0
      )
      item.color = GLSGColor.Cyan
      item.scaling = this.cellScale

      this.fixedRow.addPanelItem(this.fields[i], item)
    }
  }

  protected processMessage(message: OrderBookUpdateMessage) {
    // console.log(message);
    this.isAddingRow = true
    this.addRowToPresenter(message.sample.orders)
    this._addedNewRow.dispatch(this, this.rows[0] as OrderBookRow)
    this.currentGeneration++
    this.isAddingRow = false
  }

  // redrawRows(trades: Trade[])
  // {
  //     // this.currentGeneration = 0;
  //     this.isAddingRow = true;

  //     for (let i = 0; i < trades.length; i++) {
  //         this.addRowToPresenter(trades[i]);
  //         // this._addedNewRow.dispatch(this,this.rows[0] as DepthFinderRow);
  //         // this.currentGeneration ++;
  //     }

  //     this.isAddingRow = false;
  // }

  protected addRowToPresenter(orderBook: OrderBook) {
    let row: OrderBookRow

    let newRowStartingIndex = 0
    let positionOffsetY = 0

    newRowStartingIndex = this.currentGeneration % this.rowCount
    // positionOffsetY = this.bodyStartOffsetY - newRowStartingIndex * this.cellHeight;
    positionOffsetY = this.bodyStartOffsetY

    if (this.rows.length === this.rowCount) {
      const lastRow: OrderBookRow = this.removeLastRow()

      if (lastRow) {
        this._removedLastRow.dispatch(this, lastRow)
      }
    }

    // const len = blotter.trades.length;

    if (orderBook) {
      this.rows = []

      for (let i = 0; i < this.rowCount; i++) {
        if (orderBook.asks.length < i || orderBook.bids.length < i) break

        positionOffsetY = this.bodyStartOffsetY - i * this.cellHeight

        row = new OrderBookRow(
          this.columnCount,
          newRowStartingIndex,
          positionOffsetY
        )

        // const tradeID = this.currentGeneration + 1;
        const buyPrice = orderBook.bids[i].price
        const buyQty = orderBook.bids[i].quantity
        const sellPrice = orderBook.asks[i].price
        const sellQty = orderBook.asks[i].quantity

        const items: Array<OrderBookItem> = new Array<OrderBookItem>()

        for (let j = 0; j < this.columnCount; j++) {
          const item: OrderBookItem = new OrderBookItem(this.fields[j], j)
          item.initialize()
          item.positionOffset = new bjs.Vector2(
            j * this.cellWidth + this.startOffsetX,
            positionOffsetY
          )
          item.color = GLSGColor.Yellow
          item.scaling = this.cellScale
          item.isVisible = true
          items.push(item)

          row.addPanelItem(this.fields[j], item)
        }

        items[0].setBuyQuantity(buyQty)
        items[1].setBuyPrice(buyPrice)
        items[1].color = GLSGColor.Blue

        items[2].setSellQuantity(sellQty)
        items[3].setSellPrice(sellPrice)
        items[3].color = GLSGColor.Pink

        this.rows.push(row)
      }

      // this.addRow(row);

      if (!this.isReady) this.isReady = true
    }
  }

  //Remove Last Row and return the number of particles that were in the row.
  public removeLastRow(): OrderBookRow {
    const backRow: OrderBookRow = this.rows.pop() as OrderBookRow
    return backRow
  }

  public getNewRowFromBack(): OrderBookRow {
    const backRow: OrderBookRow = this.rows.pop() as OrderBookRow
    backRow.initialize()
    return backRow
  }

  public addRow(row: OrderBookRow) {
    this.rows.unshift(row)
    //console.log("DepthFinderPresent : added row to front");
  }
}
