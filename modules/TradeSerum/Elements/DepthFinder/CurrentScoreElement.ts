import * as bjs from '@babylonjs/core/Legacy/legacy'
import { Scene } from '@/modules/SceneGraph/Scene'
import { TextMeshString } from '@/modules/SceneGraph/TextMeshString'
import { UIControl } from '@/modules/SceneGraph/UIControl'
import {
  GLSGColor,
  HorizontalAlignment,
  VerticalAlignment,
  DockingPosition,
  SceneFormatType,
} from '@/modules/SceneGraph/Enums'
import currency from 'currency.js'
import { LocalTradingSession } from '../LocalTradingSession'

export class CurrentScoreElement extends UIControl {
  currentScoreLabel: TextMeshString | undefined

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
      3,
      5,
      DockingPosition.TOP,
      new bjs.Vector3(0, 2, 0)
    )
    this.create()
  }

  protected onCreate() {
    this.currentScoreLabel = new TextMeshString(
      'Current Score',
      0,
      0,
      0,
      this.scene,
      '0',
      2.5,
      HorizontalAlignment.Center,
      VerticalAlignment.Top,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.currentScoreLabel.setColor(GLSGColor.Aqua)
    this.addChild(this.currentScoreLabel)
  }

  public getBounding() {
    const labelScale = this.currentScoreLabel
      ? this.currentScoreLabel.textScale
      : 2.5
    const len = this.currentScoreLabel?.text
      ? this.currentScoreLabel?.text.length
      : 1

    return new bjs.Vector2(labelScale * len, labelScale)
  }

  protected onFormat() {
    if (this.scene.sceneType === SceneFormatType.Portrait) {
      // this.dockingPosition = DockingPosition.NORTH_EAST;
      this.offset.y = 3
      this.offset.x = 0
    } else {
      // this.dockingPosition = DockingPosition.NORTH;
      this.offset.y = 2
      this.offset.x = 0
    }
  }

  protected onPreRender() {
    if (this.currentScoreLabel != undefined) {
      const currentScore: currency | undefined = this.tradingSession?.closedPnL

      if (currentScore != undefined) {
        if (currentScore.value > 0)
          this.currentScoreLabel.setColor(GLSGColor.Green)
        else if (currentScore.value == 0)
          this.currentScoreLabel.setColor(GLSGColor.SeaBlue)
        else this.currentScoreLabel.setColor(GLSGColor.Red)

        this.currentScoreLabel.setText(currentScore.value.toFixed(0).toString())
      }
    }
  }
}
