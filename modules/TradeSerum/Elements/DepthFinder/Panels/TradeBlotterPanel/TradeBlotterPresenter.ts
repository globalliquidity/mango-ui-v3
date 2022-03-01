import * as bjs from '@babylonjs/core/Legacy/legacy'
import currency from 'currency.js'
import { EventDispatcher } from 'strongly-typed-events'

import { GLSGColor } from '@/modules/SceneGraph/Enums'
import { TradeStatus } from '@/modules/TradeSerum/Enums'

import { TradeBlotterRow } from './TradeBlotterRow'
import { TradeBlotterItem } from './TradeBlotterItem'
import { TradeBlotterUpdateMessage } from './TradeBlotterUpdateMessage'
import { PanelPresenter } from '@/modules/SceneGraph/PanelPresenter'
import { Trade } from '@/modules/TradeSerum/Market/Trade'
import { PanelRow } from '@/modules/SceneGraph/PanelRow'

export class TradeBlotterPresenter extends PanelPresenter {
  public cellWidth = 1
  public cellHeight = 1
  public cellScale: bjs.Vector3 = new bjs.Vector3(0.4, 0.4, 0.4)
  // public headHeight: number = 0.65;

  public startOffsetX = 0

  public headStartOffsetY = -0.1
  public bodyStartOffsetY = 0

  public currentGeneration = 0
  public currentCapital = 0

  public pageStart = 0
  public pageEnd = 0

  public fields: Array<string> = ['OPEN', 'CLOSE', 'PNL', 'SCORE']
  public fixedRow: TradeBlotterRow

  private _addedNewRow = new EventDispatcher<
    TradeBlotterPresenter,
    TradeBlotterRow
  >()
  private _updatedRow = new EventDispatcher<
    TradeBlotterPresenter,
    TradeBlotterRow
  >()
  private _removedLastRow = new EventDispatcher<
    TradeBlotterPresenter,
    TradeBlotterRow
  >()

  isReady = false
  isAddingRow = false

  private commissionRate = 25

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

    this.fixedRow = new TradeBlotterRow(columnCount, 0, 0)

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
      const item: TradeBlotterItem = new TradeBlotterItem(this.fields[i], i)
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

  protected processMessage(message: TradeBlotterUpdateMessage) {
    //console.log(message);
    if (message.trade.status === TradeStatus.Open) {
      this.isAddingRow = true
      this.addRowToPresenter(message.trade)
      this._addedNewRow.dispatch(this, this.rows[0] as TradeBlotterRow)
      this.currentGeneration++
      this.isAddingRow = false
    } else if (message.trade.status === TradeStatus.Closed) {
      this.updateRowInPresenter(message.trade)
      this._updatedRow.dispatch(this, this.rows[0] as TradeBlotterRow)
    }
  }

  redrawRows(trades: Trade[]) {
    // this.currentGeneration = 0;
    this.isAddingRow = true

    for (let i = 0; i < trades.length; i++) {
      this.addRowToPresenter(trades[i])
      // this._addedNewRow.dispatch(this,this.rows[0] as DepthFinderRow);
      // this.currentGeneration ++;
    }

    this.isAddingRow = false
  }

  protected addRowToPresenter(trade: Trade) {
    let row: TradeBlotterRow

    let newRowStartingIndex = 0
    let positionOffsetY = 0

    newRowStartingIndex = this.currentGeneration % this.rowCount
    // positionOffsetY = this.bodyStartOffsetY - newRowStartingIndex * this.cellHeight;
    positionOffsetY = this.bodyStartOffsetY

    if (this.rows.length === this.rowCount) {
      const lastRow: TradeBlotterRow = this.removeLastRow()

      if (lastRow) {
        this._removedLastRow.dispatch(this, lastRow)
      }
    }

    // const len = blotter.trades.length;

    if (trade) {
      row = new TradeBlotterRow(
        this.columnCount,
        newRowStartingIndex,
        positionOffsetY
      )

      // const trade = blotter.trades[len - 1];

      const openingPrice: currency = trade.openingOrder.price
      // const closingPrice: currency = trade.closingOrder.price;
      // const quantity: number = trade.closingOrder.quantity;
      // const closedPnL: currency = trade.closedPnL;
      // this.currentCapital += trade.closedPnL.value;

      const score = Number(this.currentCapital.toFixed(0))

      const items: Array<TradeBlotterItem> = new Array<TradeBlotterItem>()

      row.setStatus(trade.status)
      row.setDirection(trade.direction)

      for (let i = 0; i < this.columnCount; i++) {
        const item: TradeBlotterItem = new TradeBlotterItem(this.fields[i], i)
        item.initialize()
        item.positionOffset = new bjs.Vector2(
          i * this.cellWidth + this.startOffsetX,
          positionOffsetY
        )
        item.color = GLSGColor.Yellow
        item.scaling = this.cellScale
        item.isVisible = true
        items.push(item)

        row.addPanelItem(this.fields[i], item)
      }

      //items[0].setTradeID(tradeID);
      items[0].setOpeningPrice(openingPrice)
      items[0].color = GLSGColor.Blue
      // items[2].setClosingPrice(closingPrice);
      items[1].setClosingPrice(currency(0))
      items[1].color = GLSGColor.Pink
      // items[3].setClosedPnL(closedPnL);
      //items[2].setOpenPnL(openPnL);
      items[3].setScore(score)

      if (score > 0) {
        items[3].color = GLSGColor.Green
      } else {
        items[3].color = GLSGColor.Red
      }

      this.addRow(row)

      if (!this.isReady) this.isReady = true
    }
  }

  protected updateRowInPresenter(trade: Trade) {
    const currentRow: TradeBlotterRow = this.getCurrentRow() as TradeBlotterRow
    const closingPrice: currency = trade.closingOrder
      ? trade.closingOrder?.price
      : currency(0)

    if (trade.closedPnL) {
      const closedPnL: currency = trade.closedPnL
      const closedPnLWithCommission: currency = trade.closedPnL.subtract(
        this.commissionRate * 2
      )

      this.currentCapital += closedPnLWithCommission.value

      currentRow.setStatus(trade.status)

      const itemClosingPrice = currentRow.getItemByColumnName(
        this.fields[1]
      ) as TradeBlotterItem
      const itemClosedPnL = currentRow.getItemByColumnName(
        this.fields[2]
      ) as TradeBlotterItem
      const itemScore = currentRow.getItemByColumnName(
        this.fields[3]
      ) as TradeBlotterItem
      // const score: number = this.currentCapital;
      const score = Number(this.currentCapital.toFixed(0))

      itemClosingPrice.setClosingPrice(closingPrice)
      itemClosedPnL.setClosedPnL(closedPnLWithCommission)
      itemScore.setScore(score)

      if (closedPnL.value > 0) {
        itemClosedPnL.color = GLSGColor.Green
        currentRow.setWinOrLoss(true)
      } else {
        itemClosedPnL.color = GLSGColor.Red
        currentRow.setWinOrLoss(false)
      }

      if (score > 0) {
        itemScore.color = GLSGColor.Green
      } else {
        itemScore.color = GLSGColor.Red
      }
    }
  }

  public resetBlotter() {
    this.rows = new Array<PanelRow>()
    this.isReady = true
    this.isAddingRow = false
    this.currentGeneration = 0
    this.currentCapital = 0
  }

  //Remove Last Row and return the number of particles that were in the row.
  public removeLastRow(): TradeBlotterRow {
    const backRow: TradeBlotterRow = this.rows.pop() as TradeBlotterRow
    return backRow
  }

  public getNewRowFromBack(): TradeBlotterRow {
    const backRow: TradeBlotterRow = this.rows.pop() as TradeBlotterRow
    backRow.initialize()
    return backRow
  }

  public addRow(row: TradeBlotterRow) {
    this.rows.unshift(row)
    //console.log("DepthFinderPresent : added row to front");

    if (this.rows.length > this.rowCount) {
      this.pageStart = this.pageStart + 1
      this.pageEnd = this.pageEnd + 1
    }

    // for (let i = this.rows.length; i > this.rows.length - this.rowCount; i++)

    for (let i = this.pageStart; i <= this.pageEnd; i++) {
      // if (this.pageStart < 0) continue;
      // if (this.pageEnd > this.rows.length - 1) continue;

      if (i < 0) continue
      if (i > this.rows.length - 1) break

      const index = this.rows.length - 1 - i

      for (let j = 0; j < this.columnCount; j++) {
        const item: TradeBlotterItem = this.rows[index].getItemByIndex(
          j
        ) as TradeBlotterItem

        if (item) {
          item.positionOffset.y = this.bodyStartOffsetY - i * this.cellHeight
        }
      }
    }
  }
}
