/**
 * Codex Editor
 *
 * Short Description (눈_눈;)
 * @version 2.0.0
 *
 * How to start?
 * Example:
 *           new CodexEditor({
 *                holderId : 'codex-editor',
 *                initialBlock : 'text',
 *                placeholder : 'Write your story....',
 *                tools: {
 *                    quote: Quote,
 *                    anotherTool : AnotherTool
 *                },
 *                toolsConfig: {
 *                     quote: {
 *                        iconClassname : 'quote-icon',
 *                        displayInToolbox : true,
 *                        enableLineBreaks : true
 *                     },
 *                     anotherTool: {
 *                        iconClassname : 'tool-icon'
 *                     }
 *                 }
 *            });
 *
 * - tools is an object: {
 *       pluginName: PluginClass,
 *       .....
 *   }
 * - toolsConfig is an additional configuration that uses Codex Editor API
 *      iconClassname - CSS classname of toolbox icon
 *      displayInToolbox - if you want to see your Tool in toolbox hided in "plus" button, than set "True". By default : "False"
 *      enableLineBreaks - by default enter creates new block that set as initialblock, but if you set this property "True", enter will break the lines in current block
 *
 * @author CodeX-Team <https://ifmo.su>
 *
 */

/**
 * @typedef {CodexEditor} CodexEditor - editor class
 */

/**
 * @typedef {Object} EditorConfig
 * @property {String} holderId           - Element to append Editor
 * @property {Array} data                - Blocks list in JSON-format
 * @property {Object} tools              - Map for used Tools in format { name : Class, ... }
 * @property {String} initialBlock       - This Tool will be added by default
 * @property {String} placeholder        - First Block placeholder
 * @property {Object} sanitizer          - @todo fill desc
 * @property {Boolean} hideToolbar       - @todo fill desc
 * @property {Object} toolsConfig        - tools configuration {@link tools#ToolConfig}
 */

/**
 * Dynamically imported utils
 *
 * @typedef {Dom}   $      - {@link components/dom.js}
 * @typedef {Util}  _      - {@link components/utils.js}
 */

'use strict';

/**
 * Apply polyfills
 */
import 'components/polyfills';

/**
 * Require Editor modules places in components/modules dir
 */
// eslint-disable-next-line
let modules = editorModules.map( module => require('./components/modules/' + module ));

/**
 * @class
 *
 * @classdesc CodeX Editor base class
 *
 * @property this.config - all settings
 * @property this.moduleInstances - constructed editor components
 *
 * @type {CodexEditor}
 */
export default class CodexEditor {
  /** Editor version */
  static get version() {
    return VERSION;
  }

  /**
   * @param {EditorConfig} config - user configuration
   *
   */
  constructor(config) {
    /**
     * Configuration object
     * @type {EditorConfig}
     */
    this.config = {};

    /**
     * @typedef {Object} EditorComponents
     * @property {BlockManager} BlockManager
     * @property {Tools} Tools
     * @property {Events} Events
     * @property {UI} UI
     * @property {Toolbar} Toolbar
     * @property {Toolbox} Toolbox
     * @property {BlockSettings} BlockSettings
     * @property {Renderer} Renderer
     * @property {InlineToolbar} InlineToolbar
     */
    this.moduleInstances = {};

    Promise.resolve()
      .then(() => {
        this.configuration = config;
      })
      .then(() => this.init())
      .then(() => this.start())
      .then(() => {
        let methods = this.moduleInstances.API.methods;

        /**
         * Make API methods available from inside easier
         */
        for (let method in methods) {
          this[method] = methods[method];
        }

        // todo Is it necessary?
        delete this.moduleInstances;
      })
      .then(() => {
        console.log('CodeX Editor is ready!');
      })
      .catch(error => {
        console.log('CodeX Editor does not ready because of %o', error);
      });
  }

  /**
   * Setting for configuration
   * @param {EditorConfig} config
   */
  set configuration(config) {
    /**
     * Initlai block type
     * Uses in case when there is no items passed
     * @type {{type: (*), data: {text: null}}}
     */
    let initialBlock = {
      type : config.initialBlock,
      data : {}
    };

    this.config.holderId = config.holderId;
    this.config.placeholder = config.placeholder || 'write your story...';
    this.config.sanitizer = config.sanitizer || {
      p: true,
      b: true,
      a: true
    };

    this.config.hideToolbar = config.hideToolbar ? config.hideToolbar : false;
    this.config.tools = config.tools || {};
    this.config.toolsConfig = config.toolsConfig || {};
    this.config.data = config.data || {};

    /**
     * Initialize items to pass data to the Renderer
     */
    if (_.isEmpty(this.config.data)) {
      this.config.data = {};
      this.config.data.items = [ initialBlock ];
    } else {
      if (!this.config.data.items || this.config.data.items.length === 0) {
        this.config.data.items = [ initialBlock ];
      }
    }

    /**
     * If initial Block's Tool was not passed, use the first Tool in config.tools
     */
    if (!config.initialBlock) {
      for (this.config.initialBlock in this.config.tools) break;
    } else {
      this.config.initialBlock = config.initialBlock;
    }
  }

  /**
   * Returns private property
   * @returns {EditorConfig}
   */
  get configuration() {
    return this.config;
  }

  /**
   * Initializes modules:
   *  - make and save instances
   *  - configure
   */
  init() {
    /**
     * Make modules instances and save it to the @property this.moduleInstances
     */
    this.constructModules();

    /**
     * Modules configuration
     */
    this.configureModules();
  }

  /**
   * Make modules instances and save it to the @property this.moduleInstances
   */
  constructModules() {
    modules.forEach( Module => {
      try {
        /**
         * We use class name provided by displayName property
         *
         * On build, Babel will transform all Classes to the Functions so, name will always be 'Function'
         * To prevent this, we use 'babel-plugin-class-display-name' plugin
         * @see  https://www.npmjs.com/package/babel-plugin-class-display-name
         */
        this.moduleInstances[Module.displayName] = new Module({
          config : this.configuration
        });
      } catch ( e ) {
        console.log('Module %o skipped because %o', Module, e);
      }
    });
  }

  /**
   * Modules instances configuration:
   *  - pass other modules to the 'state' property
   *  - ...
   */
  configureModules() {
    for(let name in this.moduleInstances) {
      /**
       * Module does not need self-instance
       */
      this.moduleInstances[name].state = this.getModulesDiff( name );
    }
  }

  /**
   * Return modules without passed name
   */
  getModulesDiff( name ) {
    let diff = {};

    for(let moduleName in this.moduleInstances) {
      /**
       * Skip module with passed name
       */
      if (moduleName === name) {
        continue;
      }
      diff[moduleName] = this.moduleInstances[moduleName];
    }

    return diff;
  }

  /**
   * Start Editor!
   *
   * Get list of modules that needs to be prepared and return a sequence (Promise)
   * @return {Promise}
   */
  start() {
    let prepareDecorator = module => module.prepare();

    return Promise.resolve()
      .then(prepareDecorator(this.moduleInstances.Tools))
      .then(prepareDecorator(this.moduleInstances.UI))
      .then(prepareDecorator(this.moduleInstances.BlockManager))
      .then(() => {
        return this.moduleInstances.Renderer.render(this.config.data.items);
      });
  }
};

// module.exports = (function (editor) {
//
//     'use strict';
//
//     editor.version = VERSION;
//     editor.scriptPrefix = 'cdx-script-';
//
//     var init = function () {
//
//         editor.core          = require('./modules/core');
//         editor.tools         = require('./modules/tools');
//         editor.ui            = require('./modules/ui');
//         editor.transport     = require('./modules/transport');
//         editor.renderer      = require('./modules/renderer');
//         editor.saver         = require('./modules/saver');
//         editor.content       = require('./modules/content');
//         editor.toolbar       = require('./modules/toolbar/toolbar');
//         editor.callback      = require('./modules/callbacks');
//         editor.draw          = require('./modules/draw');
//         editor.caret         = require('./modules/caret');
//         editor.notifications = require('./modules/notifications');
//         editor.parser        = require('./modules/parser');
//         editor.sanitizer     = require('./modules/sanitizer');
//         editor.listeners     = require('./modules/listeners');
//         editor.destroyer     = require('./modules/destroyer');
//         editor.paste         = require('./modules/paste');
//
//     };
//
//     /**
//      * @public
//      * holds initial settings
//      */
//     editor.settings = {
//         tools     : ['text', 'header', 'picture', 'list', 'quote', 'code', 'twitter', 'instagram', 'smile'],
//         holderId  : 'codex-editor',
//
//         // Type of block showing on empty editor
//         initialBlockPlugin: 'text'
//     };
//
//     /**
//      * public
//      *
//      * Static nodes
//      */
//     editor.nodes = {
//         holder            : null,
//         wrapper           : null,
//         toolbar           : null,
//         inlineToolbar     : {
//             wrapper : null,
//             buttons : null,
//             actions : null
//         },
//         toolbox           : null,
//         notifications     : null,
//         plusButton        : null,
//         showSettingsButton: null,
//         showTrashButton   : null,
//         blockSettings     : null,
//         pluginSettings    : null,
//         defaultSettings   : null,
//         toolbarButtons    : {}, // { type : DomEl, ... }
//         redactor          : null
//     };
//
//     /**
//      * @public
//      *
//      * Output state
//      */
//     editor.state = {
//         jsonOutput  : [],
//         blocks      : [],
//         inputs      : []
//     };
//
//     /**
//     * @public
//     * Editor plugins
//     */
//     editor.tools = {};
//
//     editor.start = function (userSettings) {
//
//         init();
//
//         editor.core.prepare(userSettings)
//
//         // If all ok, make UI, bind events and parse initial-content
//             .then(editor.ui.prepare)
//             .then(editor.tools.prepare)
//             .then(editor.sanitizer.prepare)
//             .then(editor.paste.prepare)
//             .then(editor.transport.prepare)
//             .then(editor.renderer.makeBlocksFromData)
//             .then(editor.ui.saveInputs)
//             .catch(function (error) {
//
//                 editor.core.log('Initialization failed with error: %o', 'warn', error);
//
//             });
//
//     };
//
//     return editor;
//
// })({});
