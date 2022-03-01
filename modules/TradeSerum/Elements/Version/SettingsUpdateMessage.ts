import { PresenterUpdateMessage } from '@/modules//SceneGraph/PresenterUpdateMessage'
import { Settings } from './Settings'

export class SettingsUpdateMessage extends PresenterUpdateMessage {
  constructor(public settings: Settings) {
    super()
  }
}
