import * as bjs from '@babylonjs/core/Legacy/legacy'
import { GridMaterial } from '@babylonjs/materials'
import currency from 'currency.js'
//import { makeArray } from 'jquery';
import {
  HorizontalAlignment,
  VerticalAlignment,
} from '@/modules/SceneGraph/Enums'
// import { TradeDirection } from '@/modules/TradeSerum/Enums';
// import { AssetManager } from '@/modules/SceneGraph/AssetManager';
import { GLSGColor, SceneFormatType } from '@/modules/SceneGraph/Enums'
// import { Scene } from '@/modules/SceneGraph/Scene';
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { TextMeshString } from '@/modules/SceneGraph/TextMeshString'
import { TradeSerumScene } from '@/modules/TradeSerum/TradeSerumScene'
import { DepthFinderPresenter } from './DepthFinderPresenter'
import { DepthFinderRow } from './DepthFinderRow'
import { PriceDivisionManager } from '../../PriceDivision/PriceDivisionManager'
// import { MarketDataUpdate } from '@/modules/TradeSerum/Market/MarketDataClient';

export class GridFloor extends SceneElement {
  public groundMaterial: GridMaterial | undefined
  // public backWallMaterial: GridMaterial | undefined;
  public frontWallMaterial: GridMaterial | undefined
  //public frontGroundMaterial : GridMaterial | undefined;

  public ground: bjs.Mesh | undefined
  public frontGround: bjs.Mesh | undefined

  private frontWall: bjs.Mesh | undefined
  private wall: bjs.Mesh | undefined

  labels: Array<TextMeshString> = new Array<TextMeshString>()
  priceMarkers: Array<bjs.Mesh> = new Array<bjs.Mesh>()
  midPriceMarker?: bjs.InstancedMesh
  protected numLabels = 0

  public gridOffsetX = 0
  public gridOffsetZ = 0

  insideBidLabel: TextMeshString | undefined
  insideAskLabel: TextMeshString | undefined
  numSegmentsPerSide = 10
  currentMomentum = 0
  maxMomentum = 2
  minMomentum = -2

  public isResetting = false

  private priceMarkCylinder: bjs.Mesh | undefined
  private priceMarkMaterial: bjs.PBRMaterial | undefined
  private priceMarkMaterialWin: bjs.PBRMaterial | undefined
  private priceMarkMaterialLoss: bjs.PBRMaterial | undefined

  private _groundColor: bjs.Color3 = bjs.Color3.FromInts(109, 120, 166) //.toLinearSpace();
  public get groundColor(): bjs.Color3 {
    return this._groundColor
  }
  public set groundColor(value: bjs.Color3) {
    this._groundColor = value
  }

  private _gridOpacity = 1.0

  public get gridOpacity(): number {
    return this._gridOpacity
  }

  public set gridOpacity(value: number) {
    this._gridOpacity = value
  }

  insideBidMarker?: bjs.Mesh
  insideBidMarkerMaterial: bjs.PBRMaterial = new bjs.PBRMaterial(
    'Inside Bid Marker',
    this.scene.bjsScene
  )

  insideAskMarker?: bjs.Mesh
  insideAskMarkerMaterial: bjs.PBRMaterial = new bjs.PBRMaterial(
    'Inside Ask Marker',
    this.scene.bjsScene
  )

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: TradeSerumScene,
    public presenter: DepthFinderPresenter,
    public rows: number,
    public columns: number,
    public cellWidth: number,
    public cellHeight: number,
    public cellDepth: number,
    public orderBookRig: bjs.TransformNode
  ) {
    super(name, x, y, z, scene)

    this.create()
  }

  async onCreate() {
    const groundWidth: number = this.scene.columnCount
    this.ground = bjs.MeshBuilder.CreateGround(
      'myGround',
      { width: groundWidth, height: this.scene.rowCount, subdivisions: 32 },
      this.scene.bjsScene
    )
    this.ground.parent = this
    this.groundMaterial = new GridMaterial(
      'groundMaterial',
      this.scene.bjsScene
    )
    this.groundMaterial.lineColor = bjs.Color3.Black().toLinearSpace()
    this.groundMaterial.mainColor = this.groundColor
    this.groundMaterial.majorUnitFrequency = 10
    this.groundMaterial.minorUnitVisibility = 0
    this.groundMaterial.gridRatio = this.cellWidth
    this.ground.material = this.groundMaterial
    this.ground.receiveShadows = false
    this.ground.position.z = this.scene.rowCount / 2
    this.ground.position.y = -0.25
    this.ground.hasVertexAlpha = true
    this.ground.isVisible = true
    this.groundMaterial.opacity = 0.1

    this.frontWall = bjs.MeshBuilder.CreateGround(
      'myGround',
      { width: groundWidth * 5, height: 5, subdivisions: 32 },
      this.scene.bjsScene
    )
    this.frontWall.parent = this
    this.frontWall.rotation.x = -Math.PI / 2
    this.frontWallMaterial = new GridMaterial(
      'frontWallMaterial',
      this.scene.bjsScene
    )
    this.frontWallMaterial.lineColor = bjs.Color3.Black().toLinearSpace()
    this.frontWallMaterial.mainColor = this.groundColor
    this.frontWallMaterial.majorUnitFrequency = 10
    this.frontWallMaterial.minorUnitVisibility = 0
    this.frontWallMaterial.gridRatio = this.cellWidth
    this.frontWall.material = this.frontWallMaterial
    this.frontWall.receiveShadows = false
    this.frontWall.position.y = -2.5
    this.frontWall.position.z = 0
    //this.frontWall.isVisible = false;

    this.frontGround = bjs.MeshBuilder.CreateGround(
      'myGround',
      { width: groundWidth * 5, height: 64, subdivisions: 32 },
      this.scene.bjsScene
    )
    this.frontGround.parent = this
    this.frontGround.material = this.groundMaterial
    this.frontGround.receiveShadows = false
    this.frontGround.position.y = -1.5
    this.frontGround.position.z = -32
    //this.frontGround.isVisible = false;

    this.priceMarkMaterial = new bjs.PBRMaterial(
      'Price Mark',
      this.scene.bjsScene
    )
    this.priceMarkMaterial.roughness = 0.55
    this.priceMarkMaterial.metallic = 0.35
    this.priceMarkMaterial.albedoColor = bjs.Color3.FromInts(28, 28, 59)

    this.priceMarkMaterialWin = new bjs.PBRMaterial(
      'Price Mark Win',
      this.scene.bjsScene
    )
    this.priceMarkMaterialWin.roughness = 0.55
    this.priceMarkMaterialWin.metallic = 0.35
    this.priceMarkMaterialWin.albedoColor = bjs.Color3.FromInts(28, 28, 59)
    this.priceMarkMaterialWin.emissiveColor = bjs.Color3.FromInts(
      18,
      241,
      18
    ).toLinearSpace()

    this.priceMarkMaterialLoss = new bjs.PBRMaterial(
      'Price Mark Loss',
      this.scene.bjsScene
    )
    this.priceMarkMaterialLoss.roughness = 0.55
    this.priceMarkMaterialLoss.metallic = 0.35
    this.priceMarkMaterialLoss.albedoColor = bjs.Color3.FromInts(28, 28, 59)
    this.priceMarkMaterialLoss.emissiveColor = bjs.Color3.FromInts(
      241,
      18,
      18
    ).toLinearSpace()

    this.priceMarkCylinder = bjs.MeshBuilder.CreateCylinder(
      'cone',
      { height: 1, diameter: 0.375, tessellation: 12 },
      this.scene.bjsScene
    )
    this.priceMarkCylinder.material = this.priceMarkMaterial
    this.priceMarkCylinder._scene = this.scene.bjsScene
    this.priceMarkCylinder.parent = this
    this.priceMarkCylinder.position.y = -1.5
    this.priceMarkCylinder.position.z = -0.5
    this.priceMarkCylinder.rotation.x = -Math.PI / 2
    this.priceMarkCylinder.isVisible = false
    this.scene.glowLayer.addIncludedOnlyMesh(this.priceMarkCylinder)

    for (let i = 0; i < this.numLabels; i++) {
      const label: TextMeshString = new TextMeshString(
        'label' + i,
        0,
        -0.65,
        -0.5,
        this.scene,
        '0',
        0.75,
        HorizontalAlignment.Center,
        VerticalAlignment.Middle
      )
      label.parent = this
      label.setColor(GLSGColor.SeaBlue)
      this.labels.push(label)

      const marker: bjs.Mesh = this.priceMarkCylinder.clone('Marker ' + i)
      marker.material = this.priceMarkMaterial
      marker.parent = this
      this.scene.glowLayer.addIncludedOnlyMesh(marker)
      this.priceMarkers.push(marker)
    }

    this.insideBidLabel = new TextMeshString(
      'Inside Bid',
      0,
      -1,
      0,
      this.scene,
      '0',
      1.0,
      HorizontalAlignment.Right,
      VerticalAlignment.Middle,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.insideBidLabel.parent = this
    this.insideBidLabel.setColor(GLSGColor.Blue)
    //this.insideBidLabel.setEnabled(false);

    this.insideAskLabel = new TextMeshString(
      'Inside Ask',
      0,
      -1,
      0,
      this.scene,
      '0',
      1.0,
      HorizontalAlignment.Left,
      VerticalAlignment.Middle,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.insideAskLabel.parent = this
    this.insideAskLabel.setColor(GLSGColor.Pink)
    //this.insideAskLabel.setEnabled(false);
  }

  protected onAddCustomProperties() {
    this.inspectableCustomProperties = [
      {
        label: 'Grid Opacity',
        propertyName: 'gridOpacity',
        type: bjs.InspectableType.Slider,
        min: 0,
        max: 1.0,
        step: 0.01,
      },
      {
        label: 'Grid Background Color',
        propertyName: 'groundColor',
        type: bjs.InspectableType.Color3,
      },
    ]
  }

  public reset() {
    this.isResetting = true
    this.insideAskLabel?.setText('$0.00')
    this.insideBidLabel?.setText('$0.00')
  }

  protected onFormat() {
    if (this.scene.sceneType === SceneFormatType.Portrait) {
      for (let i = 0; i < this.numLabels; i++) {
        const label: TextMeshString = this.labels[i]
        label.rotation.x = Math.PI / 3
        label.rotation.z = Math.PI + Math.PI / 2
      }
    } else {
      for (let i = 0; i < this.numLabels; i++) {
        const label: TextMeshString = this.labels[i]
        label.rotation.x = 0
        label.rotation.z = 0
      }
    }
  }

  protected onRender() {
    if (this.groundMaterial) {
      this.groundMaterial.gridOffset = new bjs.Vector3(
        -this.gridOffsetX,
        0,
        -this.gridOffsetZ
      )

      if (this.groundMaterial.mainColor !== this.groundColor) {
        this.groundMaterial.mainColor = this.groundColor
      }

      if (this.groundMaterial.opacity !== this._gridOpacity) {
        this.groundMaterial.opacity = this._gridOpacity
      }
    }

    if (this.frontWallMaterial)
      this.frontWallMaterial.gridOffset = new bjs.Vector3(
        -this.gridOffsetX,
        0,
        0
      )

    if (this.presenter && this.presenter.isReady) {
      const currentRow: DepthFinderRow = this.presenter
        .rows[0] as DepthFinderRow

      if (currentRow) {
        if (this.insideBidLabel) {
          const insideBidPrice: currency | undefined =
            this.presenter.insideBid?.price

          if (insideBidPrice) {
            this.insideBidLabel.position.x =
              this.presenter.offsetForPrice(insideBidPrice) * this.cellWidth +
              this.orderBookRig.position.x
            //const inisideBidPriceFormatted : currency = currency(labelPrice, { precision: 2 });
            this.insideBidLabel.setText(insideBidPrice.toString())
          }
        }

        if (this.insideAskLabel) {
          const insideAskPrice: currency | undefined =
            this.presenter.insideAsk?.price

          if (insideAskPrice) {
            this.insideAskLabel.position.x =
              this.presenter.offsetForPrice(insideAskPrice) * this.cellWidth +
              this.orderBookRig.position.x
            //const inisideBidPriceFormatted : currency = currency(labelPrice, { precision: 2 });
            this.insideAskLabel.setText(insideAskPrice.toString())
          }
        }

        for (let i = 0; i < this.numLabels; i++) {
          const label: TextMeshString = this.labels[i]
          const marker: bjs.Mesh = this.priceMarkers[i]
          marker.isVisible = true
          label.setVisibility(true)

          if (label === undefined) break

          const priceDivisionManager = PriceDivisionManager.Instance

          if (priceDivisionManager.currentPriceDivisionSetting) {
            let labelPrice: currency = currency(0, {
              precision:
                priceDivisionManager.currentPriceDivisionSetting
                  .numDecimalPlaces,
            })

            //First label is at the first whole number above the current midPrice
            if (i === 0) {
              const stepValue =
                priceDivisionManager.currentPriceDivisionSetting.columnPriceRange?.multiply(
                  10
                )

              if (stepValue)
                labelPrice = currency(
                  Math.ceil(this.presenter.midPrice.divide(stepValue).value)
                ).multiply(stepValue)
            } else if (i === 1) {
              const stepValue =
                priceDivisionManager.currentPriceDivisionSetting.columnPriceRange?.multiply(
                  10
                )

              if (stepValue)
                labelPrice = currency(
                  Math.floor(this.presenter.midPrice.divide(stepValue).value)
                ).multiply(stepValue)
            } else {
              if (i % 2 === 0) {
                //even
                const stepValue =
                  priceDivisionManager.currentPriceDivisionSetting.columnPriceRange?.multiply(
                    10
                  )

                if (stepValue) {
                  const priceOffset = stepValue.multiply(i / 2)
                  labelPrice = currency(
                    Math.ceil(this.presenter.midPrice.divide(stepValue).value)
                  )
                    .multiply(stepValue)
                    .add(priceOffset)
                }
              } //odd
              else {
                const stepValue =
                  priceDivisionManager.currentPriceDivisionSetting.columnPriceRange?.multiply(
                    10
                  )

                if (stepValue) {
                  const priceOffset = stepValue.multiply((i - 1) / 2)
                  labelPrice = currency(
                    Math.floor(this.presenter.midPrice.divide(stepValue).value)
                  )
                    .multiply(stepValue)
                    .subtract(priceOffset)
                }
              }
            }

            label.position.x =
              this.presenter.offsetForPrice(labelPrice) * this.cellWidth +
              this.orderBookRig.position.x
            marker.position.x = label.position.x //- this.cellWidth/2; ;// - 0.2;

            label.position.y =
              this.scene.sceneType === SceneFormatType.Portrait ? -7 : -0.65

            const labelPriceFormatted: currency = currency(labelPrice, {
              precision: 2,
            })
            const labelPriceString: string = labelPriceFormatted.format()

            //labelPriceString  = labelPriceString.substring(2,labelPriceString.length);;

            label.setColor(GLSGColor.SeaBlue)
            //labelPriceString = labelPriceString.substr(3, labelPriceString.length);
            marker.isVisible = true
            marker.position.y = -0.15
            marker.position.z = this.rows / 2
            marker.scaling.y = this.rows

            // if (labelPrice.value % 10 === 0)
            //     label.setEnabled(true);
            // else
            //     label.setEnabled(false);

            /*
                        if (Math.abs(marker.position.x) > 30) 
                        {
                            marker.isVisible = false;
                            label.setVisibility(false);
                        }
                        */

            label.setText(labelPriceString)
          }
        }
      }
    }
  }
}
