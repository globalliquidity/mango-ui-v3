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

export class BaseCurrencyBalanceDisplayElement extends UIControl {
  baseCurrency = 'SOL'
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
      DockingPosition.TOP_RIGHT,
      new bjs.Vector3(0, 0, 0)
    )
    this.create()
  }

  protected onCreate() {
    this.walletBalanceText = new TextMeshString(
      'Base Balance',
      0,
      0,
      0,
      this.scene,
      '0',
      0.35,
      HorizontalAlignment.Right,
      VerticalAlignment.Top,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.walletBalanceText.setColor(GLSGColor.Orange)
    this.walletBalanceText.setPosition(-0.35, -0.75, 0)
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
      HorizontalAlignment.Right,
      VerticalAlignment.Middle,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.unsettledLabelText.setColor(GLSGColor.Orange)
    this.unsettledLabelText.setPosition(-1.4, -0.88, 0)
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
      HorizontalAlignment.Right,
      VerticalAlignment.Top,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.unsettledBalanceText.setColor(GLSGColor.Orange)
    this.unsettledBalanceText.setPosition(-0.15, -1, 0)
    this.addChild(this.unsettledBalanceText)
    this.unsettledBalanceText?.setText(this.unsettledBalanceString)

    this.setEnabled(false)

    SerumDexUIAdapter.Instance.onWalletConnected.subscribe(
      this.onWalletConnected.bind(this)
    )
    SerumDexUIAdapter.Instance.onWalletDisconnected.subscribe(
      this.onWalletDisconnected.bind(this)
    )

    SerumDexUIAdapter.Instance.onBaseCurrencyChanged.subscribe(
      this.onBaseCurrencyChanged.bind(this)
    )
    SerumDexUIAdapter.Instance.onBaseWalletBalanceChanged.subscribe(
      this.onBaseWalletBalanceChanged.bind(this)
    )
    SerumDexUIAdapter.Instance.onBaseUnsettledBalanceChanged.subscribe(
      this.onBaseUnsettledBalanceChanged.bind(this)
    )

    SerumDexUIAdapter.Instance.onInitializationInProgress.subscribe(
      this.onInitializationInProgress.bind(this)
    )
    SerumDexUIAdapter.Instance.onSettlementComplete.subscribe(
      this.onSettlementComplete.bind(this)
    )
  }

  private onWalletConnected() {
    this.setEnabled(true)
  }

  private onWalletDisconnected() {
    this.setEnabled(false)
    //this.balanceText?.setText("CONNECTING");
  }

  private onBaseCurrencyChanged(baseCurrency: string) {
    this.baseCurrency = baseCurrency
    this.walletBalanceText?.setText(
      this.baseCurrency + ' ' + this.walletBalanceString
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

  private onBaseWalletBalanceChanged(balance: number) {
    Logger.log(
      'ExchangePairDisplayElement : onBaseWalletBalanceChanged : ' + balance
    )

    this.walletBalanceString = balance.toFixed(3)
    this.walletBalanceText?.setText(
      this.baseCurrency + ' ' + balance.toFixed(3)
    )
  }

  private onBaseUnsettledBalanceChanged(balance: number) {
    Logger.log(
      'ExchangePairDisplayElement : onBaseUnsettledBalanceChanged : ' + balance
    )

    this.unsettledBalanceString = balance.toFixed(3)
    this.unsettledBalanceText?.setPosition(-0.35, -1, 0)
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
