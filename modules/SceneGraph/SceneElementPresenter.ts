import { PresenterUpdateMessage } from './PresenterUpdateMessage'

export class SceneElementPresenter<M extends PresenterUpdateMessage> {
  // constructor()
  // {
  // }

  public updatePresenter(message: M) {
    this.processMessage(message)
  }

  protected processMessage(_message: M) {
    //TODO : In subclass transform message into data
  }
}
