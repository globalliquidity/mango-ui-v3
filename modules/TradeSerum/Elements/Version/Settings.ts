import { ISettings } from '@/modules/TradeSerum/TradeSerumInterface'

export class Settings implements ISettings {
  constructor(public majorVersion: number, public minorVersion: number) {}
}
