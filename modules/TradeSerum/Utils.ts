import { WaterMaterial } from '@babylonjs/materials'
import OnlineAssets from '@/assets/OnlineAssets'
import * as bjs from '@babylonjs/core/Legacy/legacy'

export const OFFSET_FROM_NOW = 10000000000

export const SHRIMPY_API_KEY =
  '77f83febf27243f68c88b2db2fd19a2991f283803a0e38c061110885b5b6cf6e'

export const generateSkybox = (
  _size: number,
  hdrTexture: bjs.CubeTexture,
  scene: bjs.Scene
): bjs.Mesh => {
  const hdrSkybox: bjs.Mesh = bjs.Mesh.CreateBox('hdrSkyBox', 1000.0, scene)
  const hdrSkyboxMaterial: bjs.PBRMaterial = new bjs.PBRMaterial(
    'skyBox',
    scene
  )
  hdrSkyboxMaterial.backFaceCulling = false
  hdrSkyboxMaterial.reflectionTexture = hdrTexture.clone()
  hdrSkyboxMaterial.reflectionTexture.coordinatesMode = bjs.Texture.SKYBOX_MODE
  hdrSkyboxMaterial.microSurface = 1.0
  hdrSkyboxMaterial.disableLighting = true
  hdrSkybox.material = hdrSkyboxMaterial
  hdrSkybox.infiniteDistance = true
  hdrSkybox.rotation.y = (2 * Math.PI) / 2
  hdrSkybox.position.y = -90

  return hdrSkybox
}

export const generateHdrSkybox = (
  _size: number,
  hdrTexture: bjs.HDRCubeTexture,
  scene: bjs.Scene
): bjs.Mesh => {
  const hdrSkybox: bjs.Mesh = bjs.Mesh.CreateBox('hdrSkyBox', 1000.0, scene)
  const hdrSkyboxMaterial: bjs.PBRMaterial = new bjs.PBRMaterial(
    'skyBox',
    scene
  )
  hdrSkyboxMaterial.backFaceCulling = false
  hdrSkyboxMaterial.reflectionTexture = hdrTexture.clone()
  hdrSkyboxMaterial.reflectionTexture.coordinatesMode = bjs.Texture.SKYBOX_MODE
  hdrSkyboxMaterial.microSurface = 1.0
  hdrSkyboxMaterial.disableLighting = true
  hdrSkybox.material = hdrSkyboxMaterial
  hdrSkybox.infiniteDistance = true
  hdrSkybox.rotation.y = (2 * Math.PI) / 2
  hdrSkybox.position.y = -90

  return hdrSkybox
}

export const generateWaterMaterial = (scene: bjs.Scene): WaterMaterial => {
  // Water material
  const waterMaterial: WaterMaterial = new WaterMaterial(
    'waterMaterial',
    scene,
    new bjs.Vector2(512, 512)
  )
  waterMaterial.bumpTexture = new bjs.Texture(
    OnlineAssets.Images.pngWaterbump,
    scene
  )
  waterMaterial.windForce = -25
  waterMaterial.waveHeight = 0.1
  waterMaterial.bumpHeight = 0.1
  waterMaterial.waveLength = 0.1
  waterMaterial.waveSpeed = 25.0
  waterMaterial.colorBlendFactor = 0
  waterMaterial.windDirection = new bjs.Vector2(0, 1)
  waterMaterial.colorBlendFactor = 0

  return waterMaterial
}

export const getTrimedString = (value: any): string => {
  const convertedStr: string = value.toString().trim()
  const dividedStrings: Array<string> = convertedStr.split('.')

  if (!dividedStrings[1]) {
    return dividedStrings[0]
  }

  let resultString = dividedStrings[1]
  let lastCharacter = resultString[resultString.length - 1]

  while (lastCharacter && lastCharacter === '0') {
    resultString = resultString.slice(0, resultString.length - 1)
    lastCharacter = resultString[resultString.length - 1]
  }

  if (resultString === '') {
    return dividedStrings[0]
  }

  return dividedStrings[0] + '.' + resultString
}

export const getQueryParams = () => {
  const queryParams = new Map<string, string>()
  let pathStr = window.location.search
  if (window.location.hash !== '') {
    pathStr = window.location.hash.replace('#', '?')
  }
  const routes = pathStr.split('?')
  const queryString = routes[routes.length - 1]
  const paramArray = queryString.split('&')

  paramArray.forEach((pa) => {
    const values = pa.split('=')
    queryParams.set(values[0], values[1])
  })

  if (queryParams.get('state') && queryParams.get('state') !== '') {
    let statesArray = queryParams.get('state')?.split('|') || []

    if (queryParams.get('state')?.includes('%7C')) {
      statesArray = queryParams.get('state')?.split('%7C') || []
    }
    statesArray.forEach((_sa, index) => {
      if (index % 2 === 1) {
        queryParams.set(statesArray[index - 1], statesArray[index])
      }
    })

    queryParams.delete('state')
  }

  return queryParams
}
