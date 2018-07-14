declare var Module: any;

import { IEventsAPI } from '../interfaces/api';

/**
 * @class EventsAPI
 * provides with methods working with Toolbar
 */
export default class EventsAPI extends Module implements IEventsAPI {

  /**
   * Save Editor config. API provides passed configuration to the Blocks
   * @param {EditorsConfig} config
   */
  constructor({config}) {
    super({config});
  }

  /**
   * Available methods
   * @return {IEventsAPI}
   */
  get methods(): IEventsAPI {
    return {
      emit: (eventName: string, data: object) => this.emit(eventName, data),
      off: (eventName: string, callback: () => void) => this.off(eventName, callback),
      on: (eventName: string, callback: () => void) => this.on(eventName, callback),
    };
  }

  /**
   * Subscribe on Events
   * @param {String} eventName
   * @param {Function} callback
   */
  public on(eventName, callback): void {
    this.Editor.Events.on(eventName, callback);
  }

  /**
   * Emit event with data
   * @param {String} eventName
   * @param {Object} data
   */
  public emit(eventName, data): void {
    this.Editor.Events.emit(eventName, data);
  }

  /**
   * Unsubscribe from Event
   * @param {String} eventName
   * @param {Function} callback
   */
  public off(eventName, callback): void {
    this.Editor.Events.off(eventName, callback);
  }

}
