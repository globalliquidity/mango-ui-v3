import * as bjs from '@babylonjs/core/Legacy/legacy'
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { Scene } from '@/modules/SceneGraph/Scene'
import { WaterMaterial } from '@babylonjs/materials/legacy/legacy'
import OnlineAssets from '@/assets/OnlineAssets'

export class WaterFloor extends SceneElement {
  public water?: bjs.Mesh
  public waterMaterial?: WaterMaterial

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    scene: Scene
  ) {
    super(name, x, y, z, scene)
    this.create()
  }

  protected onCreate() {
    // Water material
    this.waterMaterial = this.generateWaterMaterial(this.scene.bjsScene)

    // Water mesh
    this.water = bjs.Mesh.CreateGround(
      'waterMesh',
      768,
      768,
      32,
      this.scene.bjsScene,
      false
    )
    this.water.position.y = 0
    this.water.material = this.waterMaterial
    this.waterMaterial.addToRenderList(this.scene.hdrSkybox)
    this.water.parent = this
  }

  public addMeshToWater(mesh: bjs.Mesh) {
    this.waterMaterial?.addToRenderList(mesh)
  }

  protected onRender() {}

  generateWaterMaterial = (scene: bjs.Scene): WaterMaterial => {
    //Water Material
    const waterMaterial: WaterMaterial = new WaterMaterial(
      'waterMaterial',
      scene,
      new bjs.Vector2(512, 512)
    )
    waterMaterial.bumpTexture = new bjs.Texture(
      OnlineAssets.Images.pngWaterbump,
      scene
    )
    waterMaterial.windForce = -1
    waterMaterial.waveHeight = 0.1
    waterMaterial.bumpHeight = 0.1
    waterMaterial.waveLength = 0.25
    waterMaterial.waveSpeed = 1.0
    waterMaterial.colorBlendFactor = 0
    waterMaterial.windDirection = new bjs.Vector2(0, 1)
    waterMaterial.colorBlendFactor = 0

    return waterMaterial
  }

  protected onDisposing() {
    this.water?.dispose()
  }
}
