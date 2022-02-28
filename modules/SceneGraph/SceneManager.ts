import * as bjs from '@babylonjs/core/Legacy/legacy'
import { Scene } from './Scene'
import Logger from './Logger'
import { ViewportPosition } from './Enums'

export class SceneManager {
  // SceneManager<C extends bjs.Camera>
  private static _instance: SceneManager // SceneManager<bjs.Camera>;
  public scenes: Array<Scene> = new Array<Scene>()
  engine!: bjs.Engine
  canvas!: HTMLCanvasElement

  isInitialized = false

  private constructor() {}

  public LoadScene(
    scene: Scene,
    canvas: HTMLCanvasElement,
    _position: ViewportPosition
  ) {
    Logger.log('SceneManager : Loading Scene')
    if (this.scenes.length === 0) {
      this.engine = new bjs.Engine(
        canvas as HTMLCanvasElement,
        true,
        undefined,
        true
      )
      // this.engine.setHardwareScalingLevel(1 / window.devicePixelRatio);
    }

    Logger.log('SceneManager : Adding Scene : ')
    /* const progressBarHandler: any = $(".progress-bar");
        progressBarHandler.circlos({
            increase: 4
        });
        */
    this.scenes.push(scene)
    this.canvas = canvas

    if (this.engine) {
      if (scene.title === 'emptyScene') {
        scene.initScene(this.engine)
        return
      }

      scene.load(this.engine)
    }

    if (scene.bjsScene && this.scenes.length > 1) {
      scene.bjsScene.autoClear = false
    }

    if (this.engine && !this.isInitialized) {
      this.engine.runRenderLoop(() => {
        this.scenes.forEach((e) => {
          if (e.isActive) {
            e.render()
          }
        })
      })

      window.addEventListener('resize', () => {
        if (this.engine) {
          this.engine.resize()
        }
      })

      this.isInitialized = true
    }
  }

  public clear() {
    this.scenes.forEach((scene: Scene) => {
      scene.unload()
    })

    this.scenes = new Array<Scene>()

    if (this.canvas) {
      const context = this.canvas.getContext('webgl')

      if (context) {
        context.clear(context.COLOR_BUFFER_BIT)
      }
    }
  }

  public static get Instance() {
    // Do you need arguments? Make it a regular static method instead.
    return this._instance || (this._instance = new this())
  }
}
