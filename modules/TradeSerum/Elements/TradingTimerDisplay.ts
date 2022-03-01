import * as bjs from '@babylonjs/core/Legacy/legacy'
import {
  GLSGColor,
  HorizontalAlignment,
  VerticalAlignment,
} from '@/modules/SceneGraph/Enums'
import { Scene } from '@/modules/SceneGraph/Scene'
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { TextMeshString } from '@/modules/SceneGraph/TextMeshString'
import Logger from '@/modules/SceneGraph/Logger'

export class TradingTimerDisplay extends SceneElement {
  public timeLabel: TextMeshString | undefined

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    scene: Scene,
    public textScale: number = 2
  ) {
    super(name, x, y, z, scene)
    this.create()
  }

  public setText(text: string) {
    if (this.timeLabel) this.timeLabel.setText(text)
  }

  public setTime(time: number) {
    //Logger.log("TradingTimerDisplay : Setting Timer: " + time.toString());

    if (this.timeLabel) this.timeLabel.setText(time.toString())
    else Logger.log('TradingTimerDisplay : No Time Label')
  }

  public setTimerColor(color: GLSGColor) {
    this.timeLabel?.setColor(color)
  }

  public show() {
    this.setEnabled(true)
  }

  public hide() {
    this.setEnabled(false)
  }

  protected onCreate() {
    //Logger.log("TradingTimerDisplay : Creating Timer");

    this.timeLabel = new TextMeshString(
      'Timer',
      0,
      0,
      0,
      this.scene,
      '0',
      this.textScale,
      HorizontalAlignment.Center,
      VerticalAlignment.Top,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.timeLabel.setColor(GLSGColor.Aqua)
    this.addChild(this.timeLabel)
  }

  protected onRender() {}
}
