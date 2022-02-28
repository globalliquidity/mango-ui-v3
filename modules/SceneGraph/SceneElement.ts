import * as bjs from '@babylonjs/core/Legacy/legacy'
import { AssetManager } from './AssetManager'
import { Scene } from './Scene'

export abstract class SceneElement extends bjs.TransformNode {
  public scene: Scene
  sceneElements: Array<SceneElement>
  isCreated = false

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    scene: Scene
  ) {
    super(name, scene.bjsScene)
    this.scene = scene
    this.position = new bjs.Vector3(x, y, z)
    this.sceneElements = new Array<SceneElement>()
    this.onAddCustomProperties()
  }

  public create() {
    this.onCreate()
    this.isCreated = true
    this.onFormat()
  }

  public preRender() {
    if (this.isCreated) {
      this.sceneElements.forEach((e) => {
        e.preRender()
      })
      this.onPreRender()
    }
  }

  public render() {
    if (this.isCreated) {
      this.sceneElements.forEach((e) => {
        e.render()
      })
      this.onRender()
    }
  }

  public postRender() {
    if (this.isCreated) {
      this.sceneElements.forEach((e) => {
        e.postRender()
      })
      this.onPostRender()
    }
  }

  public addChild(element: SceneElement) {
    element.parent = this
    this.sceneElements.push(element)
  }

  public format() {
    this.sceneElements.forEach((e) => {
      e.format()
    })
    this.onFormat()
  }

  public removeChild(element: SceneElement) {
    element.parent = null
    this.sceneElements = this.sceneElements.filter(
      (ele) => ele.name !== element.name
    )
  }

  public removeAll() {
    this.sceneElements.forEach((ele, _index) => {
      const elem = ele as SceneElement
      elem.parent = null
      elem.destroy()
    })

    this.sceneElements = []
  }

  public destroy() {
    this.removeAll()
    this.onDisposing()
    this.dispose()
  }

  public async getClonedMesh(model: string, from = 'emptyScene') {
    const mymodel = AssetManager.Instance(from).getMeshClone(model) as bjs.Mesh
    mymodel.isVisible = false
    let serMesh = bjs.SceneSerializer.SerializeMesh(mymodel, false, false)
    serMesh = JSON.stringify(serMesh)
    const newMeshes = await bjs.SceneLoader.ImportMeshAsync(
      '',
      '',
      'data:' + serMesh,
      this.scene.bjsScene
    )
    newMeshes.meshes[0].isVisible = true
    return newMeshes.meshes[0] as bjs.Mesh
  }

  protected onAddCustomProperties() {}

  protected onCreate() {}

  protected onFormat() {}

  protected onPreRender() {}

  protected onRender() {}

  protected onPostRender() {}

  protected onDisposing() {}
}
