import * as bjs from '@babylonjs/core/Legacy/legacy'
// import { Scene } from '@/modules/SceneGraph/Scene';
import { TextMeshString } from '@/modules/SceneGraph/TextMeshString'
import {
  GLSGColor,
  HorizontalAlignment,
  VerticalAlignment,
} from '@/modules/SceneGraph/Enums'
import { UIControl } from '@/modules/SceneGraph/UIControl'
import { DockingPosition, SceneFormatType } from '@/modules/SceneGraph/Enums'
// import { EventBus } from '@/modules/SceneGraph/EventBus';
import { TradeSerumScene } from '@/modules/TradeSerum/TradeSerumScene'
import { SerumDexUIAdapter } from '@/modules/TradeSerum/SerumDexUIAdapter'
import Logger from '@/modules/SceneGraph/Logger'

export class ExchangePairDisplayElement extends UIControl {
  exchangePairName = 'SOL/USDC'
  exchangePairText?: TextMeshString

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

    this.exchangePairText = new TextMeshString(
      'Room Name',
      0,
      0,
      0,
      this.scene,
      this.exchangePairName,
      0.5,
      HorizontalAlignment.Left,
      VerticalAlignment.Top,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.exchangePairText.setColor(GLSGColor.Orange)
    this.exchangePairText.setPosition(0.5, -0.5, 0)
    this.addChild(this.exchangePairText)

    this.exchangePairText?.setText(this.exchangePairName)

    SerumDexUIAdapter.Instance.onCurrentMarketChanged.subscribe(
      this.onCurrentMarketChanged.bind(this)
    )
  }

  public getBounding() {
    const labelScale = this.exchangePairText
      ? this.exchangePairText.textScale
      : 1.5

    return new bjs.Vector2(labelScale * 7, labelScale)
  }

  public reset() {
    this.exchangePairText?.setText(this.exchangePairName)
  }

  private onCurrentMarketChanged(currentMarket: string) {
    Logger.log(
      'ExchangePairDisplayElement : onCurrentMarketChanged : ' + currentMarket
    )
    this.exchangePairText?.setText(currentMarket)
  }

  protected onFormat() {
    if (this.exchangePairText) {
      if (this.scene.sceneType === SceneFormatType.Portrait) {
        this.exchangePairText.scaling = new bjs.Vector3(1, 1, 1)
      } else {
        this.exchangePairText.scaling = new bjs.Vector3(0.75, 0.75, 0.75)
      }
    }
  }

  protected onRender() {
    // this.roomName = this.scene.activeRoom.roomTitle + " - " + this.scene.activeRoom.exchangeName;
  }
}
