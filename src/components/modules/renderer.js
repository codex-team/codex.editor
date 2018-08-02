/**
 * Codex Editor Renderer Module
 *
 * @module Renderer
 * @author CodeX Team
 *
 * @version 2.0.0
 */
export default class Renderer extends Module {
  /**
   * @constructor
   * @param {EditorConfig} config
   */
  constructor({config}) {
    super({config});
  }

  /**
   * @typedef {Object} RendererBlocks
   * @property {String} type - tool name
   * @property {Object} data - tool data
   */

  /**
   * @example
   *
   * blocks: [
   *   {
   *     type : 'paragraph',
   *     data : {
   *       text : 'Hello from Codex!'
   *     }
   *   },
   *   {
   *     type : 'paragraph',
   *     data : {
   *       text : 'Leave feedback if you like it!'
   *     }
   *   },
   * ]
   *
   */

  /**
   * Make plugin blocks from array of plugin`s data
   * @param {RendererBlocks[]} blocks
   */
  render(blocks) {
    let chainData = [];

    for (let i = 0; i < blocks.length; i++) {
      chainData.push({
        function: () => this.insertBlock(blocks[i])
      });
    }

    return _.sequence(chainData);
  }

  /**
   * Get plugin instance
   * Add plugin instance to BlockManager
   * Insert block to working zone
   *
   * @param {Object} item
   * @returns {Promise.<T>}
   * @private
   */
  insertBlock(item) {
    let tool = item.type,
      data = item.data,
      settings = item.settings;

    if (tool in this.Editor.Tools.available) {
      try {
        this.Editor.BlockManager.insert(tool, data, settings);
      } catch (error) {
        _.log(`Block «${tool}» skipped because of plugins error`, 'warn', data);
        Promise.reject(error);
      }
    } else {
      /**
       * @todo show warning notification message
       *
       * `${tool} blocks was skipped.`
       */
      _.log(`Tool «${tool}» is not found. Check 'tools' property at your initial CodeX Editor config.`, 'warn');
    }

    return Promise.resolve();
  }
}
