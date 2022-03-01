import { AssetManager } from '@/modules//SceneGraph/AssetManager'
import { SceneFormatType } from '@/modules/SceneGraph/Enums'
import { Scene } from '@/modules/SceneGraph/Scene'
import { Theme } from './Theme'

export class DayTheme extends Theme {
  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: Scene,
    public isHighRes: boolean = false
  ) {
    super(name, x, y, z, scene, isHighRes)
  }

  public updateThemeSetting() {
    if (this.isHighRes) {
      const asset = AssetManager.Instance(this.scene.title).getAsyncAsset(
        'BrighterSkyHigh'
      )
      console.log('loaded high res asset:', asset)
      if (asset && asset.cubeTexture) {
        this.settings.skyboxTexture = asset.cubeTexture.clone()
        this.settings.skyboxTexture.name = 'DayThemeHighVersion'
      }
    } else {
      const asset = AssetManager.Instance().getAsset('BrighterSkyLow')
      if (asset && asset.cubeTexture) {
        this.settings.skyboxTexture = asset.cubeTexture.clone()
        this.settings.skyboxTexture.name = 'DayThemeLowVersion'
      }
    }
  }

  protected onApply() {
    super.onApply()

    if (this.skybox) {
      //this.skybox.rotation.y  = (Math.PI/2) +  (Math.PI/5);
      this.skybox.position.y = 0
    }
  }

  protected onFormat() {
    if (this.skybox) {
      if (this.scene.sceneType === SceneFormatType.Portrait) {
        // this.skybox.rotation.y  = -(Math.PI/4.1);
      } else {
        //this.skybox.rotation.y  = (Math.PI/2) +  (Math.PI/5);
      }
    }
  }
}
