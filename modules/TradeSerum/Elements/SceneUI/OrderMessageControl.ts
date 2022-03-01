import * as bjs from '@babylonjs/core/Legacy/legacy'
// import currency from 'currency.js';
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
// import { MarketDataClient } from '../../Market/MarketDataClient';
import { SerumDexUIAdapter } from '@/modules/TradeSerum/SerumDexUIAdapter'
import Logger from '@/modules/SceneGraph/Logger'
import { SoundPlayer, TradeSounds } from '@/modules/TradeSerum/SoundPlayer'

export class OrderMessageControl extends UIControl {
  orderMessage = ''
  orderMessageText?: TextMeshString
  currentOrderPrice = 0

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
      DockingPosition.BOTTOM,
      new bjs.Vector3(0, 10.0, 0)
    )
    this.create()
  }

  protected onCreate() {
    this.orderMessageText = new TextMeshString(
      'Mid Price Center',
      0,
      0,
      0,
      this.scene,
      '000',
      3,
      HorizontalAlignment.Center,
      VerticalAlignment.Middle,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.orderMessageText.setColor(GLSGColor.SkyBlue)
    this.addChild(this.orderMessageText)

    this.orderMessageText?.setText(this.orderMessage)

    SerumDexUIAdapter.Instance.onWalletConnected.subscribe(
      this.onWalletConnected.bind(this)
    )
    SerumDexUIAdapter.Instance.onWalletDisconnected.subscribe(
      this.onWalletDisconnected.bind(this)
    )

    SerumDexUIAdapter.Instance.onOrderMessageChanged.subscribe(
      this.onOrderMessageChanged.bind(this)
    )
  }

  private onWalletConnected() {
    this.setEnabled(true)
  }

  private onWalletDisconnected() {
    this.setEnabled(false)
    this.orderMessage = ''
    this.orderMessageText?.setText(this.orderMessage)

    //this.balanceText?.setText("CONNECTING");
  }

  public getBounding() {
    const labelScale = this.orderMessageText
      ? this.orderMessageText.textScale
      : 4
    return new bjs.Vector2(labelScale * 8, labelScale)
  }

  protected onFormat() {
    if (this.scene.sceneType === SceneFormatType.Portrait) {
      this.offset.y = 1.2
    } else {
      this.offset.y = 0.2
    }
  }

  protected onPreRender() {}

  private onOrderMessageChanged(orderMessage: string) {
    Logger.log('OrderMessageControl : onOrderMessageChanged : ' + orderMessage)
    if (orderMessage !== undefined && orderMessage !== this.orderMessage) {
      const orderPrice = Number(orderMessage.split(' ')[4])

      if (orderPrice > this.currentOrderPrice) {
        SoundPlayer.Instance.playSound(TradeSounds.POSITION_UP_TICK, -12)
      } else if (orderPrice < this.currentOrderPrice) {
        SoundPlayer.Instance.playSound(TradeSounds.POSITION_DOWN_TICK, -12)
      }

      this.currentOrderPrice = orderPrice

      this.orderMessage = orderMessage
      this.orderMessageText?.setText(this.orderMessage)

      if (this.orderMessage.startsWith('BUY'))
        this.orderMessageText?.setColor(GLSGColor.Green)
      else if (this.orderMessage.startsWith('BID'))
        this.orderMessageText?.setColor(GLSGColor.DarkGreen)
      else if (this.orderMessage.startsWith('SELL'))
        this.orderMessageText?.setColor(GLSGColor.Red)
      else if (this.orderMessage.startsWith('OFFER'))
        this.orderMessageText?.setColor(GLSGColor.DarkRed)
      else this.orderMessageText?.setColor(GLSGColor.Blue)
    }
  }
}
