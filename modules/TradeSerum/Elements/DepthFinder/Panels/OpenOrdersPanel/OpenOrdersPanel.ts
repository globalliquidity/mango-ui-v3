import * as bjs from '@babylonjs/core/Legacy/legacy'
import { Scene } from '@/modules/SceneGraph/Scene'
// import Logger from '@/modules/SceneGraph/Logger';
import {
  GLSGColor,
  HorizontalAlignment,
  VerticalAlignment,
} from '@/modules/SceneGraph/Enums'
import { DockingPosition } from '@/modules/SceneGraph/Enums'
import { TextMeshString } from '@/modules/SceneGraph/TextMeshString'
import { Panel } from '@/modules/SceneGraph/Panel'

import { AssetManager } from '@/modules/SceneGraph/AssetManager'
import { Order } from '@project-serum/serum/lib/market'
import { SerumDexUIAdapter } from '@/modules/TradeSerum/SerumDexUIAdapter'

export class OpenOrdersPanel extends Panel {
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

  // Variables in presenter
  public isUpdated = false
  public openOrders: Order[] = []
  public cellWidth = 5
  public cellHeight = 1
  public cellScale: bjs.Vector3 = new bjs.Vector3(0.75, 0.75, 0.75)
  public startOffsetX = -5.3

  public headStartOffsetY = -0.1
  public bodyStartOffsetY = 3.3

  public fields: Array<string> = ['MARKET', 'SIDE', 'SIZE', 'PRICE']

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
    public dockingPosition: DockingPosition,
    public offset: bjs.Vector3,
    public glowLayer: bjs.GlowLayer
  ) {
    super(name, x, y, z, scene, width, height, dockingPosition, offset)
    this.create()
  }

  async create() {
    super.create()

    this.cellWidth = this.width / this.columnCount
    this.cellHeight = this.height / (this.rowCount + 1)

    this.bodyStartOffsetY = this.height / 2 - (this.cellHeight * 3) / 2
    this.startOffsetX = -(
      this.width / 2 -
      (this.cellWidth - this.cellScale.x * 4) / 4
    ) //- ((this.width / 2) - ((this.cellWidth - this.cellScale.x * 4) / 2));

    SerumDexUIAdapter.Instance.onOpenOrdersUpdated.subscribe((orders) => {
      this.openOrders = orders
      this.isUpdated = true

      if (this.openOrders.length > 0) this.headPlane?.setEnabled(true)
      else this.headPlane?.setEnabled(false)
    })

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
      this.headPlane.setEnabled(false)
    }
  }

  private initHeadPanel() {
    // First Field - Symbol
    for (let i = 0; i < this.columnCount; i++) {
      const headText = this.fields[i]
      const headElem = new TextMeshString(
        headText,
        i * this.cellWidth + this.startOffsetX,
        0,
        0,
        this.scene,
        headText,
        2.0,
        HorizontalAlignment.Left,
        VerticalAlignment.Middle,
        bjs.Mesh.BILLBOARDMODE_NONE
      )

      if (this.headPlane) {
        headElem.parent = this.headPlane
        headElem.scaling = this.cellScale
        headElem.setColor(GLSGColor.Blue)

        this.headElements.push(headElem)
      }
    }

    // this.record = new TradeBlotterItemElement("Elem1",this.x, this.y, this.z, this.scene, this.bodyPlane);
  }

  private initElements() {
    const totalCount = this.rowCount * this.columnCount

    for (let i = 0; i < totalCount; i++) {
      const elemName = 'openorders-' + i.toString()

      const elem = new TextMeshString(
        elemName,
        0,
        0,
        0,
        this.scene,
        '9999.99',
        2.0,
        HorizontalAlignment.Left,
        VerticalAlignment.Middle,
        bjs.Mesh.BILLBOARDMODE_NONE
      )
      elem.setColor(GLSGColor.Violet)

      elem.scaling = this.cellScale
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
    this.highlightShape.position.x = 3.071
    this.highlightShape.scaling = new bjs.Vector3(1.96, 0.15, 0.2)
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

  protected onPreRender() {
    // super.onPreRender();
    if (this.isUpdated) {
      for (let i = 0; i < this.rowCount; i++) {
        const positionOffsetY = this.bodyStartOffsetY - i * this.cellHeight

        if (i < this.openOrders.length) {
          const currentOrder: Order = this.openOrders[i]

          const marketElem = this.textElements[i * this.columnCount]
          marketElem.setText('SRM/SOL')
          marketElem.setColor(GLSGColor.Yellow)
          marketElem.setVisibility(true)
          marketElem.scaling = this.cellScale
          marketElem.position.x = this.startOffsetX
          marketElem.position.y = positionOffsetY

          const sideElem = this.textElements[i * this.columnCount + 1]
          sideElem.setText(currentOrder.side.toUpperCase())
          sideElem.setColor(GLSGColor.Yellow)
          sideElem.setVisibility(true)
          sideElem.scaling = this.cellScale
          sideElem.position.x = 1 * this.cellWidth + this.startOffsetX
          sideElem.position.y = positionOffsetY

          const sizeElem = this.textElements[i * this.columnCount + 2]
          sizeElem.setText(currentOrder.size.toString())
          sizeElem.setColor(GLSGColor.Yellow)
          sizeElem.setVisibility(true)
          sizeElem.scaling = this.cellScale
          sizeElem.position.x = 2 * this.cellWidth + this.startOffsetX
          sizeElem.position.y = positionOffsetY

          const priceElem = this.textElements[i * this.columnCount + 3]
          priceElem.setText(currentOrder.price.toString())
          priceElem.setColor(GLSGColor.Yellow)
          priceElem.setVisibility(true)
          priceElem.scaling = this.cellScale
          priceElem.position.x = 3 * this.cellWidth + this.startOffsetX
          priceElem.position.y = positionOffsetY
        } else {
          for (let j = 0; j < this.columnCount; j++) {
            const elem = this.textElements[i * this.columnCount + j]
            elem.setVisibility(false)
          }
        }
      }
    }
    this.isUpdated = false
  }
}
