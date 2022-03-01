import * as bjs from '@babylonjs/core/Legacy/legacy'
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { Scene } from '@/modules/SceneGraph/Scene'
// import { AssetManager } from '@/modules/SceneGraph/AssetManager';
import { EventBus } from '@/modules/SceneGraph/EventBus'

export class RestartButtonElement extends SceneElement {
  background?: bjs.Mesh
  text?: bjs.Mesh
  buttonProxy?: bjs.Mesh

  backgroundMaterial: bjs.PBRMaterial = new bjs.PBRMaterial(
    'Restart Background Mat',
    this.scene.bjsScene
  )
  textMaterial: bjs.PBRMaterial = new bjs.PBRMaterial(
    'Restart Text Mat',
    this.scene.bjsScene
  )

  buttonProxyMaterial?: bjs.StandardMaterial

  rotateIcon?: bjs.Mesh
  roateIconMaterial?: bjs.Mesh

  buttonWasPressed = false
  endingScale: bjs.Vector3 = new bjs.Vector3(0, 0, 0)

  isHovered = false

  buttonDefaultScale: bjs.Vector3 = new bjs.Vector3(2.5, 2.5, 2.5)
  buttonLargeScale: bjs.Vector3 = new bjs.Vector3(2.6, 2.6, 2.6)
  buttonIsExpanding = true

  textEmissiveDefault: bjs.Color3 = bjs.Color3.FromInts(0, 0, 0)
  textEmissiveExpanded: bjs.Color3 = bjs.Color3.FromInts(70, 53, 6)

  textEmissiveHovered: bjs.Color3 = bjs.Color3.FromInts(86, 63, 1)
  colorLerpFactor = 0.8625

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: Scene,
    public glowLayer: bjs.GlowLayer
  ) {
    super(name, x, y, z, scene)
    this.create()
  }

  protected async onCreate() {
    this.buttonProxyMaterial = new bjs.StandardMaterial(
      'Restart Button Proxy',
      this.scene.bjsScene
    )
    this.buttonProxyMaterial.alpha = 0.01

    const buttonProxy = await this.getClonedMesh('SmoothCube')
    this.buttonProxy = buttonProxy
    // this.buttonProxy = AssetManager.Instance.getMeshClone("SmoothCube") as bjs.Mesh;
    this.buttonProxy.name = 'Restart Button Proxy'
    this.buttonProxy.parent = this
    this.buttonProxy._scene = this.scene.bjsScene
    this.buttonProxy.alwaysSelectAsActiveMesh = true
    this.buttonProxy.scaling = new bjs.Vector3(0.095, 0.01, 0.03)
    this.buttonProxy.material = this.buttonProxyMaterial
    this.buttonProxy.hasVertexAlpha = true
    this.scene.bjsScene.addMesh(this.buttonProxy)
    this.buttonProxy.isPickable = true
    this.glowLayer.addIncludedOnlyMesh(this.buttonProxy)
    this.buttonProxy.actionManager = new bjs.ActionManager(this.scene.bjsScene)
    this.buttonProxy.actionManager.registerAction(
      new bjs.ExecuteCodeAction(bjs.ActionManager.OnPointerOverTrigger, () => {
        if (this.buttonProxyMaterial)
          this.buttonProxyMaterial.emissiveColor = new bjs.Color3(1, 1, 1)
        this.isHovered = true
      })
    )

    this.buttonProxy.actionManager.registerAction(
      new bjs.ExecuteCodeAction(bjs.ActionManager.OnPointerOutTrigger, () => {
        this.isHovered = false
        if (this.buttonProxyMaterial)
          this.buttonProxyMaterial.emissiveColor = new bjs.Color3(0, 0, 0)
      })
    )

    this.buttonProxy.actionManager.registerAction(
      new bjs.ExecuteCodeAction(bjs.ActionManager.OnPickTrigger, () => {
        // this.buttonWasPressed = true;
        // this.setEnabled(false);
        EventBus.Instance.emit('REPLAY')
      })
    )

    const background = await this.getClonedMesh('startButtonBackground')
    this.background = background
    // this.background = AssetManager.Instance.getMeshClone("startButtonBackground") as bjs.Mesh;
    this.background.name = 'Restart Button Background'
    this.background.parent = this
    this.background._scene = this.scene.bjsScene
    this.background.alwaysSelectAsActiveMesh = true
    this.backgroundMaterial.albedoColor = bjs.Color3.FromInts(114, 119, 203) //0, 16, 48
    this.backgroundMaterial.reflectionTexture = this.scene
      .hdrTexture as bjs.Nullable<bjs.BaseTexture>
    this.backgroundMaterial.roughness = 0.1
    this.backgroundMaterial.metallic = 0.8
    this.scene.bjsScene.addMesh(this.background)

    // (this.background.getChildren()[0] as bjs.Mesh).material = this.backgroundMaterial;
    this.background.material = this.backgroundMaterial

    const backgroundMesh = this.background.getChildMeshes[0] as bjs.Mesh

    if (backgroundMesh) {
      backgroundMesh.material = this.backgroundMaterial
    }

    const text = await this.getClonedMesh('tradeText')
    this.text = text
    // this.text = AssetManager.Instance.getMeshClone("tradeText") as bjs.Mesh;
    this.text.name = 'Restart Trading Text'
    this.text._scene = this.scene.bjsScene
    this.text.alwaysSelectAsActiveMesh = true
    this.textMaterial.albedoColor = bjs.Color3.FromInts(33, 32, 126) //0, 16, 48
    this.textMaterial.reflectionTexture = this.scene
      .hdrTexture as bjs.Nullable<bjs.BaseTexture>
    this.textMaterial.metallic = 0.61
    this.textMaterial.roughness = 0.06
    this.scene.bjsScene.addMesh(this.text)
    // let textMesh : bjs.Mesh = (this.text.getChildren()[0] as bjs.Mesh);
    // textMesh.material = this.textMaterial;
    // this.glowLayer.addIncludedOnlyMesh(textMesh);
    // textMesh.position.z = 0;
    this.glowLayer.addIncludedOnlyMesh(this.text)
    this.text.material = this.textMaterial
    this.text.parent = this
    this.text.position.x = -0.05
    this.text.position.y = -0.65

    this.text.scaling.x = 0.92
    this.text.scaling.y = 0.92
    this.text.position.z = -0.2

    this.background.rotate(bjs.Axis.Y, Math.PI, bjs.Space.LOCAL)
    // this.text.rotate(bjs.Axis.Y,Math.PI, bjs.Space.LOCAL);
  }

  showStartButton(isShown: boolean) {
    if (this.background) this.background.setEnabled(isShown)
    if (this.text) this.text.setEnabled(isShown)
    if (this.buttonProxy) this.buttonProxy.setEnabled(isShown)
  }

  showRotateIcon(isShown: boolean) {
    if (this.rotateIcon) this.rotateIcon.setEnabled(isShown)
  }

  protected onRender() {
    //const deviceAspectRatio : number = this.scene.engine?.getAspectRatio(this.scene.camera) as number;

    /*
        if(deviceAspectRatio < 1)
        {
            this.showStartButton(false);
            this.showRotateIcon(true);
        }
        else
        {
            this.showRotateIcon(false);
            this.showStartButton(true);
            this.renderStartButton();
        }
        */
    this.renderStartButton()
  }

  private renderStartButton() {
    // this.lookAt(this.scene.camera.position);
    // this.rotate(bjs.Axis.Y, Math.PI, bjs.Space.LOCAL);

    if (this.buttonWasPressed) {
      /*
            this.scaling = bjs.Vector3.Lerp(this.scaling, bjs.Vector3.Zero(),0.1);
            if (this.scaling.x < 0.01) 
            {
                this.setEnabled(false);
            }
            */
    } else {
      if (this.isHovered) {
        this.textMaterial.emissiveColor = bjs.Color3.Lerp(
          this.textMaterial.emissiveColor,
          this.textEmissiveHovered,
          this.colorLerpFactor
        )
      } else {
        if (this.buttonIsExpanding) {
          this.scaling = bjs.Vector3.Lerp(
            this.scaling,
            this.buttonLargeScale,
            0.15
          )
          this.textMaterial.emissiveColor = bjs.Color3.Lerp(
            this.textMaterial.emissiveColor,
            this.textEmissiveExpanded,
            0.1
          )

          if (this.buttonLargeScale.x - this.scaling.x < 0.01) {
            this.buttonIsExpanding = false
          }
        } else {
          this.scaling = bjs.Vector3.Lerp(
            this.scaling,
            this.buttonDefaultScale,
            0.05
          )
          this.textMaterial.emissiveColor = bjs.Color3.Lerp(
            this.textMaterial.emissiveColor,
            this.textEmissiveDefault,
            0.05
          )

          if (this.scaling.x - this.buttonDefaultScale.x < 0.01) {
            this.buttonIsExpanding = true
          }
        }
      }
    }
  }
}
