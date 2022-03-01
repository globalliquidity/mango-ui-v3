import currency from 'currency.js'

import { VectorFieldRow } from '@/modules/SceneGraph/VectorFieldRow'
import { DepthFinderPresenter } from './DepthFinderPresenter'

export class DepthFinderRow extends VectorFieldRow {
  public insideBidOffsetX = 0
  public insideAskOffsetX = 0

  public insideBidPrice: currency = currency(0)
  public insideAskPrice: currency = currency(0)

  public midPrice: currency = currency(0)

  constructor(
    public presenter: DepthFinderPresenter,
    public cellCount: number,
    public positionOffsetX: number,
    public generation: number,
    public startingIndex: number = 0
  ) {
    super(presenter, cellCount, generation, startingIndex)
  }

  protected onInitialize() {
    this.positionOffsetX = 0
    this.insideBidOffsetX = 0
    this.insideAskOffsetX = 0
    this.insideBidPrice = currency(0)
    this.insideAskPrice = currency(0)
    this.startingIndex = 0
    this.midPrice = currency(0)
  }
}
