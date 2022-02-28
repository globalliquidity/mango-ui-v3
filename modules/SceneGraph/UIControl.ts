import * as bjs from '@babylonjs/core/Legacy/legacy'
import { Scene } from './Scene'
import { SceneElement } from './SceneElement'
import { DockingPosition } from './Enums'

export class UIControl extends SceneElement {
  public moveable!: boolean
  public resizable!: boolean
  public collapsible!: boolean

  public isDocked!: boolean

  constructor(
    name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: Scene,
    public width: number,
    public height: number,
    public dockingPosition: DockingPosition,
    public offset: bjs.Vector3
  ) {
    super(name, x, y, z, scene)
  }

  async create() {
    super.create()
  }

  protected onCreate() {}

  public getBounding() {
    return new bjs.Vector2(this.width, this.height)
  }

  public setPosition(position: bjs.Vector3) {
    this.position = position
    this.onFormat()
  }

  public show() {
    this.setEnabled(true)
  }

  public hide() {
    this.setEnabled(false)
  }

  protected onPreRender() {}
}
