import * as bjs from '@babylonjs/core/Legacy/legacy'
import { SolidParticleSystemElement } from '@/modules/SceneGraph/SolidParticleSystemElement'
import { SolidParticleMaterial } from '@/modules/SceneGraph/SolidParticleMaterial'
import { TradeSerumScene } from '../TradeSerumScene'

export class TradeSerumSolidParticleSystem extends SolidParticleSystemElement {
  constructor(
    name: string,
    x: number,
    y: number,
    z: number,
    scene: TradeSerumScene,
    meshBase: bjs.Mesh,
    material: SolidParticleMaterial,
    amount: number,
    spsOptions?: {
      updatable?: boolean
      isPickable?: boolean
      enableDepthSort?: boolean
      particleIntersection?: boolean
      boundingSphereOnly?: boolean
      bSphereRadiusFactor?: number
    },
    posOptions?: {
      positionFunction?: any
      vertexFunction?: any
    }
  ) {
    super(
      name,
      x,
      y,
      z,
      scene,
      meshBase,
      material,
      amount,
      spsOptions,
      posOptions
    )
  }

  protected onUpdateParticle = (
    particle: bjs.SolidParticle
  ): bjs.SolidParticle => {
    return particle
  }
}
