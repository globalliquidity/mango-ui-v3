import { PanelItem } from './PanelItem'

export class PanelRow {
  public items: Map<string, PanelItem> = new Map<string, PanelItem>()

  constructor(public columnCount: number, public rowIndex: number) {}

  getItemByIndex(index: number): PanelItem | undefined {
    if (index >= 0 && index < this.columnCount) {
      for (const item of Array.from(this.items.values())) {
        if (item.columnIndex === index) {
          return item
        }
      }
    }

    return undefined
  }

  getItemByColumnName(columnName: string): PanelItem | undefined {
    return this.items.get(columnName)
  }

  public addPanelItem(columnName: string, item: PanelItem) {
    this.items.set(columnName, item)
  }

  public removePanelItem(columnName: string) {
    return this.items.delete(columnName)
  }

  public initialize() {
    this.items.forEach((item) => {
      item.initialize()
    })

    this.onInitialize()
  }

  protected onInitialize() {}
}
