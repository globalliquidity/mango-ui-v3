import * as bjs from '@babylonjs/core/Legacy/legacy'
import { Scene } from './Scene'
import { GLSGAssetType } from './Enums'
import { GLSGAsset } from './GLSGAsset'
import { LoadAssetHandler, TaskSuccessHandler, TaskErrorHandler } from './Procs'
import { EventBus } from './EventBus'
import Logger from './Logger'

export class AssetManager {
  // private static _instance: AssetManager;
  private static _instances: Map<string, AssetManager> = new Map<
    string,
    AssetManager
  >()

  private assetsManager!: bjs.AssetsManager
  private asyncManager!: bjs.AssetsManager

  public assetMap: Map<string, GLSGAsset> = new Map<string, GLSGAsset>()
  public asyncMap: Map<string, GLSGAsset> = new Map<string, GLSGAsset>()

  // public containerMap: Map<Scene, bjs.AssetContainer> = new Map<Scene, bjs.AssetContainer>();

  public currentScene!: Scene

  private constructor() {}

  public init(scene: Scene) {
    this.currentScene = scene
    bjs.SceneLoader.ShowLoadingScreen = false

    //if (!this.assetsManager) {
    this.assetsManager = new bjs.AssetsManager(scene.bjsScene)
    this.assetsManager.useDefaultLoadingScreen = false
    //}

    //if (!this.asyncManager) {
    this.asyncManager = new bjs.AssetsManager(scene.bjsScene)
    this.asyncManager.useDefaultLoadingScreen = false
    //}
  }

  public reset() {
    if (this.assetsManager) {
      this.assetsManager.reset()
    }
  }

  public load(assets?: any[], finishHandler?: LoadAssetHandler) {
    if (assets) {
      if (finishHandler) {
        this.assetsManager.onFinish = finishHandler
      }

      this.asyncManager.onFinish = (_tasks) => {
        Logger.log('Finish loading async assets')
        //const progressBarHandler: any = $(".progress-bar");
        //progressBarHandler.circlos({
        ///    increase: 15
        // });
        this.currentScene.isHighResLoaded = true
        EventBus.Instance.emit('ASYNC_ASSETS_LOADED')
      }

      for (let i = 0; i < assets.length; i++) {
        if (assets[i].async === true) {
          if (assets[i].type === 'cubetexture') {
            this.addCubeTextureAsyncTask(
              assets[i].name,
              assets[i].url + assets[i].fileName
            )
          }
        } else {
          if (assets[i].type === 'mesh') {
            this.addMeshTask(
              assets[i].name,
              '',
              assets[i].url,
              assets[i].fileName
            )
          } else if (assets[i].type === 'cubetexture') {
            this.addCubeTextureTask(
              assets[i].name,
              assets[i].url + assets[i].fileName
            )
          } else if (assets[i].type === 'hdrtexture') {
            this.addHDRCubeTextureTask(
              assets[i].name,
              assets[i].url + assets[i].fileName
            )
          }
        }
      }

      this.assetsManager.load()
    }
  }

  public startAsyncLoad() {
    this.asyncManager.loadAsync()
  }

  /*
    public import(assets?: any[], finishHandler?: Function) 
    {
        const promises: Array<Promise<void>> = new Array<Promise<void>>();

        if (assets)
        {
            for (let i = 0; i < assets.length; i++) {
                if (assets[i].type === 'mesh') {
                    const promise = bjs.SceneLoader.ImportMeshAsync(null, assets[i].url, assets[i].fileName, this.currentScene.bjsScene).then((result) => {
                        const meshAsset = new GLSGAsset(GLSGAssetType.MODEL, assets[i].url, assets[i].fileName, result.meshes);
                        meshAsset.loadStat = bjs.AssetTaskState.DONE;

                        this.assetMap.set(assets[i].name, meshAsset);
                    });

                    promises.push(promise);
                }
            }
        }
       
        Promise.all(promises).then(() => {
            if (finishHandler) {
                finishHandler();
            }
        });
    }
    */

  public unload(assets: any[]) {
    this.assetsManager.reset()

    if (this.assetMap) {
      for (let i = 0; i < assets.length; i++) {
        if (assets[i].type === 'mesh') {
          const asset: GLSGAsset | undefined = this.getAsset(assets[i].name)

          if (asset) {
            const meshes = asset.meshes

            if (meshes) {
              for (let j = 0; j < meshes.length; j++) {
                meshes[i].dispose()
              }
            }
          }
          this.assetMap.delete(assets[i].name)
        }
      }
    }
  }

  /*
    public addAssetContainer(scene: Scene) {
        let assetContainer = new bjs.AssetContainer(scene.bjsScene);
        this.containerMap.set(scene, assetContainer);
    }

    public getAssetContainer(scene: Scene) {
        return this.containerMap.get(scene);
    }
    */

  public addMeshTask(
    taskName: string,
    meshesNames: any,
    rootUrl: string,
    sceneFileName: string,
    success?: TaskSuccessHandler,
    error?: TaskErrorHandler
  ) {
    const meshTask = this.assetsManager.addMeshTask(
      taskName,
      meshesNames,
      rootUrl,
      sceneFileName
    )

    meshTask.onSuccess = (task) => {
      const meshAsset = new GLSGAsset(
        GLSGAssetType.MODEL,
        rootUrl,
        sceneFileName,
        task.loadedMeshes
      )
      meshAsset.loadStat = bjs.AssetTaskState.DONE

      this.assetMap.set(taskName, meshAsset)

      if (success) {
        success(task)
      }
    }

    meshTask.onError = (task, message, exception) => {
      const meshAsset = new GLSGAsset(
        GLSGAssetType.MODEL,
        rootUrl,
        sceneFileName,
        task.loadedMeshes
      )
      meshAsset.loadStat = bjs.AssetTaskState.ERROR

      this.assetMap.set(taskName, meshAsset)

      if (error) {
        error(task, message as string, exception)
      }
    }
  }

  public addImageTask(
    taskName: string,
    url: string,
    success: TaskSuccessHandler,
    error: TaskErrorHandler
  ) {
    const imageTask = this.assetsManager.addImageTask(taskName, url)

    imageTask.onSuccess = (task) => {
      if (success) {
        success(task)
      }
    }

    imageTask.onError = (task, message, exception) => {
      if (error) {
        error(task, message as string, exception)
      }
    }
  }

  public addTextureTask(
    taskName: string,
    url: string,
    success?: TaskSuccessHandler,
    error?: TaskErrorHandler
  ) {
    const textureTask = this.assetsManager.addTextureTask(taskName, url)

    textureTask.onSuccess = (task) => {
      const textureAsset = new GLSGAsset(
        GLSGAssetType.TEXTURE,
        '',
        url,
        task.texture
      )
      textureAsset.loadStat = bjs.AssetTaskState.DONE

      this.assetMap.set(taskName, textureAsset)

      if (success) {
        success(task)
      }
    }

    textureTask.onError = (task, message, exception) => {
      const textureAsset = new GLSGAsset(
        GLSGAssetType.TEXTURE,
        '',
        url,
        task.texture
      )
      textureAsset.loadStat = bjs.AssetTaskState.ERROR

      this.assetMap.set(taskName, textureAsset)

      if (error) {
        error(task, message as string, exception)
      }
    }
  }

  public addCubeTextureTask(
    taskName: string,
    url: string,
    success?: TaskSuccessHandler,
    error?: TaskErrorHandler
  ) {
    const cubeTextureTask = this.assetsManager.addCubeTextureTask(taskName, url)

    cubeTextureTask.onSuccess = (task) => {
      const cubeTextureAsset = new GLSGAsset(
        GLSGAssetType.CUBE_TEXTURE,
        '',
        url,
        task.texture
      )
      cubeTextureAsset.loadStat = bjs.AssetTaskState.DONE

      this.assetMap.set(taskName, cubeTextureAsset)

      if (success) {
        success(task)
      }
    }

    cubeTextureTask.onError = (task, message, exception) => {
      const cubeTextureAsset = new GLSGAsset(
        GLSGAssetType.CUBE_TEXTURE,
        '',
        url,
        task.texture
      )
      cubeTextureAsset.loadStat = bjs.AssetTaskState.ERROR

      this.assetMap.set(taskName, cubeTextureAsset)

      if (error) {
        error(task, message as string, exception)
      }
    }
  }

  public addCubeTextureAsyncTask(
    taskName: string,
    url: string,
    success?: TaskSuccessHandler,
    error?: TaskErrorHandler
  ) {
    const cubeTextureTask = this.asyncManager.addCubeTextureTask(taskName, url)

    cubeTextureTask.onSuccess = (task) => {
      const cubeTextureAsset = new GLSGAsset(
        GLSGAssetType.CUBE_TEXTURE,
        '',
        url,
        task.texture
      )
      cubeTextureAsset.loadStat = bjs.AssetTaskState.DONE

      this.asyncMap.set(taskName, cubeTextureAsset)

      if (success) {
        success(task)
      }
    }

    cubeTextureTask.onError = (task, message, exception) => {
      const cubeTextureAsset = new GLSGAsset(
        GLSGAssetType.CUBE_TEXTURE,
        '',
        url,
        task.texture
      )
      cubeTextureAsset.loadStat = bjs.AssetTaskState.ERROR

      this.asyncMap.set(taskName, cubeTextureAsset)

      if (error) {
        error(task, message as string, exception)
      }
    }
  }

  public addHDRCubeTextureTask(
    taskName: string,
    url: string,
    success?: TaskSuccessHandler,
    error?: TaskErrorHandler
  ) {
    const hdrCubeTextureTask = this.assetsManager.addHDRCubeTextureTask(
      taskName,
      url,
      0
    )

    hdrCubeTextureTask.onSuccess = (task) => {
      const hdrCubeTextureAsset = new GLSGAsset(
        GLSGAssetType.HDR_CUBE_TEXTURE,
        '',
        url,
        task.texture
      )
      hdrCubeTextureAsset.loadStat = bjs.AssetTaskState.DONE

      this.assetMap.set(taskName, hdrCubeTextureAsset)

      if (success) {
        success(task)
      }
    }

    hdrCubeTextureTask.onError = (task, message, exception) => {
      const hdrCubeTextureAsset = new GLSGAsset(
        GLSGAssetType.HDR_CUBE_TEXTURE,
        '',
        url,
        task.texture
      )
      hdrCubeTextureAsset.loadStat = bjs.AssetTaskState.ERROR

      this.assetMap.set(taskName, hdrCubeTextureAsset)

      if (error) {
        error(task, message as string, exception)
      }
    }
  }

  public addBinaryFileTask(
    taskName: string,
    url: string,
    success: TaskSuccessHandler,
    error: TaskErrorHandler
  ) {
    const binaryTask = this.assetsManager.addBinaryFileTask(taskName, url)

    binaryTask.onSuccess = (task) => {
      if (success) {
        success(task)
      }
    }

    binaryTask.onError = (task, message, exception) => {
      if (error) {
        error(task, message as string, exception)
      }
    }
  }

  getAsset(assetName: string): GLSGAsset | undefined {
    if (this.assetMap) {
      if (this.assetMap.has(assetName)) return this.assetMap.get(assetName)
    }
    return undefined
  }

  getAsyncAsset(assetName: string): GLSGAsset | undefined {
    if (this.asyncMap) {
      if (this.asyncMap.has(assetName)) return this.asyncMap.get(assetName)
    }
    return undefined
  }

  getMesh(assetName: string): bjs.Mesh | undefined {
    const asset: GLSGAsset | undefined = this.getAsset(assetName)

    if (asset) {
      const meshes: bjs.AbstractMesh[] | undefined = asset.meshes

      if (meshes) {
        if (meshes[0]) {
          meshes[0].setEnabled(true)
          return meshes[0] as bjs.Mesh
        }
      }
    }
    return undefined
  }

  getMeshInstance(assetName: string): bjs.InstancedMesh | undefined {
    const asset: GLSGAsset | undefined = this.getAsset(assetName)

    if (asset) {
      const meshes: bjs.AbstractMesh[] | undefined = asset.meshes

      if (meshes) {
        if (meshes[0]) {
          //meshes[0].setEnabled(true);
          const meshInstance: bjs.InstancedMesh = (
            meshes[0] as bjs.Mesh
          ).createInstance(assetName + 'Instance')
          return meshInstance
        }
      }
    }
    return undefined
  }

  getMeshClone(assetName: string): bjs.Mesh | undefined {
    const mesh: bjs.Mesh | undefined = this.getMesh(assetName)

    if (mesh) {
      const clonedMesh: bjs.Mesh = mesh.clone()

      mesh.setEnabled(false)

      if (clonedMesh) {
        return clonedMesh
      }
    }

    const asset: GLSGAsset | undefined = this.getAsset(assetName)

    if (asset) {
      const meshes: bjs.AbstractMesh[] | undefined = asset.meshes

      if (meshes) {
        if (meshes[0]) {
          meshes[0].isVisible = true

          const childMeshes: bjs.AbstractMesh[] =
            meshes[0].getChildMeshes(false)

          if (childMeshes)
            childMeshes.forEach((item) => {
              item.isVisible = true
            })

          return meshes[0] as bjs.Mesh
        }
      }
    }
    return undefined
  }

  // public static get Instance()
  // {
  //     return this._instance || (this._instance = new this());
  // }

  public static Instance(scene = 'emptyScene') {
    let instance = this._instances.get(scene)
    if (instance) return instance

    instance = new this()
    this._instances.set(scene, instance)

    return instance
  }
}
