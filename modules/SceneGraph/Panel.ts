import * as bjs from '@babylonjs/core/Legacy/legacy'
import { Scene } from './Scene'
import Logger from './Logger'
import { DockingPosition, SceneFormatType } from './Enums'
import { UIControl } from './UIControl'

export class Panel extends UIControl {
  material!: bjs.PBRMaterial

  hasHeader = false
  panelPlane!: bjs.Mesh

  constructor(
    name: string,
    public x: number,
    public y: number,
    public z: number,
    scene: Scene,
    public width: number,
    public height: number,
    public dockingPosition: DockingPosition,
    public offset: bjs.Vector3 = new bjs.Vector3(0, 0, 0)
  ) {
    super(name, x, y, z, scene, width, height, dockingPosition, offset)
  }

  protected onCreate() {
    this.createBasePanel()
  }

  public belongToScene(scene: Scene) {
    this.scene = scene
    // this.panelPlane._scene = this.scene.bjsScene;
  }

  public createBasePanel() {
    Logger.log('Creating Panel')

    if (this.scene && this.scene.bjsScene) {
      this.panelPlane = bjs.MeshBuilder.CreatePlane(
        this.name,
        { width: this.width, height: this.height },
        this.scene.bjsScene
      )

      this.material = new bjs.PBRMaterial(
        'Plan Material 1',
        this.scene.bjsScene
      )
      this.material.albedoColor = bjs.Color3.FromInts(0, 12, 32)
      // material.reflectionTexture =  this.scene.hdrTexture as bjs.Nullable<bjs.BaseTexture>;
      this.material.roughness = 1
      this.material.metallic = 0.5
      this.material.alpha = 0.05
      // material.needDepthPrePass = true;
      // this.panelPlane.isPickable = true;
      this.panelPlane.parent = this
      this.panelPlane.material = this.material
      this.panelPlane.position = new bjs.Vector3(this.x, this.y, this.z)
      // this.panel.rotation.x = Math.PI / 3;
      // this.panelPlane.billboardMode = bjs.AbstractMesh.BILLBOARDMODE_ALL;
      // this.parent = this.container;
      // this.registerDraggingBehavior();
    }
  }

  public getBounding() {
    /*
        let width = 1;
        let height = 1;

        let boundingInfo = this.panelPlane.getBoundingInfo();

        if (boundingInfo)
        {
            width = boundingInfo.boundingBox.extendSizeWorld.x * 2;
            height = boundingInfo.boundingBox.extendSizeWorld.y * 2;
        }
        */

    return new bjs.Vector2(this.width, this.height)
  }

  protected onFormat() {
    if (this.scene.sceneType === SceneFormatType.Portrait) {
      // this.rotation.x = Math.PI;
      // this.rotation.z = -Math.PI / 2;
    } else {
      // this.rotation.x = 0;
      // this.rotation.z = 0;
    }
  }

  /*
    protected onPreRender()
    {
        
        if (this.panelPlane != null && this.arcRotateCamera != null) 
        {
            this.panelPlane.rotation.y = -(this.arcRotateCamera.alpha) - Math.PI / 2;
            this.panelPlane.rotation.x = -(this.arcRotateCamera.beta) + Math.PI / 2;
        }
    }
    */
}
