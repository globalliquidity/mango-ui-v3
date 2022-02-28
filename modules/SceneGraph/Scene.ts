import * as bjs from '@babylonjs/core/Legacy/legacy'
import { SceneElement } from './SceneElement'
import Logger from './Logger'
import { AssetManager } from './AssetManager'
import { SceneFormatType } from './Enums'
import { EventBus } from './EventBus'

// const MAXIMUM_CANVAS_WIDTH = 1920;
// const MAXIMUM_CANVAS_HEIGHT = 1080;

export class Scene {
  engine: bjs.Engine | undefined
  bjsScene!: bjs.Scene
  camera!: bjs.ArcRotateCamera
  hdrTexture: bjs.CubeTexture | undefined
  hdrSkybox: bjs.Mesh | undefined
  sceneType: SceneFormatType = SceneFormatType.Portrait
  sceneElements: Array<SceneElement> = new Array<SceneElement>()

  isAssetLoaded = false

  assetsPath: Array<Record<string, unknown>> = []

  fadeLevel = 1.0

  isActive = false
  isShowing = false
  isHiding = false

  isHighResLoaded = false

  postProcess!: bjs.PostProcess
  glowLayer!: bjs.GlowLayer

  // Original canvas size
  private originalWidth = window.innerWidth
  private originalHeight = window.innerHeight

  asyncAssetsLoaded = false

  protected sceneBaseUrl = process.env.REACT_APP_TRADE_RESOURCE_MODELS_BASE_URL

  constructor(public title: string, public canvas: HTMLElement) {}

  public aspectRatio(): number {
    if (this.camera) {
      return this.camera.viewport.height / this.camera.viewport.width
    }

    return 1
  }

  public load(engine: bjs.Engine) {
    this.initScene(engine)
    this.setupCamera()

    this.loadAssets()

    EventBus.Instance.eventHandler.subscribe((p, r) => {
      if (r === 'SCENE_ASSET_LOADED:' + this.title) {
        this.createBaseScene()
      }
    })

    window.addEventListener('beforeunload', () => {
      Logger.log('Scene : Detecting browser close. Destroying engine.')
      //MessageBusManager.Instance.disconnect();
      //GamePlayerManager.Instance.removeLocalPlayerFromActivePlayers();
    })
  }

  public initScene(engine: bjs.Engine) {
    this.engine = engine
    this.bjsScene = new bjs.Scene(engine)

    this.sceneElements = new Array<SceneElement>()
  }

  public unload() {
    this.onUnload()
  }

  protected onUnload() {
    if (this.bjsScene) {
      this.bjsScene.cleanCachedTextureBuffer()
      this.bjsScene.clearCachedVertexData()

      setTimeout(() => this.destroy(), 0)
    }
  }

  public loadAssets() {
    AssetManager.Instance(this.title).init(this)
    if (this.assetsPath.length > 0) {
      AssetManager.Instance(this.title).load(this.assetsPath, () => {
        EventBus.Instance.emit('SCENE_ASSET_LOADED:' + this.title)
        AssetManager.Instance(this.title).reset()
      })
    } else {
      this.createBaseScene()
    }
  }

  public unloadAssets() {
    AssetManager.Instance(this.title).unload(this.assetsPath)
  }

  protected setupCamera() {
    Logger.log('Scene : setupCamera()')
  }

  public initCamera() {
    Logger.log('Scene : initCamera()')
  }

  public attachCamera() {
    if (this.camera && this.bjsScene) {
      this.camera.attachControl(this.canvas, true)
    }
  }

  public detachCamera() {
    this.camera.detachControl()
  }

  public async createBaseScene() {
    Logger.log('Creating Base Scene: ' + this.title)

    /*
        const progressBarHandler: any = $(".progress-bar");
        progressBarHandler.circlos({
            increase: 8
        });
        */

    this.resizeCanvas()
    //this.createScene();

    await this.createScene()
    this.applyPostProcess()

    if (this.bjsScene) {
      this.bjsScene.registerBeforeRender(() => {
        if (this.isShowing) {
          this.fadeLevel = bjs.Scalar.Lerp(this.fadeLevel, 1, 0.2)
          if (this.fadeLevel > 0.99) {
            this.show()

            if (this.title === 'Lobby Scene')
              EventBus.Instance.emit('SHOWN_START_SCENE')
            else if (this.title === 'Bionic Trader')
              EventBus.Instance.emit('SHOWN_TRADING_SCENE')
          }
        } else if (this.isHiding) {
          this.fadeLevel = bjs.Scalar.Lerp(this.fadeLevel, 0, 0.2)
          if (this.fadeLevel < 0.01) {
            this.hide()

            if (this.title === 'Lobby Scene')
              EventBus.Instance.emit('HIDDEN_START_SCENE')
            else if (this.title === 'Bionic Trader')
              EventBus.Instance.emit('HIDDEN_TRADING_SCENE')
          }
        }

        if (this.isActive) {
          this.preRender()
        }
      })

      this.bjsScene.registerAfterRender(() => {
        if (this.isActive) {
          this.postRender()
        }
      })
    }
  }

  protected async createScene() {}

  public show() {
    if (!this.isShowing) {
      this.isShowing = true
      this.isHiding = false
      this.isActive = true
    } else {
      this.fadeLevel = 1
      this.isShowing = false
      this.isHiding = false

      if (!this.asyncAssetsLoaded) {
        AssetManager.Instance(this.title).startAsyncLoad()
        this.asyncAssetsLoaded = true
      }
    }
  }

  public hide() {
    if (!this.isHiding) {
      this.isHiding = true
    } else {
      this.fadeLevel = 0
      this.isActive = false
      this.isHiding = false
      this.isShowing = false
    }
  }

  protected applyPostProcess() {
    bjs.Effect.ShadersStore['fadePixelShader'] =
      'precision highp float;' +
      'varying vec2 vUV;' +
      'uniform sampler2D textureSampler; ' +
      'uniform float fadeLevel; ' +
      'void main(void){' +
      'vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;' +
      'baseColor.a = 1.0;' +
      'gl_FragColor = baseColor;' +
      '}'

    this.postProcess = new bjs.PostProcess(
      'Fade',
      'fade',
      ['fadeLevel'],
      null,
      1.0,
      this.camera
    )
    this.postProcess.onApply = (effect) => {
      effect.setFloat('fadeLevel', this.fadeLevel)
    }
  }

  public AddSceneElement(element: SceneElement) {
    this.sceneElements.push(element)
  }

  public DeleteSceneElement(name: string) {
    this.sceneElements = this.sceneElements.filter(
      (se: SceneElement) => se['name'] !== name
    )
  }

  public format(type: SceneFormatType) {
    this.sceneType = type
    this.sceneElements.forEach((e) => {
      e.format()
    })
    this.onFormat()
  }

  public resizeCanvas() {
    // let eWidth = Math.min(window.innerWidth, MAXIMUM_CANVAS_WIDTH);
    // let eHeight = Math.min(window.innerHeight, MAXIMUM_CANVAS_HEIGHT);
    // let scalingLevelX = window.innerWidth / eWidth;
    // let scalingLevelY = window.innerHeight / eHeight;
    // let scalingLevel = Math.min(scalingLevelX, scalingLevelY);
    //this.engine?.setHardwareScalingLevel(scalingLevel);
  }

  public preRender() {
    if (this.camera != null) {
      this.sceneElements.forEach((e) => {
        e.preRender()
      })
      this.onPreRender()
    }

    if (
      this.originalHeight !== window.innerHeight ||
      this.originalWidth !== window.innerWidth
    ) {
      this.resizeCanvas()

      this.originalWidth = window.innerWidth
      this.originalHeight = window.innerHeight
    }
  }

  public render() {
    if (this.camera != null) {
      this.sceneElements.forEach((e) => {
        e.render()
      })
      this.onRender()

      if (this.bjsScene) {
        this.bjsScene.render()
      }
    }
  }

  public postRender() {
    if (this.camera != null) {
      this.sceneElements.forEach((e) => {
        e.postRender()
      })
      this.onPostRender()
    }
  }

  public removeAll() {
    this.sceneElements.forEach((ele, _index) => {
      const elem = ele as SceneElement
      elem.parent = null
      elem.destroy()
    })

    this.sceneElements = []
  }

  protected destroy() {
    this.removeAll()
    this.postProcess.dispose()
    this.hdrTexture?.dispose()
    this.hdrSkybox?.dispose()

    this.bjsScene.dispose()
    // setTimeout(()=> {this.bjsScene.dispose()}, 1);
  }

  protected onPreRender() {}

  protected onRender() {}

  protected onPostRender() {}

  protected onFormat() {}
}
