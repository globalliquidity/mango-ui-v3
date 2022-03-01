import Logger from '@/modules/SceneGraph/Logger'
import { SimpleEventDispatcher } from 'strongly-typed-events'

export class SettingsManager {
  private static _instance: SettingsManager

  public static get Instance() {
    return this._instance || (this._instance = new this())
  }

  //Show Skybox
  private _showSkybox = false
  public get showSkybox(): boolean {
    return this._showSkybox
  }
  public set showSkybox(value: boolean) {
    this._showSkybox = value
    localStorage.setItem('showSkybox', JSON.stringify(value))
    this._onShowSkybox.dispatch(value)
  }

  private _onShowSkybox = new SimpleEventDispatcher<boolean>()
  public get onShowSkybox() {
    return this._onShowSkybox.asEvent()
  }

  //Enable Audio
  private _enableAudio = true
  public get enableAudio(): boolean {
    return this._enableAudio
  }
  public set enableAudio(value: boolean) {
    this._enableAudio = value
    localStorage.setItem('enableAudio', JSON.stringify(value))
    this._onEnableAudio.dispatch(value)
  }

  private _onEnableAudio = new SimpleEventDispatcher<boolean>()
  public get onEnableAudio() {
    return this._onEnableAudio.asEvent()
  }

  //Use Stepped Motion
  private _useSteppedMotion = true
  public get useSteppedMotion(): boolean {
    return this._useSteppedMotion
  }
  public set useSteppedMotion(value: boolean) {
    this._useSteppedMotion = value
    localStorage.setItem('useSteppedMotion', JSON.stringify(value))
    this._onUseSteppedMotion.dispatch(value)
  }

  private _onUseSteppedMotion = new SimpleEventDispatcher<boolean>()
  public get onUseSteppedMotion() {
    return this._onUseSteppedMotion.asEvent()
  }

  //Automate Smart Order Cancel-Replace
  private _automateSmartOrders = false
  public get automateSmartOrders(): boolean {
    return this._automateSmartOrders
  }
  public set automateSmartOrders(value: boolean) {
    this._automateSmartOrders = value
    localStorage.setItem('automateSmartOrders', JSON.stringify(value))
    this._onAutomateSmartOrders.dispatch(value)
  }

  private _onAutomateSmartOrders = new SimpleEventDispatcher<boolean>()
  public get onAutomateSmartOrders() {
    return this._onAutomateSmartOrders.asEvent()
  }

  private constructor() {
    Logger.log('SettingsManager  | Constructor')

    if (localStorage.getItem('showSkybox') === null) {
      localStorage.setItem('showSkybox', JSON.stringify(this._showSkybox))
    } else {
      if (localStorage.getItem('showSkybox') === 'true') {
        this.showSkybox = true
      } else {
        this.showSkybox = false
      }
    }

    if (localStorage.getItem('enableAudio') === null) {
      localStorage.setItem('enableAudio', JSON.stringify(this._enableAudio))
    } else {
      if (localStorage.getItem('enableAudio') === 'true') {
        this.enableAudio = true
      } else {
        this.enableAudio = false
      }
    }

    if (localStorage.getItem('useSteppedMotion') === null) {
      localStorage.setItem(
        'useSteppedMotion',
        JSON.stringify(this._useSteppedMotion)
      )
    } else {
      if (localStorage.getItem('useSteppedMotion') === 'false') {
        this.useSteppedMotion = false
      } else {
        this.useSteppedMotion = true
      }
    }

    if (localStorage.getItem('automateSmartOrders') === null) {
      localStorage.setItem(
        'automateSmartOrders',
        JSON.stringify(this._automateSmartOrders)
      )
    } else {
      if (localStorage.getItem('automateSmartOrders') === 'false') {
        this.automateSmartOrders = false
      } else {
        this.automateSmartOrders = true
      }
    }
  }

  public intialize() {}
}
