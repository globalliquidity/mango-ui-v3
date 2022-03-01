import * as bjs from '@babylonjs/core/Legacy/legacy'
// import { Scene } from '@/modules/SceneGraph/Scene';
import { TextMeshString } from '@/modules/SceneGraph/TextMeshString'
import {
  GLSGColor,
  HorizontalAlignment,
  VerticalAlignment,
} from '@/modules/SceneGraph/Enums'
import { UIControl } from '@/modules/SceneGraph/UIControl'
import { DockingPosition } from '@/modules/SceneGraph/Enums'
// import { EventBus } from '@/modules/SceneGraph/EventBus';
import { TradeSerumScene } from '@/modules/TradeSerum/TradeSerumScene'
import { SerumDexUIAdapter } from '@/modules/TradeSerum/SerumDexUIAdapter'
import Logger from '@/modules/SceneGraph/Logger'

export class QuoteCurrencyBalanceDisplayElement extends UIControl {
  quoteCurrency = 'USDC'

  walletBalanceString = 'CONNECTING'
  walletBalanceText?: TextMeshString

  unsettledLabelText?: TextMeshString
  unsettledBalanceString = 'CONNECTING'
  unsettledBalanceText?: TextMeshString

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: TradeSerumScene
  ) {
    super(
      name,
      x,
      y,
      z,
      scene,
      3,
      5,
      DockingPosition.TOP_LEFT,
      new bjs.Vector3(0, 0, 0)
    )
    this.create()
  }

  protected onCreate() {
    // this.roomName = this.scene.activeRoom.roomTitle + " - " + this.scene.activeRoom.exchangeName;

    this.walletBalanceText = new TextMeshString(
      'Wallet Balance',
      0,
      0,
      0,
      this.scene,
      '0',
      0.35,
      HorizontalAlignment.Left,
      VerticalAlignment.Top,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.walletBalanceText.setColor(GLSGColor.Orange)
    this.walletBalanceText.setPosition(0.35, -0.75, 0)
    this.addChild(this.walletBalanceText)

    this.walletBalanceText?.setText(this.walletBalanceString)

    this.unsettledLabelText = new TextMeshString(
      'Unsettled Label',
      0,
      0,
      0,
      this.scene,
      'UNSETTLED',
      0.15,
      HorizontalAlignment.Left,
      VerticalAlignment.Middle,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.unsettledLabelText.setColor(GLSGColor.Orange)
    this.unsettledLabelText.setPosition(1.15, -0.88, 0)
    this.addChild(this.unsettledLabelText)
    this.unsettledLabelText.setEnabled(false)

    this.unsettledBalanceText = new TextMeshString(
      'Unsettled Balance',
      0,
      0,
      0,
      this.scene,
      '0',
      0.25,
      HorizontalAlignment.Left,
      VerticalAlignment.Top,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.unsettledBalanceText.setColor(GLSGColor.Orange)
    this.unsettledBalanceText.setPosition(0.35, -1, 0)
    this.addChild(this.unsettledBalanceText)
    this.unsettledBalanceText?.setText(this.unsettledBalanceString)

    this.setEnabled(false)

    SerumDexUIAdapter.Instance.onWalletConnected.subscribe(
      this.onWalletConnected.bind(this)
    )
    SerumDexUIAdapter.Instance.onWalletDisconnected.subscribe(
      this.onWalletDisconnected.bind(this)
    )
    SerumDexUIAdapter.Instance.onQuoteCurrencyChanged.subscribe(
      this.onQuoteCurrencyChanged.bind(this)
    )
    SerumDexUIAdapter.Instance.onQuoteWalletBalanceChanged.subscribe(
      this.onQuoteWalletBalanceChanged.bind(this)
    )
    SerumDexUIAdapter.Instance.onQuoteUnsettledBalanceChanged.subscribe(
      this.onQuoteUnsettledBalanceChanged.bind(this)
    )

    SerumDexUIAdapter.Instance.onInitializationInProgress.subscribe(
      this.onInitializationInProgress.bind(this)
    )
    SerumDexUIAdapter.Instance.onSettlementComplete.subscribe(
      this.onSettlementComplete.bind(this)
    )
  }

  public getBounding() {
    const labelScale = this.walletBalanceText
      ? this.walletBalanceText.textScale
      : 1.5

    return new bjs.Vector2(labelScale * 7, labelScale)
  }

  public reset() {
    this.walletBalanceText?.setText(this.walletBalanceString)
    this.unsettledBalanceText?.setText(this.unsettledBalanceString)
  }

  private onWalletConnected() {
    this.setEnabled(true)
  }

  private onWalletDisconnected() {
    this.setEnabled(false)
    //this.balanceText?.setText("CONNECTING");
  }

  private onQuoteCurrencyChanged(quoteCurrency: string) {
    this.quoteCurrency = quoteCurrency
    this.walletBalanceText?.setText(
      this.quoteCurrency + ' ' + this.walletBalanceString
    )
  }

  private onQuoteWalletBalanceChanged(balance: number) {
    Logger.log(
      'ExchangePairDisplayElement : onQuoteWalletBalanceChanged : ' + balance
    )

    this.walletBalanceString = balance.toFixed(3)
    this.walletBalanceText?.setText(
      this.quoteCurrency + ' ' + this.walletBalanceString
    )
  }

  private onQuoteUnsettledBalanceChanged(balance: number) {
    Logger.log(
      'ExchangePairDisplayElement : onQuoteUnsettledBalanceChanged : ' + balance
    )

    this.unsettledBalanceString = balance.toFixed(3)
    this.unsettledBalanceText?.setPosition(2.45, -1, 0)
    this.unsettledBalanceText?.setText(balance.toFixed(3))
    this.unsettledLabelText?.setEnabled(true)
  }

  private onInitializationInProgress() {
    this.unsettledBalanceText?.setText('SYNCHRONIZING')
  }

  private onSettlementComplete() {
    this.unsettledBalanceText?.setText('0.000')
  }

  protected onFormat() {}

  protected onRender() {}
}
