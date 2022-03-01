import * as bjs from '@babylonjs/core/Legacy/legacy'
import * as bjsgui from '@babylonjs/gui'
import { SceneElement } from '@/modules/SceneGraph/SceneElement'
import { TradeSerumScene } from '@/modules/TradeSerum/TradeSerumScene'
// import { SoundPlayer } from '../../SoundPlayer';
import { SettingsManager } from '../../SettingsManager'

export class FullScreenGUIElement extends SceneElement {
  advancedTexture?: bjsgui.AdvancedDynamicTexture
  settingsButton?: bjsgui.Button
  settingsPanel?: bjsgui.SelectionPanel

  constructor(
    public name: string,
    public x: number,
    public y: number,
    public z: number,
    public scene: TradeSerumScene,
    public glowLayer: bjs.GlowLayer
  ) {
    super(name, x, y, z, scene)
    this.create()
  }

  protected async onCreate() {
    this.advancedTexture =
      bjsgui.AdvancedDynamicTexture.CreateFullscreenUI('Fullscreen GUI')

    await this.advancedTexture.parseFromURLAsync(
      'https://globalliquidity.blob.core.windows.net/bionictraderassets/images/menuTest11.json'
    )

    this.settingsButton = bjsgui.Button.CreateSimpleButton('but1', 'Settings')
    this.settingsButton.width = '100px'
    this.settingsButton.height = '40px'
    // this.settingsButton.color = "white";
    this.settingsButton.cornerRadius = 10
    this.settingsButton.background = '#575782'
    this.settingsButton.left = -5
    this.settingsButton.top = -5
    this.settingsButton.horizontalAlignment =
      bjsgui.Control.HORIZONTAL_ALIGNMENT_LEFT
    this.settingsButton.verticalAlignment =
      bjsgui.Control.VERTICAL_ALIGNMENT_TOP
    this.settingsButton.onPointerUpObservable.add(() => {
      if (this.settingsPanel)
        if (this.settingsPanel.isVisible) this.settingsPanel.isVisible = false
        else this.settingsPanel.isVisible = true
    })
    this.advancedTexture.addControl(this.settingsButton)

    const lookAndFeelGroup = new bjsgui.CheckboxGroup('Look and Feel')

    lookAndFeelGroup.addCheckbox(
      'Show Sky',
      (isChecked) => {
        SettingsManager.Instance.showSkybox = isChecked
      },
      SettingsManager.Instance.showSkybox
    )

    lookAndFeelGroup.addCheckbox(
      'Stepped Motion',
      (isChecked) => {
        SettingsManager.Instance.useSteppedMotion = isChecked
      },
      SettingsManager.Instance.useSteppedMotion
    )

    lookAndFeelGroup.addCheckbox(
      'Enable Sound',
      (isChecked) => {
        SettingsManager.Instance.enableAudio = isChecked
      },
      SettingsManager.Instance.enableAudio
    )

    /*
        var masterVolumeGroup = new bjsgui.SliderGroup("Master Volume");

        masterVolumeGroup.addSlider(
            "Volume",
            (volume) =>{
                SoundPlayer.Instance.masterVolume = volume;
            },
            "dB",
            -48,
            0,
            0,
            (volume) =>{
               return  SoundPlayer.Instance.masterVolume;;
            },
          );
          */

    const tradingGroup = new bjsgui.CheckboxGroup('Smart Orders')

    tradingGroup.addCheckbox(
      'Automatic Replace',
      (isChecked) => {
        SettingsManager.Instance.automateSmartOrders = isChecked
      },
      SettingsManager.Instance.automateSmartOrders
    )

    this.settingsPanel = new bjsgui.SelectionPanel('sp', [
      lookAndFeelGroup,
      tradingGroup,
    ])
    this.settingsPanel.width = 0.125
    this.settingsPanel.height = 0.47
    this.settingsPanel.horizontalAlignment =
      bjsgui.Control.HORIZONTAL_ALIGNMENT_LEFT
    this.settingsPanel.verticalAlignment = bjsgui.Control.VERTICAL_ALIGNMENT_TOP
    this.settingsPanel.left = 100
    this.settingsPanel.cornerRadius = 10
    this.settingsPanel.background = '#575782'
    //this.settingsPanel.alpha = 0.8;
    this.settingsPanel.shadowColor = 'black'
    this.settingsPanel.shadowOffsetX = 5
    this.settingsPanel.shadowOffsetY = 5
    this.settingsPanel.shadowBlur = 0.5
    this.advancedTexture.addControl(this.settingsPanel)
    this.settingsPanel.isVisible = false
    this.hideSmartOrderPanel()
  }

  soundsCheckHandler(isChecked) {
    if (isChecked) {
      //box.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
    } else {
      //box.scaling = new BABYLON.Vector3(1, 1, 1);
    }
  }

  skyCheckHandler(isChecked) {
    if (isChecked) {
      //box.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
      this.scene.hdrSkybox?.setEnabled(true)
    } else {
      this.scene.hdrSkybox?.setEnabled(true)
      //box.scaling = new BABYLON.Vector3(1, 1, 1);
    }
  }

  public showSmartOrderPanel() {
    const smartOrderPanel =
      this.advancedTexture?.getControlByName('SmartOrderPanel')

    if (smartOrderPanel) smartOrderPanel.isVisible = true
  }

  public hideSmartOrderPanel() {
    const smartOrderPanel =
      this.advancedTexture?.getControlByName('SmartOrderPanel')

    if (smartOrderPanel) smartOrderPanel.isVisible = false
  }

  public show() {
    this.setEnabled(true)
  }

  public hide() {
    this.setEnabled(false)
  }

  public reset() {}

  protected onFormat() {
    /*
        if (this.scene.sceneType === SceneFormatType.Portrait)
        {
           
        }
        else
        {
            
        }
        */
  }

  protected onRender() {}
}
