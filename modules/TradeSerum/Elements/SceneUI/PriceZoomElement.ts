import * as bjs from '@babylonjs/core/Legacy/legacy'
import { Scene } from '@/modules/SceneGraph/Scene'
import { AssetManager } from '@/modules/SceneGraph/AssetManager'
import { EventBus } from '@/modules/SceneGraph/EventBus'
import {
  GLSGColor,
  HorizontalAlignment,
  VerticalAlignment,
} from '@/modules/SceneGraph/Enums'
import { DockingPosition, SceneFormatType } from '@/modules/SceneGraph/Enums'
import { TextMeshString } from '@/modules/SceneGraph/TextMeshString'
import { PriceDivisionManager } from '@/modules/TradeSerum/PriceDivision/PriceDivisionManager'
import { UIControl } from '@/modules/SceneGraph/UIControl'

export class PriceZoomElement extends UIControl {
  plusButtonMaterial?: bjs.PBRMaterial
  plusButtonMesh?: bjs.Mesh

  minusButtonMaterial?: bjs.PBRMaterial
  minusButtonMesh?: bjs.Mesh

  // cubeMesh : bjs.Mesh;
  // cubeMaterial : bjs.PBRMaterial;

  labelMaterial?: bjs.PBRMaterial
  labelText?: TextMeshString

  private minusButtonHovered = false
  private plusButtonHovered = false

  private buttonDefaultScale: bjs.Vector3 = new bjs.Vector3(1, 1, 1)
  private buttonHoverScale: bjs.Vector3 = new bjs.Vector3(1.2, 1.2, 1.2)

  plusHoverColor: bjs.Color3 = bjs.Color3.FromInts(0, 23, 77)
  plusClickColor: bjs.Color3 = bjs.Color3.FromInts(0, 34, 112)

  minusHoverColor: bjs.Color3 = bjs.Color3.FromInts(52, 0, 77)
  minusClickColor: bjs.Color3 = bjs.Color3.FromInts(77, 0, 112)

  plusEmissiveFading = false
  minusEmissiveFading = false

  emissiveFadeRate = 0.1

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: Scene,
    public glowLayer: bjs.GlowLayer,
    public priceDivisionManager: PriceDivisionManager
  ) {
    super(
      name,
      x,
      y,
      z,
      scene,
      6,
      11.5,
      DockingPosition.BOTTOM_RIGHT,
      new bjs.Vector3(0, 0, 0)
    )
    this.create()
  }

  protected async onCreate() {
    this.plusButtonMaterial = new bjs.PBRMaterial(
      'Plus Button',
      this.scene.bjsScene
    )
    this.plusButtonMaterial.albedoColor = bjs.Color3.FromInts(96, 96, 96) //0, 16, 48
    this.plusButtonMaterial.reflectionTexture = this.scene
      .hdrTexture as bjs.Nullable<bjs.BaseTexture>
    this.plusButtonMaterial.roughness = 0.1
    this.plusButtonMaterial.metallic = 0.8
    this.plusButtonMaterial.clearCoat.isEnabled = true

    this.plusButtonMesh = AssetManager.Instance(this.scene.title).getMeshClone(
      'Plus'
    ) as bjs.Mesh
    this.plusButtonMesh.name = 'Plus Button'
    this.plusButtonMesh.parent = this
    this.plusButtonMesh.billboardMode = bjs.Mesh.BILLBOARDMODE_NONE
    ;(this.plusButtonMesh.getChildren()[0] as bjs.Mesh).material =
      this.plusButtonMaterial
    ;(this.plusButtonMesh.getChildren()[0] as bjs.Mesh).scaling =
      new bjs.Vector3(0.03, 0.03, 0.03)

    this.plusButtonMesh.position = new bjs.Vector3(0, 3.5, 0)
    this.plusButtonMesh.hasVertexAlpha = true

    this.minusButtonMaterial = new bjs.PBRMaterial(
      'Minus Button',
      this.scene.bjsScene
    )
    this.minusButtonMaterial.albedoColor = bjs.Color3.FromInts(96, 96, 96) //0, 16, 48
    this.minusButtonMaterial.reflectionTexture = this.scene
      .hdrTexture as bjs.Nullable<bjs.BaseTexture>
    this.minusButtonMaterial.roughness = 0.1
    this.minusButtonMaterial.metallic = 0.8
    this.minusButtonMaterial.clearCoat.isEnabled = true

    this.minusButtonMesh = AssetManager.Instance(this.scene.title).getMeshClone(
      'Minus'
    ) as bjs.Mesh
    this.minusButtonMesh.name = 'Minus Button'
    this.minusButtonMesh.parent = this
    this.minusButtonMesh.billboardMode = bjs.Mesh.BILLBOARDMODE_NONE
    ;(this.minusButtonMesh.getChildren()[0] as bjs.Mesh).material =
      this.minusButtonMaterial
    ;(this.minusButtonMesh.getChildren()[0] as bjs.Mesh).scaling =
      new bjs.Vector3(0.03, 0.03, 0.03)

    this.minusButtonMesh.position = new bjs.Vector3(0, -3, 0)
    this.minusButtonMesh.hasVertexAlpha = true

    // this.cubeMaterial = new bjs.PBRMaterial("Price Cube", this.scene.bjsScene);
    // this.cubeMaterial.albedoColor = bjs.Color3.FromInts(128,128,128);
    // this.cubeMaterial.metallic = 0.1;
    // this.cubeMaterial.roughness = 0.5;

    // this.cubeMesh = AssetManager.Instance.getMeshClone("SmoothCube") as bjs.Mesh;
    // this.cubeMesh.parent = this;
    // this.cubeMesh.material = this.cubeMaterial;
    // this.cubeMesh.scaling = new bjs.Vector3(0.8,0.8,0.8);
    // this.cubeMesh.position = new bjs.Vector3(0,-10,0);

    // this.cubeMesh.isVisible = false;

    this.labelText = new TextMeshString(
      'Price Division',
      0,
      0,
      0,
      this.scene,
      '0.5',
      1.5,
      HorizontalAlignment.Center,
      VerticalAlignment.Middle,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.labelText.scaling = new bjs.Vector3(1, 1, 1)
    this.labelText.parent = this
    this.labelText.setColor(GLSGColor.Green)

    this.labelText.setText(
      (
        this.priceDivisionManager.currentPriceDivisionSetting
          ?.columnPriceRange || ''
      ).toString()
    )

    const plusButtonMesh: bjs.Mesh =
      this.plusButtonMesh.getChildren()[0] as bjs.Mesh

    plusButtonMesh.isPickable = true
    this.glowLayer.addIncludedOnlyMesh(plusButtonMesh)
    plusButtonMesh.actionManager = new bjs.ActionManager(this.scene.bjsScene)
    plusButtonMesh.actionManager.registerAction(
      new bjs.ExecuteCodeAction(bjs.ActionManager.OnPointerOverTrigger, () => {
        if (this.plusButtonMaterial)
          this.plusButtonMaterial.emissiveColor = this.plusHoverColor
        this.plusButtonHovered = true
      })
    )

    plusButtonMesh.actionManager.registerAction(
      new bjs.ExecuteCodeAction(bjs.ActionManager.OnPointerOutTrigger, () => {
        if (this.plusButtonMaterial)
          this.plusButtonMaterial.emissiveColor = new bjs.Color3(0, 0, 0)
        this.plusButtonHovered = false
      })
    )

    plusButtonMesh.actionManager.registerAction(
      new bjs.ExecuteCodeAction(bjs.ActionManager.OnPickTrigger, () => {
        EventBus.Instance.emit('NEXT_CLICK')
        this.labelText?.setText(
          this.priceDivisionManager.currentPriceDivisionSetting?.columnPriceRange?.value
            .toFixed(2)
            .toString() as string
        )
        if (this.plusButtonMaterial)
          this.plusButtonMaterial.emissiveColor = this.plusClickColor
        this.plusEmissiveFading = true
        if (this.plusButtonMesh)
          this.plusButtonMesh.scaling = new bjs.Vector3(1.1, 1.1, 1.1)
        //this.labelText.setText("NEXT");
      })
    )

    const minusButtonMesh: bjs.Mesh =
      this.minusButtonMesh.getChildren()[0] as bjs.Mesh
    this.glowLayer.addIncludedOnlyMesh(minusButtonMesh)
    minusButtonMesh.isPickable = true
    minusButtonMesh.actionManager = new bjs.ActionManager(this.scene.bjsScene)
    minusButtonMesh.actionManager.registerAction(
      new bjs.ExecuteCodeAction(bjs.ActionManager.OnPointerOverTrigger, () => {
        if (this.minusButtonMaterial)
          this.minusButtonMaterial.emissiveColor = this.minusHoverColor
        this.minusButtonHovered = true
      })
    )

    minusButtonMesh.actionManager.registerAction(
      new bjs.ExecuteCodeAction(bjs.ActionManager.OnPointerOutTrigger, () => {
        if (this.minusButtonMaterial)
          this.minusButtonMaterial.emissiveColor = new bjs.Color3(0, 0, 0)
        this.minusButtonHovered = false
      })
    )

    minusButtonMesh.actionManager.registerAction(
      new bjs.ExecuteCodeAction(bjs.ActionManager.OnPickTrigger, () => {
        EventBus.Instance.emit('PREV_CLICK')
        this.labelText?.setText(
          this.priceDivisionManager.currentPriceDivisionSetting?.columnPriceRange?.value
            .toFixed(2)
            .toString() as string
        )
        if (this.minusButtonMaterial)
          this.minusButtonMaterial.emissiveColor = this.minusClickColor
        this.minusEmissiveFading = true
        if (this.minusButtonMesh)
          this.minusButtonMesh.scaling = new bjs.Vector3(1.1, 1.1, 1.1)
        //this.labelText.setText("PREV");
      })
    )

    //this.scene.bjsScene.actionManager = new bjs.ActionManager(this.scene.bjsScene);
    if (this.scene.bjsScene.actionManager === undefined) {
      this.scene.bjsScene.actionManager = new bjs.ActionManager(
        this.scene.bjsScene
      )
    }
  }

  public show() {
    this.setEnabled(true)
  }

  public hide() {
    this.setEnabled(false)
  }

  public getBounding() {
    return new bjs.Vector2(this.width, this.height)
  }

  protected onFormat() {
    if (this.scene.sceneType === SceneFormatType.Portrait) {
      this.dockingPosition = DockingPosition.TOP_LEFT
    } else {
      this.dockingPosition = DockingPosition.BOTTOM_RIGHT
    }
  }

  protected onPreRender() {}

  protected onRender() {
    //const aspectRatio : number = this.scene.bjsScene.getEngine().getAspectRatio(this.scene.camera);

    // this.lookAt(this.scene.camera.position);

    //console.log(this.scene.bjsScene.meshUnderPointer?.name);
    //this.rotate(bjs.Axis.Y, Math.PI, bjs.Space.LOCAL);

    if (this.minusButtonHovered) {
      //this.leftArrowBackground.scaling = bjs.Vector3.Lerp(this.leftArrowBackground.scaling,this.buttonHoverScale,0.1);
      if (this.minusButtonMesh)
        this.minusButtonMesh.scaling = bjs.Vector3.Lerp(
          this.minusButtonMesh.scaling,
          this.buttonHoverScale,
          0.2
        )
    } else {
      //this.leftArrowBackground.scaling = bjs.Vector3.Lerp(this.leftArrowBackground.scaling,this.buttonDefaultScale,0.1);
      if (this.minusButtonMesh)
        this.minusButtonMesh.scaling = bjs.Vector3.Lerp(
          this.minusButtonMesh.scaling,
          this.buttonDefaultScale,
          0.2
        )
    }

    if (this.plusButtonHovered) {
      //this.leftArrowBackground.scaling = bjs.Vector3.Lerp(this.leftArrowBackground.scaling,this.buttonHoverScale,0.1);
      if (this.plusButtonMesh)
        this.plusButtonMesh.scaling = bjs.Vector3.Lerp(
          this.plusButtonMesh.scaling,
          this.buttonHoverScale,
          0.2
        )
    } else {
      //this.leftArrowBackground.scaling = bjs.Vector3.Lerp(this.leftArrowBackground.scaling,this.buttonDefaultScale,0.1);
      if (this.plusButtonMesh)
        this.plusButtonMesh.scaling = bjs.Vector3.Lerp(
          this.plusButtonMesh.scaling,
          this.buttonDefaultScale,
          0.2
        )
    }

    if (this.plusEmissiveFading) {
      if (this.plusButtonMaterial) {
        this.plusButtonMaterial.emissiveColor = bjs.Color3.Lerp(
          this.plusButtonMaterial.emissiveColor,
          bjs.Color3.Black(),
          this.emissiveFadeRate
        )

        if (this.plusButtonMaterial.emissiveColor.b < 0.1) {
          this.plusButtonMaterial.emissiveColor = bjs.Color3.Black()
          this.plusEmissiveFading = false
        }
      }
    }

    if (this.minusEmissiveFading) {
      if (this.minusButtonMaterial) {
        this.minusButtonMaterial.emissiveColor = bjs.Color3.Lerp(
          this.minusButtonMaterial.emissiveColor,
          bjs.Color3.Black(),
          this.emissiveFadeRate
        )

        if (this.minusButtonMaterial.emissiveColor.r < 0.1) {
          this.minusButtonMaterial.emissiveColor = bjs.Color3.Black()
          this.minusEmissiveFading = false
        }
      }
    }
  }

  protected hsl2rgb(h, s, l): bjs.Color3 {
    let r, g, b

    if (!isFinite(h)) h = 0
    if (!isFinite(s)) s = 0
    if (!isFinite(l)) l = 0

    h /= 60
    if (h < 0) h = 6 - (-h % 6)
    h %= 6

    s = Math.max(0, Math.min(1, s / 100))
    l = Math.max(0, Math.min(1, l / 100))

    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs((h % 2) - 1))

    if (h < 1) {
      r = c
      g = x
      b = 0
    } else if (h < 2) {
      r = x
      g = c
      b = 0
    } else if (h < 3) {
      r = 0
      g = c
      b = x
    } else if (h < 4) {
      r = 0
      g = x
      b = c
    } else if (h < 5) {
      r = x
      g = 0
      b = c
    } else {
      r = c
      g = 0
      b = x
    }

    const m = l - c / 2
    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return new bjs.Color3(r, g, b)
  }

  protected rgb2hsl(r, g, b): bjs.Color3 {
    let h, s, l, d
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    l = (max + min) / 2
    if (max == min) {
      h = s = 0
    } else {
      d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }
    h = Math.floor(h * 360)
    s = Math.floor(s * 100)
    l = Math.floor(l * 100)
    return new bjs.Color3(h, s, l)
  }
}
