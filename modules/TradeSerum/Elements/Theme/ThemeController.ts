// import * as bjs from '@babylonjs/core/Legacy/legacy';
import { SceneElement } from '@/modules//SceneGraph/SceneElement'
import { Theme } from './Theme'
import { Scene } from '@/modules//SceneGraph/Scene'

export class ThemeController extends SceneElement {
  themes: Array<Theme> = new Array<Theme>()
  activeTheme: Theme | undefined
  activeThemeIndex = 0

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: Scene
  ) {
    super(name, x, y, z, scene)
    this.create()
  }

  addTheme(name: string, theme: Theme) {
    theme.setEnabled(false)
    this.addChild(theme)
    this.themes.push(theme)
  }

  applyThemeByIndex(_index: number) {}

  applyTheme(index: number) {
    if (index < this.themes.length) {
      const newTheme: Theme | undefined = this.themes[index]

      if (newTheme) {
        if (this.activeTheme !== undefined) {
          if (this.activeTheme) {
            this.activeTheme.remove()
          }
        }

        this.activeTheme = newTheme
        this.activeThemeIndex = index
        this.activeTheme?.setEnabled(true)
        this.activeTheme?.apply()
      }
    }
  }

  public nextTheme(): void {
    if (this.activeThemeIndex < this.themes.length - 1) {
      this.applyTheme(this.activeThemeIndex + 1)
    } else {
      this.applyTheme(0)
    }
  }

  protected onCreate() {}

  protected onRender() {}
}
