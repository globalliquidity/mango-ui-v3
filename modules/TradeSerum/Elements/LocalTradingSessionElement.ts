import { LocalTradingSession } from './LocalTradingSession'
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { Scene } from '@/modules/SceneGraph/Scene'

export class LocalTradingSessionElement extends SceneElement {
  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: Scene,
    public session: LocalTradingSession
  ) {
    super(name, x, y, z, scene)
  }
}
