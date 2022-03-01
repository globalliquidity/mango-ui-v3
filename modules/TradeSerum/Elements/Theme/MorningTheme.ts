import { AssetManager } from '@/modules//SceneGraph/AssetManager'
import { Scene } from '@/modules/SceneGraph/Scene'
import { Theme } from './Theme'

export class MorningTheme extends Theme {
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
      const asset = AssetManager.Instance().getAsyncAsset('MorningSkyRipple1')
      if (asset && asset.cubeTexture) {
        this.settings.skyboxTexture = asset.cubeTexture.clone()
        this.settings.skyboxTexture.name = 'MorningThemeHighVersion'
      }
    } else {
      const asset = AssetManager.Instance().getAsset('MorningSkyRipple')
      if (asset && asset.cubeTexture) {
        this.settings.skyboxTexture = asset.cubeTexture.clone()
        this.settings.skyboxTexture.name = 'MorningThemeLowVersion'
      }
    }
  }

  protected makeSkybox() {
    if (this.settings.skyboxTexture) {
      let envTexture

      const asset = AssetManager.Instance().getAsset('TokyoNightBlur')

      if (asset && asset.cubeTexture) {
        envTexture = asset.cubeTexture.clone()
      }

      this.scene.bjsScene.environmentTexture = envTexture //this.settings.skyboxTexture;
      this.generateSkybox(1000, this.settings.skyboxTexture)
      this.scene.hdrSkybox = this.skybox
    }
  }

  protected onApply() {
    super.onApply()

    if (this.skybox) {
      this.skybox.rotation.y = (Math.PI / 2) * 3
      this.skybox.position.y = -25
    }
  }
}
