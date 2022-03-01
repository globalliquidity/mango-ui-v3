import * as bjs from '@babylonjs/core/Legacy/legacy'
// import { Scene } from "@/modules/SceneGraph/Scene";
import { GLSGColor } from '@/modules/SceneGraph/Enums'
import { MarketSide } from '@/modules/TradeSerum/Enums'
import Logger from '@/modules/SceneGraph/Logger'
import { VectorField } from '@/modules/SceneGraph/VectorField'
import { SolidParticleMaterial } from '@/modules/SceneGraph/SolidParticleMaterial'
import { DepthFinderPresenter } from './DepthFinderPresenter'
import { DepthFinderRow } from './DepthFinderRow'
import { TradeSerumScene } from '../../TradeSerumScene'
import currency from 'currency.js'
import { PriceDivisionManager } from '../../PriceDivision/PriceDivisionManager'

export class OrderBookFloorVectorField extends VectorField {
  public isResetting = false
  public rowDepthMultiplier = 0
  //private floorWidth: number = 100;

  constructor(
    name: string,
    public x: number,
    public y: number,
    public z: number,
    scene: TradeSerumScene,
    public mesh: bjs.Mesh,
    public rowCount: number,
    public columnCount: number,
    public layerCount: number,
    public cellWidth: number,
    public cellHeight: number,
    public cellDepth: number,
    public cellMeshScaleFactor: number,
    public presenter: DepthFinderPresenter,
    public orderBookRig: bjs.TransformNode,
    public floorWidth: number
  ) {
    super(
      name,
      x,
      y,
      z,
      scene,
      mesh,
      rowCount,
      columnCount,
      layerCount,
      cellWidth,
      cellHeight,
      cellDepth,
      cellMeshScaleFactor,
      presenter
    )
    Logger.log('OrderBookHistoryFloorVectorField :  constructor()')
    Logger.log(
      'OrderBookHistoryFloorVectorField :  constructor() - calling this.create()'
    )

    this.create()
  }

  async create() {
    // Logger.log('OrderBookHistoryFloorVectorField : create()');
    super.create()
    this.material.roughness = 1 //.75;
    this.material.metallic = 0.4
    this.material.alpha = 1.0
    this.material.albedoColor = bjs.Color3.FromInts(
      141,
      141,
      141
    ).toLinearSpace()
  }

  public reset() {
    this.isResetting = true
    this.sps.setParticles()
  }

  protected onPreRender() {
    this.sps.setParticles()
  }

  protected onSetInitialParticlePosition = (
    particle: bjs.SolidParticle,
    _i: number
  ) => {
    particle.isVisible = false
  }

  protected onUpdateParticle = (particle: bjs.SolidParticle) => {
    particle.isVisible = false
    particle.scaling.y = 0.25
    //particle.rotation.z

    if (this.presenter.isReady) {
      const cellColumnIndex: number = particle.idx % this.columnCount
      const cellRowIndex: number = Math.floor(particle.idx / 2 / 2)
      particle.isVisible = false

      if (cellColumnIndex < 2) {
        //Draw the bid and ask floor
        //Logger.log("Order Book History : updating particle");
        const cellRow: DepthFinderRow = this.presenter.rows[
          cellRowIndex
        ] as DepthFinderRow
        let side: MarketSide = MarketSide.Bid
        // let cellOffsetX: number = 0;
        let cellPositionX = 0

        if (cellColumnIndex === 0) {
          side = MarketSide.Bid
          particle.uvs = SolidParticleMaterial.getUVSforColor(GLSGColor.SkyBlue)
        } else if (cellColumnIndex === 1) {
          side = MarketSide.Ask
          particle.uvs = SolidParticleMaterial.getUVSforColor(GLSGColor.HotPink)
        }

        if (cellRow) {
          particle.isVisible = true

          let cellOffsetX = 0
          let cellFloorWidth = 0
          const parentPositionX = -this.orderBookRig.position.x
          const minPositionX = parentPositionX - this.floorWidth / 2
          const maxPositionX = parentPositionX + this.floorWidth / 2

          if (this.presenter.insideBid && this.presenter.insideAsk) {
            const spread: currency = cellRow.insideAskPrice.subtract(
              cellRow.insideBidPrice
            )
            //Logger.log("OrderBookFloorVectorField   |   Spread  |   " + spread.value);
            //let midPrice : currency = cellRow.midPrice;
            //Logger.log("OrderBookFloorVectorField   |   MidPrice  |   " + midPrice.value);
            const halfTheSpread: currency = spread.divide(2)
            //Logger.log("OrderBookFloorVectorField   |   MidPrice Minus Half The Spread  |   " + midPriceMinusHalfTheSpread.value);

            if (side === MarketSide.Bid) {
              if (PriceDivisionManager.Instance.currentPriceDivisionSetting) {
                const insideBidOffsetX: currency | undefined =
                  halfTheSpread.multiply(
                    PriceDivisionManager.Instance.currentPriceDivisionSetting
                      ?.priceDivisionMultiplier
                  )

                if (insideBidOffsetX)
                  cellOffsetX =
                    (cellRow.positionOffsetX - insideBidOffsetX.value) *
                    this.cellWidth
              }
            } else {
              if (PriceDivisionManager.Instance.currentPriceDivisionSetting) {
                const insideAskOffsetX = halfTheSpread.multiply(
                  PriceDivisionManager.Instance.currentPriceDivisionSetting
                    .priceDivisionMultiplier
                )

                if (insideAskOffsetX)
                  cellOffsetX =
                    (cellRow.positionOffsetX + insideAskOffsetX.value) *
                      this.cellWidth +
                    this.cellWidth
              }
            }

            let cellMinPositionX = Math.max(cellOffsetX, minPositionX)
            let cellMaxPositionX = Math.min(cellOffsetX, maxPositionX)

            if (side === MarketSide.Bid) {
              if (cellMinPositionX > maxPositionX) {
                cellMinPositionX = maxPositionX
              }
              cellFloorWidth = Math.abs(cellMinPositionX - minPositionX)
              cellPositionX = cellMinPositionX - cellFloorWidth / 2
            } else {
              if (cellMaxPositionX < minPositionX) {
                cellMaxPositionX = minPositionX
              }
              cellFloorWidth = Math.abs(maxPositionX - cellMaxPositionX)
              cellPositionX = cellMaxPositionX + cellFloorWidth / 2
            }

            cellFloorWidth = Math.min(cellFloorWidth, this.floorWidth)
            particle.scaling.x = cellFloorWidth

            let cellPositionZ = 0
            // particle.scaling.z = this.cellDepth;

            if (cellRowIndex === 0) {
              //smooth motion
              particle.scaling.z =
                this.rowDepthMultiplier * this.cellDepth * 0.9
              cellPositionZ = (-this.rowDepthMultiplier * this.cellDepth) / 2
            } else {
              cellPositionZ = cellRowIndex * this.cellDepth - this.cellDepth / 2
              particle.scaling.z = 0.9 // this.cellDepth + this.cellMeshScaleFactor;
            }
            particle.position.set(cellPositionX, -0.1, cellPositionZ)
          }
        } else {
          particle.isVisible = false
        }
      } else if (cellColumnIndex === 2) {
        /*
                 let cellRow : DepthFinderRow = this.presenter.rows[cellRowIndex] as DepthFinderRow;
                 let cellPositionX: number = 0;
                 if (cellRow)
                 {
                     particle.isVisible = true;
                     particle.uvs =  SolidParticleMaterial.getUVSforColor(GLSGColor.SeaBlue);
 
                     let cellOffsetX : number = 0;
                     let cellWidth = 0;
                     //const parentPositionX = -this.orderBookRig.position.x;
 
                     //if (this.presenter.insideBid && this.presenter.insideAsk)
                     //{   
                         let spread : currency = cellRow.insideAskPrice.subtract(cellRow.insideBidPrice);
                         let halfTheSpread : currency = spread.divide(2);
                         //Logger.log("OrderBookFloorVectorField   |   MidPrice Minus Half The Spread  |   " + midPriceMinusHalfTheSpread.value);

                        cellPositionX = cellRow.positionOffsetX + this.cellWidth/2;
                 
                        cellWidth = spread.multiply(this.presenter.priceQuantizeDivision.priceDivisionMultiplier).value * this.cellWidth + this.cellWidth
                        particle.scaling.x = cellWidth;
 
                         let cellPositionZ : number = 0
                         // particle.scaling.z = this.cellDepth;
 
                         if (cellRowIndex === 0) //smooth motion 
                         {
                             particle.scaling.z = this.rowDepthMultiplier * this.cellDepth * 0.9;
                             cellPositionZ = - this.rowDepthMultiplier * this.cellDepth / 2;
         
                         }
                         else
                         {
                             cellPositionZ = cellRowIndex  * this.cellDepth - this.cellDepth / 2;
                             particle.scaling.z = 0.9;// this.cellDepth + this.cellMeshScaleFactor;
                         }
                         particle.position.set(cellPositionX, -0.1, cellPositionZ);
                   //  }       
                 }
                 else
                 {
                     particle.isVisible = false;
                 }

                 */
      } else {
        particle.uvs = SolidParticleMaterial.getUVSforColor(GLSGColor.SeaBlue)

        particle.scaling.x = 0
        particle.scaling.y = 0
        particle.scaling.z = 0
        particle.isVisible = false
      }
    }

    return particle
  }
}
