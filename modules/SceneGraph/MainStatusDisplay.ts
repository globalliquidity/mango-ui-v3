import * as bjs from '@babylonjs/core/Legacy/legacy'
import { SceneElement } from './SceneElement'
import { Scene } from './Scene'
import Logger from './Logger'
import { TextMeshString } from './TextMeshString'
import { HorizontalAlignment } from './Enums'
import { VerticalAlignment, GLSGColor, AnimationState } from './Enums'
import { Queue } from 'queue-typescript'

export class StatusMessage {
  constructor(
    public text: string,
    public color: GLSGColor = GLSGColor.Aqua,
    public persist: boolean = false
  ) {}
}

export class MainStatusDisplay extends SceneElement {
  private textMesh!: TextMeshString
  private animationState: AnimationState = AnimationState.Initial

  private startingScale: bjs.Vector3 = new bjs.Vector3(0.1, 0.1, 0.1)
  private shownScale: bjs.Vector3 = new bjs.Vector3(1, 1, 1)
  private endingScale: bjs.Vector3 = new bjs.Vector3(0, 0, 0)

  private showLerpFactor = 0.2
  private hideLerpFactor = 0.2
  private showDuration = 1000

  private isEnteringInitialState = true
  private isEnteringShownState = false
  private hideTimeout!: NodeJS.Timeout
  private persist = false

  private messageQueue: Queue<StatusMessage> = new Queue<StatusMessage>()
  private textMeshQueue: Queue<TextMeshString> = new Queue<TextMeshString>()

  constructor(
    name: string,
    x: number,
    y: number,
    z: number,
    scene: Scene,
    public text: string,
    public textColor: GLSGColor,
    public textScale: number = 0.5,
    public horizontalAlignment: HorizontalAlignment = HorizontalAlignment.Center,
    public verticalAlignment: VerticalAlignment = VerticalAlignment.Middle,
    _billboardMode = bjs.Mesh.BILLBOARDMODE_NONE
  ) {
    super(name, x, y, z, scene)
    Logger.log('MainStatusDisplay : Constructor')
    this.name = name
    this.create()
  }

  async create() {
    Logger.log('MainStatusDisplay : onCreate')

    super.create()
    this.textMesh = new TextMeshString(
      this.text,
      0,
      0,
      0,
      this.scene,
      this.text,
      this.textScale,
      this.horizontalAlignment,
      this.verticalAlignment,
      this.billboardMode
    )
    this.addChild(this.textMesh)
    this.setColor(this.textColor)
  }

  public enqueueStatusMessage(
    text: string,
    color: GLSGColor,
    persist: boolean
  ) {
    Logger.log('MainStatusDisplay : Enqueue Message ' + text)

    if (this.persist)
      if (this.animationState === AnimationState.Shown) {
        this.persist = false
        this.hide()
      }

    this.messageQueue.enqueue(new StatusMessage(text, color, persist))
  }

  public show(message: StatusMessage) {
    Logger.log('MainStatusDisplay : Show ' + message.text)
    this.reset()
    this.textMesh.setColor(message.color)
    this.textMesh.setText(message.text)
    this.persist = message.persist
    this.animationState = AnimationState.Showing
  }

  public hide() {
    this.animationState = AnimationState.Hiding
  }

  public setColor(color: GLSGColor) {
    this.textMesh?.setColor(color)
  }

  private reset() {
    this.scaling = this.startingScale

    if (this.animationState === AnimationState.Shown) {
      clearInterval(this.hideTimeout)
    }
  }

  protected onPreRender() {
    switch (this.animationState) {
      case AnimationState.Initial: {
        if (this.isEnteringInitialState) {
          Logger.log('MainStatusDisplay   |   Intial State    | Entering')
          this.setEnabled(false)
          this.scaling = this.startingScale
          this.isEnteringInitialState = false
          this.textMesh.position.y = 0
        }

        if (this.messageQueue.length > 0) {
          const message: StatusMessage = this.messageQueue.dequeue()
          Logger.log(
            'MainStatusDisplay   |   Initial State   | Showing Message:  ' +
              message
          )
          this.show(message)
        }

        break
      }
      case AnimationState.Showing: {
        if (!this.isEnabled()) {
          this.setEnabled(true)
        }

        this.scaling = bjs.Vector3.Lerp(
          this.scaling,
          this.shownScale,
          this.showLerpFactor
        )

        if (this.shownScale.x - this.scaling.x < 0.01) {
          this.isEnteringShownState = true
          this.animationState = AnimationState.Shown
        }
        break
      }
      case AnimationState.Shown: {
        if (this.isEnteringShownState) {
          this.isEnteringShownState = false

          if (!this.persist) this.hideAfterDelay()
        }

        //if (this.scene.engine)
        //   this.textMesh.position.y += this.scene.engine?.getDeltaTime() * 0.015;
        break
      }
      case AnimationState.Hiding: {
        this.scaling.y = bjs.Scalar.Lerp(
          this.scaling.y,
          this.endingScale.y,
          this.hideLerpFactor
        )

        if (this.scaling.y <= 0.005) {
          this.isEnteringInitialState = true
          this.animationState = AnimationState.Initial
        }
        break
      }
    }
  }

  private hideAfterDelay() {
    this.hideTimeout = setTimeout(() => {
      this.animationState = AnimationState.Hiding
    }, this.showDuration)
  }
}
