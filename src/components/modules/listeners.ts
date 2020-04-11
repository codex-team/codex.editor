import Module from '../__module';
import listeners from './api/listeners';

/**
 * Event listener information
 */
export interface ListenerData {
  /**
   * Listener unique identifier
   */
  id: string;

  /**
   * Element where to listen to dispatched events
   */
  element: EventTarget;

  /**
   * Event to listen
   */
  eventType: string;

  /**
   * Event handler
   *
   * @param {Event} event
   */
  handler: (event: Event) => void;

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
   */
  options: boolean | AddEventListenerOptions;
}

/**
 * Editor.js Listeners module
 *
 * @module Listeners
 *
 * Module-decorator for event listeners assignment
 *
 * @author Codex Team
 * @version 2.0.0
 */

/**
 * @typedef {Listeners} Listeners
 * @property {Array} allListeners
 */
export default class Listeners extends Module {

  /**
   * Stores all listeners data to find/remove/process it
   * @type {ListenerData[]}
   */
  private allListeners: ListenerData[] = [];

  /**
   * Assigns event listener on element and returns unique identifier
   *
   * @param {EventTarget} element - DOM element that needs to be listened
   * @param {String} eventType - event type
   * @param {Function} handler - method that will be fired on event
   * @param {Boolean|AddEventListenerOptions} options - useCapture or {capture, passive, once}
   *
   * @return {string}
   */
  public on(
    element: EventTarget,
    eventType: string,
    handler: (event: Event) => void,
    options: boolean | AddEventListenerOptions = false,
  ): string {
    // tslint:disable-next-line:no-bitwise
    const id = `f${(~~(Math.random() * 1e8)).toString(16)}`;
    const assignedEventData = {
      id,
      element,
      eventType,
      handler,
      options,
    };

    const alreadyExist = this.findOne(element, eventType, handler);

    if (alreadyExist) { return; }

    this.allListeners.push(assignedEventData);
    element.addEventListener(eventType, handler, options);

    return id;
  }

  /**
   * Removes event listener from element
   *
   * @param {EventTarget} element - DOM element that we removing listener
   * @param {String} eventType - event type
   * @param {Function} handler - remove handler, if element listens several handlers on the same event type
   * @param {Boolean|AddEventListenerOptions} options - useCapture or {capture, passive, once}
   */
  public off(
    element: EventTarget,
    eventType: string,
    handler?: (event: Event) => void,
    options?: boolean | AddEventListenerOptions,
  ): void {
    const existingListeners = this.findAll(element, eventType, handler);

    existingListeners.forEach((listener, i) => {
      const index = this.allListeners.indexOf(existingListeners[i]);

      if (index > 0) {
        this.allListeners.splice(index, 1);

        listener.element.removeEventListener(listener.eventType, listener.handler, listener.options);
      }
    });
  }

  /**
   * Removes listener by id
   * @param {string} id - listener identifier
   */
  public offById(id: string): void {
    const listener = this.findById(id);

    if (!listener) {
      return;
    }

    listener.element.removeEventListener(listener.eventType, listener.handler, listener.options);
  }

  /**
   * @param {EventTarget} element
   * @param {String} eventType
   * @param {Function} handler
   * @return {ListenerData|null}
   */
  public findOne(element: EventTarget, eventType?: string, handler?: (event: Event) => void): ListenerData {
    const foundListeners = this.findAll(element, eventType, handler);

    return foundListeners.length > 0 ? foundListeners[0] : null;
  }

  /**
   * @param {EventTarget} element
   * @param {String} eventType
   * @param {Function} handler
   * @return {ListenerData[]}
   */
  public findAll(element: EventTarget, eventType?: string, handler?: (event: Event) => void): ListenerData[] {
    let found;
    const foundByEventTargets = element ? this.findByEventTarget(element) : [];

    if (element && eventType && handler) {
      found = foundByEventTargets.filter( (event) => event.eventType === eventType && event.handler === handler );
    } else if (element && eventType) {
      found = foundByEventTargets.filter( (event) => event.eventType === eventType);
    } else {
      found = foundByEventTargets;
    }

    return found;
  }

  /**
   * Removes all listeners
   */
  public removeAll(): void {
    this.allListeners.map( (current) => {
      current.element.removeEventListener(current.eventType, current.handler, current.options);
    });

    this.allListeners = [];
  }

  /**
   * Search method: looks for listener by passed element
   * @param {EventTarget} element - searching element
   * @returns {Array} listeners that found on element
   */
  private findByEventTarget(element: EventTarget): ListenerData[] {
    return this.allListeners.filter((listener) => {
      if (listener.element === element) {
        return listener;
      }
    });
  }

  /**
   * Search method: looks for listener by passed event type
   * @param {String} eventType
   * @return {Array} listeners that found on element
   */
  private findByType(eventType: string): ListenerData[] {
    return this.allListeners.filter((listener) => {
      if (listener.eventType === eventType) {
        return listener;
      }
    });
  }

  /**
   * Search method: looks for listener by passed handler
   * @param {Function} handler
   * @return {Array} listeners that found on element
   */
  private findByHandler(handler: (event: Event) => void): ListenerData[] {
    return this.allListeners.filter((listener) => {
      if (listener.handler === handler) {
        return listener;
      }
    });
  }

  /**
   * Returns listener data found by id
   * @param {string} id - listener identifier
   *
   * @return {ListenerData}
   */
  private findById(id: string): ListenerData {
    for (const listener of this.allListeners) {
      if (listener.id === id) {
        return listener;
      }
    }
  }
}
