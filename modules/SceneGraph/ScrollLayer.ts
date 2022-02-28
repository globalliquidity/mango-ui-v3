import * as bjs from '@babylonjs/core/Legacy/legacy'
import { Scene } from './Scene'

import { UILayer } from './UILayer'

export class ScrollLayer extends UILayer {
  public numsPerPage = 5
  public numsOfEdgeElem = 2
  public numsOfElem = 27
  public currentPage = 0
  public totalPages = 1
  public isPagniating = false
  public scrollingSpeed = 100
  public scrollDirection = 0

  constructor(
    name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: Scene,
    public distance: number
  ) {
    super(name, x, y, z, scene, distance)
    // this.create();
  }

  protected onCreate() {
    this.initializeEvents()
  }

  public setPageNumber(pageNum: number) {
    this.currentPage = pageNum
  }

  protected initializeEvents() {
    this.scene.bjsScene.onPointerObservable.add((pointerInfo) => {
      switch (pointerInfo.type) {
        case bjs.PointerEventTypes.POINTERDOWN:
          // Logger.log("POINTER DOWN");
          break
        case bjs.PointerEventTypes.POINTERUP:
          // Logger.log("POINTER UP");
          break
        case bjs.PointerEventTypes.POINTERMOVE:
          // Logger.log("POINTER MOVE");
          break
        case bjs.PointerEventTypes.POINTERWHEEL:
          // Logger.log("POINTER WHEEL");
          if (pointerInfo.event['wheelDelta'] > 0) {
            this.scrollDirection = 1
          } else {
            this.scrollDirection = 0
          }
          this.scene.detachCamera()
          this.isPagniating = true
          break
        case bjs.PointerEventTypes.POINTERPICK:
          // Logger.log("POINTER PICK");
          break
        case bjs.PointerEventTypes.POINTERTAP:
          // Logger.log("POINTER TAP");
          break
        case bjs.PointerEventTypes.POINTERDOUBLETAP:
          // Logger.log("POINTER DOUBLE-TAP");
          break
      }
    })
  }
}
