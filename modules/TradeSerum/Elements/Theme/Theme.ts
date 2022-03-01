import * as bjs from '@babylonjs/core/Legacy/legacy'
// import { SkyMaterial } from '@babylonjs/materials';
import { Scene } from '@/modules//SceneGraph/Scene'
import { SceneElement } from '@/modules//SceneGraph/SceneElement'

export class ThemeSettings {
  skyboxTexturePath = ''
  lutTexturePath = ''
  skyboxTexture!: bjs.CubeTexture
}

export abstract class Theme extends SceneElement {
  settings: ThemeSettings = new ThemeSettings()
  skybox!: bjs.Mesh
  skyboxMaterial!: bjs.StandardMaterial

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: Scene,
    public isHighRes: boolean = false
  ) {
    super(name, x, y, z, scene)
    this.create()
    // this.apply();
  }

  public apply() {
    this.makeSkybox()
    this.onApply()
  }

  public remove() {
    this.skybox.dispose()
    this.onRemove()
  }

  public updateThemeSetting() {}

  protected onRemove() {}

  protected onApply() {}

  public addMeshToWater(_mesh: bjs.Mesh) {}

  protected onCreate() {
    this.updateThemeSetting()
  }

  protected onFormat() {}

  protected onRender() {}

  protected makeSkybox() {
    if (this.settings.skyboxTexture) {
      this.scene.bjsScene.environmentTexture = this.settings.skyboxTexture
      this.generateSkybox(1000, this.settings.skyboxTexture)
      this.scene.hdrSkybox = this.skybox
    }
  }

  protected generateSkybox(_size: number, hdrTexture: bjs.CubeTexture) {
    let tmpSky

    if (this.skybox && !this.skybox.isDisposed()) {
      tmpSky = this.skybox
    }

    this.skybox = bjs.Mesh.CreateBox('hdrSkyBox', 1000.0, this.scene.bjsScene)
    const hdrSkyboxMaterial: bjs.StandardMaterial = new bjs.StandardMaterial(
      'skyBox',
      this.scene.bjsScene
    )
    hdrSkyboxMaterial.backFaceCulling = false
    hdrSkyboxMaterial.reflectionTexture = hdrTexture.clone()
    hdrSkyboxMaterial.reflectionTexture.coordinatesMode =
      bjs.Texture.SKYBOX_MODE
    hdrSkyboxMaterial.disableLighting = true
    this.skybox.material = hdrSkyboxMaterial

    /*
        var skyMaterial = new SkyMaterial("skyMaterial", this.scene.bjsScene);
        skyMaterial.backFaceCulling = false;
        skyMaterial.inclination = 0.42
        //skyMaterial.azimuth = 0.29;
        this.skybox.material = skyMaterial;
        */

    this.skybox.infiniteDistance = true
    //this.skybox.rotation.y = (2 * Math.PI) / 2;
    this.skybox.parent = this
    this.skybox.rotation.y = 0

    if (tmpSky) {
      tmpSky.dispose()
    }
  }
}
