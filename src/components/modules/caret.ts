/**
 * @class Caret
 * @classdesc Contains methods for working Caret
 *
 * Uses Range methods to manipulate with caret
 *
 * @module Caret
 *
 * @version 2.0.0
 */

import Selection from '../selection';
import Module from '../__module';
import Block from '../block';
import $ from '../dom';
import _ from '../utils';

/**
 * @typedef {Caret} Caret
 */
export default class Caret extends Module {

  /**
   * Allowed caret positions in input
   *
   * @static
   * @returns {{START: string, END: string, DEFAULT: string}}
   */
  public static get positions(): {START: string, END: string, DEFAULT: string} {
    return {
      START: 'start',
      END: 'end',
      DEFAULT: 'default',
    };
  }

  /**
   * Elements styles that can be useful for Caret Module
   */
  private static get CSS(): {shadowCaret: string} {
    return {
      shadowCaret: 'cdx-shadow-caret',
    };
  }

  /**
   * Get's deepest first node and checks if offset is zero
   * @return {boolean}
   */
  public get isAtStart(): boolean {
    /**
     * Don't handle ranges
     */
    if (!Selection.isCollapsed) {
      return false;
    }

    const selection = Selection.get(),
      anchorNode = selection.anchorNode,
      firstNode = $.getDeepestNode(this.Editor.BlockManager.currentBlock.currentInput);

    /** In case lastNode is native input */
    if ($.isNativeInput(firstNode)) {
      return (firstNode as HTMLInputElement).selectionEnd === 0;
    }

    /**
     * Workaround case when caret in the text like " |Hello!"
     * selection.anchorOffset is 1, but real caret visible position is 0
     * @type {number}
     */
    let firstLetterPosition = anchorNode.textContent.search(/\S/);

    if (firstLetterPosition === -1) { // empty text
      firstLetterPosition = 0;
    }

    /**
     * In case of
     * <div contenteditable>
     *     <p><b></b></p>   <-- first (and deepest) node is <b></b>
     *     |adaddad         <-- anchor node
     * </div>
     */
    if ($.isEmpty(firstNode)) {
      const leftSiblings = this.getHigherLevelSiblings(anchorNode as HTMLElement, 'left'),
        nothingAtLeft = leftSiblings.every( (node) => $.isEmpty(node) );

      if (nothingAtLeft && selection.anchorOffset === firstLetterPosition) {
        return true;
      }
    }

    /**
     * We use <= comparison for case:
     * "| Hello"  <--- selection.anchorOffset is 0, but firstLetterPosition is 1
     */
    return firstNode === null || anchorNode === firstNode && selection.anchorOffset <= firstLetterPosition;
  }

  /**
   * Get's deepest last node and checks if offset is last node text length
   * @return {boolean}
   */
  public get isAtEnd(): boolean {
    /**
     * Don't handle ranges
     */
    if (!Selection.isCollapsed) {
      return false;
    }

    const selection = Selection.get(),
      anchorNode = selection.anchorNode,
      lastNode = $.getDeepestNode(this.Editor.BlockManager.currentBlock.currentInput, true);

    /** In case lastNode is native input */
    if ($.isNativeInput(lastNode)) {
      return (lastNode as HTMLInputElement).selectionEnd === (lastNode as HTMLInputElement).value.length;
    }

    /**
     * In case of
     * <div contenteditable>
     *     adaddad|         <-- anchor node
     *     <p><b></b></p>   <-- first (and deepest) node is <b></b>
     * </div>
     */
    if ($.isEmpty(lastNode)) {
      const leftSiblings = this.getHigherLevelSiblings(anchorNode as HTMLElement, 'right'),
        nothingAtRight = leftSiblings.every( (node) => $.isEmpty(node) );

      if (nothingAtRight && selection.anchorOffset === anchorNode.textContent.length) {
        return true;
      }
    }

    /**
     * Workaround case:
     * hello |     <--- anchorOffset will be 5, but textContent.length will be 6.
     * Why not regular .trim():
     *  in case of ' hello |' trim() will also remove space at the beginning, so length will be lower than anchorOffset
     */
    const rightTrimmedText = lastNode.textContent.replace(/\s+$/, '');

    /**
     * We use >= comparison for case:
     * "Hello |"  <--- selection.anchorOffset is 7, but rightTrimmedText is 6
     */
    return anchorNode === lastNode && selection.anchorOffset >= rightTrimmedText.length;
  }

  /**
   * Method gets Block instance and puts caret to the text node with offset
   * There two ways that method applies caret position:
   *   - first found text node: sets at the beginning, but you can pass an offset
   *   - last found text node: sets at the end of the node. Also, you can customize the behaviour
   *
   * @param {Block} block - Block class
   * @param {String} position - position where to set caret.
   *                            If default - leave default behaviour and apply offset if it's passed
   * @param {Number} offset - caret offset regarding to the text node
   */
  public setToBlock(block: Block, position: string = Caret.positions.DEFAULT, offset: number = 0): void {
    const {BlockManager} = this.Editor;
    let element;

    switch (position) {
      case Caret.positions.START:
        element = block.firstInput;
        break;
      case Caret.positions.END:
        element = block.lastInput;
        break;
      default:
        element = block.currentInput;
    }

    if (!element) {
      return;
    }

    const nodeToSet = $.getDeepestNode(element, position === Caret.positions.END);
    const contentLength = $.getContentLength(nodeToSet);

    switch (true) {
      case position === Caret.positions.START:
        offset = 0;
        break;
      case position === Caret.positions.END:
      case offset > contentLength:
        offset = contentLength;
        break;
    }

    /**
     * @todo try to fix via Promises or use querySelectorAll to not to use timeout
     */
    _.delay( () => {
      this.set(nodeToSet as HTMLElement, offset);
    }, 20)();

    BlockManager.setCurrentBlockByChildNode(block.holder);
    BlockManager.currentBlock.currentInput = element;
  }

  /**
   * Set caret to the current input of current Block.
   *
   * @param {HTMLElement} input - input where caret should be set
   * @param {String} position - position of the caret.
   *                            If default - leave default behaviour and apply offset if it's passed
   * @param {number} offset - caret offset regarding to the text node
   */
  public setToInput(input: HTMLElement, position: string = Caret.positions.DEFAULT, offset: number = 0): void {
    const {currentBlock} = this.Editor.BlockManager;
    const nodeToSet = $.getDeepestNode(input);

    switch (position) {
      case Caret.positions.START:
        this.set(nodeToSet as HTMLElement, 0);
        break;

      case Caret.positions.END:
        const contentLength = $.getContentLength(nodeToSet);

        this.set(nodeToSet as HTMLElement, contentLength);
        break;

      default:
        if (offset) {
          this.set(nodeToSet as HTMLElement, offset);
        }
    }

    currentBlock.currentInput = input;
  }

  /**
   * Creates Document Range and sets caret to the element with offset
   * @param {HTMLElement} element - target node.
   * @param {Number} offset - offset
   */
  public set(element: HTMLElement, offset: number = 0): void {
    const range = document.createRange(),
      selection = Selection.get();

    /** if found deepest node is native input */
    if ($.isNativeInput(element)) {
      element.focus();
      (element as HTMLInputElement).selectionStart = (element as HTMLInputElement).selectionEnd = offset;
      return;
    }

    range.setStart(element, offset);
    range.setEnd(element, offset);

    selection.removeAllRanges();
    selection.addRange(range);

    /** If new cursor position is not visible, scroll to it */
    const {top, bottom} = range.getBoundingClientRect();
    const {innerHeight} = window;

    if (top < 0) { window.scrollBy(0, top); }
    if (bottom > innerHeight) { window.scrollBy(0, bottom - innerHeight); }
  }
  /**
   * Set Caret to the last Block
   * If last block is not empty, append another empty block
   */
  public setToTheLastBlock(): void {
    const lastBlock = this.Editor.BlockManager.lastBlock;

    if (!lastBlock) {
      return;
    }

    /**
     * If last block is empty and it is an initialBlock, set to that.
     * Otherwise, append new empty block and set to that
     */
    if (lastBlock.isEmpty) {
      this.setToBlock(lastBlock);
    } else {
      const newBlock = this.Editor.BlockManager.insertAtEnd();

      this.setToBlock(newBlock);
    }
  }

  /**
   * Extract content fragment of current Block from Caret position to the end of the Block
   */
  public extractFragmentFromCaretPosition(): void|DocumentFragment {
    const selection = Selection.get();

    if (selection.rangeCount) {
      const selectRange = selection.getRangeAt(0);
      const currentBlockInput = this.Editor.BlockManager.currentBlock.currentInput;

      selectRange.deleteContents();

      if (currentBlockInput) {
        const range = selectRange.cloneRange();

        range.selectNodeContents(currentBlockInput);
        range.setStart(selectRange.endContainer, selectRange.endOffset);
        return range.extractContents();
      }
    }
  }

  /**
   * Set's caret to the next Block or Tool`s input
   * Before moving caret, we should check if caret position is at the end of Plugins node
   * Using {@link Dom#getDeepestNode} to get a last node and match with current selection
   *
   * @param {Boolean} force - force navigation even if caret is not at the end
   *
   * @return {Boolean}
   */
  public navigateNext(force: boolean = false): boolean {
    const {currentBlock, nextContentfulBlock} = this.Editor.BlockManager;
    const {nextInput} = currentBlock;

    if (!nextContentfulBlock && !nextInput) {
      return false;
    }

    if (force) {
      this.setToBlock(nextContentfulBlock, Caret.positions.START);
      return true;
    }

    if (this.isAtEnd) {
      /** If next Tool`s input exists, focus on it. Otherwise set caret to the next Block */
      if (!nextInput) {
        this.setToBlock(nextContentfulBlock, Caret.positions.START);
      } else {
        this.setToInput(nextInput, Caret.positions.START);
      }

      return true;
    }

    return false;
  }

  /**
   * Set's caret to the previous Tool`s input or Block
   * Before moving caret, we should check if caret position is start of the Plugins node
   * Using {@link Dom#getDeepestNode} to get a last node and match with current selection
   *
   * @param {Boolean} force - force navigation even if caret is not at the start
   *
   * @return {Boolean}
   */
  public navigatePrevious(force: boolean = false): boolean {
    const {currentBlock, previousContentfulBlock} = this.Editor.BlockManager;

    if (!currentBlock) {
      return false;
    }

    const {previousInput} = currentBlock;

    if (!previousContentfulBlock && !previousInput) {
      return false;
    }

    if (force) {
      this.setToBlock( previousContentfulBlock, Caret.positions.END );
    }

    if (this.isAtStart) {
      /** If previous Tool`s input exists, focus on it. Otherwise set caret to the previous Block */
      if (!previousInput) {
        this.setToBlock( previousContentfulBlock, Caret.positions.END );
      } else {
        this.setToInput(previousInput, Caret.positions.END);
      }
      return true;
    }

    return false;
  }

  /**
   * Inserts shadow element after passed element where caret can be placed
   * @param {Node} element
   */
  public createShadow(element): void {
    const shadowCaret = document.createElement('span');

    shadowCaret.classList.add(Caret.CSS.shadowCaret);
    element.insertAdjacentElement('beforeEnd', shadowCaret);
  }

  /**
   * Restores caret position
   * @param {HTMLElement} element
   */
  public restoreCaret(element: HTMLElement): void {
    const shadowCaret = element.querySelector(`.${Caret.CSS.shadowCaret}`);

    if (!shadowCaret) {
      return;
    }

    /**
     * After we set the caret to the required place
     * we need to clear shadow caret
     *
     * - make new range
     * - select shadowed span
     * - use extractContent to remove it from DOM
     */
    const sel = new Selection();

    sel.expandToTag(shadowCaret as HTMLElement);

    setTimeout(() => {
      const newRange = document.createRange();

      newRange.selectNode(shadowCaret);
      newRange.extractContents();
    }, 50);
  }

  /**
   * Get all first-level (first child of [contenteditabel]) siblings from passed node
   * Then you can check it for emptiness
   *
   * @example
   * <div contenteditable>
   *     <p></p>                            |
   *     <p></p>                            | left first-level siblings
   *     <p></p>                            |
   *     <blockquote><a><b>adaddad</b><a><blockquote>       <-- passed node for example <b>
   *     <p></p>                            |
   *     <p></p>                            | right first-level siblings
   *     <p></p>                            |
   * </div>
   *
   * @return {Element[]}
   */
  private getHigherLevelSiblings(from: HTMLElement, direction?: string): HTMLElement[] {
    let current = from;
    const siblings = [];

    /**
     * Find passed node's firs-level parent (in example - blockquote)
     */
    while (current.parentNode && (current.parentNode as HTMLElement).contentEditable !== 'true') {
      current = current.parentNode as HTMLElement;
    }

    const sibling = direction === 'left' ? 'previousSibling' : 'nextSibling';

    /**
     * Find all left/right siblings
     */
    while (current[sibling]) {
      current = current[sibling] as HTMLElement;
      siblings.push(current);
    }

    return siblings;
  }
}
