import { EventDispatcher } from 'strongly-typed-events'

interface IEventData {
  type: string
  data: any
}

export class EventBus {
  private _eventHandler = new EventDispatcher<EventBus, string>()
  private _eventDataHandler = new EventDispatcher<EventBus, IEventData>()
  static eventBus = new EventBus()

  constructor() {
    this._eventHandler = new EventDispatcher<EventBus, string>()
    this._eventDataHandler = new EventDispatcher<EventBus, IEventData>()
  }

  emit(eventName: string) {
    this._eventHandler.dispatch(this, eventName)
  }

  emitData(data: IEventData) {
    this._eventDataHandler.dispatch(this, data)
  }

  get eventHandler() {
    return this._eventHandler.asEvent()
  }

  get eventDataHandler() {
    return this._eventDataHandler.asEvent()
  }

  static get Instance() {
    return this.eventBus
  }
}
