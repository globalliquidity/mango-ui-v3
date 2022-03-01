import { ExchangeOrder } from '../Market/ExchangeOrder'
import { MarketDataSampler } from '../Market/MarketDataSampler'
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { TradeSerumScene } from '../TradeSerumScene'

export class ExchangeOrderSceneElement extends SceneElement {
  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: TradeSerumScene,
    public sampler: MarketDataSampler,
    public order: ExchangeOrder,
    public generation: number
  ) {
    super(name, x, y, z, scene)
  }
}
