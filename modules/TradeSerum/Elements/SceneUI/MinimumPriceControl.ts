import * as bjs from '@babylonjs/core/Legacy/legacy'
import currency from 'currency.js'
import { LocalTradingSession } from '../LocalTradingSession'
import { Scene } from '@/modules/SceneGraph/Scene'
import { TextMeshString } from '@/modules/SceneGraph/TextMeshString'
import {
  GLSGColor,
  HorizontalAlignment,
  VerticalAlignment,
} from '@/modules/SceneGraph/Enums'
import { UIControl } from '@/modules/SceneGraph/UIControl'
import { DockingPosition, SceneFormatType } from '@/modules/SceneGraph/Enums'
import { PriceDivisionManager } from '../../PriceDivision/PriceDivisionManager'

export class MinimumPriceControl extends UIControl {
  priceLabel?: TextMeshString

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: Scene,
    public tradingSession: LocalTradingSession
  ) {
    super(
      name,
      x,
      y,
      z,
      scene,
      32,
      4,
      DockingPosition.BOTTOM_LEFT,
      new bjs.Vector3(0, 0.2, 0)
    )
    this.create()
  }

  protected onCreate() {
    this.priceLabel = new TextMeshString(
      'Mid Price Center',
      0,
      3.9,
      0,
      this.scene,
      '000',
      2.5,
      HorizontalAlignment.Left,
      VerticalAlignment.Middle,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.priceLabel.setColor(GLSGColor.SkyBlue)
    this.addChild(this.priceLabel)
  }

  public getBounding() {
    const labelScale = this.priceLabel ? this.priceLabel.textScale : 4
    return new bjs.Vector2(labelScale, labelScale)
  }

  protected onFormat() {
    if (this.scene.sceneType === SceneFormatType.Portrait) {
      this.offset.y = 1.2
    } else {
      this.offset.y = 0.2
    }
  }

  protected onPreRender() {
    //let midPrice : currency | undefined = MarketDataClient.Instance.currentMarketDataUpdate?.midPrice;
    const minimumPrice: currency | undefined =
      PriceDivisionManager.Instance.currentPriceDivisionSetting?.minimumPrice

    if (minimumPrice) {
      this.priceLabel?.setText(minimumPrice.toString())
    }
  }
}
