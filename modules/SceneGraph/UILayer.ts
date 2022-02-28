import * as bjs from '@babylonjs/core/Legacy/legacy'
import { Scene } from './Scene'
import { SceneElement } from './SceneElement'
import { DockingPosition, SceneFormatType } from './Enums'
import { UIControl } from './UIControl'

export class UILayer extends SceneElement {
  controls: Map<string, UIControl> = new Map<string, UIControl>()

  public topLeft: bjs.Vector3 = new bjs.Vector3(0, 0, 0)
  public bottomLeft: bjs.Vector3 = new bjs.Vector3(0, 0, 0)
  public topRight: bjs.Vector3 = new bjs.Vector3(0, 0, 0)
  public bottomRight: bjs.Vector3 = new bjs.Vector3(0, 0, 0)

  public center: bjs.Vector3 = new bjs.Vector3(0, 0, 0)

  public aspectRatio = 1
  public tangentRate = 1

  constructor(
    name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: Scene,
    public distance: number
  ) {
    super(name, x, y, z, scene)
    // this.create();
  }

  async create() {
    super.create()

    this.scene.bjsScene.onBeforeRenderObservable.add(() => {
      this.getFourCorners()
    })
  }

  public addUIControl(control: UIControl) {
    this.controls.set(control.name, control)
    this.addChild(control)
  }

  public removeUIControl(_name: string) {}

  public getFourCorners() {
    // let fov = this.scene.camera.fov;
    // let tangentRate = Math.tan(fov / 2);
    // let aspectRatio = this.scene.bjsScene.getEngine().getAspectRatio(this.scene.camera);
    const y = this.distance * this.tangentRate
    const x = y * this.aspectRatio

    this.topLeft = new bjs.Vector3(-x, y, this.distance)
    this.topRight = new bjs.Vector3(x, y, this.distance)
    this.bottomLeft = new bjs.Vector3(-x, -y, this.distance)
    this.bottomRight = new bjs.Vector3(x, -y, this.distance)

    this.center = new bjs.Vector3(2 * x, 2 * y, this.distance)
  }

  public setLayout() {
    if (this.topLeft && this.topRight && this.bottomLeft && this.bottomRight) {
      this.controls.forEach((control) => {
        const boundingInfo = control.getBounding()

        if (boundingInfo) {
          const dockingPosition: DockingPosition = control.dockingPosition
          const radius =
            this.scene.sceneType === SceneFormatType.Portrait ? 42 : 85
          const distBaseScale = this.distance / radius //this.distance / this.scene.camera.radius;

          const halfWidth = (boundingInfo.x / 2) * distBaseScale
          const halfHeight = (boundingInfo.y / 2) * distBaseScale
          const position = new bjs.Vector3()

          position.z = this.distance

          switch (dockingPosition) {
            case DockingPosition.TOP_LEFT:
              position.x = this.topLeft.x + halfWidth + control.offset.x
              position.y = this.topLeft.y - halfHeight - control.offset.y
              break
            case DockingPosition.TOP_RIGHT:
              position.x = this.topRight.x - halfWidth - control.offset.x
              position.y = this.topRight.y - halfHeight - control.offset.y
              break
            case DockingPosition.BOTTOM_LEFT:
              position.x = this.bottomLeft.x + halfWidth + control.offset.x
              position.y = this.bottomLeft.y + halfHeight + control.offset.y
              break
            case DockingPosition.BOTTOM_RIGHT:
              position.x = this.bottomRight.x - halfWidth - control.offset.x
              position.y = this.bottomRight.y + halfHeight + control.offset.y
              break
            case DockingPosition.TOP:
              position.y = this.topLeft.y - halfHeight - control.offset.y
              break
            case DockingPosition.BOTTOM:
              position.y = this.bottomLeft.y + halfHeight + control.offset.y
              break
            case DockingPosition.LEFT:
              position.x = this.topLeft.x + halfWidth + control.offset.x
              break
            case DockingPosition.RIGHT:
              position.x = this.topRight.x - halfWidth - control.offset.x
              break
            case DockingPosition.CENTER:
              position.x = control.offset.x
              position.y = control.offset.y
              break
            default:
              break
          }

          control.setPosition(position)
        }
      })

      this.onFormat()
    }
  }

  public setLayerParams(aspectRatio: number, tangentRate: number) {
    this.aspectRatio = aspectRatio
    this.tangentRate = tangentRate
  }

  protected onPreRender() {
    this.setLayout()
  }
}
