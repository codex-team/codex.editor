import { EditorModules } from '../types-internal/editor-modules';
import { EditorConfig } from '../../types';
import { ModuleConfig } from '../types-internal/module-config';

/**
 * @abstract
 * @class      Module
 * @classdesc  All modules inherits from this class.
 *
 * @typedef {Module} Module
 * @property {object} config - Editor user settings
 * @property {EditorModules} Editor - List of Editor modules
 */
export default class Module {
  /**
   * Module memorizes HTMLElements
   */
  public nodes: any;

  /**
   * Editor modules list
   *
   * @type {EditorModules}
   */
  protected Editor: EditorModules;

  /**
   * Editor configuration object
   *
   * @type {EditorConfig}
   */
  protected config: EditorConfig;

  /**
   * Mutable listeners
   */
  protected readOnlyMutableListeners = {
    /**
     * Assigns event listener on DOM element and pushes into special array that might be removed
     *
     * @param {EventTarget} element - DOM Element
     * @param {string} eventType - Event name
     * @param {Function} handler - Event handler
     * @param {boolean|AddEventListenerOptions} options - Listening options
     */
    on: (
      element: EventTarget,
      eventType: string,
      handler: (event: Event) => void,
      options: boolean | AddEventListenerOptions = false
    ): void => {
      const { Listeners } = this.Editor;

      this.mutableListenerIds.push(
        Listeners.on(element, eventType, handler, options)
      );
    },

    /**
     * Clears all mutable listeners
     */
    clearAll: (): void => {
      const { Listeners } = this.Editor;

      for (const id of this.mutableListenerIds) {
        Listeners.offById(id);
      }

      this.mutableListenerIds = [];
    },
  };

  /**
   * Listener identifiers
   */
  private mutableListenerIds: string[] = [];

  /**
   * @class
   * @param {EditorConfig} config - Editor's config
   */
  constructor({ config }: ModuleConfig) {
    if (new.target === Module) {
      throw new TypeError('Constructors for abstract class Module are not allowed.');
    }

    this.config = config;
  }

  /**
   * Editor modules setter
   *
   * @param {EditorModules} Editor - Editor's Modules
   */
  public set state(Editor: EditorModules) {
    this.Editor = Editor;
  }

  /**
   * Remove memorized nodes
   */
  public removeAllNodes(): void {
    for (const key in this.nodes) {
      const node = this.nodes[key];

      if (node instanceof HTMLElement) {
        node.remove();
      }
    }
  }
}
