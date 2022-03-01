import { PresenterUpdateMessage } from '@/modules/SceneGraph/PresenterUpdateMessage'
import { MarketDataSample } from '@/modules/TradeSerum/Market/MarketDataSample'

export class OrderBookUpdateMessage extends PresenterUpdateMessage {
  constructor(public sample: MarketDataSample) {
    super()
  }
}
