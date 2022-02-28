import { PanelItem } from './PanelItem'

export class TextItem extends PanelItem {
  public text!: string

  constructor(public columnName: string, public columnIndex: number) {
    super(columnName, columnIndex)
  }

  public setItemAsText(text: string) {
    this.text = text
  }

  public getItemAsText() {
    return this.text
  }

  protected onInitialize() {
    this.text = ''
  }
}
