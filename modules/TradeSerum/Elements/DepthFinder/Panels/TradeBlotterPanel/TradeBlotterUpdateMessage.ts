import { PresenterUpdateMessage } from '@/modules/SceneGraph/PresenterUpdateMessage'
import { Trade } from '@/modules/TradeSerum/Market/Trade'

export class TradeBlotterUpdateMessage extends PresenterUpdateMessage {
  constructor(public trade: Trade) {
    super()
  }
}
