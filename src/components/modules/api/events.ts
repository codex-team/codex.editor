import Module from '../../__module';

import * as API from '../../../../types/api';

/**
 * @class EventsAPI
 * provides with methods working with Toolbar
 */
export default class EventsAPI extends Module {

  /**
   * Save Editor config. API provides passed configuration to the Blocks
   */
  constructor({config}) {
    super({config});
  }

  /**
   * Available methods
   * @return {API.events}
   */
  get methods(): API.events {
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