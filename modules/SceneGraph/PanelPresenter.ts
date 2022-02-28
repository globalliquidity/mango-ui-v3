import { SceneElementPresenter } from './SceneElementPresenter'
import { PresenterUpdateMessage } from './PresenterUpdateMessage'
import { PanelRow } from './PanelRow'

export class PanelPresenter extends SceneElementPresenter<PresenterUpdateMessage> {
  rows: Array<PanelRow>

  constructor(public rowCount: number, public columnCount: number) {
    super()

    this.rows = new Array<PanelRow>()
  }

  protected processMessage(_message: PresenterUpdateMessage): void {
    //TODO : In subclass transform message into data
  }

  getRow(rowIndex: number): PanelRow | undefined {
    if (rowIndex >= 0 && rowIndex < this.rows.length) {
      return this.rows[rowIndex]
    }

    return undefined
  }

  getCurrentRow(): PanelRow | undefined {
    return this.getRow(0)
  }
}
