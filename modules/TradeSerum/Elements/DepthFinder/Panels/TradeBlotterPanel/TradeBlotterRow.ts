import { TradeDirection, TradeStatus } from '@/modules/TradeSerum/Enums'

import { PanelRow } from '@/modules/SceneGraph/PanelRow'
import { TradeBlotterItem } from './TradeBlotterItem'

export class TradeBlotterRow extends PanelRow {
  public items: Map<string, TradeBlotterItem> = new Map<
    string,
    TradeBlotterItem
  >()

  public status: TradeStatus = TradeStatus.Created
  public direction?: TradeDirection
  public win = false

  constructor(
    public columnCount: number,
    public rowIndex: number,
    public positionOffsetY: number
  ) {
    super(columnCount, rowIndex)
  }

  public setStatus(status: TradeStatus) {
    this.status = status
  }

  public getStatus() {
    return this.status
  }

  public setDirection(direction: TradeDirection) {
    this.direction = direction
  }

  public getDirection() {
    return this.direction
  }

  public setWinOrLoss(win: boolean) {
    this.win = win
  }

  public isWin() {
    return this.win
  }

  protected onInitialize() {}
}
