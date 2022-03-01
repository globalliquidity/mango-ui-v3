import * as bjs from '@babylonjs/core/Legacy/legacy'
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { Scene } from '@/modules/SceneGraph/Scene'
import { AssetManager } from '@/modules/SceneGraph/AssetManager'
import { TextMeshString } from '@/modules/SceneGraph/TextMeshString'
import {
  GLSGColor,
  HorizontalAlignment,
  VerticalAlignment,
} from '@/modules/SceneGraph/Enums'
import { TradingPlayer } from '@/modules/TradeSerum/TradingPlayer'

export class PlayerInfoElement extends SceneElement {
  background?: bjs.Mesh
  text?: TextMeshString
  playerImage?: bjs.Mesh
  playerImageMaterial?: bjs.StandardMaterial

  backgroundMaterial: bjs.PBRMaterial = new bjs.PBRMaterial(
    'Start Background Mat',
    this.scene.bjsScene
  )

  player?: TradingPlayer

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: Scene
  ) {
    super(name, x, y, z, scene)
    this.create()
  }

  protected onCreate() {
    this.background = AssetManager.Instance(this.scene.title).getMeshClone(
      'startButtonBackground'
    ) as bjs.Mesh
    this.background.name = 'Background'
    this.background.parent = this
    this.background.scaling = new bjs.Vector3(1.8, 0.5, 1)

    this.backgroundMaterial.albedoColor = bjs.Color3.FromInts(168, 171, 240) //0, 16, 48
    this.backgroundMaterial.reflectionTexture = this.scene
      .hdrTexture as bjs.Nullable<bjs.BaseTexture>
    this.backgroundMaterial.roughness = 0.22
    this.backgroundMaterial.metallic = 0.42

    // (this.background.getChildren()[0] as bjs.Mesh).material = this.backgroundMaterial;

    this.background.material = this.backgroundMaterial

    const backgroundMesh = this.background.getChildMeshes[0] as bjs.Mesh

    if (backgroundMesh) {
      backgroundMesh.material = this.backgroundMaterial
    }

    this.text = new TextMeshString(
      'Player Name',
      -6,
      0,
      0,
      this.scene,
      '000',
      0.75,
      HorizontalAlignment.Left,
      VerticalAlignment.Middle,
      bjs.Mesh.BILLBOARDMODE_NONE
    )

    this.addChild(this.text)
    this.text.setColor(GLSGColor.SeaBlue)
    this.text.setText('PLAYER')

    this.playerImage = bjs.Mesh.CreatePlane(
      'Player Image',
      1,
      this.scene.bjsScene
    )
    this.playerImage.position.x = -7
    this.playerImage.position.y = 0
    this.playerImage.position.z = -0.05
    this.playerImage.parent = this
  }

  public Show(player: TradingPlayer) {
    this.player = player

    this.setEnabled(true)
    if (this.player.telegramUserName)
      this.text?.setText(this.player.telegramUserName.toUpperCase())
    if (this.player.playerImage) this.setPlayerImage(this.player.playerImage)
  }

  private setPlayerImage(playerImage: string | null) {
    //const playerImageString64:string = "data:image/jpg;base64," + playerImage;
    //console.log("Player Image:  " + playerImageString64);
    this.playerImageMaterial = new bjs.StandardMaterial(
      'Player Image',
      this.scene.bjsScene
    )
    this.playerImageMaterial.diffuseTexture = new bjs.Texture(
      playerImage || 'https://glsgassets.s3.amazonaws.com/default_avatar.jpeg',
      this.scene.bjsScene
    )
    this.playerImageMaterial.emissiveTexture = new bjs.Texture(
      playerImage || 'https://glsgassets.s3.amazonaws.com/default_avatar.jpeg',
      this.scene.bjsScene
    )

    //this.playerImageMaterial.diffuseTexture.uScale = 5.0;//Repeat 5 times on the Vertical Axes
    //this.playerImageMaterial.diffuseTexture.vScale = 5.0;//Repeat 5 times on the Horizontal Axes
    this.playerImageMaterial.backFaceCulling = false //Allways show the front and the back of an element
    if (this.playerImage) this.playerImage.material = this.playerImageMaterial
  }

  protected onRender() {
    //this.lookAt(this.scene.camera.position);
    //this.rotate(bjs.Axis.Y, Math.PI, bjs.Space.LOCAL);
  }
}
