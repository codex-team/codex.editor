var CodexEditor =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 22);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Inline toolbar
 *
 * Contains from tools:
 * Bold, Italic, Underline and Anchor
 *
 * @author Codex Team
 * @version 1.0
 */

module.exports = function (inline) {

    var editor = codex.editor;

    inline.buttonsOpened = null;
    inline.actionsOpened = null;
    inline.wrappersOffset = null;

    /**
     * saving selection that need for execCommand for styling
     *
     */
    inline.storedSelection = null;

    /**
     * @protected
     *
     * Open inline toobar
     */
    inline.show = function () {

        var currentNode = editor.content.currentNode,
            tool = currentNode.dataset.tool,
            plugin;

        /**
         * tool allowed to open inline toolbar
         */
        plugin = editor.tools[tool];

        if (!plugin.showInlineToolbar) return;

        var selectedText = inline.getSelectionText(),
            toolbar = editor.nodes.inlineToolbar.wrapper;

        if (selectedText.length > 0) {

            /** Move toolbar and open */
            editor.toolbar.inline.move();

            /** Open inline toolbar */
            toolbar.classList.add('opened');

            /** show buttons of inline toolbar */
            editor.toolbar.inline.showButtons();
        }
    };

    /**
     * @protected
     *
     * Closes inline toolbar
     */
    inline.close = function () {

        var toolbar = editor.nodes.inlineToolbar.wrapper;

        toolbar.classList.remove('opened');
    };

    /**
     * @private
     *
     * Moving toolbar
     */
    inline.move = function () {

        if (!this.wrappersOffset) {

            this.wrappersOffset = this.getWrappersOffset();
        }

        var coords = this.getSelectionCoords(),
            defaultOffset = 0,
            toolbar = editor.nodes.inlineToolbar.wrapper,
            newCoordinateX,
            newCoordinateY;

        if (toolbar.offsetHeight === 0) {

            defaultOffset = 40;
        }

        newCoordinateX = coords.x - this.wrappersOffset.left;
        newCoordinateY = coords.y + window.scrollY - this.wrappersOffset.top - defaultOffset - toolbar.offsetHeight;

        toolbar.style.transform = 'translate3D(' + Math.floor(newCoordinateX) + 'px, ' + Math.floor(newCoordinateY) + 'px, 0)';

        /** Close everything */
        editor.toolbar.inline.closeButtons();
        editor.toolbar.inline.closeAction();
    };

    /**
     * @private
     *
     * Tool Clicked
     */

    inline.toolClicked = function (event, type) {

        /**
         * For simple tools we use default browser function
         * For more complicated tools, we should write our own behavior
         */
        switch (type) {

            case 'createLink':
                editor.toolbar.inline.createLinkAction(event, type);break;
            default:
                editor.toolbar.inline.defaultToolAction(type);break;

        }

        /**
         * highlight buttons
         * after making some action
         */
        editor.nodes.inlineToolbar.buttons.childNodes.forEach(editor.toolbar.inline.hightlight);
    };

    /**
     * @private
     *
     * Saving wrappers offset in DOM
     */
    inline.getWrappersOffset = function () {

        var wrapper = editor.nodes.wrapper,
            offset = this.getOffset(wrapper);

        this.wrappersOffset = offset;
        return offset;
    };

    /**
     * @private
     *
     * Calculates offset of DOM element
     *
     * @param el
     * @returns {{top: number, left: number}}
     */
    inline.getOffset = function (el) {

        var _x = 0;
        var _y = 0;

        while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {

            _x += el.offsetLeft + el.clientLeft;
            _y += el.offsetTop + el.clientTop;
            el = el.offsetParent;
        }
        return { top: _y, left: _x };
    };

    /**
     * @private
     *
     * Calculates position of selected text
     * @returns {{x: number, y: number}}
     */
    inline.getSelectionCoords = function () {

        var sel = document.selection,
            range;
        var x = 0,
            y = 0;

        if (sel) {

            if (sel.type != 'Control') {

                range = sel.createRange();
                range.collapse(true);
                x = range.boundingLeft;
                y = range.boundingTop;
            }
        } else if (window.getSelection) {

            sel = window.getSelection();

            if (sel.rangeCount) {

                range = sel.getRangeAt(0).cloneRange();
                if (range.getClientRects) {

                    range.collapse(true);
                    var rect = range.getClientRects()[0];

                    if (!rect) {

                        return;
                    }

                    x = rect.left;
                    y = rect.top;
                }
            }
        }
        return { x: x, y: y };
    };

    /**
     * @private
     *
     * Returns selected text as String
     * @returns {string}
     */
    inline.getSelectionText = function () {

        var selectedText = '';

        // all modern browsers and IE9+
        if (window.getSelection) {

            selectedText = window.getSelection().toString();
        }

        return selectedText;
    };

    /** Opens buttons block */
    inline.showButtons = function () {

        var buttons = editor.nodes.inlineToolbar.buttons;

        buttons.classList.add('opened');

        editor.toolbar.inline.buttonsOpened = true;

        /** highlight buttons */
        editor.nodes.inlineToolbar.buttons.childNodes.forEach(editor.toolbar.inline.hightlight);
    };

    /** Makes buttons disappear */
    inline.closeButtons = function () {

        var buttons = editor.nodes.inlineToolbar.buttons;

        buttons.classList.remove('opened');

        editor.toolbar.inline.buttonsOpened = false;
    };

    /** Open buttons defined action if exist */
    inline.showActions = function () {

        var action = editor.nodes.inlineToolbar.actions;

        action.classList.add('opened');

        editor.toolbar.inline.actionsOpened = true;
    };

    /** Close actions block */
    inline.closeAction = function () {

        var action = editor.nodes.inlineToolbar.actions;

        action.innerHTML = '';
        action.classList.remove('opened');
        editor.toolbar.inline.actionsOpened = false;
    };

    /**
    * Callback for keydowns in inline toolbar "Insert link..." input
    */
    var inlineToolbarAnchorInputKeydown_ = function inlineToolbarAnchorInputKeydown_(event) {

        if (event.keyCode != editor.core.keys.ENTER) {

            return;
        }

        var editable = editor.content.currentNode,
            storedSelection = editor.toolbar.inline.storedSelection;

        editor.toolbar.inline.restoreSelection(editable, storedSelection);
        editor.toolbar.inline.setAnchor(this.value);

        /**
         * Preventing events that will be able to happen
         */
        event.preventDefault();
        event.stopImmediatePropagation();

        editor.toolbar.inline.clearRange();
    };

    /** Action for link creation or for setting anchor */
    inline.createLinkAction = function (event) {

        var isActive = this.isLinkActive();

        var editable = editor.content.currentNode,
            storedSelection = editor.toolbar.inline.saveSelection(editable);

        /** Save globally selection */
        editor.toolbar.inline.storedSelection = storedSelection;

        if (isActive) {

            /**
             * Changing stored selection. if we want to remove anchor from word
             * we should remove anchor from whole word, not only selected part.
             * The solution is than we get the length of current link
             * Change start position to - end of selection minus length of anchor
             */
            editor.toolbar.inline.restoreSelection(editable, storedSelection);

            editor.toolbar.inline.defaultToolAction('unlink');
        } else {

            /** Create input and close buttons */
            var action = editor.draw.inputForLink();

            editor.nodes.inlineToolbar.actions.appendChild(action);

            editor.toolbar.inline.closeButtons();
            editor.toolbar.inline.showActions();

            /**
             * focus to input
             * Solution: https://developer.mozilla.org/ru/docs/Web/API/HTMLElement/focus
             * Prevents event after showing input and when we need to focus an input which is in unexisted form
             */
            action.focus();
            event.preventDefault();

            /** Callback to link action */
            editor.listeners.add(action, 'keydown', inlineToolbarAnchorInputKeydown_, false);
        }
    };

    inline.isLinkActive = function () {

        var isActive = false;

        editor.nodes.inlineToolbar.buttons.childNodes.forEach(function (tool) {

            var dataType = tool.dataset.type;

            if (dataType == 'link' && tool.classList.contains('hightlighted')) {

                isActive = true;
            }
        });

        return isActive;
    };

    /** default action behavior of tool */
    inline.defaultToolAction = function (type) {

        document.execCommand(type, false, null);
    };

    /**
     * @private
     *
     * Sets URL
     *
     * @param {String} url - URL
     */
    inline.setAnchor = function (url) {

        document.execCommand('createLink', false, url);

        /** Close after URL inserting */
        editor.toolbar.inline.closeAction();
    };

    /**
     * @private
     *
     * Saves selection
     */
    inline.saveSelection = function (containerEl) {

        var range = window.getSelection().getRangeAt(0),
            preSelectionRange = range.cloneRange(),
            start;

        preSelectionRange.selectNodeContents(containerEl);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);

        start = preSelectionRange.toString().length;

        return {
            start: start,
            end: start + range.toString().length
        };
    };

    /**
     * @private
     *
     * Sets to previous selection (Range)
     *
     * @param {Element} containerEl - editable element where we restore range
     * @param {Object} savedSel - range basic information to restore
     */
    inline.restoreSelection = function (containerEl, savedSel) {

        var range = document.createRange(),
            charIndex = 0;

        range.setStart(containerEl, 0);
        range.collapse(true);

        var nodeStack = [containerEl],
            node,
            foundStart = false,
            stop = false,
            nextCharIndex;

        while (!stop && (node = nodeStack.pop())) {

            if (node.nodeType == 3) {

                nextCharIndex = charIndex + node.length;

                if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {

                    range.setStart(node, savedSel.start - charIndex);
                    foundStart = true;
                }
                if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {

                    range.setEnd(node, savedSel.end - charIndex);
                    stop = true;
                }
                charIndex = nextCharIndex;
            } else {

                var i = node.childNodes.length;

                while (i--) {

                    nodeStack.push(node.childNodes[i]);
                }
            }
        }

        var sel = window.getSelection();

        sel.removeAllRanges();
        sel.addRange(range);
    };

    /**
     * @private
     *
     * Removes all ranges from window selection
     */
    inline.clearRange = function () {

        var selection = window.getSelection();

        selection.removeAllRanges();
    };

    /**
     * @private
     *
     * sets or removes hightlight
     */
    inline.hightlight = function (tool) {

        var dataType = tool.dataset.type;

        if (document.queryCommandState(dataType)) {

            editor.toolbar.inline.setButtonHighlighted(tool);
        } else {

            editor.toolbar.inline.removeButtonsHighLight(tool);
        }

        /**
         *
         * hightlight for anchors
         */
        var selection = window.getSelection(),
            tag = selection.anchorNode.parentNode;

        if (tag.tagName == 'A' && dataType == 'link') {

            editor.toolbar.inline.setButtonHighlighted(tool);
        }
    };

    /**
     * @private
     *
     * Mark button if text is already executed
     */
    inline.setButtonHighlighted = function (button) {

        button.classList.add('hightlighted');

        /** At link tool we also change icon */
        if (button.dataset.type == 'link') {

            var icon = button.childNodes[0];

            icon.classList.remove('ce-icon-link');
            icon.classList.add('ce-icon-unlink');
        }
    };

    /**
     * @private
     *
     * Removes hightlight
     */
    inline.removeButtonsHighLight = function (button) {

        button.classList.remove('hightlighted');

        /** At link tool we also change icon */
        if (button.dataset.type == 'link') {

            var icon = button.childNodes[0];

            icon.classList.remove('ce-icon-unlink');
            icon.classList.add('ce-icon-link');
        }
    };

    return inline;
}({});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Toolbar settings
 *
 * @version 1.0.5
 */

module.exports = function (settings) {

    var editor = codex.editor;

    settings.opened = false;

    settings.setting = null;
    settings.actions = null;

    /**
     * Append and open settings
     */
    settings.open = function (toolType) {

        /**
         * Append settings content
         * It's stored in tool.settings
         */
        if (!editor.tools[toolType] || !editor.tools[toolType].makeSettings) {

            return;
        }

        /**
         * Draw settings block
         */
        var settingsBlock = editor.tools[toolType].makeSettings();

        editor.nodes.pluginSettings.appendChild(settingsBlock);

        /** Open settings block */
        editor.nodes.blockSettings.classList.add('opened');
        this.opened = true;
    };

    /**
     * Close and clear settings
     */
    settings.close = function () {

        editor.nodes.blockSettings.classList.remove('opened');
        editor.nodes.pluginSettings.innerHTML = '';

        this.opened = false;
    };

    /**
     * @param {string} toolType - plugin type
     */
    settings.toggle = function (toolType) {

        if (!this.opened) {

            this.open(toolType);
        } else {

            this.close();
        }
    };

    /**
     * Here we will draw buttons and add listeners to components
     */
    settings.makeRemoveBlockButton = function () {

        var removeBlockWrapper = editor.draw.node('SPAN', 'ce-toolbar__remove-btn', {}),
            settingButton = editor.draw.node('SPAN', 'ce-toolbar__remove-setting', { innerHTML: '<i class="ce-icon-trash"></i>' }),
            actionWrapper = editor.draw.node('DIV', 'ce-toolbar__remove-confirmation', {}),
            confirmAction = editor.draw.node('DIV', 'ce-toolbar__remove-confirm', { textContent: 'Удалить блок' }),
            cancelAction = editor.draw.node('DIV', 'ce-toolbar__remove-cancel', { textContent: 'Отмена' });

        editor.listeners.add(settingButton, 'click', editor.toolbar.settings.removeButtonClicked, false);

        editor.listeners.add(confirmAction, 'click', editor.toolbar.settings.confirmRemovingRequest, false);

        editor.listeners.add(cancelAction, 'click', editor.toolbar.settings.cancelRemovingRequest, false);

        actionWrapper.appendChild(confirmAction);
        actionWrapper.appendChild(cancelAction);

        removeBlockWrapper.appendChild(settingButton);
        removeBlockWrapper.appendChild(actionWrapper);

        /** Save setting */
        editor.toolbar.settings.setting = settingButton;
        editor.toolbar.settings.actions = actionWrapper;

        return removeBlockWrapper;
    };

    settings.removeButtonClicked = function () {

        var action = editor.toolbar.settings.actions;

        if (action.classList.contains('opened')) {

            editor.toolbar.settings.hideRemoveActions();
        } else {

            editor.toolbar.settings.showRemoveActions();
        }

        editor.toolbar.toolbox.close();
        editor.toolbar.settings.close();
    };

    settings.cancelRemovingRequest = function () {

        editor.toolbar.settings.actions.classList.remove('opened');
    };

    settings.confirmRemovingRequest = function () {

        var currentBlock = editor.content.currentNode,
            firstLevelBlocksCount;

        currentBlock.remove();

        firstLevelBlocksCount = editor.nodes.redactor.childNodes.length;

        /**
         * If all blocks are removed
         */
        if (firstLevelBlocksCount === 0) {

            /** update currentNode variable */
            editor.content.currentNode = null;

            /** Inserting new empty initial block */
            editor.ui.addInitialBlock();
        }

        editor.ui.saveInputs();

        editor.toolbar.close();
    };

    settings.showRemoveActions = function () {

        editor.toolbar.settings.actions.classList.add('opened');
    };

    settings.hideRemoveActions = function () {

        editor.toolbar.settings.actions.classList.remove('opened');
    };

    return settings;
}({});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Codex Editor toolbox
 *
 * All tools be able to appended here
 *
 * @author Codex Team
 * @version 1.0
 */

module.exports = function (toolbox) {

    var editor = codex.editor;

    toolbox.opened = false;
    toolbox.openedOnBlock = null;

    /** Shows toolbox */
    toolbox.open = function () {

        /** Close setting if toolbox is opened */
        if (editor.toolbar.settings.opened) {

            editor.toolbar.settings.close();
        }

        /** Add 'toolbar-opened' class for current block **/
        toolbox.openedOnBlock = editor.content.currentNode;
        toolbox.openedOnBlock.classList.add('toolbar-opened');

        /** display toolbox */
        editor.nodes.toolbox.classList.add('opened');

        /** Animate plus button */
        editor.nodes.plusButton.classList.add('clicked');

        /** toolbox state */
        editor.toolbar.toolbox.opened = true;
    };

    /** Closes toolbox */
    toolbox.close = function () {

        /** Remove 'toolbar-opened' class from current block **/
        if (toolbox.openedOnBlock) toolbox.openedOnBlock.classList.remove('toolbar-opened');
        toolbox.openedOnBlock = null;

        /** Makes toolbox disappear */
        editor.nodes.toolbox.classList.remove('opened');

        /** Rotate plus button */
        editor.nodes.plusButton.classList.remove('clicked');

        /** toolbox state */
        editor.toolbar.toolbox.opened = false;

        editor.toolbar.current = null;
    };

    toolbox.leaf = function () {

        var currentTool = editor.toolbar.current,
            tools = Object.keys(editor.tools),
            barButtons = editor.nodes.toolbarButtons,
            nextToolIndex = 0,
            toolToSelect = void 0,
            visibleTool = void 0,
            tool = void 0;

        if (!currentTool) {

            /** Get first tool from object*/
            for (tool in editor.tools) {

                if (editor.tools[tool].displayInToolbox) {

                    break;
                }

                nextToolIndex++;
            }
        } else {

            nextToolIndex = (tools.indexOf(currentTool) + 1) % tools.length;
            visibleTool = tools[nextToolIndex];

            while (!editor.tools[visibleTool].displayInToolbox) {

                nextToolIndex = (nextToolIndex + 1) % tools.length;
                visibleTool = tools[nextToolIndex];
            }
        }

        toolToSelect = tools[nextToolIndex];

        for (var button in barButtons) {

            barButtons[button].classList.remove('selected');
        }

        barButtons[toolToSelect].classList.add('selected');
        editor.toolbar.current = toolToSelect;
    };

    /**
     * Transforming selected node type into selected toolbar element type
     * @param {event} event
     */
    toolbox.toolClicked = function (event) {

        /**
         * UNREPLACEBLE_TOOLS this types of tools are forbidden to replace even they are empty
         */
        var UNREPLACEBLE_TOOLS = ['image', 'link', 'list', 'instagram', 'twitter', 'embed'],
            tool = editor.tools[editor.toolbar.current],
            workingNode = editor.content.currentNode,
            currentInputIndex = editor.caret.inputIndex,
            newBlockContent,
            appendCallback,
            blockData;

        /** Make block from plugin */
        newBlockContent = tool.render();

        /** information about block */
        blockData = {
            block: newBlockContent,
            type: tool.type,
            stretched: false
        };

        if (workingNode && UNREPLACEBLE_TOOLS.indexOf(workingNode.dataset.tool) === -1 && workingNode.textContent.trim() === '') {

            /** Replace current block */
            editor.content.switchBlock(workingNode, newBlockContent, tool.type);
        } else {

            /** Insert new Block from plugin */
            editor.content.insertBlock(blockData);

            /** increase input index */
            currentInputIndex++;
        }

        /** Fire tool append callback  */
        appendCallback = tool.appendCallback;

        if (appendCallback && typeof appendCallback == 'function') {

            appendCallback.call(event);
        }

        window.setTimeout(function () {

            /** Set caret to current block */
            editor.caret.setToBlock(currentInputIndex);
        }, 10);

        /**
         * Changing current Node
         */
        editor.content.workingNodeChanged();

        /**
         * Move toolbar when node is changed
         */
        editor.toolbar.move();
    };

    return toolbox;
}({});

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Codex Editor Anchors module
 *
 * @author Codex Team
 * @version 1.0
 */

module.exports = function (anchors) {

    var editor = codex.editor;

    anchors.input = null;
    anchors.currentNode = null;

    anchors.settingsOpened = function (currentBlock) {

        anchors.currentNode = currentBlock;
        anchors.input.value = anchors.currentNode.dataset.anchor || '';
    };

    anchors.anchorChanged = function (e) {

        var newAnchor = e.target.value = anchors.rusToTranslit(e.target.value);

        anchors.currentNode.dataset.anchor = newAnchor;

        if (newAnchor.trim() !== '') {

            anchors.currentNode.classList.add(editor.ui.className.BLOCK_WITH_ANCHOR);
        } else {

            anchors.currentNode.classList.remove(editor.ui.className.BLOCK_WITH_ANCHOR);
        }
    };

    anchors.keyDownOnAnchorInput = function (e) {

        if (e.keyCode == editor.core.keys.ENTER) {

            e.preventDefault();
            e.stopPropagation();

            e.target.blur();
            editor.toolbar.settings.close();
        }
    };

    anchors.keyUpOnAnchorInput = function (e) {

        if (e.keyCode >= editor.core.keys.LEFT && e.keyCode <= editor.core.keys.DOWN) {

            e.stopPropagation();
        }
    };

    anchors.rusToTranslit = function (string) {

        var ru = ['А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М', 'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ь', 'Ы', 'Ь', 'Э', 'Ю', 'Я'],
            en = ['A', 'B', 'V', 'G', 'D', 'E', 'E', 'Zh', 'Z', 'I', 'Y', 'K', 'L', 'M', 'N', 'O', 'P', 'R', 'S', 'T', 'U', 'F', 'H', 'C', 'Ch', 'Sh', 'Sch', '', 'Y', '', 'E', 'Yu', 'Ya'];

        for (var i = 0; i < ru.length; i++) {

            string = string.split(ru[i]).join(en[i]);
            string = string.split(ru[i].toLowerCase()).join(en[i].toLowerCase());
        }

        string = string.replace(/[^0-9a-zA-Z_]+/g, '-');

        return string;
    };

    return anchors;
}({});

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * @module Codex Editor Callbacks module
 * @description Module works with editor added Elements
 *
 * @author Codex Team
 * @version 1.4.0
 */

module.exports = function (callbacks) {

    var editor = codex.editor;

    /**
     * used by UI module
     * @description Routes all keydowns on document
     * @param {Object} event
     */
    callbacks.globalKeydown = function (event) {

        switch (event.keyCode) {

            case editor.core.keys.ENTER:
                enterKeyPressed_(event);break;

        }
    };

    /**
     * used by UI module
     * @description Routes all keydowns on redactors area
     * @param {Object} event
     */
    callbacks.redactorKeyDown = function (event) {

        switch (event.keyCode) {

            case editor.core.keys.TAB:
                tabKeyPressedOnRedactorsZone_(event);break;
            case editor.core.keys.ENTER:
                enterKeyPressedOnRedactorsZone_(event);break;
            case editor.core.keys.ESC:
                escapeKeyPressedOnRedactorsZone_(event);break;
            default:
                defaultKeyPressedOnRedactorsZone_(event);break;

        }
    };

    /**
     * used by UI module
     * @description Routes all keyup events
     * @param {Object} event
     */
    callbacks.globalKeyup = function (event) {

        switch (event.keyCode) {

            case editor.core.keys.UP:
            case editor.core.keys.LEFT:
            case editor.core.keys.RIGHT:
            case editor.core.keys.DOWN:
                arrowKeyPressed_(event);break;

        }
    };

    /**
     * @param {Object} event
     * @private
     *
     * Handles behaviour when tab pressed
     * @description if Content is empty show toolbox (if it is closed) or leaf tools
     * uses Toolbars toolbox module to handle the situation
     */
    var tabKeyPressedOnRedactorsZone_ = function tabKeyPressedOnRedactorsZone_(event) {

        /**
         * Wait for solution. Would like to know the behaviour
         * @todo Add spaces
         */
        event.preventDefault();

        if (!editor.core.isBlockEmpty(editor.content.currentNode)) {

            return;
        }

        if (!editor.toolbar.opened) {

            editor.toolbar.open();
        }

        if (editor.toolbar.opened && !editor.toolbar.toolbox.opened) {

            editor.toolbar.toolbox.open();
        } else {

            editor.toolbar.toolbox.leaf();
        }
    };

    /**
     * Handles global EnterKey Press
     * @see enterPressedOnBlock_
     * @param {Object} event
     */
    var enterKeyPressed_ = function enterKeyPressed_() {

        if (editor.content.editorAreaHightlighted) {

            /**
             * it means that we lose input index, saved index before is not correct
             * therefore we need to set caret when we insert new block
             */
            editor.caret.inputIndex = -1;

            enterPressedOnBlock_();
        }
    };

    /**
     * Callback for enter key pressing in first-level block area
     *
     * @param {Event} event
     * @private
     *
     * @description Inserts new block with initial type from settings
     */
    var enterPressedOnBlock_ = function enterPressedOnBlock_() {

        var NEW_BLOCK_TYPE = editor.settings.initialBlockPlugin;

        editor.content.insertBlock({
            type: NEW_BLOCK_TYPE,
            block: editor.tools[NEW_BLOCK_TYPE].render()
        }, true);

        editor.toolbar.move();
        editor.toolbar.open();
    };

    /**
     * ENTER key handler
     *
     * @param {Object} event
     * @private
     *
     * @description Makes new block with initial type from settings
     */
    var enterKeyPressedOnRedactorsZone_ = function enterKeyPressedOnRedactorsZone_(event) {

        if (event.target.contentEditable == 'true') {

            /** Update input index */
            editor.caret.saveCurrentInputIndex();
        }

        var currentInputIndex = editor.caret.getCurrentInputIndex() || 0,
            workingNode = editor.content.currentNode,
            tool = workingNode.dataset.tool,
            isEnterPressedOnToolbar = editor.toolbar.opened && editor.toolbar.current && event.target == editor.state.inputs[currentInputIndex];

        /** The list of tools which needs the default browser behaviour */
        var enableLineBreaks = editor.tools[tool].enableLineBreaks;

        /** This type of block creates when enter is pressed */
        var NEW_BLOCK_TYPE = editor.settings.initialBlockPlugin;

        /**
         * When toolbar is opened, select tool instead of making new paragraph
         */
        if (isEnterPressedOnToolbar) {

            event.preventDefault();

            editor.toolbar.toolbox.toolClicked(event);

            editor.toolbar.close();

            /**
             * Stop other listeners callback executions
             */
            event.stopPropagation();
            event.stopImmediatePropagation();

            return;
        }

        /**
         * Allow paragraph lineBreaks with shift enter
         * Or if shiftkey pressed and enter and enabledLineBreaks, the let new block creation
         */
        if (event.shiftKey || enableLineBreaks) {

            event.stopPropagation();
            event.stopImmediatePropagation();
            return;
        }

        var currentSelection = window.getSelection(),
            currentSelectedNode = currentSelection.anchorNode,
            caretAtTheEndOfText = editor.caret.position.atTheEnd(),
            isTextNodeHasParentBetweenContenteditable = false;

        /**
         * Allow making new <p> in same block by SHIFT+ENTER and forbids to prevent default browser behaviour
         */
        if (event.shiftKey && !enableLineBreaks) {

            editor.callback.enterPressedOnBlock(editor.content.currentBlock, event);
            event.preventDefault();
            return;
        }

        /**
         * Workaround situation when caret at the Text node that has some wrapper Elements
         * Split block cant handle this.
         * We need to save default behavior
         */
        isTextNodeHasParentBetweenContenteditable = currentSelectedNode && currentSelectedNode.parentNode.contentEditable != 'true';

        /**
         * Split blocks when input has several nodes and caret placed in textNode
         */
        if (currentSelectedNode.nodeType == editor.core.nodeTypes.TEXT && !isTextNodeHasParentBetweenContenteditable && !caretAtTheEndOfText) {

            event.preventDefault();

            editor.core.log('Splitting Text node...');

            editor.content.splitBlock(currentInputIndex);

            /** Show plus button when next input after split is empty*/
            if (!editor.state.inputs[currentInputIndex + 1].textContent.trim()) {

                editor.toolbar.showPlusButton();
            }
        } else {

            var islastNode = editor.content.isLastNode(currentSelectedNode);

            if (islastNode && caretAtTheEndOfText) {

                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                editor.core.log('ENTER clicked in last textNode. Create new BLOCK');

                editor.content.insertBlock({
                    type: NEW_BLOCK_TYPE,
                    block: editor.tools[NEW_BLOCK_TYPE].render()
                }, true);

                editor.toolbar.move();
                editor.toolbar.open();

                /** Show plus button with empty block */
                editor.toolbar.showPlusButton();
            }
        }

        /** get all inputs after new appending block */
        editor.ui.saveInputs();
    };

    /**
     * Escape behaviour
     * @param event
     * @private
     *
     * @description Closes toolbox and toolbar. Prevents default behaviour
     */
    var escapeKeyPressedOnRedactorsZone_ = function escapeKeyPressedOnRedactorsZone_(event) {

        /** Close all toolbar */
        editor.toolbar.close();

        /** Close toolbox */
        editor.toolbar.toolbox.close();

        event.preventDefault();
    };

    /**
     * @param {Event} event
     * @private
     *
     * closes and moves toolbar
     */
    var arrowKeyPressed_ = function arrowKeyPressed_(event) {

        editor.content.workingNodeChanged();

        /* Closing toolbar */
        editor.toolbar.close();
        editor.toolbar.move();
    };

    /**
     * @private
     * @param {Event} event
     *
     * @description Closes all opened bars from toolbar.
     * If block is mark, clears highlightning
     */
    var defaultKeyPressedOnRedactorsZone_ = function defaultKeyPressedOnRedactorsZone_() {

        editor.toolbar.close();

        if (!editor.toolbar.inline.actionsOpened) {

            editor.toolbar.inline.close();
            editor.content.clearMark();
        }
    };

    /**
     * Handler when clicked on redactors area
     *
     * @protected
     * @param event
     *
     * @description Detects clicked area. If it is first-level block area, marks as detected and
     * on next enter press will be inserted new block
     * Otherwise, save carets position (input index) and put caret to the editable zone.
     *
     * @see detectWhenClickedOnFirstLevelBlockArea_
     *
     */
    callbacks.redactorClicked = function (event) {

        detectWhenClickedOnFirstLevelBlockArea_();

        editor.content.workingNodeChanged(event.target);
        editor.ui.saveInputs();

        var selectedText = editor.toolbar.inline.getSelectionText(),
            firstLevelBlock;

        /** If selection range took off, then we hide inline toolbar */
        if (selectedText.length === 0) {

            editor.toolbar.inline.close();
        }

        /** Update current input index in memory when caret focused into existed input */
        if (event.target.contentEditable == 'true') {

            editor.caret.saveCurrentInputIndex();
        }

        if (editor.content.currentNode === null) {

            /**
             * If inputs in redactor does not exits, then we put input index 0 not -1
             */
            var indexOfLastInput = editor.state.inputs.length > 0 ? editor.state.inputs.length - 1 : 0;

            /** If we have any inputs */
            if (editor.state.inputs.length) {

                /** getting firstlevel parent of input */
                firstLevelBlock = editor.content.getFirstLevelBlock(editor.state.inputs[indexOfLastInput]);
            }

            /** If input is empty, then we set caret to the last input */
            if (editor.state.inputs.length && editor.state.inputs[indexOfLastInput].textContent === '' && firstLevelBlock.dataset.tool == editor.settings.initialBlockPlugin) {

                editor.caret.setToBlock(indexOfLastInput);
            } else {

                /** Create new input when caret clicked in redactors area */
                var NEW_BLOCK_TYPE = editor.settings.initialBlockPlugin;

                editor.content.insertBlock({
                    type: NEW_BLOCK_TYPE,
                    block: editor.tools[NEW_BLOCK_TYPE].render()
                });

                /** If there is no inputs except inserted */
                if (editor.state.inputs.length === 1) {

                    editor.caret.setToBlock(indexOfLastInput);
                } else {

                    /** Set caret to this appended input */
                    editor.caret.setToNextBlock(indexOfLastInput);
                }
            }
        } else {

            /** Close all panels */
            editor.toolbar.settings.close();
            editor.toolbar.toolbox.close();
        }

        /**
         * Move toolbar and open
         */
        editor.toolbar.move();
        editor.toolbar.open();

        var inputIsEmpty = !editor.content.currentNode.textContent.trim(),
            currentNodeType = editor.content.currentNode.dataset.tool,
            isInitialType = currentNodeType == editor.settings.initialBlockPlugin;

        /** Hide plus buttons */
        editor.toolbar.hidePlusButton();

        if (!inputIsEmpty) {

            /** Mark current block */
            editor.content.markBlock();
        }

        if (isInitialType && inputIsEmpty) {

            /** Show plus button */
            editor.toolbar.showPlusButton();
        }
    };

    /**
     * This method allows to define, is caret in contenteditable element or not.
     *
     * @private
     *
     * @description Otherwise, if we get TEXT node from range container, that will means we have input index.
     * In this case we use default browsers behaviour (if plugin allows that) or overwritten action.
     * Therefore, to be sure that we've clicked first-level block area, we should have currentNode, which always
     * specifies to the first-level block. Other cases we just ignore.
     */
    var detectWhenClickedOnFirstLevelBlockArea_ = function detectWhenClickedOnFirstLevelBlockArea_() {

        var selection = window.getSelection(),
            anchorNode = selection.anchorNode,
            flag = false;

        if (selection.rangeCount === 0) {

            editor.content.editorAreaHightlighted = true;
        } else {

            if (!editor.core.isDomNode(anchorNode)) {

                anchorNode = anchorNode.parentNode;
            }

            /** Already founded, without loop */
            if (anchorNode.contentEditable == 'true') {

                flag = true;
            }

            while (anchorNode.contentEditable != 'true') {

                anchorNode = anchorNode.parentNode;

                if (anchorNode.contentEditable == 'true') {

                    flag = true;
                }

                if (anchorNode == document.body) {

                    break;
                }
            }

            /** If editable element founded, flag is "TRUE", Therefore we return "FALSE" */
            editor.content.editorAreaHightlighted = !flag;
        }
    };

    /**
     * Toolbar button click handler
     *
     * @param {Object} event - cursor to the button
     * @protected
     *
     * @description gets current tool and calls render method
     */
    callbacks.toolbarButtonClicked = function (event) {

        var button = this;

        editor.toolbar.current = button.dataset.type;

        editor.toolbar.toolbox.toolClicked(event);
        editor.toolbar.close();
    };

    /**
     * Show or Hide toolbox when plus button is clicked
     */
    callbacks.plusButtonClicked = function () {

        if (!editor.nodes.toolbox.classList.contains('opened')) {

            editor.toolbar.toolbox.open();
        } else {

            editor.toolbar.toolbox.close();
        }
    };

    /**
     * Block handlers for KeyDown events
     *
     * @protected
     * @param {Object} event
     *
     * Handles keydowns on block
     * @see blockRightOrDownArrowPressed_
     * @see backspacePressed_
     * @see blockLeftOrUpArrowPressed_
     */
    callbacks.blockKeydown = function (event) {

        var block = event.target; // event.target is input

        switch (event.keyCode) {

            case editor.core.keys.DOWN:
            case editor.core.keys.RIGHT:
                blockRightOrDownArrowPressed_(event);
                break;

            case editor.core.keys.BACKSPACE:
                backspacePressed_(block, event);
                break;

            case editor.core.keys.UP:
            case editor.core.keys.LEFT:
                blockLeftOrUpArrowPressed_(event);
                break;

        }
    };

    /**
     * RIGHT or DOWN keydowns on block
     *
     * @param {Object} event
     * @private
     *
     * @description watches the selection and gets closest editable element.
     * Uses method getDeepestTextNodeFromPosition to get the last node of next block
     * Sets caret if it is contenteditable
     */
    var blockRightOrDownArrowPressed_ = function blockRightOrDownArrowPressed_(event) {

        var selection = window.getSelection(),
            inputs = editor.state.inputs,
            focusedNode = selection.anchorNode,
            focusedNodeHolder;

        /** Check for caret existance */
        if (!focusedNode) {

            return false;
        }

        /** Looking for closest (parent) contentEditable element of focused node */
        while (focusedNode.contentEditable != 'true') {

            focusedNodeHolder = focusedNode.parentNode;
            focusedNode = focusedNodeHolder;
        }

        /** Input index in DOM level */
        var editableElementIndex = 0;

        while (focusedNode != inputs[editableElementIndex]) {

            editableElementIndex++;
        }

        /**
         * Founded contentEditable element doesn't have childs
         * Or maybe New created block
         */
        if (!focusedNode.textContent) {

            editor.caret.setToNextBlock(editableElementIndex);
            return;
        }

        /**
         * Do nothing when caret doesn not reaches the end of last child
         */
        var caretInLastChild = false,
            caretAtTheEndOfText = false;

        var lastChild, deepestTextnode;

        lastChild = focusedNode.childNodes[focusedNode.childNodes.length - 1];

        if (editor.core.isDomNode(lastChild)) {

            deepestTextnode = editor.content.getDeepestTextNodeFromPosition(lastChild, lastChild.childNodes.length);
        } else {

            deepestTextnode = lastChild;
        }

        caretInLastChild = selection.anchorNode == deepestTextnode;
        caretAtTheEndOfText = deepestTextnode.length == selection.anchorOffset;

        if (!caretInLastChild || !caretAtTheEndOfText) {

            editor.core.log('arrow [down|right] : caret does not reached the end');
            return false;
        }

        editor.caret.setToNextBlock(editableElementIndex);
    };

    /**
     * LEFT or UP keydowns on block
     *
     * @param {Object} event
     * @private
     *
     * watches the selection and gets closest editable element.
     * Uses method getDeepestTextNodeFromPosition to get the last node of previous block
     * Sets caret if it is contenteditable
     *
     */
    var blockLeftOrUpArrowPressed_ = function blockLeftOrUpArrowPressed_(event) {

        var selection = window.getSelection(),
            inputs = editor.state.inputs,
            focusedNode = selection.anchorNode,
            focusedNodeHolder;

        /** Check for caret existance */
        if (!focusedNode) {

            return false;
        }

        /**
         * LEFT or UP not at the beginning
         */
        if (selection.anchorOffset !== 0) {

            return false;
        }

        /** Looking for parent contentEditable block */
        while (focusedNode.contentEditable != 'true') {

            focusedNodeHolder = focusedNode.parentNode;
            focusedNode = focusedNodeHolder;
        }

        /** Input index in DOM level */
        var editableElementIndex = 0;

        while (focusedNode != inputs[editableElementIndex]) {

            editableElementIndex++;
        }

        /**
         * Do nothing if caret is not at the beginning of first child
         */
        var caretInFirstChild = false,
            caretAtTheBeginning = false;

        var firstChild, deepestTextnode;

        /**
         * Founded contentEditable element doesn't have childs
         * Or maybe New created block
         */
        if (!focusedNode.textContent) {

            editor.caret.setToPreviousBlock(editableElementIndex);
            return;
        }

        firstChild = focusedNode.childNodes[0];

        if (editor.core.isDomNode(firstChild)) {

            deepestTextnode = editor.content.getDeepestTextNodeFromPosition(firstChild, 0);
        } else {

            deepestTextnode = firstChild;
        }

        caretInFirstChild = selection.anchorNode == deepestTextnode;
        caretAtTheBeginning = selection.anchorOffset === 0;

        if (caretInFirstChild && caretAtTheBeginning) {

            editor.caret.setToPreviousBlock(editableElementIndex);
        }
    };

    /**
     * Handles backspace keydown
     *
     * @param {Element} block
     * @param {Object} event
     * @private
     *
     * @description if block is empty, delete the block and set caret to the previous block
     * If block is not empty, try to merge two blocks - current and previous
     * But it we try'n to remove first block, then we should set caret to the next block, not previous.
     * If we removed the last block, create new one
     */
    var backspacePressed_ = function backspacePressed_(block, event) {

        var currentInputIndex = editor.caret.getCurrentInputIndex(),
            range,
            selectionLength,
            firstLevelBlocksCount;

        if (editor.core.isNativeInput(event.target)) {

            /** If input value is empty - remove block */
            if (event.target.value.trim() == '') {

                block.remove();
            } else {

                return;
            }
        }

        if (block.textContent.trim()) {

            range = editor.content.getRange();
            selectionLength = range.endOffset - range.startOffset;

            if (editor.caret.position.atStart() && !selectionLength && editor.state.inputs[currentInputIndex - 1]) {

                editor.content.mergeBlocks(currentInputIndex);
            } else {

                return;
            }
        }

        if (!selectionLength) {

            block.remove();
        }

        firstLevelBlocksCount = editor.nodes.redactor.childNodes.length;

        /**
         * If all blocks are removed
         */
        if (firstLevelBlocksCount === 0) {

            /** update currentNode variable */
            editor.content.currentNode = null;

            /** Inserting new empty initial block */
            editor.ui.addInitialBlock();

            /** Updating inputs state after deleting last block */
            editor.ui.saveInputs();

            /** Set to current appended block */
            window.setTimeout(function () {

                editor.caret.setToPreviousBlock(1);
            }, 10);
        } else {

            if (editor.caret.inputIndex !== 0) {

                /** Target block is not first */
                editor.caret.setToPreviousBlock(editor.caret.inputIndex);
            } else {

                /** If we try to delete first block */
                editor.caret.setToNextBlock(editor.caret.inputIndex);
            }
        }

        editor.toolbar.move();

        if (!editor.toolbar.opened) {

            editor.toolbar.open();
        }

        /** Updating inputs state */
        editor.ui.saveInputs();

        /** Prevent default browser behaviour */
        event.preventDefault();
    };

    /**
     * used by UI module
     * Clicks on block settings button
     *
     * @param {Object} event
     * @protected
     * @description Opens toolbar settings
     */
    callbacks.showSettingsButtonClicked = function (event) {

        /**
         * Get type of current block
         * It uses to append settings from tool.settings property.
         * ...
         * Type is stored in data-type attribute on block
         */
        var currentToolType = editor.content.currentNode.dataset.tool;

        editor.toolbar.settings.toggle(currentToolType);

        /** Close toolbox when settings button is active */
        editor.toolbar.toolbox.close();
        editor.toolbar.settings.hideRemoveActions();
    };

    return callbacks;
}({});

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Codex Editor Caret Module
 *
 * @author Codex Team
 * @version 1.0
 */

module.exports = function (caret) {

    var editor = codex.editor;

    /**
     * @var {int} InputIndex - editable element in DOM
     */
    caret.inputIndex = null;

    /**
     * @var {int} offset - caret position in a text node.
     */
    caret.offset = null;

    /**
     * @var {int} focusedNodeIndex - we get index of child node from first-level block
     */
    caret.focusedNodeIndex = null;

    /**
     * Creates Document Range and sets caret to the element.
     * @protected
     * @uses caret.save — if you need to save caret position
     * @param {Element} el - Changed Node.
     */
    caret.set = function (el, index, offset) {

        offset = offset || caret.offset || 0;
        index = index || caret.focusedNodeIndex || 0;

        var childs = el.childNodes,
            nodeToSet;

        if (childs.length === 0) {

            nodeToSet = el;
        } else {

            nodeToSet = childs[index];
        }

        /** If Element is INPUT */
        if (el.contentEditable != 'true') {

            el.focus();
            return;
        }

        if (editor.core.isDomNode(nodeToSet)) {

            nodeToSet = editor.content.getDeepestTextNodeFromPosition(nodeToSet, nodeToSet.childNodes.length);
        }

        var range = document.createRange(),
            selection = window.getSelection();

        window.setTimeout(function () {

            range.setStart(nodeToSet, offset);
            range.setEnd(nodeToSet, offset);

            selection.removeAllRanges();
            selection.addRange(range);

            editor.caret.saveCurrentInputIndex();
        }, 20);
    };

    /**
     * @protected
     * Updates index of input and saves it in caret object
     */
    caret.saveCurrentInputIndex = function () {

        /** Index of Input that we paste sanitized content */
        var selection = window.getSelection(),
            inputs = editor.state.inputs,
            focusedNode = selection.anchorNode,
            focusedNodeHolder;

        if (!focusedNode) {

            return;
        }

        /** Looking for parent contentEditable block */
        while (focusedNode.contentEditable != 'true') {

            focusedNodeHolder = focusedNode.parentNode;
            focusedNode = focusedNodeHolder;
        }

        /** Input index in DOM level */
        var editableElementIndex = 0;

        while (focusedNode != inputs[editableElementIndex]) {

            editableElementIndex++;
        }

        caret.inputIndex = editableElementIndex;
    };

    /**
     * Returns current input index (caret object)
     */
    caret.getCurrentInputIndex = function () {

        return caret.inputIndex;
    };

    /**
     * @param {int} index - index of first-level block after that we set caret into next input
     */
    caret.setToNextBlock = function (index) {

        var inputs = editor.state.inputs,
            nextInput = inputs[index + 1];

        if (!nextInput) {

            editor.core.log('We are reached the end');
            return;
        }

        /**
         * When new Block created or deleted content of input
         * We should add some text node to set caret
         */
        if (!nextInput.childNodes.length) {

            var emptyTextElement = document.createTextNode('');

            nextInput.appendChild(emptyTextElement);
        }

        editor.caret.inputIndex = index + 1;
        editor.caret.set(nextInput, 0, 0);
        editor.content.workingNodeChanged(nextInput);
    };

    /**
     * @param {int} index - index of target input.
     * Sets caret to input with this index
     */
    caret.setToBlock = function (index) {

        var inputs = editor.state.inputs,
            targetInput = inputs[index];

        if (!targetInput) {

            return;
        }

        /**
         * When new Block created or deleted content of input
         * We should add some text node to set caret
         */
        if (!targetInput.childNodes.length) {

            var emptyTextElement = document.createTextNode('');

            targetInput.appendChild(emptyTextElement);
        }

        editor.caret.inputIndex = index;
        editor.caret.set(targetInput, 0, 0);
        editor.content.workingNodeChanged(targetInput);
    };

    /**
     * @param {int} index - index of input
     */
    caret.setToPreviousBlock = function (index) {

        index = index || 0;

        var inputs = editor.state.inputs,
            previousInput = inputs[index - 1],
            lastChildNode,
            lengthOfLastChildNode,
            emptyTextElement;

        if (!previousInput) {

            editor.core.log('We are reached first node');
            return;
        }

        lastChildNode = editor.content.getDeepestTextNodeFromPosition(previousInput, previousInput.childNodes.length);
        lengthOfLastChildNode = lastChildNode.length;

        /**
         * When new Block created or deleted content of input
         * We should add some text node to set caret
         */
        if (!previousInput.childNodes.length) {

            emptyTextElement = document.createTextNode('');
            previousInput.appendChild(emptyTextElement);
        }
        editor.caret.inputIndex = index - 1;
        editor.caret.set(previousInput, previousInput.childNodes.length - 1, lengthOfLastChildNode);
        editor.content.workingNodeChanged(inputs[index - 1]);
    };

    caret.position = {

        atStart: function atStart() {

            var selection = window.getSelection(),
                anchorOffset = selection.anchorOffset,
                anchorNode = selection.anchorNode,
                firstLevelBlock = editor.content.getFirstLevelBlock(anchorNode),
                pluginsRender = firstLevelBlock.childNodes[0];

            if (!editor.core.isDomNode(anchorNode)) {

                anchorNode = anchorNode.parentNode;
            }

            var isFirstNode = anchorNode === pluginsRender.childNodes[0],
                isOffsetZero = anchorOffset === 0;

            return isFirstNode && isOffsetZero;
        },

        atTheEnd: function atTheEnd() {

            var selection = window.getSelection(),
                anchorOffset = selection.anchorOffset,
                anchorNode = selection.anchorNode;

            /** Caret is at the end of input */
            return !anchorNode || !anchorNode.length || anchorOffset === anchorNode.length;
        }
    };

    /**
     * Inserts node at the caret location
     * @param {HTMLElement|DocumentFragment} node
     */
    caret.insertNode = function (node) {

        var selection,
            range,
            lastNode = node;

        if (node.nodeType == editor.core.nodeTypes.DOCUMENT_FRAGMENT) {

            lastNode = node.lastChild;
        }

        selection = window.getSelection();

        range = selection.getRangeAt(0);
        range.deleteContents();

        range.insertNode(node);

        range.setStartAfter(lastNode);
        range.collapse(true);

        selection.removeAllRanges();
        selection.addRange(range);
    };

    return caret;
}({});

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Codex Editor Content Module
 * Works with DOM
 *
 * @module Codex Editor content module
 *
 * @author Codex Team
 * @version 1.3.13
 *
 * @description Module works with Elements that have been appended to the main DOM
 */

module.exports = function (content) {

    var editor = codex.editor;

    /**
     * Links to current active block
     * @type {null | Element}
     */
    content.currentNode = null;

    /**
     * clicked in redactor area
     * @type {null | Boolean}
     */
    content.editorAreaHightlighted = null;

    /**
     * @deprecated
     * Synchronizes redactor with original textarea
     */
    content.sync = function () {

        editor.core.log('syncing...');

        /**
         * Save redactor content to editor.state
         */
        editor.state.html = editor.nodes.redactor.innerHTML;
    };

    /**
     * Appends background to the block
     *
     * @description add CSS class to highlight visually first-level block area
     */
    content.markBlock = function () {

        editor.content.currentNode.classList.add(editor.ui.className.BLOCK_HIGHLIGHTED);
    };

    /**
     * Clear background
     *
     * @description clears styles that highlights block
     */
    content.clearMark = function () {

        if (editor.content.currentNode) {

            editor.content.currentNode.classList.remove(editor.ui.className.BLOCK_HIGHLIGHTED);
        }
    };

    /**
     * Finds first-level block
     *
     * @param {Element} node - selected or clicked in redactors area node
     * @protected
     *
     * @description looks for first-level block.
     * gets parent while node is not first-level
     */
    content.getFirstLevelBlock = function (node) {

        if (!editor.core.isDomNode(node)) {

            node = node.parentNode;
        }

        if (node === editor.nodes.redactor || node === document.body) {

            return null;
        } else {

            while (!node.classList.contains(editor.ui.className.BLOCK_CLASSNAME)) {

                node = node.parentNode;
            }

            return node;
        }
    };

    /**
     * Trigger this event when working node changed
     * @param {Element} targetNode - first-level of this node will be current
     * @protected
     *
     * @description If targetNode is first-level then we set it as current else we look for parents to find first-level
     */
    content.workingNodeChanged = function (targetNode) {

        /** Clear background from previous marked block before we change */
        editor.content.clearMark();

        if (!targetNode) {

            return;
        }

        content.currentNode = content.getFirstLevelBlock(targetNode);
    };

    /**
     * Replaces one redactor block with another
     * @protected
     * @param {Element} targetBlock - block to replace. Mostly currentNode.
     * @param {Element} newBlock
     * @param {string} newBlockType - type of new block; we need to store it to data-attribute
     *
     * [!] Function does not saves old block content.
     *     You can get it manually and pass with newBlock.innerHTML
     */
    content.replaceBlock = function (targetBlock, newBlock) {

        if (!targetBlock || !newBlock) {

            editor.core.log('replaceBlock: missed params');
            return;
        }

        /** If target-block is not a frist-level block, then we iterate parents to find it */
        while (!targetBlock.classList.contains(editor.ui.className.BLOCK_CLASSNAME)) {

            targetBlock = targetBlock.parentNode;
        }

        /** Replacing */
        editor.nodes.redactor.replaceChild(newBlock, targetBlock);

        /**
         * Set new node as current
         */
        editor.content.workingNodeChanged(newBlock);

        /**
         * Add block handlers
         */
        editor.ui.addBlockHandlers(newBlock);

        /**
         * Save changes
         */
        editor.ui.saveInputs();
    };

    /**
     * @protected
     *
     * Inserts new block to redactor
     * Wrapps block into a DIV with BLOCK_CLASSNAME class
     *
     * @param blockData          {object}
     * @param blockData.block    {Element}   element with block content
     * @param blockData.type     {string}    block plugin
     * @param needPlaceCaret     {bool}      pass true to set caret in new block
     *
     */
    content.insertBlock = function (blockData, needPlaceCaret) {

        var workingBlock = editor.content.currentNode,
            newBlockContent = blockData.block,
            blockType = blockData.type,
            isStretched = blockData.stretched;

        var newBlock = composeNewBlock_(newBlockContent, blockType, isStretched);

        if (workingBlock) {

            editor.core.insertAfter(workingBlock, newBlock);
        } else {

            /**
             * If redactor is empty, append as first child
             */
            editor.nodes.redactor.appendChild(newBlock);
        }

        /**
         * Block handler
         */
        editor.ui.addBlockHandlers(newBlock);

        /**
         * Set new node as current
         */
        editor.content.workingNodeChanged(newBlock);

        /**
         * Save changes
         */
        editor.ui.saveInputs();

        if (needPlaceCaret) {

            /**
             * If we don't know input index then we set default value -1
             */
            var currentInputIndex = editor.caret.getCurrentInputIndex() || -1;

            if (currentInputIndex == -1) {

                var editableElement = newBlock.querySelector('[contenteditable]'),
                    emptyText = document.createTextNode('');

                editableElement.appendChild(emptyText);
                editor.caret.set(editableElement, 0, 0);

                editor.toolbar.move();
                editor.toolbar.showPlusButton();
            } else {

                if (currentInputIndex === editor.state.inputs.length - 1) return;

                /** Timeout for browsers execution */
                window.setTimeout(function () {

                    /** Setting to the new input */
                    editor.caret.setToNextBlock(currentInputIndex);
                    editor.toolbar.move();
                    editor.toolbar.open();
                }, 10);
            }
        }

        /**
         * Block is inserted, wait for new click that defined focusing on editors area
         * @type {boolean}
         */
        content.editorAreaHightlighted = false;
    };

    /**
     * Replaces blocks with saving content
     * @protected
     * @param {Element} noteToReplace
     * @param {Element} newNode
     * @param {Element} blockType
     */
    content.switchBlock = function (blockToReplace, newBlock, tool) {

        tool = tool || editor.content.currentNode.dataset.tool;
        var newBlockComposed = composeNewBlock_(newBlock, tool);

        /** Replacing */
        editor.content.replaceBlock(blockToReplace, newBlockComposed);

        /** Save new Inputs when block is changed */
        editor.ui.saveInputs();
    };

    /**
     * Iterates between child noted and looking for #text node on deepest level
     * @protected
     *
     * @param {Element} block - node where find
     * @param {int} postiton - starting postion
     *      Example: childNodex.length to find from the end
     *               or 0 to find from the start
     * @return {Text} block
     * @uses DFS
     */
    content.getDeepestTextNodeFromPosition = function (block, position) {

        /**
         * Clear Block from empty and useless spaces with trim.
         * Such nodes we should remove
         */
        var blockChilds = block.childNodes,
            index,
            node,
            text;

        for (index = 0; index < blockChilds.length; index++) {

            node = blockChilds[index];

            if (node.nodeType == editor.core.nodeTypes.TEXT) {

                text = node.textContent.trim();

                /** Text is empty. We should remove this child from node before we start DFS
                 * decrease the quantity of childs.
                 */
                if (text === '') {

                    block.removeChild(node);
                    position--;
                }
            }
        }

        if (block.childNodes.length === 0) {

            return document.createTextNode('');
        }

        /** Setting default position when we deleted all empty nodes */
        if (position < 0) position = 1;

        var lookingFromStart = false;

        /** For looking from START */
        if (position === 0) {

            lookingFromStart = true;
            position = 1;
        }

        while (position) {

            /** initial verticle of node. */
            if (lookingFromStart) {

                block = block.childNodes[0];
            } else {

                block = block.childNodes[position - 1];
            }

            if (block.nodeType == editor.core.nodeTypes.TAG) {

                position = block.childNodes.length;
            } else if (block.nodeType == editor.core.nodeTypes.TEXT) {

                position = 0;
            }
        }

        return block;
    };

    /**
     * @private
     * @param {Element} block - current plugins render
     * @param {String} tool - plugins name
     * @param {Boolean} isStretched - make stretched block or not
     *
     * @description adds necessary information to wrap new created block by first-level holder
     */
    var composeNewBlock_ = function composeNewBlock_(block, tool, isStretched) {

        var newBlock = editor.draw.node('DIV', editor.ui.className.BLOCK_CLASSNAME, {}),
            blockContent = editor.draw.node('DIV', editor.ui.className.BLOCK_CONTENT, {});

        blockContent.appendChild(block);
        newBlock.appendChild(blockContent);

        if (isStretched) {

            blockContent.classList.add(editor.ui.className.BLOCK_STRETCHED);
        }

        newBlock.dataset.tool = tool;
        return newBlock;
    };

    /**
     * Returns Range object of current selection
     * @protected
     */
    content.getRange = function () {

        var selection = window.getSelection().getRangeAt(0);

        return selection;
    };

    /**
     * Divides block in two blocks (after and before caret)
     *
     * @protected
     * @param {int} inputIndex - target input index
     *
     * @description splits current input content to the separate blocks
     * When enter is pressed among the words, that text will be splited.
     */
    content.splitBlock = function (inputIndex) {

        var selection = window.getSelection(),
            anchorNode = selection.anchorNode,
            anchorNodeText = anchorNode.textContent,
            caretOffset = selection.anchorOffset,
            textBeforeCaret,
            textNodeBeforeCaret,
            textAfterCaret,
            textNodeAfterCaret;

        var currentBlock = editor.content.currentNode.querySelector('[contentEditable]');

        textBeforeCaret = anchorNodeText.substring(0, caretOffset);
        textAfterCaret = anchorNodeText.substring(caretOffset);

        textNodeBeforeCaret = document.createTextNode(textBeforeCaret);

        if (textAfterCaret) {

            textNodeAfterCaret = document.createTextNode(textAfterCaret);
        }

        var previousChilds = [],
            nextChilds = [],
            reachedCurrent = false;

        if (textNodeAfterCaret) {

            nextChilds.push(textNodeAfterCaret);
        }

        for (var i = 0, child; !!(child = currentBlock.childNodes[i]); i++) {

            if (child != anchorNode) {

                if (!reachedCurrent) {

                    previousChilds.push(child);
                } else {

                    nextChilds.push(child);
                }
            } else {

                reachedCurrent = true;
            }
        }

        /** Clear current input */
        editor.state.inputs[inputIndex].innerHTML = '';

        /**
         * Append all childs founded before anchorNode
         */
        var previousChildsLength = previousChilds.length;

        for (i = 0; i < previousChildsLength; i++) {

            editor.state.inputs[inputIndex].appendChild(previousChilds[i]);
        }

        editor.state.inputs[inputIndex].appendChild(textNodeBeforeCaret);

        /**
         * Append text node which is after caret
         */
        var nextChildsLength = nextChilds.length,
            newNode = document.createElement('div');

        for (i = 0; i < nextChildsLength; i++) {

            newNode.appendChild(nextChilds[i]);
        }

        newNode = newNode.innerHTML;

        /** This type of block creates when enter is pressed */
        var NEW_BLOCK_TYPE = editor.settings.initialBlockPlugin;

        /**
         * Make new paragraph with text after caret
         */
        editor.content.insertBlock({
            type: NEW_BLOCK_TYPE,
            block: editor.tools[NEW_BLOCK_TYPE].render({
                text: newNode
            })
        }, true);
    };

    /**
     * Merges two blocks — current and target
     * If target index is not exist, then previous will be as target
     *
     * @protected
     * @param {int} currentInputIndex
     * @param {int} targetInputIndex
     *
     * @description gets two inputs indexes and merges into one
     */
    content.mergeBlocks = function (currentInputIndex, targetInputIndex) {

        /** If current input index is zero, then prevent method execution */
        if (currentInputIndex === 0) {

            return;
        }

        var targetInput,
            currentInputContent = editor.state.inputs[currentInputIndex].innerHTML;

        if (!targetInputIndex) {

            targetInput = editor.state.inputs[currentInputIndex - 1];
        } else {

            targetInput = editor.state.inputs[targetInputIndex];
        }

        targetInput.innerHTML += currentInputContent;
    };

    /**
     * Iterates all right siblings and parents, which has right siblings
     * while it does not reached the first-level block
     *
     * @param {Element} node
     * @return {boolean}
     */
    content.isLastNode = function (node) {

        // console.log('погнали перебор родителей');

        var allChecked = false;

        while (!allChecked) {

            // console.log('Смотрим на %o', node);
            // console.log('Проверим, пустые ли соседи справа');

            if (!allSiblingsEmpty_(node)) {

                // console.log('Есть непустые соседи. Узел не последний. Выходим.');
                return false;
            }

            node = node.parentNode;

            /**
             * Проверяем родителей до тех пор, пока не найдем блок первого уровня
             */
            if (node.classList.contains(editor.ui.className.BLOCK_CONTENT)) {

                allChecked = true;
            }
        }

        return true;
    };

    /**
     * Checks if all element right siblings is empty
     * @param node
     */
    var allSiblingsEmpty_ = function allSiblingsEmpty_(node) {

        /**
         * Нужно убедиться, что после пустого соседа ничего нет
         */
        var sibling = node.nextSibling;

        while (sibling) {

            if (sibling.textContent.length) {

                return false;
            }

            sibling = sibling.nextSibling;
        }

        return true;
    };

    /**
     * @public
     *
     * @param {string} htmlData - html content as string
     * @param {string} plainData - plain text
     * @return {string} - html content as string
     */
    content.wrapTextWithParagraphs = function (htmlData, plainData) {

        if (!htmlData.trim()) {

            return wrapPlainTextWithParagraphs(plainData);
        }

        var wrapper = document.createElement('DIV'),
            newWrapper = document.createElement('DIV'),
            i,
            paragraph,
            firstLevelBlocks = ['DIV', 'P'],
            blockTyped,
            node;

        /**
         * Make HTML Element to Wrap Text
         * It allows us to work with input data as HTML content
         */
        wrapper.innerHTML = htmlData;
        paragraph = document.createElement('P');

        for (i = 0; i < wrapper.childNodes.length; i++) {

            node = wrapper.childNodes[i];

            blockTyped = firstLevelBlocks.indexOf(node.tagName) != -1;

            /**
             * If node is first-levet
             * we add this node to our new wrapper
             */
            if (blockTyped) {

                /**
                 * If we had splitted inline nodes to paragraph before
                 */
                if (paragraph.childNodes.length) {

                    newWrapper.appendChild(paragraph.cloneNode(true));

                    /** empty paragraph */
                    paragraph = null;
                    paragraph = document.createElement('P');
                }

                newWrapper.appendChild(node.cloneNode(true));
            } else {

                /** Collect all inline nodes to one as paragraph */
                paragraph.appendChild(node.cloneNode(true));

                /** if node is last we should append this node to paragraph and paragraph to new wrapper */
                if (i == wrapper.childNodes.length - 1) {

                    newWrapper.appendChild(paragraph.cloneNode(true));
                }
            }
        }

        return newWrapper.innerHTML;
    };

    /**
     * Splits strings on new line and wraps paragraphs with <p> tag
     * @param plainText
     * @returns {string}
     */
    var wrapPlainTextWithParagraphs = function wrapPlainTextWithParagraphs(plainText) {

        if (!plainText) return '';

        return '<p>' + plainText.split('\n\n').join('</p><p>') + '</p>';
    };

    /**
    * Finds closest Contenteditable parent from Element
    * @param {Element} node     element looking from
    * @return {Element} node    contenteditable
    */
    content.getEditableParent = function (node) {

        while (node && node.contentEditable != 'true') {

            node = node.parentNode;
        }

        return node;
    };

    /**
    * Clear editors content
     *
     * @param {Boolean} all — if true, delete all article data (content, id, etc.)
    */
    content.clear = function (all) {

        editor.nodes.redactor.innerHTML = '';
        editor.content.sync();
        editor.ui.saveInputs();
        if (all) {

            editor.state.blocks = {};
        } else if (editor.state.blocks) {

            editor.state.blocks.items = [];
        }

        editor.content.currentNode = null;
    };

    /**
    *
     * Load new data to editor
     * If editor is not empty, just append articleData.items
     *
    * @param articleData.items
    */
    content.load = function (articleData) {

        var currentContent = Object.assign({}, editor.state.blocks);

        editor.content.clear();

        if (!Object.keys(currentContent).length) {

            editor.state.blocks = articleData;
        } else if (!currentContent.items) {

            currentContent.items = articleData.items;
            editor.state.blocks = currentContent;
        } else {

            currentContent.items = currentContent.items.concat(articleData.items);
            editor.state.blocks = currentContent;
        }

        editor.renderer.makeBlocksFromData();
    };

    return content;
}({});

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Codex Editor Destroyer module
 *
 * @auhor Codex Team
 * @version 1.0
 */

module.exports = function (destroyer) {

    var editor = codex.editor;

    destroyer.removeNodes = function () {

        editor.nodes.wrapper.remove();
        editor.nodes.notifications.remove();
    };

    destroyer.destroyPlugins = function () {

        for (var tool in editor.tools) {

            if (typeof editor.tools[tool].destroy === 'function') {

                editor.tools[tool].destroy();
            }
        }
    };

    destroyer.destroyScripts = function () {

        var scripts = document.getElementsByTagName('SCRIPT');

        for (var i = 0; i < scripts.length; i++) {

            if (scripts[i].id.indexOf(editor.scriptPrefix) + 1) {

                scripts[i].remove();
                i--;
            }
        }
    };

    /**
     * Delete editor data from webpage.
     * You should send settings argument with boolean flags:
     * @param settings.ui- remove redactor event listeners and DOM nodes
     * @param settings.scripts - remove redactor scripts from DOM
     * @param settings.plugins - remove plugin's objects
     * @param settings.core - remove editor core. You can remove core only if UI and scripts flags is true
     * }
     *
     */
    destroyer.destroy = function (settings) {

        if (!settings || (typeof settings === 'undefined' ? 'undefined' : _typeof(settings)) !== 'object') {

            return;
        }

        if (settings.ui) {

            destroyer.removeNodes();
            editor.listeners.removeAll();
        }

        if (settings.scripts) {

            destroyer.destroyScripts();
        }

        if (settings.plugins) {

            destroyer.destroyPlugins();
        }

        if (settings.ui && settings.scripts && settings.core) {

            delete codex.editor;
        }
    };

    return destroyer;
}({});

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Codex Editor Listeners module
 *
 * @author Codex Team
 * @version 1.0
 */

/**
 * Module-decorator for event listeners assignment
 */
module.exports = function (listeners) {

    var allListeners = [];

    /**
     * Search methods
     *
     * byElement, byType and byHandler returns array of suitable listeners
     * one and all takes element, eventType, and handler and returns first (all) suitable listener
     *
     */
    listeners.search = function () {

        var byElement = function byElement(element, context) {

            var listenersOnElement = [];

            context = context || allListeners;

            for (var i = 0; i < context.length; i++) {

                var listener = context[i];

                if (listener.element === element) {

                    listenersOnElement.push(listener);
                }
            }

            return listenersOnElement;
        };

        var byType = function byType(eventType, context) {

            var listenersWithType = [];

            context = context || allListeners;

            for (var i = 0; i < context.length; i++) {

                var listener = context[i];

                if (listener.type === eventType) {

                    listenersWithType.push(listener);
                }
            }

            return listenersWithType;
        };

        var byHandler = function byHandler(handler, context) {

            var listenersWithHandler = [];

            context = context || allListeners;

            for (var i = 0; i < context.length; i++) {

                var listener = context[i];

                if (listener.handler === handler) {

                    listenersWithHandler.push(listener);
                }
            }

            return listenersWithHandler;
        };

        var one = function one(element, eventType, handler) {

            var result = allListeners;

            if (element) result = byElement(element, result);

            if (eventType) result = byType(eventType, result);

            if (handler) result = byHandler(handler, result);

            return result[0];
        };

        var all = function all(element, eventType, handler) {

            var result = allListeners;

            if (element) result = byElement(element, result);

            if (eventType) result = byType(eventType, result);

            if (handler) result = byHandler(handler, result);

            return result;
        };

        return {
            byElement: byElement,
            byType: byType,
            byHandler: byHandler,
            one: one,
            all: all
        };
    }();

    listeners.add = function (element, eventType, handler, isCapture) {

        element.addEventListener(eventType, handler, isCapture);

        var data = {
            element: element,
            type: eventType,
            handler: handler
        };

        var alreadyAddedListener = listeners.search.one(element, eventType, handler);

        if (!alreadyAddedListener) {

            allListeners.push(data);
        }
    };

    listeners.remove = function (element, eventType, handler) {

        element.removeEventListener(eventType, handler);

        var existingListeners = listeners.search.all(element, eventType, handler);

        for (var i = 0; i < existingListeners.length; i++) {

            var index = allListeners.indexOf(existingListeners[i]);

            if (index > 0) {

                allListeners.splice(index, 1);
            }
        }
    };

    listeners.removeAll = function () {

        allListeners.map(function (current) {

            listeners.remove(current.element, current.type, current.handler);
        });
    };

    listeners.get = function (element, eventType, handler) {

        return listeners.search.all(element, eventType, handler);
    };

    return listeners;
}({});

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Codex Editor Notification Module
 *
 * @author Codex Team
 * @version 1.0
 */

module.exports = function (notifications) {

    var editor = codex.editor;

    var queue = [];

    var addToQueue = function addToQueue(settings) {

        queue.push(settings);

        var index = 0;

        while (index < queue.length && queue.length > 5) {

            if (queue[index].type == 'confirm' || queue[index].type == 'prompt') {

                index++;
                continue;
            }

            queue[index].close();
            queue.splice(index, 1);
        }
    };

    notifications.createHolder = function () {

        var holder = editor.draw.node('DIV', 'cdx-notifications-block');

        editor.nodes.notifications = document.body.appendChild(holder);

        return holder;
    };

    /**
     * Error notificator. Shows block with message
     * @protected
     */
    notifications.errorThrown = function (errorMsg, event) {

        editor.notifications.notification({ message: 'This action is not available currently', type: event.type });
    };

    /**
     *
     * Appends notification
     *
     *  settings = {
     *      type        - notification type (reserved types: alert, confirm, prompt). Just add class 'cdx-notification-'+type
     *      message     - notification message
     *      okMsg       - confirm button text (default - 'Ok')
     *      cancelBtn   - cancel button text (default - 'Cancel'). Only for confirm and prompt types
     *      confirm     - function-handler for ok button click
     *      cancel      - function-handler for cancel button click. Only for confirm and prompt types
     *      time        - time (in seconds) after which notification will close (default - 10s)
     *  }
     *
     * @param settings
     */
    notifications.notification = function (constructorSettings) {

        /** Private vars and methods */
        var notification = null,
            cancel = null,
            type = null,
            confirm = null,
            inputField = null;

        var confirmHandler = function confirmHandler() {

            close();

            if (typeof confirm !== 'function') {

                return;
            }

            if (type == 'prompt') {

                confirm(inputField.value);
                return;
            }

            confirm();
        };

        var cancelHandler = function cancelHandler() {

            close();

            if (typeof cancel !== 'function') {

                return;
            }

            cancel();
        };

        /** Public methods */
        function create(settings) {

            if (!(settings && settings.message)) {

                editor.core.log('Can\'t create notification. Message is missed');
                return;
            }

            settings.type = settings.type || 'alert';
            settings.time = settings.time * 1000 || 10000;

            var wrapper = editor.draw.node('DIV', 'cdx-notification'),
                message = editor.draw.node('DIV', 'cdx-notification__message'),
                input = editor.draw.node('INPUT', 'cdx-notification__input'),
                okBtn = editor.draw.node('SPAN', 'cdx-notification__ok-btn'),
                cancelBtn = editor.draw.node('SPAN', 'cdx-notification__cancel-btn');

            message.textContent = settings.message;
            okBtn.textContent = settings.okMsg || 'ОК';
            cancelBtn.textContent = settings.cancelMsg || 'Отмена';

            editor.listeners.add(okBtn, 'click', confirmHandler);
            editor.listeners.add(cancelBtn, 'click', cancelHandler);

            wrapper.appendChild(message);

            if (settings.type == 'prompt') {

                wrapper.appendChild(input);
            }

            wrapper.appendChild(okBtn);

            if (settings.type == 'prompt' || settings.type == 'confirm') {

                wrapper.appendChild(cancelBtn);
            }

            wrapper.classList.add('cdx-notification-' + settings.type);
            wrapper.dataset.type = settings.type;

            notification = wrapper;
            type = settings.type;
            confirm = settings.confirm;
            cancel = settings.cancel;
            inputField = input;

            if (settings.type != 'prompt' && settings.type != 'confirm') {

                window.setTimeout(close, settings.time);
            }
        };

        /**
        * Show notification block
        */
        function send() {

            editor.nodes.notifications.appendChild(notification);
            inputField.focus();

            editor.nodes.notifications.classList.add('cdx-notification__notification-appending');

            window.setTimeout(function () {

                editor.nodes.notifications.classList.remove('cdx-notification__notification-appending');
            }, 100);

            addToQueue({ type: type, close: close });
        };

        /**
        *  Remove notification block
        */
        function close() {

            notification.remove();
        };

        if (constructorSettings) {

            create(constructorSettings);
            send();
        }

        return {
            create: create,
            send: send,
            close: close
        };
    };

    notifications.clear = function () {

        editor.nodes.notifications.innerHTML = '';
        queue = [];
    };

    return notifications;
}({});

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Codex Editor Parser Module
 *
 * @author Codex Team
 * @version 1.1
 */

module.exports = function (parser) {

    var editor = codex.editor;

    /** inserting text */
    parser.insertPastedContent = function (blockType, tag) {

        editor.content.insertBlock({
            type: blockType.type,
            block: blockType.render({
                text: tag.innerHTML
            })
        });
    };

    /**
     * Check DOM node for display style: separated block or child-view
     */
    parser.isFirstLevelBlock = function (node) {

        return node.nodeType == editor.core.nodeTypes.TAG && node.classList.contains(editor.ui.className.BLOCK_CLASSNAME);
    };

    return parser;
}({});

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Codex Editor Paste module
 *
 * @author Codex Team
 * @version 1.1.1
 */

module.exports = function (paste) {

    var editor = codex.editor;

    var patterns = [];

    paste.prepare = function () {

        var tools = editor.tools;

        for (var tool in tools) {

            if (!tools[tool].renderOnPastePatterns || !Array.isArray(tools[tool].renderOnPastePatterns)) {

                continue;
            }

            tools[tool].renderOnPastePatterns.map(function (pattern) {

                patterns.push(pattern);
            });
        }

        return Promise.resolve();
    };

    /**
     * Saves data
     * @param event
     */
    paste.pasted = function (event) {

        var clipBoardData = event.clipboardData || window.clipboardData,
            content = clipBoardData.getData('Text');

        var result = analize(content);

        if (result) {

            event.preventDefault();
            event.stopImmediatePropagation();
        }

        return result;
    };

    /**
     * Analizes pated string and calls necessary method
     */

    var analize = function analize(string) {

        var result = false,
            content = editor.content.currentNode,
            plugin = content.dataset.tool;

        patterns.map(function (pattern) {

            var execArray = pattern.regex.exec(string),
                match = execArray && execArray[0];

            if (match && match === string.trim()) {

                /** current block is not empty */
                if (content.textContent.trim() && plugin == editor.settings.initialBlockPlugin) {

                    pasteToNewBlock_();
                }

                pattern.callback(string, pattern);
                result = true;
            }
        });

        return result;
    };

    var pasteToNewBlock_ = function pasteToNewBlock_() {

        /** Create new initial block */
        editor.content.insertBlock({

            type: editor.settings.initialBlockPlugin,
            block: editor.tools[editor.settings.initialBlockPlugin].render({
                text: ''
            })

        }, false);
    };

    /**
     * This method prevents default behaviour.
     *
     * @param {Object} event
     * @protected
     *
     * @description We get from clipboard pasted data, sanitize, make a fragment that contains of this sanitized nodes.
     * Firstly, we need to memorize the caret position. We can do that by getting the range of selection.
     * After all, we insert clear fragment into caret placed position. Then, we should move the caret to the last node
     */
    paste.blockPasteCallback = function (event) {

        if (!needsToHandlePasteEvent(event.target)) {

            return;
        }

        /** Prevent default behaviour */
        event.preventDefault();

        /** get html pasted data - dirty data */
        var htmlData = event.clipboardData.getData('text/html'),
            plainData = event.clipboardData.getData('text/plain');

        /** Temporary DIV that is used to work with text's paragraphs as DOM-elements*/
        var paragraphs = editor.draw.node('DIV', '', {}),
            cleanData,
            wrappedData;

        /** Create fragment, that we paste to range after proccesing */
        cleanData = editor.sanitizer.clean(htmlData);

        /**
         * We wrap pasted text with <p> tags to split it logically
         * @type {string}
         */
        wrappedData = editor.content.wrapTextWithParagraphs(cleanData, plainData);
        paragraphs.innerHTML = wrappedData;

        /**
         * If there only one paragraph, just insert in at the caret location
         */
        if (paragraphs.childNodes.length == 1) {

            emulateUserAgentBehaviour(paragraphs.firstChild);
            return;
        }

        insertPastedParagraphs(paragraphs.childNodes);
    };

    /**
     * Checks if we should handle paste event on block
     * @param block
     *
     * @return {boolean}
     */
    var needsToHandlePasteEvent = function needsToHandlePasteEvent(block) {

        /** If area is input or textarea then allow default behaviour */
        if (editor.core.isNativeInput(block)) {

            return false;
        }

        var editableParent = editor.content.getEditableParent(block);

        /** Allow paste when event target placed in Editable element */
        if (!editableParent) {

            return false;
        }

        return true;
    };

    /**
     * Inserts new initial plugin blocks with data in paragraphs
     *
     * @param {Array} paragraphs - array of paragraphs (<p></p>) whit content, that should be inserted
     */
    var insertPastedParagraphs = function insertPastedParagraphs(paragraphs) {

        var NEW_BLOCK_TYPE = editor.settings.initialBlockPlugin,
            currentNode = editor.content.currentNode;

        paragraphs.forEach(function (paragraph) {

            /** Don't allow empty paragraphs */
            if (editor.core.isBlockEmpty(paragraph)) {

                return;
            }

            editor.content.insertBlock({
                type: NEW_BLOCK_TYPE,
                block: editor.tools[NEW_BLOCK_TYPE].render({
                    text: paragraph.innerHTML
                })
            });

            editor.caret.inputIndex++;
        });

        editor.caret.setToPreviousBlock(editor.caret.getCurrentInputIndex() + 1);

        /**
         * If there was no data in working node, remove it
         */
        if (editor.core.isBlockEmpty(currentNode)) {

            currentNode.remove();
            editor.ui.saveInputs();
        }
    };

    /**
     * Inserts node content at the caret position
     *
     * @param {Node} node - DOM node (could be DocumentFragment), that should be inserted at the caret location
     */
    var emulateUserAgentBehaviour = function emulateUserAgentBehaviour(node) {

        var newNode;

        if (node.childElementCount) {

            newNode = document.createDocumentFragment();

            node.childNodes.forEach(function (current) {

                if (!editor.core.isDomNode(current) && current.data.trim() === '') {

                    return;
                }

                newNode.appendChild(current.cloneNode(true));
            });
        } else {

            newNode = document.createTextNode(node.textContent);
        }

        editor.caret.insertNode(newNode);
    };

    return paste;
}({});

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Codex Editor Renderer Module
 *
 * @author Codex Team
 * @version 1.0
 */

module.exports = function (renderer) {

    var editor = codex.editor;

    /**
     * Asyncronously parses input JSON to redactor blocks
     */
    renderer.makeBlocksFromData = function () {

        /**
         * If redactor is empty, add first paragraph to start writing
         */
        if (editor.core.isEmpty(editor.state.blocks) || !editor.state.blocks.items.length) {

            editor.ui.addInitialBlock();
            return;
        }

        Promise.resolve()

        /** First, get JSON from state */
        .then(function () {

            return editor.state.blocks;
        })

        /** Then, start to iterate they */
        .then(editor.renderer.appendBlocks)

        /** Write log if something goes wrong */
        .catch(function (error) {

            editor.core.log('Error while parsing JSON: %o', 'error', error);
        });
    };

    /**
     * Parses JSON to blocks
     * @param {object} data
     * @return Primise -> nodeList
     */
    renderer.appendBlocks = function (data) {

        var blocks = data.items;

        /**
         * Sequence of one-by-one blocks appending
         * Uses to save blocks order after async-handler
         */
        var nodeSequence = Promise.resolve();

        for (var index = 0; index < blocks.length; index++) {

            /** Add node to sequence at specified index */
            editor.renderer.appendNodeAtIndex(nodeSequence, blocks, index);
        }
    };

    /**
     * Append node at specified index
     */
    renderer.appendNodeAtIndex = function (nodeSequence, blocks, index) {

        /** We need to append node to sequence */
        nodeSequence

        /** first, get node async-aware */
        .then(function () {

            return editor.renderer.getNodeAsync(blocks, index);
        })

        /**
         * second, compose editor-block from JSON object
         */
        .then(editor.renderer.createBlockFromData)

        /**
         * now insert block to redactor
         */
        .then(function (blockData) {

            /**
             * blockData has 'block', 'type' and 'stretched' information
             */
            editor.content.insertBlock(blockData);

            /** Pass created block to next step */
            return blockData.block;
        })

        /** Log if something wrong with node */
        .catch(function (error) {

            editor.core.log('Node skipped while parsing because %o', 'error', error);
        });
    };

    /**
     * Asynchronously returns block data from blocksList by index
     * @return Promise to node
     */
    renderer.getNodeAsync = function (blocksList, index) {

        return Promise.resolve().then(function () {

            return {
                tool: blocksList[index],
                position: index
            };
        });
    };

    /**
     * Creates editor block by JSON-data
     *
     * @uses render method of each plugin
     *
     * @param {Object} toolData.tool
     *                              { header : {
     *                                                text: '',
     *                                                type: 'H3', ...
     *                                            }
     *                               }
     * @param {Number} toolData.position - index in input-blocks array
     * @return {Object} with type and Element
     */
    renderer.createBlockFromData = function (toolData) {

        /** New parser */
        var block,
            tool = toolData.tool,
            pluginName = tool.type;

        /** Get first key of object that stores plugin name */
        // for (var pluginName in blockData) break;

        /** Check for plugin existance */
        if (!editor.tools[pluginName]) {

            throw Error('Plugin \xAB' + pluginName + '\xBB not found');
        }

        /** Check for plugin having render method */
        if (typeof editor.tools[pluginName].render != 'function') {

            throw Error('Plugin \xAB' + pluginName + '\xBB must have \xABrender\xBB method');
        }

        if (editor.tools[pluginName].available === false) {

            block = editor.draw.unavailableBlock();

            block.innerHTML = editor.tools[pluginName].loadingMessage;

            /**
            * Saver will extract data from initial block data by position in array
            */
            block.dataset.inputPosition = toolData.position;
        } else {

            /** New Parser */
            block = editor.tools[pluginName].render(tool.data);
        }

        /** is first-level block stretched */
        var stretched = editor.tools[pluginName].isStretched || false;

        /** Retrun type and block */
        return {
            type: pluginName,
            block: block,
            stretched: stretched
        };
    };

    return renderer;
}({});

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Codex Sanitizer
 */

module.exports = function (sanitizer) {

    /** HTML Janitor library */
    var janitor = __webpack_require__(24);

    /** Codex Editor */
    var editor = codex.editor;

    sanitizer.prepare = function () {

        if (editor.settings.sanitizer && !editor.core.isEmpty(editor.settings.sanitizer)) {

            Config.CUSTOM = editor.settings.sanitizer;
        }
    };

    /**
     * Basic config
     */
    var Config = {

        /** User configuration */
        CUSTOM: null,

        BASIC: {

            tags: {
                p: {},
                a: {
                    href: true,
                    target: '_blank',
                    rel: 'nofollow'
                }
            }
        }
    };

    sanitizer.Config = Config;

    /**
     *
     * @param userCustomConfig
     * @returns {*}
     * @private
     *
     * @description If developer uses editor's API, then he can customize sane restrictions.
     * Or, sane config can be defined globally in editors initialization. That config will be used everywhere
     * At least, if there is no config overrides, that API uses BASIC Default configation
     */
    var init_ = function init_(userCustomConfig) {

        var configuration = userCustomConfig || Config.CUSTOM || Config.BASIC;

        return new janitor(configuration);
    };

    /**
     * Cleans string from unwanted tags
     * @protected
     * @param {String} dirtyString - taint string
     * @param {Object} customConfig - allowed tags
     */
    sanitizer.clean = function (dirtyString, customConfig) {

        var janitorInstance = init_(customConfig);

        return janitorInstance.clean(dirtyString);
    };

    return sanitizer;
}({});

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Codex Editor Saver
 *
 * @author Codex Team
 * @version 1.1.0
 */

module.exports = function (saver) {

    var editor = codex.editor;

    /**
     * @public
     * Save blocks
     */
    saver.save = function () {

        /** Save html content of redactor to memory */
        editor.state.html = editor.nodes.redactor.innerHTML;

        /** Clean jsonOutput state */
        editor.state.jsonOutput = [];

        return saveBlocks(editor.nodes.redactor.childNodes);
    };

    /**
     * @private
     * Save each block data
     *
     * @param blocks
     * @returns {Promise.<TResult>}
     */
    var saveBlocks = function saveBlocks(blocks) {

        var data = [];

        for (var index = 0; index < blocks.length; index++) {

            data.push(getBlockData(blocks[index]));
        }

        return Promise.all(data).then(makeOutput).catch(editor.core.log);
    };

    /** Save and validate block data */
    var getBlockData = function getBlockData(block) {

        return saveBlockData(block).then(validateBlockData).catch(editor.core.log);
    };

    /**
    * @private
    * Call block`s plugin save method and return saved data
    *
    * @param block
    * @returns {Object}
    */
    var saveBlockData = function saveBlockData(block) {

        var pluginName = block.dataset.tool;

        /** Check for plugin existence */
        if (!editor.tools[pluginName]) {

            editor.core.log('Plugin \xAB' + pluginName + '\xBB not found', 'error');
            return { data: null, pluginName: null };
        }

        /** Check for plugin having save method */
        if (typeof editor.tools[pluginName].save !== 'function') {

            editor.core.log('Plugin \xAB' + pluginName + '\xBB must have save method', 'error');
            return { data: null, pluginName: null };
        }

        /** Result saver */
        var blockContent = block.childNodes[0],
            pluginsContent = blockContent.childNodes[0],
            position = pluginsContent.dataset.inputPosition;

        /** If plugin wasn't available then return data from cache */
        if (editor.tools[pluginName].available === false) {

            return Promise.resolve({ data: codex.editor.state.blocks.items[position].data, pluginName: pluginName });
        }

        return Promise.resolve(pluginsContent).then(editor.tools[pluginName].save).then(function (data) {
            return Object({ data: data, pluginName: pluginName });
        });
    };

    /**
    * Call plugin`s validate method. Return false if validation failed
    *
    * @param data
    * @param pluginName
    * @returns {Object|Boolean}
    */
    var validateBlockData = function validateBlockData(_ref) {
        var data = _ref.data,
            pluginName = _ref.pluginName;


        if (!data || !pluginName) {

            return false;
        }

        if (editor.tools[pluginName].validate) {

            var result = editor.tools[pluginName].validate(data);

            /**
             * Do not allow invalid data
             */
            if (!result) {

                return false;
            }
        }

        return { data: data, pluginName: pluginName };
    };

    /**
    * Compile article output
    *
    * @param savedData
    * @returns {{time: number, version, items: (*|Array)}}
    */
    var makeOutput = function makeOutput(savedData) {

        savedData = savedData.filter(function (blockData) {
            return blockData;
        });

        var items = savedData.map(function (blockData) {
            return Object({ type: blockData.pluginName, data: blockData.data });
        });

        editor.state.jsonOutput = items;

        return {
            id: editor.state.blocks.id || null,
            time: +new Date(),
            version: editor.version,
            items: items
        };
    };

    return saver;
}({});

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 *
 * Codex.Editor Transport Module
 *
 * @copyright 2017 Codex-Team
 * @version 1.2.0
 */

module.exports = function (transport) {

    var editor = codex.editor;

    /**
     * @private {Object} current XmlHttpRequest instance
     */
    var currentRequest = null;

    /**
     * @type {null} | {DOMElement} input - keeps input element in memory
     */
    transport.input = null;

    /**
     * @property {Object} arguments - keep plugin settings and defined callbacks
     */
    transport.arguments = null;

    /**
     * Prepares input element where will be files
     */
    transport.prepare = function () {

        var input = editor.draw.node('INPUT', '', { type: 'file' });

        editor.listeners.add(input, 'change', editor.transport.fileSelected);
        editor.transport.input = input;
    };

    /** Clear input when files is uploaded */
    transport.clearInput = function () {

        /** Remove old input */
        transport.input = null;

        /** Prepare new one */
        transport.prepare();
    };

    /**
     * Callback for file selection
     * @param {Event} event
     */
    transport.fileSelected = function () {

        var input = this,
            i,
            files = input.files,
            formData = new FormData();

        if (editor.transport.arguments.multiple === true) {

            for (i = 0; i < files.length; i++) {

                formData.append('files[]', files[i], files[i].name);
            }
        } else {

            formData.append('files', files[0], files[0].name);
        }

        currentRequest = editor.core.ajax({
            type: 'POST',
            data: formData,
            url: editor.transport.arguments.url,
            beforeSend: editor.transport.arguments.beforeSend,
            success: editor.transport.arguments.success,
            error: editor.transport.arguments.error,
            progress: editor.transport.arguments.progress
        });

        /** Clear input */
        transport.clearInput();
    };

    /**
     * Use plugin callbacks
     * @protected
     *
     * @param {Object} args - can have :
     * @param {String} args.url - fetch URL
     * @param {Function} args.beforeSend - function calls before sending ajax
     * @param {Function} args.success - success callback
     * @param {Function} args.error - on error handler
     * @param {Function} args.progress - xhr onprogress handler
     * @param {Boolean} args.multiple - allow select several files
     * @param {String} args.accept - adds accept attribute
     */
    transport.selectAndUpload = function (args) {

        transport.arguments = args;

        if (args.multiple === true) {

            transport.input.setAttribute('multiple', 'multiple');
        }

        if (args.accept) {

            transport.input.setAttribute('accept', args.accept);
        }

        transport.input.click();
    };

    transport.abort = function () {

        currentRequest.abort();

        currentRequest = null;
    };

    return transport;
}({});

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @module eventDispatcher
 *
 * Has two important methods:
 *    - {Function} on - appends subscriber to the event. If event doesn't exist - creates new one
 *    - {Function} emit - fires all subscribers with data
 *
 * @version 1.0.0
 */
var Events = function () {
    _createClass(Events, [{
        key: "state",


        /**
         * @param Editor
         * @param Editor.modules {@link CodexEditor#moduleInstances}
         * @param Editor.config {@link CodexEditor#configuration}
         */
        set: function set(Editor) {

            this.Editor = Editor;
        }

        /**
         * @constructor
         *
         * @property {Object} subscribers - all subscribers grouped by event name
         */

    }]);

    function Events() {
        _classCallCheck(this, Events);

        this.subscribers = {};
        this.Editor = null;
    }

    /**
     * @param {String} eventName - event name
     * @param {Function} callback - subscriber
     */


    _createClass(Events, [{
        key: "on",
        value: function on(eventName, callback) {

            if (!(eventName in this.subscribers)) {

                this.subscribers[eventName] = [];
            }

            // group by events
            this.subscribers[eventName].push(callback);
        }

        /**
         * @param {String} eventName - event name
         * @param {Object} data - subscribers get this data when they were fired
         */

    }, {
        key: "emit",
        value: function emit(eventName, data) {

            this.subscribers[eventName].reduce(function (previousData, currentHandler) {

                var newData = currentHandler(previousData);

                return newData ? newData : previousData;
            }, data);
        }

        /**
         * Destroyer
         */

    }, {
        key: "destroy",
        value: function destroy() {

            this.Editor = null;
            this.subscribers = null;
        }
    }]);

    return Events;
}();

Events.displayName = "Events";


module.exports = Events;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * DOM manipulations
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */


var _dom = __webpack_require__(18);

var _dom2 = _interopRequireDefault(_dom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 *
 * «Toolbar» is the node that moves up/down over current block
 *
 *  ______________________________________ Toolbar ____________________________________________
 * |                                                                                           |
 * |  ..................... Content ....................   ......... Block Actions ..........  |
 * |  .                                                .   .                                .  |
 * |  .                                                .   . [Open Settings] [Remove Block] .  |
 * |  .  [Plus Button]  [Toolbox: {Tool1}, {Tool2}]    .   .                                .  |
 * |  .                                                .   .        [Settings Panel]        .  |
 * |  ..................................................   ..................................  |
 * |                                                                                           |
 * |___________________________________________________________________________________________|
 *
 *
 * Toolbox — its an Element contains tools buttons. Can be shown by Plus Button.
 *
 *  _______________ Toolbox _______________
 * |                                       |
 * | [Header] [Image] [List] [Quote] ...   |
 * |_______________________________________|
 *
 *
 * Settings Panel — is an Element with block settings:
 *
 *   ____ Settings Panel ____
 *  | ...................... |
 *  | .   Tool Settings    . |
 *  | ...................... |
 *  | .  Default Settings  . |
 *  | ...................... |
 *  |________________________|
 *
 *
 * @class
 * @classdesc Toolbar module
 *
 * @property {Object} nodes
 * @property {Element} nodes.wrapper        - Toolbar main element
 * @property {Element} nodes.content        - Zone with Plus button and toolbox.
 * @property {Element} nodes.actions        - Zone with Block Settings and Remove Button
 * @property {Element} nodes.plusButton     - Button that opens or closes Toolbox
 * @property {Element} nodes.toolbox        - Container for tools
 * @property {Element} nodes.settingsToggler - open/close Settings Panel button
 * @property {Element} nodes.removeBlockButton - Remove Block button
 * @property {Element} nodes.settings          - Settings Panel
 * @property {Element} nodes.pluginSettings    - Plugin Settings section of Settings Panel
 * @property {Element} nodes.defaultSettings   - Default Settings section of Settings Panel
 */
var Toolbar = function () {

  /**
   * @constructor
   */
  function Toolbar() {
    _classCallCheck(this, Toolbar);

    this.Editor = null;

    this.nodes = {
      wrapper: null,
      content: null,
      actions: null,

      // Content Zone
      plusButton: null,
      toolbox: null,

      // Actions Zone
      settingsToggler: null,
      removeBlockButton: null,
      settings: null,

      // Settings Zone: Plugin Settings and Default Settings
      pluginSettings: null,
      defaultSettings: null
    };

    this.CSS = {
      toolbar: 'ce-toolbar',
      content: 'ce-toolbar__content',
      actions: 'ce-toolbar__actions',

      // Content Zone
      toolbox: 'ce-toolbar__toolbox',
      plusButton: 'ce-toolbar__plus',

      // Actions Zone
      settingsToggler: 'ce-toolbar__settings-btn',
      removeBlockButton: 'ce-toolbar__remove-btn',

      // Settings Panel
      settings: 'ce-settings',
      defaultSettings: 'ce-settings_default',
      pluginSettings: 'ce-settings_plugin'
    };
  }

  /**
   * Editor modules setter
   * @param {object} Editor - available editor modules
   */


  _createClass(Toolbar, [{
    key: 'make',


    /**
     * Makes toolbar
     */
    value: function make() {
      var _this = this;

      this.nodes.wrapper = _dom2.default.make('div', this.CSS.toolbar);

      /**
       * Make Content Zone and Actions Zone
       */
      ['content', 'actions'].forEach(function (el) {

        _this.nodes[el] = _dom2.default.make('div', _this.CSS[el]);
        _dom2.default.append(_this.nodes.wrapper, _this.nodes[el]);
      });

      /**
       * Fill Content Zone:
       *  - Plus Button
       *  - Toolbox
       */
      ['plusButton', 'toolbox'].forEach(function (el) {

        _this.nodes[el] = _dom2.default.make('div', _this.CSS[el]);
        _dom2.default.append(_this.nodes.content, _this.nodes[el]);
      });

      /**
       * Fill Actions Zone:
       *  - Settings Toggler
       *  - Remove Block Button
       *  - Settings Panel
       */
      this.nodes.settingsToggler = _dom2.default.make('span', this.CSS.settingsToggler);
      this.nodes.removeBlockButton = this.makeRemoveBlockButton();

      _dom2.default.append(this.nodes.actions, [this.nodes.settingsToggler, this.nodes.removeBlockButton]);

      /**
       * Make and append Settings Panel
       */
      this.makeBlockSettingsPanel();

      /**
       * Append toolbar to the Editor
       */
      _dom2.default.append(this.Editor.UI.nodes.wrapper, this.nodes.wrapper);
    }

    /**
     * Panel with block settings with 2 sections:
     *
     * @return {Element}
     */

  }, {
    key: 'makeBlockSettingsPanel',
    value: function makeBlockSettingsPanel() {

      this.nodes.settings = _dom2.default.make('div', this.CSS.settings);

      this.nodes.pluginSettings = _dom2.default.make('div', this.CSS.pluginSettings);
      this.nodes.defaultSettings = _dom2.default.make('div', this.CSS.defaultSettings);

      _dom2.default.append(this.nodes.settings, [this.nodes.pluginSettings, this.nodes.defaultSettings]);
      _dom2.default.append(this.nodes.actions, this.nodes.settings);
    }

    /**
     * Makes Remove Block button, and confirmation panel
     * @return {Element} wrapper with button and panel
     */

  }, {
    key: 'makeRemoveBlockButton',
    value: function makeRemoveBlockButton() {

      /**
       * @todo  add confirmation panel and handlers
       * @see  {@link settings#makeRemoveBlockButton}
       */
      return _dom2.default.make('span', this.CSS.removeBlockButton);
    }
  }, {
    key: 'state',
    set: function set(Editor) {

      this.Editor = Editor;
    }
  }]);

  return Toolbar;
}();

Toolbar.displayName = 'Toolbar';


module.exports = Toolbar;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * DOM manupulations helper
 */
var Dom = function () {
    function Dom() {
        _classCallCheck(this, Dom);
    }

    _createClass(Dom, null, [{
        key: "make",


        /**
         * Helper for making Elements with classname and attributes
         *
         * @param  {string} tagName           - new Element tag name
         * @param  {array|string} classNames  - list or name of CSS classname(s)
         * @param  {Object} attributes        - any attributes
         * @return {Element}
         */
        value: function make(tagName, classNames, attributes) {

            var el = document.createElement(tagName);

            if (Array.isArray(classNames)) {
                var _el$classList;

                (_el$classList = el.classList).add.apply(_el$classList, _toConsumableArray(classNames));
            } else if (classNames) {

                el.classList.add(classNames);
            }

            for (var attrName in attributes) {

                el[attrName] = attributes[attrName];
            }

            return el;
        }

        /**
         * Append one or several elements to the parent
         *
         * @param  {Element} parent    - where to append
         * @param  {Element|Element[]} - element ore elements list
         */

    }, {
        key: "append",
        value: function append(parent, elements) {

            if (Array.isArray(elements)) {

                elements.forEach(function (el) {
                    return parent.appendChild(el);
                });
            } else {

                parent.appendChild(elements);
            }
        }

        /**
         * Selector Decorator
         *
         * Returns first match
         *
         * @param {Element} el - element we searching inside. Default - DOM Document
         * @param {String} selector - searching string
         *
         * @returns {Element}
         */

    }, {
        key: "find",
        value: function find() {
            var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
            var selector = arguments[1];


            return el.querySelector(selector);
        }

        /**
         * Selector Decorator.
         *
         * Returns all matches
         *
         * @param {Element} el - element we searching inside. Default - DOM Document
         * @param {String} selector - searching string
         * @returns {NodeList}
         */

    }, {
        key: "findAll",
        value: function findAll() {
            var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;
            var selector = arguments[1];


            return el.querySelectorAll(selector);
        }
    }]);

    return Dom;
}();

Dom.displayName = "Dom";
exports.default = Dom;
;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Codex Editor toolbar module
 *
 * Contains:
 *  - Inline toolbox
 *  - Toolbox within plus button
 *  - Settings section
 *
 * @author Codex Team
 * @version 1.0
 */

module.exports = function (toolbar) {

    var editor = codex.editor;

    toolbar.settings = __webpack_require__(1);
    toolbar.inline = __webpack_require__(0);
    toolbar.toolbox = __webpack_require__(2);

    /**
     * Margin between focused node and toolbar
     */
    toolbar.defaultToolbarHeight = 49;

    toolbar.defaultOffset = 34;

    toolbar.opened = false;

    toolbar.current = null;

    /**
     * @protected
     */
    toolbar.open = function () {

        if (editor.hideToolbar) {

            return;
        }

        var toolType = editor.content.currentNode.dataset.tool;

        if (!editor.tools[toolType] || !editor.tools[toolType].makeSettings) {

            editor.nodes.showSettingsButton.classList.add('hide');
        } else {

            editor.nodes.showSettingsButton.classList.remove('hide');
        }

        editor.nodes.toolbar.classList.add('opened');
        this.opened = true;
    };

    /**
     * @protected
     */
    toolbar.close = function () {

        editor.nodes.toolbar.classList.remove('opened');

        toolbar.opened = false;
        toolbar.current = null;

        for (var button in editor.nodes.toolbarButtons) {

            editor.nodes.toolbarButtons[button].classList.remove('selected');
        }

        /** Close toolbox when toolbar is not displayed */
        editor.toolbar.toolbox.close();
        editor.toolbar.settings.close();
    };

    toolbar.toggle = function () {

        if (!this.opened) {

            this.open();
        } else {

            this.close();
        }
    };

    toolbar.hidePlusButton = function () {

        editor.nodes.plusButton.classList.add('hide');
    };

    toolbar.showPlusButton = function () {

        editor.nodes.plusButton.classList.remove('hide');
    };

    /**
     * Moving toolbar to the specified node
     */
    toolbar.move = function () {

        /** Close Toolbox when we move toolbar */
        editor.toolbar.toolbox.close();

        if (!editor.content.currentNode) {

            return;
        }

        var newYCoordinate = editor.content.currentNode.offsetTop - editor.toolbar.defaultToolbarHeight / 2 + editor.toolbar.defaultOffset;

        editor.nodes.toolbar.style.transform = 'translate3D(0, ' + Math.floor(newYCoordinate) + 'px, 0)';

        /** Close trash actions */
        editor.toolbar.settings.hideRemoveActions();
    };

    return toolbar;
}({});

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @module Codex Editor Tools Submodule
 *
 * Creates Instances from Plugins and binds external config to the instances
 */

/**
 * Load user defined tools
 * Tools must contain the following important objects:
 *
 * @typedef {Object} ToolsConfig
 * @property {String} iconClassname - this a icon in toolbar
 * @property {Boolean} displayInToolbox - will be displayed in toolbox. Default value is TRUE
 * @property {Boolean} enableLineBreaks - inserts new block or break lines. Default value is FALSE
 */

/**
 * @typedef {Object} Tool
 * @property render
 * @property save
 * @property settings
 * @property validate
 */

/**
 * Class properties:
 *
 * @property {String} name - name of this module
 * @property {Object[]} toolInstances - list of tool instances
 * @property {Tools[]} available - available Tools
 * @property {Tools[]} unavailable - unavailable Tools
 * @property {Object} toolsClasses - all classes
 * @property {EditorConfig} config - Editor config
 */
var util = __webpack_require__(25);

var Tools = function () {
    _createClass(Tools, [{
        key: 'available',


        /**
         * Returns available Tools
         * @return {Tool[]}
         */
        get: function get() {

            return this.toolsAvailable;
        }

        /**
         * Returns unavailable Tools
         * @return {Tool[]}
         */

    }, {
        key: 'unavailable',
        get: function get() {

            return this.toolsUnavailable;
        }

        /**
         * @param Editor
         * @param Editor.modules {@link CodexEditor#moduleInstances}
         * @param Editor.config {@link CodexEditor#configuration}
         */

    }, {
        key: 'state',
        set: function set(Editor) {

            this.Editor = Editor;
        }

        /**
         * If config wasn't passed by user
         * @return {ToolsConfig}
         */

    }, {
        key: 'defaultConfig',
        get: function get() {

            return {
                iconClassName: 'default-icon',
                displayInToolbox: false,
                enableLineBreaks: false
            };
        }

        /**
         * @constructor
         *
         * @param {ToolsConfig} config
         */

    }]);

    function Tools(_ref) {
        var config = _ref.config;

        _classCallCheck(this, Tools);

        this.config = config;

        this.toolClasses = {};
        this.toolsAvailable = {};
        this.toolsUnavailable = {};
    }

    /**
     * Creates instances via passed or default configuration
     * @return {boolean}
     */


    _createClass(Tools, [{
        key: 'prepare',
        value: function prepare() {
            var _this = this;

            var self = this;

            if (!this.config.hasOwnProperty('tools')) {

                return Promise.reject("Can't start without tools");
            }

            for (var toolName in this.config.tools) {

                this.toolClasses[toolName] = this.config.tools[toolName];
            }

            /**
             * getting classes that has prepare method
             */
            var sequenceData = this.getListOfPrepareFunctions();

            /**
             * if sequence data contains nothing then resolve current chain and run other module prepare
             */
            if (sequenceData.length === 0) {

                return Promise.resolve();
            }

            /**
             * to see how it works {@link Util#sequence}
             */
            return util.sequence(sequenceData, function (data) {

                _this.success(data);
            }, function (data) {

                _this.fallback(data);
            });
        }

        /**
         * Binds prepare function of plugins with user or default config
         * @return {Array} list of functions that needs to be fired sequently
         */

    }, {
        key: 'getListOfPrepareFunctions',
        value: function getListOfPrepareFunctions() {

            var toolPreparationList = [];

            for (var toolName in this.toolClasses) {

                var toolClass = this.toolClasses[toolName];

                if (typeof toolClass.prepare === 'function') {

                    toolPreparationList.push({
                        function: toolClass.prepare,
                        data: {
                            toolName: toolName
                        }
                    });
                }
            }

            return toolPreparationList;
        }

        /**
         * @param {ChainData.data} data - append tool to available list
         */

    }, {
        key: 'success',
        value: function success(data) {

            this.toolsAvailable[data.toolName] = this.toolClasses[data.toolName];
        }

        /**
         * @param {ChainData.data} data - append tool to unavailable list
         */

    }, {
        key: 'fallback',
        value: function fallback(data) {

            this.toolsUnavailable[data.toolName] = this.toolClasses[data.toolName];
        }

        /**
         * Returns all tools
         * @return {Array}
         */

    }, {
        key: 'getTools',
        value: function getTools() {

            return this.toolInstances;
        }
    }]);

    return Tools;
}();

Tools.displayName = 'Tools';


module.exports = Tools;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dom = __webpack_require__(18);

var _dom2 = _interopRequireDefault(_dom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Module UI
 *
 * @type {UI}
 */
// let className = {

/**
     * @const {string} BLOCK_CLASSNAME - redactor blocks name
     */
// BLOCK_CLASSNAME : 'ce-block',

/**
     * @const {String} wrapper for plugins content
     */
// BLOCK_CONTENT : 'ce-block__content',

/**
     * @const {String} BLOCK_STRETCHED - makes block stretched
     */
// BLOCK_STRETCHED : 'ce-block--stretched',

/**
     * @const {String} BLOCK_HIGHLIGHTED - adds background
     */
// BLOCK_HIGHLIGHTED : 'ce-block--focused',

/**
     * @const {String} - for all default settings
     */
// SETTINGS_ITEM : 'ce-settings__item'
// };

var CSS = {
    editorWrapper: 'codex-editor',
    editorZone: 'ce-redactor'
};

/**
 * @class
 *
 * @classdesc Makes CodeX Editor UI:
 *                <codex-editor>
 *                    <ce-redactor />
 *                    <ce-toolbar />
 *                    <ce-inline-toolbar />
 *                </codex-editor>
 *
 * @property {EditorConfig} config   - editor configuration {@link CodexEditor#configuration}
 * @property {Object} Editor         - available editor modules {@link CodexEditor#moduleInstances}
 * @property {Object} nodes          -
 * @property {Element} nodes.wrapper  - element where we need to append redactor
 * @property {Element} nodes.wrapper  - <codex-editor>
 * @property {Element} nodes.redactor - <ce-redactor>
 */
var UI = function () {

    /**
     * @constructor
     *
     * @param  {EditorConfig} config
     */
    function UI(_ref) {
        var config = _ref.config;

        _classCallCheck(this, UI);

        this.config = config;
        this.Editor = null;

        this.nodes = {
            holder: null,
            wrapper: null,
            redactor: null
        };
    }

    /**
     * Editor modules setter
     * @param {object} Editor - available editor modules
     */


    _createClass(UI, [{
        key: 'prepare',


        /**
         * @protected
         *
         * Making main interface
         */
        value: function prepare() {
            var _this = this;

            return new Promise(function (resolve, reject) {

                /**
                 * Element where we need to append CodeX Editor
                 * @type {Element}
                 */
                _this.nodes.holder = document.getElementById(_this.config.holderId);

                if (!_this.nodes.holder) {

                    reject(Error("Holder wasn't found by ID: #" + _this.config.holderId));
                    return;
                }

                /**
                 * Create and save main UI elements
                 */
                _this.nodes.wrapper = _dom2.default.make('div', CSS.editorWrapper);
                _this.nodes.redactor = _dom2.default.make('div', CSS.editorZone);

                _this.nodes.wrapper.appendChild(_this.nodes.redactor);
                _this.nodes.holder.appendChild(_this.nodes.wrapper);

                /**
                 * Make toolbar
                 */
                _this.Editor.Toolbar.make();

                /**
                 * Load and append CSS
                 */
                _this.loadStyles();

                resolve();
            })

            /** Add toolbox tools */
            // .then(addTools_)

            /** Make container for inline toolbar */
            // .then(makeInlineToolbar_)

            /** Add inline toolbar tools */
            // .then(addInlineToolbarTools_)

            /** Draw wrapper for notifications */
            // .then(makeNotificationHolder_)

            /** Add eventlisteners to redactor elements */
            // .then(bindEvents_)

            .catch(function (e) {

                console.error(e);

                // editor.core.log("Can't draw editor interface");
            });
        }
    }, {
        key: 'loadStyles',
        value: function loadStyles() {

            var styles = __webpack_require__(26);

            console.log('styles: %o', styles);
        }
    }, {
        key: 'state',
        set: function set(Editor) {

            this.Editor = Editor;
        }
    }]);

    return UI;
}();

UI.displayName = 'UI';


module.exports = UI;

// /**
//  * Codex Editor UI module
//  *
//  * @author Codex Team
//  * @version 1.2.0
//  */
//
// module.exports = (function (ui) {
//
//     let editor = codex.editor;
//
//     /**
//      * Basic editor classnames
//      */
//     ui.prepare = function () {
//

//
//     };
//
//     /** Draw notifications holder */
//     var makeNotificationHolder_ = function () {
//
//         /** Append block with notifications to the document */
//         editor.nodes.notifications = editor.notifications.createHolder();
//
//     };
//
//     /**
//      * @private
//      * Append tools passed in editor.tools
//      */
//     var addTools_ = function () {
//
//         var tool,
//             toolName,
//             toolButton;
//
//         for ( toolName in editor.settings.tools ) {
//
//             tool = editor.settings.tools[toolName];
//
//             editor.tools[toolName] = tool;
//
//             if (!tool.iconClassname && tool.displayInToolbox) {
//
//                 editor.core.log('Toolbar icon classname missed. Tool %o skipped', 'warn', toolName);
//                 continue;
//
//             }
//
//             if (typeof tool.render != 'function') {
//
//                 editor.core.log('render method missed. Tool %o skipped', 'warn', toolName);
//                 continue;
//
//             }
//
//             if (!tool.displayInToolbox) {
//
//                 continue;
//
//             } else {
//
//                 /** if tools is for toolbox */
//                 toolButton = editor.draw.toolbarButton(toolName, tool.iconClassname);
//
//                 editor.nodes.toolbox.appendChild(toolButton);
//
//                 editor.nodes.toolbarButtons[toolName] = toolButton;
//
//             }
//
//         }
//
//     };
//
//     var addInlineToolbarTools_ = function () {
//
//         var tools = {
//
//             bold: {
//                 icon    : 'ce-icon-bold',
//                 command : 'bold'
//             },
//
//             italic: {
//                 icon    : 'ce-icon-italic',
//                 command : 'italic'
//             },
//
//             link: {
//                 icon    : 'ce-icon-link',
//                 command : 'createLink'
//             }
//         };
//
//         var toolButton,
//             tool;
//
//         for(var name in tools) {
//
//             tool = tools[name];
//
//             toolButton = editor.draw.toolbarButtonInline(name, tool.icon);
//
//             editor.nodes.inlineToolbar.buttons.appendChild(toolButton);
//             /**
//              * Add callbacks to this buttons
//              */
//             editor.ui.setInlineToolbarButtonBehaviour(toolButton, tool.command);
//
//         }
//
//     };
//
//     /**
//      * @private
//      * Bind editor UI events
//      */
//     var bindEvents_ = function () {
//
//         editor.core.log('ui.bindEvents fired', 'info');
//
//         // window.addEventListener('error', function (errorMsg, url, lineNumber) {
//         //     editor.notifications.errorThrown(errorMsg, event);
//         // }, false );
//
//         /** All keydowns on Document */
//         editor.listeners.add(document, 'keydown', editor.callback.globalKeydown, false);
//
//         /** All keydowns on Redactor zone */
//         editor.listeners.add(editor.nodes.redactor, 'keydown', editor.callback.redactorKeyDown, false);
//
//         /** All keydowns on Document */
//         editor.listeners.add(document, 'keyup', editor.callback.globalKeyup, false );
//
//         /**
//          * Mouse click to radactor
//          */
//         editor.listeners.add(editor.nodes.redactor, 'click', editor.callback.redactorClicked, false );
//
//         /**
//          * Clicks to the Plus button
//          */
//         editor.listeners.add(editor.nodes.plusButton, 'click', editor.callback.plusButtonClicked, false);
//
//         /**
//          * Clicks to SETTINGS button in toolbar
//          */
//         editor.listeners.add(editor.nodes.showSettingsButton, 'click', editor.callback.showSettingsButtonClicked, false );
//
//         /** Bind click listeners on toolbar buttons */
//         for (var button in editor.nodes.toolbarButtons) {
//
//             editor.listeners.add(editor.nodes.toolbarButtons[button], 'click', editor.callback.toolbarButtonClicked, false);
//
//         }
//
//     };
//
//     ui.addBlockHandlers = function (block) {
//
//         if (!block) return;
//
//         /**
//          * Block keydowns
//          */
//         editor.listeners.add(block, 'keydown', editor.callback.blockKeydown, false);
//
//         /**
//          * Pasting content from another source
//          * We have two type of sanitization
//          * First - uses deep-first search algorithm to get sub nodes,
//          * sanitizes whole Block_content and replaces cleared nodes
//          * This method is deprecated
//          * Method is used in editor.callback.blockPaste(event)
//          *
//          * Secont - uses Mutation observer.
//          * Observer "observe" DOM changes and send changings to callback.
//          * Callback gets changed node, not whole Block_content.
//          * Inserted or changed node, which we've gotten have been cleared and replaced with diry node
//          *
//          * Method is used in editor.callback.blockPasteViaSanitize(event)
//          *
//          * @uses html-janitor
//          * @example editor.callback.blockPasteViaSanitize(event), the second method.
//          *
//          */
//         editor.listeners.add(block, 'paste', editor.paste.blockPasteCallback, false);
//
//         /**
//          * Show inline toolbar for selected text
//          */
//         editor.listeners.add(block, 'mouseup', editor.toolbar.inline.show, false);
//         editor.listeners.add(block, 'keyup', editor.toolbar.inline.show, false);
//
//     };
//
//     /** getting all contenteditable elements */
//     ui.saveInputs = function () {
//
//         var redactor = editor.nodes.redactor;
//
//         editor.state.inputs = [];
//
//         /** Save all inputs in global variable state */
//         var inputs = redactor.querySelectorAll('[contenteditable], input, textarea');
//
//         Array.prototype.map.call(inputs, function (current) {
//
//             if (!current.type || current.type == 'text' || current.type == 'textarea') {
//
//                 editor.state.inputs.push(current);
//
//             }
//
//         });
//
//     };
//
//     /**
//      * Adds first initial block on empty redactor
//      */
//     ui.addInitialBlock = function () {
//
//         var initialBlockType = editor.settings.initialBlockPlugin,
//             initialBlock;
//
//         if ( !editor.tools[initialBlockType] ) {
//
//             editor.core.log('Plugin %o was not implemented and can\'t be used as initial block', 'warn', initialBlockType);
//             return;
//
//         }
//
//         initialBlock = editor.tools[initialBlockType].render();
//
//         initialBlock.setAttribute('data-placeholder', editor.settings.placeholder);
//
//         editor.content.insertBlock({
//             type  : initialBlockType,
//             block : initialBlock
//         });
//
//         editor.content.workingNodeChanged(initialBlock);
//
//     };
//
//     ui.setInlineToolbarButtonBehaviour = function (button, type) {
//
//         editor.listeners.add(button, 'mousedown', function (event) {
//
//             editor.toolbar.inline.toolClicked(event, type);
//
//         }, false);
//
//     };
//
//     return ui;
//
// })({});

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
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
 *                initialBlock : 'paragraph',
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
 * @property {String} holderId - Element to append Editor
 * ...
 */



/**
 * Require Editor modules places in components/modules dir
 */
// eslint-disable-next-line

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var modules = ["events.js","toolbar.js","tools.js","ui.js"].map(function (module) {

    return __webpack_require__(23)("./" + module);
});

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
module.exports = function () {
    _createClass(CodexEditor, null, [{
        key: 'version',


        /** Editor version */
        get: function get() {

            return "2.0.0";
        }

        /**
         * @param {EditorConfig} config - user configuration
         *
         */

    }]);

    function CodexEditor(config) {
        var _this = this;

        _classCallCheck(this, CodexEditor);

        /**
         * Configuration object
         */
        this.config = {};

        /**
         * Editor Components
         */
        this.moduleInstances = {};

        Promise.resolve().then(function () {

            _this.configuration = config;
        }).then(function () {
            return _this.init();
        }).then(function () {
            return _this.start();
        }).then(function () {

            console.log('CodeX Editor is ready');
        }).catch(function (error) {

            console.log('CodeX Editor does not ready beecause of %o', error);
        });
    }

    /**
     * Setting for configuration
     * @param {Object} config
     */


    _createClass(CodexEditor, [{
        key: 'init',


        /**
         * Initializes modules:
         *  - make and save instances
         *  - configure
         */
        value: function init() {

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

    }, {
        key: 'constructModules',
        value: function constructModules() {
            var _this2 = this;

            modules.forEach(function (Module) {

                try {

                    /**
                     * We use class name provided by displayName property
                     *
                     * On build, Babel will transform all Classes to the Functions so, name will always be 'Function'
                     * To prevent this, we use 'babel-plugin-class-display-name' plugin
                     * @see  https://www.npmjs.com/package/babel-plugin-class-display-name
                     */

                    _this2.moduleInstances[Module.displayName] = new Module({
                        config: _this2.configuration
                    });
                } catch (e) {

                    console.log('Module %o skipped because %o', Module, e);
                }
            });
        }

        /**
         * Modules instances configuration:
         *  - pass other modules to the 'state' property
         *  - ...
         */

    }, {
        key: 'configureModules',
        value: function configureModules() {

            for (var name in this.moduleInstances) {

                /**
                 * Module does not need self-instance
                 */
                this.moduleInstances[name].state = this.getModulesDiff(name);
            }
        }

        /**
         * Return modules without passed name
         */

    }, {
        key: 'getModulesDiff',
        value: function getModulesDiff(name) {

            var diff = {};

            for (var moduleName in this.moduleInstances) {

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
         * @return {Promise}
         */

    }, {
        key: 'start',
        value: function start() {

            var prepareDecorator = function prepareDecorator(module) {
                return module.prepare();
            };

            return Promise.resolve().then(prepareDecorator(this.moduleInstances.UI)).then(prepareDecorator(this.moduleInstances.Tools)).catch(function (error) {

                console.log('Error occured', error);
            });
        }
    }, {
        key: 'configuration',
        set: function set() {
            var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


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
        }

        /**
         * Returns private property
         * @returns {{}|*}
         */
        ,
        get: function get() {

            return this.config;
        }
    }]);

    return CodexEditor;
}();

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
//         tools     : ['paragraph', 'header', 'picture', 'list', 'quote', 'code', 'twitter', 'instagram', 'smile'],
//         holderId  : 'codex-editor',
//
//         // Type of block showing on empty editor
//         initialBlockPlugin: 'paragraph'
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

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./_anchors": 3,
	"./_anchors.js": 3,
	"./_callbacks": 4,
	"./_callbacks.js": 4,
	"./_caret": 5,
	"./_caret.js": 5,
	"./_content": 6,
	"./_content.js": 6,
	"./_destroyer": 7,
	"./_destroyer.js": 7,
	"./_listeners": 8,
	"./_listeners.js": 8,
	"./_notifications": 9,
	"./_notifications.js": 9,
	"./_parser": 10,
	"./_parser.js": 10,
	"./_paste": 11,
	"./_paste.js": 11,
	"./_renderer": 12,
	"./_renderer.js": 12,
	"./_sanitizer": 13,
	"./_sanitizer.js": 13,
	"./_saver": 14,
	"./_saver.js": 14,
	"./_transport": 15,
	"./_transport.js": 15,
	"./events": 16,
	"./events.js": 16,
	"./toolbar": 17,
	"./toolbar.js": 17,
	"./toolbar/inline": 0,
	"./toolbar/inline.js": 0,
	"./toolbar/settings": 1,
	"./toolbar/settings.js": 1,
	"./toolbar/toolbar": 19,
	"./toolbar/toolbar.js": 19,
	"./toolbar/toolbox": 2,
	"./toolbar/toolbox.js": 2,
	"./tools": 20,
	"./tools.js": 20,
	"./ui": 21,
	"./ui.js": 21
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number or string
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 23;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.HTMLJanitor = factory();
  }
}(this, function () {

  /**
   * @param {Object} config.tags Dictionary of allowed tags.
   * @param {boolean} config.keepNestedBlockElements Default false.
   */
  function HTMLJanitor(config) {

    var tagDefinitions = config['tags'];
    var tags = Object.keys(tagDefinitions);

    var validConfigValues = tags
      .map(function(k) { return typeof tagDefinitions[k]; })
      .every(function(type) { return type === 'object' || type === 'boolean' || type === 'function'; });

    if(!validConfigValues) {
      throw new Error("The configuration was invalid");
    }

    this.config = config;
  }

  // TODO: not exhaustive?
  var blockElementNames = ['P', 'LI', 'TD', 'TH', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'PRE'];
  function isBlockElement(node) {
    return blockElementNames.indexOf(node.nodeName) !== -1;
  }

  var inlineElementNames = ['A', 'B', 'STRONG', 'I', 'EM', 'SUB', 'SUP', 'U', 'STRIKE'];
  function isInlineElement(node) {
    return inlineElementNames.indexOf(node.nodeName) !== -1;
  }

  HTMLJanitor.prototype.clean = function (html) {
    var sandbox = document.createElement('div');
    sandbox.innerHTML = html;

    this._sanitize(sandbox);

    return sandbox.innerHTML;
  };

  HTMLJanitor.prototype._sanitize = function (parentNode) {
    var treeWalker = createTreeWalker(parentNode);
    var node = treeWalker.firstChild();
    if (!node) { return; }

    do {
      // Ignore nodes that have already been sanitized
      if (node._sanitized) {
        continue;
      }

      if (node.nodeType === Node.TEXT_NODE) {
        // If this text node is just whitespace and the previous or next element
        // sibling is a block element, remove it
        // N.B.: This heuristic could change. Very specific to a bug with
        // `contenteditable` in Firefox: http://jsbin.com/EyuKase/1/edit?js,output
        // FIXME: make this an option?
        if (node.data.trim() === ''
            && ((node.previousElementSibling && isBlockElement(node.previousElementSibling))
                 || (node.nextElementSibling && isBlockElement(node.nextElementSibling)))) {
          parentNode.removeChild(node);
          this._sanitize(parentNode);
          break;
        } else {
          continue;
        }
      }

      // Remove all comments
      if (node.nodeType === Node.COMMENT_NODE) {
        parentNode.removeChild(node);
        this._sanitize(parentNode);
        break;
      }

      var isInline = isInlineElement(node);
      var containsBlockElement;
      if (isInline) {
        containsBlockElement = Array.prototype.some.call(node.childNodes, isBlockElement);
      }

      // Block elements should not be nested (e.g. <li><p>...); if
      // they are, we want to unwrap the inner block element.
      var isNotTopContainer = !! parentNode.parentNode;
      var isNestedBlockElement =
            isBlockElement(parentNode) &&
            isBlockElement(node) &&
            isNotTopContainer;

      var nodeName = node.nodeName.toLowerCase();

      var allowedAttrs = getAllowedAttrs(this.config, nodeName, node);

      var isInvalid = isInline && containsBlockElement;

      // Drop tag entirely according to the whitelist *and* if the markup
      // is invalid.
      if (isInvalid || shouldRejectNode(node, allowedAttrs)
          || (!this.config.keepNestedBlockElements && isNestedBlockElement)) {
        // Do not keep the inner text of SCRIPT/STYLE elements.
        if (! (node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE')) {
          while (node.childNodes.length > 0) {
            parentNode.insertBefore(node.childNodes[0], node);
          }
        }
        parentNode.removeChild(node);

        this._sanitize(parentNode);
        break;
      }

      // Sanitize attributes
      for (var a = 0; a < node.attributes.length; a += 1) {
        var attr = node.attributes[a];

        if (shouldRejectAttr(attr, allowedAttrs, node)) {
          node.removeAttribute(attr.name);
          // Shift the array to continue looping.
          a = a - 1;
        }
      }

      // Sanitize children
      this._sanitize(node);

      // Mark node as sanitized so it's ignored in future runs
      node._sanitized = true;
    } while ((node = treeWalker.nextSibling()));
  };

  function createTreeWalker(node) {
    return document.createTreeWalker(node,
                                     NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT,
                                     null, false);
  }

  function getAllowedAttrs(config, nodeName, node){
    if (typeof config.tags[nodeName] === 'function') {
      return config.tags[nodeName](node);
    } else {
      return config.tags[nodeName];
    }
  }

  function shouldRejectNode(node, allowedAttrs){
    if (typeof allowedAttrs === 'undefined') {
      return true;
    } else if (typeof allowedAttrs === 'boolean') {
      return !allowedAttrs;
    }

    return false;
  }

  function shouldRejectAttr(attr, allowedAttrs, node){
    var attrName = attr.name.toLowerCase();

    if (allowedAttrs === true){
      return false;
    } else if (typeof allowedAttrs[attrName] === 'function'){
      return !allowedAttrs[attrName](attr.value, node);
    } else if (typeof allowedAttrs[attrName] === 'undefined'){
      return true;
    } else if (allowedAttrs[attrName] === false) {
      return true;
    } else if (typeof allowedAttrs[attrName] === 'string') {
      return (allowedAttrs[attrName] !== attr.value);
    }

    return false;
  }

  return HTMLJanitor;

}));


/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Codex Editor Util
 */
module.exports = function () {
    function Util() {
        _classCallCheck(this, Util);
    }

    _createClass(Util, null, [{
        key: "sequence",


        /**
         * @typedef {Object} ChainData
         * @property {Object} data - data that will be passed to the success or fallback
         * @property {Function} function - function's that must be called asynchronically
         */

        /**
         * Fires a promise sequence asyncronically
         *
         * @param {Object[]} chains - list or ChainData's
         * @param {Function} success - success callback
         * @param {Function} fallback - callback that fires in case of errors
         *
         * @return {Promise}
         */
        value: function sequence(chains, success, fallback) {

            return new Promise(function (resolve, reject) {

                /**
                 * pluck each element from queue
                 * First, send resolved Promise as previous value
                 * Each plugins "prepare" method returns a Promise, that's why
                 * reduce current element will not be able to continue while can't get
                 * a resolved Promise
                 */
                chains.reduce(function (previousValue, currentValue, iteration) {

                    return previousValue.then(function () {
                        return waitNextBlock(currentValue, success, fallback);
                    }).then(function () {

                        // finished
                        if (iteration == chains.length - 1) {

                            resolve();
                        }
                    });
                }, Promise.resolve());
            });

            /**
             * Decorator
             *
             * @param {ChainData} chainData
             *
             * @param {Function} success
             * @param {Function} fallback
             *
             * @return {Promise}
             */
            function waitNextBlock(chainData, success, fallback) {

                return new Promise(function (resolve, reject) {

                    chainData.function().then(function () {

                        success(chainData.data);
                    }).then(resolve).catch(function () {

                        fallback(chainData.data);

                        // anyway, go ahead even it falls
                        resolve();
                    });
                });
            }
        }
    }]);

    return Util;
}();

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(27)(undefined);
// imports


// module
exports.push([module.i, "/**\n* Editor wrapper\n*/\n.codex-editor{\n    position: relative;\n}\n.codex-editor .hide {\n        display: none;\n    }\n/**\n* Working zone - redactor\n*/\n.ce-redactor{\n    position: relative;\n    padding-bottom: 120px;\n    min-height: 350px;\n}\n.ce-block__content a {\n    color: #186baa;\n}\n/*.ce-redactor * {\n    box-sizing: border-box;\n}*/\n/**\n* Remove outlines from inputs\n*/\n.ce-redactor [contenteditable]{\n    outline: none !important;\n}\n/**\n* Toolbar\n*/\n.ce-toolbar{\n    position: absolute;\n    z-index: 2;\n    width: 100%;\n\n    /* hidden by default */\n    display: none;\n}\n.ce-toolbar.opened{\n    display: block;\n}\n.ce-toolbar__content {\n        position: relative;\n        max-width: 600px;\n        margin: 0 auto;\n    }\n/**\n* Plus button\n*/\n.ce-toolbar__plus{\n    position: absolute;\n    background-position: center center;\n    background-repeat: no-repeat;\n    text-align: center;\n    transition: -webkit-transform 100ms ease;\n    transition: transform 100ms ease;\n    transition: transform 100ms ease, -webkit-transform 100ms ease;\n    will-change: transform;\n\n    margin-left: -50px;\n}\n.ce-toolbar__plus.clicked{\n    -webkit-transform: rotate(45deg);\n            transform: rotate(45deg);\n}\n/**\n* Tools list\n*/\n.ce-toolbar__tools{\n    position: absolute;\n    top: 0;\n    left: 0;\n\n    /* hidden by default */\n    opacity: 0;\n    visibility: hidden;\n    -webkit-transform: translateX(-100px);\n            transform: translateX(-100px);\n    transition: all 150ms cubic-bezier(0.600, -0.280, 0.735, 0.045);\n}\n.ce-toolbar__tools.opened{\n    opacity: 1;\n    visibility: visible;\n    -webkit-transform: none;\n            transform: none;\n}\n.ce-toolbar__plus,\n.ce-toolbar__tools li {\n    display: inline-block;\n    width: 32px;\n    height: 32px;\n    background-color: #eff2f5;\n    /*box-shadow: 0 0 0 1px #6d748c;*/\n    margin-right: 17px;\n    border-radius: 16px;\n    text-align: center;\n    vertical-align: top;\n    cursor: pointer;\n    font-size: 14px;\n\n    will-change: transform, margin-right;\n    transition: margin 200ms ease-out, -webkit-transform 200ms cubic-bezier(0.600, -0.280, 0.735, 0.045);\n    transition: transform 200ms cubic-bezier(0.600, -0.280, 0.735, 0.045), margin 200ms ease-out;\n    transition: transform 200ms cubic-bezier(0.600, -0.280, 0.735, 0.045), margin 200ms ease-out, -webkit-transform 200ms cubic-bezier(0.600, -0.280, 0.735, 0.045);\n}\n.ce-toolbar__tools li i{\n    line-height: 32px;\n}\n.ce-toolbar__tools li:hover,\n.ce-toolbar__tools .selected{\n    background: #383b5d;\n    box-shadow: none;\n    color: #fff;\n}\n/* animation for tools opening */\n.ce-toolbar__tools li{\n    -webkit-transform: rotate(-180deg) scale(.7);\n            transform: rotate(-180deg) scale(.7);\n    margin-right: -15px;\n}\n.ce-toolbar__tools.opened li{\n    -webkit-transform: none;\n            transform: none;\n    margin-right: 17px;\n}\n/**\n* Toolbar right zone with SETTINGS and DELETE\n*/\n.ce-toolbar__actions{\n    position: absolute;\n    right: 15px;\n    border-radius: 2px;\n    padding: 6px 5px;\n    line-height: 1em;\n    font-size: 14px;\n    background: #fff;\n}\n/**\n* Settings button\n*/\n.ce-toolbar__settings-btn{\n    margin-right: .3em;\n    cursor: pointer;\n}\n.ce-toolbar__settings-btn,\n.ce-toolbar__remove-btn{\n    color: #5e6475;\n}\n.ce-toolbar__settings-btn:hover,\n.ce-toolbar__remove-btn:hover{\n    color: #272b35\n}\n/**\n* Settigns panel\n*/\n.ce-settings,\n.ce-toolbar__remove-confirmation{\n    position: absolute;\n    right: 0;\n    margin-top: 10px;\n    min-width: 200px;\n    background: #FFFFFF;\n    border: 1px solid #e7e9f1;\n    box-shadow: 0px 2px 5px 0px rgba(16, 23, 49, 0.05);\n    border-radius: 3px;\n    white-space: nowrap;\n    color: #2b2d31;\n    font-size: 13.4px;\n\n    /* hidden by default */\n    display: none;\n}\n/**\n* Settings and remove-confirmation corner\n*/\n.ce-settings:before,\n.ce-toolbar__remove-confirmation:before,\n.ce-settings:after,\n.ce-toolbar__remove-confirmation:after{\n    content: \"\";\n    position: absolute;\n    top: -14px;\n    right: 10px;\n    border-style: solid;\n}\n.ce-settings:before,\n.ce-toolbar__remove-confirmation:before {\n    margin: -2px -1px 0;\n    border-width: 8px;\n    border-color: transparent transparent #e7e9f1 transparent;\n}\n.ce-settings:after,\n.ce-toolbar__remove-confirmation:after {\n    border-width: 7px;\n    border-color: transparent transparent #fff transparent;\n}\n.ce-settings:before,\n.ce-settings:after{\n    right: 31px;\n}\n.ce-toolbar__remove-confirmation:before,\n.ce-toolbar__remove-confirmation:after{\n    right: 10px;\n}\n.ce-toolbar__remove-confirmation{\n    right: -3px;\n}\n/**\n* Plugins settings style helper\n*/\n.cdx-plugin-settings--horisontal {\n    display: -moz-flex;\n    display: -ms-flex;\n    display: -o-flex;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n}\n.cdx-plugin-settings--horisontal .cdx-plugin-settings__item {\n    -webkit-box-flex: 1;\n        -ms-flex: 1 0 auto;\n            flex: 1 0 auto;\n    text-align: center;\n}\n.ce-settings__item,\n.ce-toolbar__remove-confirm,\n.ce-toolbar__remove-cancel,\n.cdx-plugin-settings__item {\n    padding: 15px;\n    cursor: pointer;\n    line-height: 1em;\n}\n.ce-settings__item:hover,\n.ce-toolbar__remove-cancel:hover,\n.cdx-plugin-settings__item:hover {\n    background: #edf0f5;\n}\n.ce-settings.opened,\n.ce-toolbar__remove-confirmation.opened{\n    display: block;\n}\n.ce-settings_plugin{\n    border-bottom: 1px solid #e7e9f1;\n}\n.ce-settings_plugin:empty{\n    display: none;\n}\n.ce-settings__item:not(:last-of-type) {\n    border-bottom: 1px solid #e7e9f1;\n}\n.ce-settings__item i,\n.cdx-plugin-settings__item i {\n    min-width: 16px;\n    margin-right: 1.3em;\n}\n.ce-settings__item i::before {\n    min-width: 16px;\n    margin: 0;\n}\n/**\n * Trash button\n */\n.ce-toolbar__remove-btn {\n    cursor: pointer;\n}\n.ce-toolbar__remove-confirm{\n    color: #ea5c5c;\n}\n.ce-toolbar__remove-confirm:hover{\n    background: #e23d3d;\n    color: #fff;\n}\n/** Anchor input */\n.ce-settings__anchor-wrapper:hover {\n    background: none;\n}\n.ce-settings__anchor-input {\n    max-width: 100%;\n    border: 0;\n    outline: none;\n    padding: 14px 0;\n    margin: -15px 0;\n    font-size: inherit;\n    color: #000;\n    height: 1em;\n}\n.ce-settings__anchor-input::-webkit-input-placeholder {color: rgba(112, 118, 132, 0.5);}\n.ce-settings__anchor-input::-moz-placeholder {color: rgba(112, 118, 132, 0.5);}\n.ce-settings__anchor-input:-moz-placeholder {color: rgba(112, 118, 132, 0.5);}\n.ce-settings__anchor-input:-ms-input-placeholder {color: rgba(112, 118, 132, 0.5);}\n.ce-settings__anchor-hash {\n    display: inline-block;\n    background-size: contain;\n    height: 11px;\n    width: 10px;\n    vertical-align: middle;\n}\n/**\n* Overlayed inline toolbar\n*/\n.ce-toolbar-inline{\n    position: absolute;\n    left: 0;\n    top: 0;\n    z-index: 3;\n    background: #242533;\n    border-radius: 3px;\n    padding: 0 5px;\n    margin-top: -.5em;\n\n    will-change: transform;\n    transition: -webkit-transform .2s cubic-bezier(0.600, -0.280, 0.735, 0.045);\n    transition: transform .2s cubic-bezier(0.600, -0.280, 0.735, 0.045);\n    transition: transform .2s cubic-bezier(0.600, -0.280, 0.735, 0.045), -webkit-transform .2s cubic-bezier(0.600, -0.280, 0.735, 0.045);\n\n    color: #fff;\n\n    /* hidden by default */\n    display: none;\n}\n.ce-toolbar-inline.opened {\n    display: block;\n}\n.ce-toolbar-inline__buttons{\n}\n.ce-toolbar-inline__buttons button{\n    background: none;\n    border: 0;\n    margin: 0 !important;\n    height: auto !important;\n    padding: 13px 9px;\n    line-height: 1em;\n    color: inherit;\n    font-size: 12px;\n    cursor: pointer;\n}\n.ce-toolbar-inline__buttons button:hover{\n    background: #171827;\n    color: #428bff;\n}\n.ce-toolbar-inline__actions{\n    position: absolute;\n    left: 0;\n    top: 0;\n    bottom: 0;\n    right: 0;\n    border-radius: 3px;\n    background: #242533;\n    display: none;\n}\n.ce-toolbar-inline__actions.opened{\n        display: block;\n    }\n.ce-toolbar-inline__actions input{\n        background: transparent !important;\n        border : 0 !important;\n        box-sizing: border-box !important;\n        padding: 12px;\n        font-size: 13px;\n        width: 100%;\n        color: #fff;\n        outline: none;\n    }\n.ce-toolbar-inline__actions input::-moz-placeholder{ color: #afb4c3  !important;}\n.ce-toolbar-inline__actions input::-webkit-input-placeholder{ color: #afb4c3 !important;}\n/**\n* Base blocks\n*/\n.ce-block {\n    margin: 0 5px;\n    border-radius: 3px;\n}\n.ce-block--focused {\n    background: #f9f9fb;\n}\n.ce-block--feed-mode {\n    position: relative;\n}\n.ce-block--feed-mode:before {\n    content: '\\E81B';\n    font-family: \"codex_editor\";\n    display: inline-block;\n    position: absolute;\n    left: 17px;\n    top: 13px;\n    font-size: 16px;\n    color: #7d6060;\n}\n.ce-block--anchor {\n    position: relative;\n}\n.ce-block--anchor::after {\n    display: inline-block;\n    content: \"#\" attr(data-anchor);\n    color: #868896;\n    position: absolute;\n    left: 17px;\n    top: 13px;\n    max-width: 100px;\n    word-wrap: break-word;\n    font-size: 12px;\n    line-height: 1.4em;\n}\n/**\n* Block content holder\n*/\n.ce-block__content{\n    max-width: 600px;\n    margin: 0 auto;\n    padding: 1px;\n}\n.ce-block--stretched{\n    max-width: none;\n    padding: 0;\n}\n.cdx-unavailable-block {\n    display: block;\n    margin: 10px 0;\n    padding: 80px;\n    background-color: #fff7f7;\n    text-align: center;\n    border-radius: 3px;\n    color: #ce5f5f;\n}\n/**\n* Typographycs\n*/\n.ce-redactor p{\n    margin: 0;\n}\n/**\n* Loading bar class\n*/\n.ce-redactor__loader {\n    background-image: repeating-linear-gradient(-45deg, transparent, transparent 4px, #f5f9ff 4px, #eaedef 8px) !important;\n    background-size: 56px 56px;\n    -webkit-animation: loading-bar 600ms infinite linear;\n            animation: loading-bar 600ms infinite linear;\n}\n@-webkit-keyframes loading-bar {\n    100% { background-position: -56% 0 }\n}\n@keyframes loading-bar {\n    100% { background-position: -56% 0 }\n}\n/**\n* Notifications\n*/\n.cdx-notifications-block {\n    position: fixed;\n    bottom: 0;\n    left: 0;\n    padding: 15px;\n}\n.cdx-notification__notification-appending div {\n    -webkit-animation: notification 100ms infinite ease-in;\n            animation: notification 100ms infinite ease-in;\n}\n@-webkit-keyframes notification {\n\n    0% { -webkit-transform: translateY(20px); transform: translateY(20px); }\n    100% { -webkit-transform: translateY(0px); transform: translateY(0px);  }\n\n}\n@keyframes notification {\n\n    0% { -webkit-transform: translateY(20px); transform: translateY(20px); }\n    100% { -webkit-transform: translateY(0px); transform: translateY(0px);  }\n\n}\n.cdx-notification {\n    width: 250px;\n    margin-top: 15px;\n    padding: 15px;\n    background: #fff;\n    border: 1px solid #e7e9f1;\n    box-shadow: 0px 2px 5px 0px rgba(16, 23, 49, 0.05);\n    border-radius: 3px;\n    font-size: 14px;\n}\n.cdx-notification__message {\n    margin-bottom: 15px;\n}\n.cdx-notification__ok-btn,\n.cdx-notification__cancel-btn {\n    padding: 4px 7px;\n    cursor: pointer;\n    background: #4584d8;\n    color: #fff;\n    min-width: 50px;\n    display: inline-block;\n    text-align: center;\n    border-radius: 2px;\n}\n.cdx-notification__cancel-btn {\n    margin-left: 10px;\n    background: #dae0e8;\n    color: inherit;\n}\n.cdx-notification__cancel-btn {\n    background: #cad5e2;\n}\n.cdx-notification__ok-btn:hover {\n    background: #3d77c3;\n}\n.cdx-notification__input {\n    display: block;\n    width: 100%;\n    margin-bottom: 15px;\n    border: none;\n    outline: none;\n    padding: 2px 0;\n    font-size: inherit;\n    border-bottom: 2px solid #d1d3da;\n}\n.cdx-notification-error {\n    border-left: 4px solid rgb(255, 112, 112);\n}\n.cdx-notification-warn {\n    border-left: 4px solid rgb(79, 146, 247);\n}\n/**\n* Mobile viewport styles\n* =================================\n*/\n@media all and (max-width: 1000px){\n\n    .ce-block{\n        margin: 0;\n    }\n    .ce-block__content,\n    .ce-toolbar__content\n    {\n        padding: 0 25px;\n    }\n\n    .ce-toolbar {\n        margin-top: 5px;\n    }\n\n    .ce-toolbar__actions {\n        right: 0;\n        top: -10px;\n        font-size: 14px;\n        line-height: 18px;\n    }\n\n    .ce-toolbar__settings-btn {\n        display: block;\n        margin-bottom: 3px;\n    }\n\n    .ce-toolbar__plus {\n        margin-left: -25px;\n    }\n\n    .ce-toolbar__plus,\n    .ce-toolbar__tools li {\n        width: 22px;\n        height: 22px;\n    }\n\n    .ce-toolbar__tools li i {\n        line-height: 22px;\n    }\n\n    .ce-toolbar__tools {\n        left: 30px;\n        font-size: 13px;\n    }\n\n    .ce-block--anchor::after {\n        display: none;\n    }\n\n}", ""]);

// exports


/***/ }),
/* 27 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ })
/******/ ]);
//# sourceMappingURL=codex-editor.js.map