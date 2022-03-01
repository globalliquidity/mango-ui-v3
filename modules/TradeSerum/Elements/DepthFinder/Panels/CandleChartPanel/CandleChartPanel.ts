import * as bjs from '@babylonjs/core/Legacy/legacy'
import { Scene } from '@/modules/SceneGraph/Scene'
import {
  HorizontalAlignment,
  VerticalAlignment,
  GLSGColor,
} from '@/modules/SceneGraph/Enums'
import { DockingPosition, SceneFormatType } from '@/modules/SceneGraph/Enums'
import { TextMeshString } from '@/modules/SceneGraph/TextMeshString'
import { Panel } from '@/modules/SceneGraph/Panel'
import { CandleChartPresenter } from './CandleChartPresenter'
import { CandleChartElement } from './CandleChartElement'
import { GridMaterial } from '@babylonjs/materials'
import { BarChartElement } from './BarChartElement'

export class CandleChartPanel extends Panel {
  // panelPlane: bjs.Mesh;
  backgroundPlane?: bjs.Mesh

  // material: bjs.PBRMaterial;
  backgroundMaterial?: GridMaterial

  backgroundColor: bjs.Color3 = bjs.Color3.FromInts(0, 12, 32)

  hasHeader = true
  headPlane?: bjs.Mesh
  bodyPlane?: bjs.Mesh

  xLabels: Array<TextMeshString> = new Array<TextMeshString>()
  yLabels: Array<TextMeshString> = new Array<TextMeshString>()
  barLabels: Array<TextMeshString> = new Array<TextMeshString>()
  // numXLabels: number = 4;
  // numYLabels: number = 3;

  isDocked = false

  constructor(
    name: string,
    public x: number,
    public y: number,
    public z: number,
    public width: number,
    public height: number,
    public scene: Scene,
    public candleCount: number,
    public presenter: CandleChartPresenter,
    public glowLayer: bjs.GlowLayer,
    public dockingPosition: DockingPosition
  ) {
    super(name, x, y, z, scene, width, height, dockingPosition)
    this.create()
  }

  async create() {
    super.create()

    this.createSubPanels()
    this.initHeadPanel()

    this.createBackground()
    this.createTickLabels()
    this.initElements()
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

      this.headPlane = bjs.MeshBuilder.CreatePlane(
        this.name + ' Head',
        { width: this.width, height: this.presenter.headHeight },
        this.scene.bjsScene
      )
      this.headPlane.parent = this //this.panelPlane;
      this.headPlane.material = material
      this.headPlane.position.y = (this.height - this.presenter.headHeight) / 2
      this.headPlane.position.z = -0.001
    }
  }

  private initHeadPanel() {
    // First Field - Symbol

    const titleElem = new TextMeshString(
      'Candle Stick',
      0,
      0,
      0,
      this.scene,
      'CANDLE STICK',
      1.0,
      HorizontalAlignment.Center,
      VerticalAlignment.Middle,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    if (this.headPlane) {
      titleElem.parent = this.headPlane
      titleElem.scaling = this.presenter.titleScale
      titleElem.setColor(GLSGColor.Cyan)
    }
  }

  private createBackground() {
    const backgroundWidth = this.width - this.presenter.marginX
    const backgroundHeight =
      this.height - this.presenter.marginY - this.presenter.headHeight

    const backgroundOffsetX =
      this.x - this.presenter.marginX / 2 + this.presenter.bgOffsetX
    const backgroundOffsetY =
      this.y +
      (this.presenter.marginY - this.presenter.headHeight) / 2 -
      this.presenter.bgOffsetY
    this.backgroundPlane = bjs.MeshBuilder.CreatePlane(
      this.name + ' Background',
      { width: backgroundWidth, height: backgroundHeight },
      this.scene.bjsScene
    )
    this.backgroundPlane.parent = this

    this.backgroundMaterial = new GridMaterial(
      'backgroundMaterial',
      this.scene.bjsScene
    )
    // this.backgroundMaterial.lineColor = bjs.Color3.FromInts(255,255,255);
    // this.backgroundMaterial.mainColor = this.backgroundColor;
    this.backgroundMaterial.mainColor = new bjs.Color3(0.85, 0.85, 0.85) //new bjs.Color3(0, 0.05, 0.2);//bjs.Color3.FromInts(0,33,81);
    this.backgroundMaterial.lineColor = new bjs.Color3(0, 0, 0)
    this.backgroundMaterial.majorUnitFrequency = 10
    this.backgroundMaterial.minorUnitVisibility = 0.5
    this.backgroundMaterial.gridRatio = 0.5
    this.backgroundMaterial.gridOffset.x = 2.5
    this.backgroundMaterial.gridOffset.y = -7.5
    this.backgroundMaterial.alpha = 0.1
    this.backgroundMaterial.opacity = 0.2
    this.backgroundMaterial.backFaceCulling = false
    // this.backgroundMaterial.alphaMode = 1;
    this.backgroundPlane.material = this.backgroundMaterial
    // this.backgroundPlane.receiveShadows = false;
    this.backgroundPlane.hasVertexAlpha = true
    // this.backgroundPlane.position = new bjs.Vector3(this.x, this.y - (this.presenter.headHeight / 2), this.z);
    this.backgroundPlane.position = new bjs.Vector3(
      backgroundOffsetX,
      backgroundOffsetY,
      this.z
    )
    // this.glowLayer.addIncludedOnlyMesh(this.backgroundPlane);

    // let originMesh = bjs.MeshBuilder.CreateSphere("sphere", {diameter: 1}, this.scene.bjsScene); //default sphere
    // originMesh.parent = this;
    // originMesh.position.x = this.presenter.originX;
    // originMesh.position.y = this.presenter.originY;
  }

  private createTickLabels() {
    for (let i = 0; i < this.presenter.xTickCount; i++) {
      const label: TextMeshString = new TextMeshString(
        'xLabel' + i,
        this.presenter.originX + i * 5,
        this.presenter.originY,
        0,
        this.scene,
        '10.00',
        0.4,
        HorizontalAlignment.Center,
        VerticalAlignment.Bottom,
        bjs.Mesh.BILLBOARDMODE_NONE
      )
      label.parent = this
      label.setColor(GLSGColor.SeaBlue)
      this.xLabels.push(label)
    }

    let tickHeight =
      this.presenter.candleChartHeight / (this.presenter.yTickCount - 1)
    for (let i = 0; i < this.presenter.yTickCount; i++) {
      const label: TextMeshString = new TextMeshString(
        'yLabel' + i,
        this.presenter.originX + this.presenter.chartWidth,
        this.presenter.candleOriginY + i * tickHeight,
        0,
        this.scene,
        '12000',
        0.4,
        HorizontalAlignment.Left,
        VerticalAlignment.Top,
        bjs.Mesh.BILLBOARDMODE_NONE
      )
      label.parent = this
      label.setColor(GLSGColor.SeaBlue)
      this.yLabels.push(label)
    }

    tickHeight =
      this.presenter.barChartHeight / (this.presenter.barTickCount + 1)
    for (let i = 0; i < this.presenter.barTickCount; i++) {
      const label: TextMeshString = new TextMeshString(
        'barLabel' + i,
        this.presenter.originX + this.presenter.chartWidth,
        this.presenter.originY + (i + 1) * tickHeight,
        0,
        this.scene,
        '100',
        0.4,
        HorizontalAlignment.Left,
        VerticalAlignment.Middle,
        bjs.Mesh.BILLBOARDMODE_NONE
      )
      label.parent = this
      label.setColor(GLSGColor.SeaBlue)
      this.barLabels.push(label)
    }
  }

  private initElements() {
    const candleChartElement = new CandleChartElement(
      'Candle Chart',
      0,
      0,
      0,
      this.scene,
      this.candleCount,
      this.presenter
    )
    this.addChild(candleChartElement)
    // candleChartElement.parent = this.bodyPlane;

    const barChartElement = new BarChartElement(
      'Bar Chart',
      0,
      0,
      0,
      this.scene,
      this.candleCount,
      this.presenter
    )
    this.addChild(barChartElement)
  }

  protected onFormat() {
    super.onFormat()

    if (this.scene.sceneType === SceneFormatType.Portrait) {
      this.dockingPosition = DockingPosition.BOTTOM

      // this.scaling.x = this.distance / this.width;
      // this.scaling.y = this.scaling.x;
    } else {
      this.dockingPosition = DockingPosition.TOP_LEFT
      // this.scaling.x = 1;
      // this.scaling.y = 1;
    }
  }

  protected onPreRender() {
    // super.onPreRender();
    if (this.presenter && this.presenter.isReady) {
      for (let i = 0; i < this.presenter.xTickCount; i++) {
        this.xLabels[i].setText(this.presenter.xValues[i])
      }

      for (let i = 0; i < this.presenter.yTickCount; i++) {
        this.yLabels[i].setText(this.presenter.yValues[i])
      }

      for (let i = 0; i < this.presenter.barTickCount; i++) {
        this.barLabels[i].setText(this.presenter.barValues[i])
      }
    }
  }
}
