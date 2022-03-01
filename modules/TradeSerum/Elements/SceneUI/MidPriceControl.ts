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
import { MarketDataClient } from '@/modules/TradeSerum/Market/MarketDataClient'

export class MidPriceControl extends UIControl {
  midPriceLabel?: TextMeshString

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
      DockingPosition.TOP,
      new bjs.Vector3(0, 0.2, 0)
    )
    this.create()
  }

  protected onCreate() {
    this.midPriceLabel = new TextMeshString(
      'Mid Price Center',
      0.5,
      -4,
      0,
      this.scene,
      '000',
      2.5,
      HorizontalAlignment.Center,
      VerticalAlignment.Middle,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.midPriceLabel.setColor(GLSGColor.SkyBlue)
    this.addChild(this.midPriceLabel)
  }

  public getBounding() {
    const labelScale = this.midPriceLabel ? this.midPriceLabel.textScale : 4
    return new bjs.Vector2(labelScale * 8, labelScale)
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
    const midPrice: currency | undefined =
      MarketDataClient.Instance.currentMarketDataUpdate?.midPrice

    if (midPrice) {
      this.midPriceLabel?.setText(midPrice.format())
    }
  }
}
