import { AssetManager } from '@/modules//SceneGraph/AssetManager'
import { Theme } from './Theme'
import { Scene } from '@/modules//SceneGraph/Scene'

export class NightTheme extends Theme {
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
        'TokyoNightBlurHigh'
      )
      if (asset && asset.cubeTexture) {
        this.settings.skyboxTexture = asset.cubeTexture.clone()
        this.settings.skyboxTexture.name = 'NightThemeHighVersion'
      }
    } else {
      const asset = AssetManager.Instance().getAsset('TokyoNightBlurLow')
      if (asset && asset.cubeTexture) {
        this.settings.skyboxTexture = asset.cubeTexture.clone()
        this.settings.skyboxTexture.name = 'NightThemeLowVersion'
      }
    }
  }

  protected onApply() {
    super.onApply()
  }
}
