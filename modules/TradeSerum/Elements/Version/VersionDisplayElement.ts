import * as bjs from '@babylonjs/core/Legacy/legacy'
import { Scene } from '@/modules//SceneGraph/Scene'
import { TextMeshString } from '@/modules//SceneGraph/TextMeshString'
import {
  GLSGColor,
  HorizontalAlignment,
  VerticalAlignment,
} from '@/modules//SceneGraph/Enums'
import { UIControl } from '@/modules//SceneGraph/UIControl'
import { DockingPosition } from '@/modules/SceneGraph/Enums'

export class VersionDisplayElement extends UIControl {
  versionLabel: TextMeshString | undefined

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: Scene
  ) {
    super(
      name,
      x,
      y,
      z,
      scene,
      3,
      5,
      DockingPosition.BOTTOM_LEFT,
      new bjs.Vector3(0, 0, 0)
    )
    this.create()
  }

  protected onCreate() {
    console.log('process.env_______________________')
    console.log(process.env.NODE_ENV)
    this.versionLabel = new TextMeshString(
      'Version',
      0,
      0,
      0,
      this.scene,
      `V ${process.env.APP_VERSION || '0.1.3'}`,
      1.5,
      HorizontalAlignment.Center,
      VerticalAlignment.Top,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.versionLabel.setColor(GLSGColor.HotPink)
    this.addChild(this.versionLabel)
    // this.scaling = new bjs.Vector3(0.05,0.05,0.05);
    // this.position = new bjs.Vector3(x - 0.17, -y + 0.015 , this.radius);
  }

  public getBounding() {
    const labelScale = this.versionLabel ? this.versionLabel.textScale : 1.5

    return new bjs.Vector2(labelScale * 7, labelScale)
  }

  protected onRender() {}
}
