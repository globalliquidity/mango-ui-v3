import { PresenterUpdateMessage } from '@/modules/SceneGraph/PresenterUpdateMessage'
import { CandleStick } from '@/modules/TradeSerum/Market/CandleStick'

export class CandleChartUpdateMessage extends PresenterUpdateMessage {
  constructor(public candles: CandleStick[]) {
    super()
  }
}
