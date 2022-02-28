import * as bjs from '@babylonjs/core/Legacy/legacy'
import { GLSGAssetType } from './Enums'

export class GLSGAsset {
  public url: string
  public fileName: string
  public type: GLSGAssetType

  public loadStat: bjs.AssetTaskState = bjs.AssetTaskState.INIT

  public meshes: bjs.Mesh[] | undefined

  public cubeTexture: bjs.CubeTexture | undefined
  public texture: bjs.Texture | undefined

  constructor(type: GLSGAssetType, url: string, fileName: string, asset: any) {
    this.type = type
    this.url = url
    this.fileName = fileName

    if (type === GLSGAssetType.MODEL) {
      this.meshes = asset as bjs.Mesh[]

      if (this.meshes && this.meshes.length > 0) {
        this.meshes[0].setEnabled(false)
      }
    } else if (type === GLSGAssetType.TEXTURE) {
      this.texture = asset as bjs.Texture
    } else if (type === GLSGAssetType.CUBE_TEXTURE) {
      this.cubeTexture = asset as bjs.CubeTexture
    }
  }
}
