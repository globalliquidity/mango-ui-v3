import * as bjs from '@babylonjs/core/Legacy/legacy'
import { Scene } from '@/modules/SceneGraph/Scene'
import {
  HorizontalAlignment,
  VerticalAlignment,
} from '@/modules/SceneGraph/Enums'
import { TradeStatus, TradeDirection } from '@/modules/TradeSerum/Enums'
import { DockingPosition, SceneFormatType } from '@/modules/SceneGraph/Enums'
import { TextMeshString } from '@/modules/SceneGraph/TextMeshString'
import { Panel } from '@/modules/SceneGraph/Panel'

import { TradeBlotterItem } from './TradeBlotterItem'
import { TradeBlotterPresenter } from './TradeBlotterPresenter'
import { TradeBlotterRow } from './TradeBlotterRow'
import { AssetManager } from '@/modules/SceneGraph/AssetManager'

export class TradeBlotterPanel extends Panel {
  // panelPlane: bjs.Mesh;
  // material: bjs.PBRMaterial;

  hasHeader = true
  headPlane?: bjs.Mesh

  // records: Array<TradeBlotterItemElement> = new Array<TradeBlotterItemElement>();

  textElements: Array<TextMeshString> = new Array<TextMeshString>()
  headElements: Array<TextMeshString> = new Array<TextMeshString>()

  isDocked = false

  // private material : SolidParticleMaterial | undefined;
  // private maxRecordCount: number = 10;
  // private recentTradeCount: number = 0;

  public highlightShape?: bjs.Mesh
  public highlightShapeMat?: bjs.PBRMaterial

  emissiveDefault: bjs.Color3 = new bjs.Color3(0, 0, 0)

  emissiveLong: bjs.Color3 = new bjs.Color3(0, 0, 1)
  emissiveShort: bjs.Color3 = new bjs.Color3(0.8, 0.2, 1)

  emissiveWin: bjs.Color3 = new bjs.Color3(0, 1, 0)
  emissiveLoss: bjs.Color3 = new bjs.Color3(1, 0, 0)

  constructor(
    name: string,
    public x: number,
    public y: number,
    public z: number,
    public width: number,
    public height: number,
    public rowCount: number,
    public columnCount: number,
    scene: Scene,
    public presenter: TradeBlotterPresenter,
    public dockingPosition: DockingPosition,
    public glowLayer: bjs.GlowLayer
  ) {
    super(name, x, y, z, scene, width, height, dockingPosition)
    this.create()
  }

  async create() {
    super.create()

    this.createSubPanels()
    this.initHeadPanel()
    this.initElements()
    this.initHighlight()
  }

  private createSubPanels() {
    if (this.scene && this.scene.bjsScene) {
      const material = new bjs.PBRMaterial(
        'Plan Material 2',
        this.scene.bjsScene
      )
      material.albedoColor = bjs.Color3.FromInts(0, 12, 32) //0, 16, 48
      // material1.reflectionTexture =  this.scene.hdrTexture as bjs.Nullable<bjs.BaseTexture>;
      material.roughness = 1
      material.metallic = 0.5
      material.alpha = 0.05
      // material1.needDepthPrePass = true;

      const headHeight = this.height / (this.rowCount + 1)

      this.headPlane = bjs.MeshBuilder.CreatePlane(
        this.name + ' Head',
        { width: this.width, height: headHeight },
        this.scene.bjsScene
      )
      this.headPlane.parent = this //this.panelPlane;
      this.headPlane.material = material
      this.headPlane.position.y = (this.height - headHeight) / 2
      this.headPlane.position.z = -0.001
    }
  }

  private initHeadPanel() {
    // First Field - Symbol
    for (let i = 0; i < this.presenter.columnCount; i++) {
      const headItem = this.presenter.fixedRow.getItemByColumnName(
        this.presenter.fields[i]
      ) as TradeBlotterItem

      const headElem = new TextMeshString(
        this.presenter.fields[i],
        headItem.positionOffset.x,
        headItem.positionOffset.y,
        0,
        this.scene,
        headItem.getItemAsText(),
        1.0,
        HorizontalAlignment.Left,
        VerticalAlignment.Middle,
        bjs.Mesh.BILLBOARDMODE_NONE
      )

      if (this.headPlane) {
        headElem.parent = this.headPlane
        headElem.scaling = headItem.scaling
        headElem.setColor(headItem.color)

        this.headElements.push(headElem)
      }
    }

    // this.record = new TradeBlotterItemElement("Elem1",this.x, this.y, this.z, this.scene, this.bodyPlane);
  }

  private initElements() {
    const totalCount = this.presenter.rowCount * this.presenter.columnCount

    for (let i = 0; i < totalCount; i++) {
      const elemName = 'tradeblotter-' + i.toString()

      const elem = new TextMeshString(
        elemName,
        0,
        0,
        0,
        this.scene,
        '9999.99',
        1.0,
        HorizontalAlignment.Left,
        VerticalAlignment.Middle,
        bjs.Mesh.BILLBOARDMODE_NONE
      )

      elem.scaling = this.presenter.cellScale
      elem.setVisibility(false)

      this.addChild(elem)
      this.textElements.push(elem)
    }
  }

  public initHighlight() {
    this.highlightShapeMat = new bjs.PBRMaterial(
      'Highlight Mat',
      this.scene.bjsScene
    )
    this.highlightShapeMat.alpha = 0.2
    // this.highlightShapeMat.albedoColor = bjs.Color3.FromInts(33,32,126); //0, 16, 48
    // this.highlightShapeMat.reflectionTexture =  this.scene.hdrTexture as bjs.Nullable<bjs.BaseTexture>;
    // this.highlightShapeMat.metallic = 0.61;
    // this.highlightShapeMat.roughness = 0.06;
    // this.highlightShapeMat.emissiveColor = bjs.Color3.FromInts(0,0,0);
    this.highlightShapeMat.albedoColor = bjs.Color3.FromInts(64, 64, 64) //0, 16, 48
    this.highlightShapeMat.reflectionTexture = this.scene
      .hdrTexture as bjs.Nullable<bjs.BaseTexture>
    this.highlightShapeMat.roughness = 0.1
    this.highlightShapeMat.metallic = 0.8

    this.highlightShape = AssetManager.Instance(this.scene.title).getMeshClone(
      'arrowBackground'
    ) as bjs.Mesh
    this.highlightShape.name = 'Highligh Shape'
    this.highlightShape.parent = this
    // this.highlightShape.scaling = new bjs.Vector3(this.presenter.cellWidth * 0.0495, 0.001,this.presenter.cellHeight * 0.011);
    // this.highlightShape.position.x = 4.2;
    // this.highlightShape.position.y = 0.7;
    // this.highlightShape.position.z = -2;
    // this.highlightShape.billboardMode = bjs.Mesh.BILLBOARDMODE_X;
    this.highlightShape.position.x = 3.6
    this.highlightShape.scaling = new bjs.Vector3(2.35, 0.17, 0.2)
    // this.highlightShape.position.y = 4.397;
    this.highlightShape.position.z = 0
    // this.highlightShape.scaling = new bjs.Vector3(2.5,0.15,0);
    // this.highlightShape.material = this.highlightShapeMat;
    ;(this.highlightShape.getChildren()[0] as bjs.Mesh).material =
      this.highlightShapeMat
    this.highlightShape.hasVertexAlpha = true
    // this.highlightShape.isVisible = false;
    this.highlightShape.setEnabled(false)

    // this.highlightShape.rotate(bjs.Axis.Y,Math.PI, bjs.Space.LOCAL);

    this.glowLayer.addIncludedOnlyMesh(this.highlightShape)
    this.highlightShapeMat.emissiveColor = this.emissiveDefault
  }

  public hideRows() {
    const totalCount = this.presenter.rowCount * this.presenter.columnCount

    for (let i = 0; i < totalCount; i++) {
      this.textElements[i].setVisibility(false)
    }

    if (this.highlightShape) this.highlightShape.setEnabled(false)
    this.presenter.isReady = false
  }

  protected onFormat() {
    super.onFormat()

    if (this.scene.sceneType === SceneFormatType.Portrait) {
      this.dockingPosition = DockingPosition.TOP
      this.position.x = 0
      // this.scaling.x = this.distance / this.width;
      // this.scaling.y = this.scaling.x;
    } else {
      this.dockingPosition = DockingPosition.TOP_RIGHT
      // this.scaling.x = 1;
      // this.scaling.y = 1;
    }
  }

  protected onPreRender() {
    // super.onPreRender();
    if (this.presenter.isReady) {
      if (this.presenter.rows && this.presenter.rows.length > 0) {
        if (this.highlightShape) this.highlightShape.setEnabled(true)

        for (let i = 0; i < this.rowCount; i++) {
          if (i < this.presenter.rows.length) {
            const currentRow: TradeBlotterRow = this.presenter.rows[
              i
            ] as TradeBlotterRow

            for (let j = 0; j < this.columnCount; j++) {
              const elem = this.textElements[i * this.columnCount + j]
              const item = currentRow.getItemByIndex(j) as TradeBlotterItem
              const text = item.getItemAsText()
              if (text !== undefined) {
                elem.setText(text)
                elem.setColor(item.color)
                elem.setVisibility(item.isVisible)

                elem.scaling = item.scaling
                elem.position.x = item.positionOffset.x
                elem.position.y = item.positionOffset.y
              }
            }
          } else {
            for (let j = 0; j < this.columnCount; j++) {
              const elem = this.textElements[i * this.columnCount + j]
              elem.setVisibility(false)
            }
          }
        }

        const currentRow: TradeBlotterRow = this.presenter
          .rows[0] as TradeBlotterRow
        const item = currentRow.getItemByIndex(0) as TradeBlotterItem

        if (this.highlightShape && this.highlightShapeMat) {
          this.highlightShape.position.y = item.positionOffset.y + 0.15

          if (currentRow.status === TradeStatus.Open) {
            if (currentRow.direction === TradeDirection.Long) {
              this.highlightShapeMat.emissiveColor = bjs.Color3.Lerp(
                this.highlightShapeMat.emissiveColor,
                this.emissiveLong,
                0.1
              )
            } else {
              this.highlightShapeMat.emissiveColor = bjs.Color3.Lerp(
                this.highlightShapeMat.emissiveColor,
                this.emissiveShort,
                0.1
              )
            }
          } else if (currentRow.status === TradeStatus.Closed) {
            if (currentRow.isWin()) {
              this.highlightShapeMat.emissiveColor = bjs.Color3.Lerp(
                this.highlightShapeMat.emissiveColor,
                this.emissiveWin,
                0.1
              )
            } else {
              this.highlightShapeMat.emissiveColor = bjs.Color3.Lerp(
                this.highlightShapeMat.emissiveColor,
                this.emissiveLoss,
                0.1
              )
            }
          }
        }
      } else {
        this.hideRows()
      }
    }
  }

  protected onDisposing() {
    const totalCount = this.presenter.rowCount * this.presenter.columnCount

    for (let i = 0; i < totalCount; i++) {
      const elem = this.textElements[i]
      elem.parent = null
    }

    this.textElements = []
  }
}
