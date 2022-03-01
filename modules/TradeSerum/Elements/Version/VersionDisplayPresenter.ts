import { SceneElementPresenter } from '@/modules/SceneGraph/SceneElementPresenter'
import { PresenterUpdateMessage } from '@/modules//SceneGraph/PresenterUpdateMessage'
import { Settings } from './Settings'
import { SettingsUpdateMessage } from './SettingsUpdateMessage'

export class VersionDisplayPresenter extends SceneElementPresenter<PresenterUpdateMessage> {
  isReady = false
  versionString = '1.0'

  constructor() {
    super()
  }

  protected processMessage(message: SettingsUpdateMessage): void {
    //TODO : In subclass transform message into data
    this.updateSettings(message.settings)
  }

  protected updateSettings(setting: Settings) {
    this.versionString =
      setting.majorVersion.toString() + '.' + setting.minorVersion.toString()

    if (!this.isReady) this.isReady = true
  }
}
