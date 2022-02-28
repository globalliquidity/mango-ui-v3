import { Scene } from './Scene'
import { SceneManager } from './SceneManager'
import { AssetManager } from './AssetManager'
import { ViewportPosition } from './Enums'
import { EventBus } from './EventBus'
import Logger from './Logger'

export class Experience {
  //implements IExperience
  scenes: Map<string, Scene> = new Map<string, Scene>()
  public isAssetLoaded = false
  protected experienceBaseUrl =
    process.env.REACT_APP_TRADE_RESOURCE_MODELS_BASE_URL

  assetsPath: Array<Record<string, unknown>> = []

  constructor(public title: string, public canvas: HTMLCanvasElement) {}

  public load() {
    Logger.log('Experience : load()')
    // this.onLoad();
    this.loadAssets()

    EventBus.Instance.eventHandler.subscribe((p, r) => {
      if (r === 'EXPERIENCE_ASSET_LOADED') {
        Logger.log('EXPERIENCE_ASSET_LOADED___________________')
        //const progressBarHandler: any = $(".progress-bar");
        //progressBarHandler.circlos({
        //    increase: 20
        //});
        this.isAssetLoaded = true
        this.onLoad()
      }
    })
  }

  public unload() {
    this.onUnload()
    this.unloadAssets()
  }

  protected onLoad() {}

  protected onUnload() {}

  public loadAssets() {
    if (this.assetsPath.length > 0) {
      const emptyScene: Scene = new Scene('emptyScene', this.canvas)
      SceneManager.Instance.LoadScene(
        emptyScene,
        this.canvas,
        ViewportPosition.Top
      )
      AssetManager.Instance(emptyScene.title).init(emptyScene)

      AssetManager.Instance(emptyScene.title).load(this.assetsPath, () => {
        EventBus.Instance.emit('EXPERIENCE_ASSET_LOADED')
      })
    } else {
      this.isAssetLoaded = true
      this.onLoad()
    }
  }

  public unloadAssets() {
    AssetManager.Instance('emptyScene').unload(this.assetsPath)
  }

  public AddScene(scene: Scene) {
    this.scenes.set(scene.title, scene)
  }

  public RemoveScene(name: string) {
    this.scenes.delete(name)
  }
}
