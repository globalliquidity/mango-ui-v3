import { TradeDirection, TradeStatus } from '@/modules/TradeSerum/Enums'

import { PanelRow } from '@/modules/SceneGraph/PanelRow'
import { OrderBookItem } from './OrderBookItem'

export class OrderBookRow extends PanelRow {
  public items: Map<string, OrderBookItem> = new Map<string, OrderBookItem>()

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

  protected onInitialize() {}
}
