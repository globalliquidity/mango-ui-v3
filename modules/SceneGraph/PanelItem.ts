import * as bjs from '@babylonjs/core/Legacy/legacy'
import { GLSGColor } from './Enums'

export class PanelItem {
  public isVisible = false

  public positionOffset: bjs.Vector2 = new bjs.Vector2(0, 0)
  public scaling: bjs.Vector3 = new bjs.Vector3(1, 1, 1)

  public color: GLSGColor = GLSGColor.Blue

  constructor(public columnName: string, public columnIndex: number) {}

  public initialize() {
    this.isVisible = false
    this.positionOffset.set(0, 0)
    this.color = GLSGColor.Blue

    this.onInitialize()
  }

  protected onInitialize() {}
}
