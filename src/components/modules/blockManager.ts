/**
 * @class BlockManager
 * @classdesc Manage editor`s blocks storage and appearance
 *
 * @module BlockManager
 *
 * @version 2.0.0
 */
import Block from '../block';
import Module from '../__module';
import $ from '../dom';
import Blocks from '../blocks';
import {BlockToolData, ToolConfig} from '../../../types/tools';

/**
 * @typedef {BlockManager} BlockManager
 * @property {Number} currentBlockIndex - Index of current working block
 * @property {Proxy} _blocks - Proxy for Blocks instance {@link Blocks}
 */
export default class BlockManager extends Module {

  /**
   * returns last Block
   * @return {Block}
   */
  public get lastBlock(): Block {
    return this._blocks[this._blocks.length - 1];
  }

  /**
   * Get current Block instance
   *
   * @return {Block}
   */
  public get currentBlock(): Block {
    return this._blocks[this.currentBlockIndex];
  }

  /**
   * Returns next Block instance
   * @return {Block|null}
   */
  public get nextBlock(): Block {
    const isLastBlock = this.currentBlockIndex === (this._blocks.length - 1);

    if (isLastBlock) {
      return null;
    }

    return this._blocks[this.currentBlockIndex + 1];
  }

  /**
   * Return first Block with inputs after current Block
   *
   * @returns {Block | undefined}
   */
  public get nextContentfulBlock(): Block {
    const nextBlocks = this.blocks.slice(this.currentBlockIndex + 1);

    return nextBlocks.find((block) => !!block.inputs.length);
  }

  /**
   * Return first Block with inputs before current Block
   *
   * @returns {Block | undefined}
   */
  public get previousContentfulBlock(): Block {
    const previousBlocks = this.blocks.slice(0, this.currentBlockIndex).reverse();

    return previousBlocks.find((block) => !!block.inputs.length);
  }

  /**
   * Returns previous Block instance
   * @return {Block|null}
   */
  public get previousBlock(): Block {
    const isFirstBlock = this.currentBlockIndex === 0;

    if (isFirstBlock) {
      return null;
    }

    return this._blocks[this.currentBlockIndex - 1];
  }

  /**
   * Get array of Block instances
   *
   * @returns {Block[]} {@link Blocks#array}
   */
  public get blocks(): Block[] {
    return this._blocks.array;
  }
  public currentBlockIndex: number;

  // tslint:disable-next-line
  private _blocks: Blocks;

  /**
   * @constructor
   * @param {EditorConfig} config
   */
  constructor({config}) {
    super({config});

    /**
     * Proxy for Blocks instance {@link Blocks}
     *
     * @type {Proxy}
     * @private
     */
    this._blocks = null;

    /**
     * Index of current working block
     *
     * @type {number}
     * @private
     */
    this.currentBlockIndex = -1;
  }

  /**
   * Should be called after Editor.UI preparation
   * Define this._blocks property
   *
   * @returns {Promise}
   */
  public async prepare() {
    const blocks = new Blocks(this.Editor.UI.nodes.redactor);

    /**
     * We need to use Proxy to overload set/get [] operator.
     * So we can use array-like syntax to access blocks
     *
     * @example
     * this._blocks[0] = new Block(...);
     *
     * block = this._blocks[0];
     *
     * @todo proxy the enumerate method
     *
     * @type {Proxy}
     * @private
     */
    this._blocks = new Proxy(blocks, {
      set: Blocks.set,
      get: Blocks.get,
    });
  }

  /**
   * Creates Block instance by tool name
   *
   * @param {String} toolName - tools passed in editor config {@link EditorConfig#tools}
   * @param {Object} data - constructor params
   * @param {Object} settings - block settings
   *
   * @return {Block}
   */
  public composeBlock(toolName: string, data: BlockToolData, settings?: ToolConfig): Block {
    const toolInstance = this.Editor.Tools.construct(toolName, data);
    const toolClass = this.Editor.Tools.available[toolName];
    const block = new Block(toolName, toolInstance, toolClass, settings, this.Editor.API.methods);

    this.bindEvents(block);
    /**
     * Apply callback before inserting html
     */
    block.call('appendCallback', {});

    return block;
  }

  /**
   * Insert new block into _blocks
   *
   * @param {String} toolName — plugin name, by default method inserts initial block type
   * @param {Object} data — plugin data
   * @param {Object} settings - default settings
   *
   * @return {Block}
   */
  public insert(
    toolName: string = this.config.initialBlock,
    data: BlockToolData = {},
    settings: ToolConfig = {},
  ): Block {
    // Increment index before construct,
    // because developers can use API/Blocks/getCurrentInputIndex on the render() method
    const newIndex = ++this.currentBlockIndex;
    const block = this.composeBlock(toolName, data, settings);

    this._blocks[newIndex] = block;
    return block;
  }

  /**
   * Always inserts at the end
   * @return {Block}
   */
  public insertAtEnd(): Block {
    /**
     * Define new value for current block index
     */
    this.currentBlockIndex = this.blocks.length - 1;

    /**
     * Insert initial typed block
     */
    return this.insert();
  }

  /**
   * Merge two blocks
   * @param {Block} targetBlock - previous block will be append to this block
   * @param {Block} blockToMerge - block that will be merged with target block
   *
   * @return {Promise} - the sequence that can be continued
   */
  public async mergeBlocks(targetBlock: Block, blockToMerge: Block): Promise<void> {
    const blockToMergeIndex = this._blocks.indexOf(blockToMerge);

    if (blockToMerge.isEmpty) {
      return;
    }

    const blockToMergeData = await blockToMerge.data;

    await targetBlock.mergeWith(blockToMergeData);

    this.removeBlock(blockToMergeIndex);
    this.currentBlockIndex = this._blocks.indexOf(targetBlock);
  }

  /**
   * Remove block with passed index or remove last
   * @param {Number|null} index
   */
  public removeBlock(index?: number): void {
    if (!index) {
      index = this.currentBlockIndex;
    }
    this._blocks.remove(index);

    /**
     * If first Block was removed, insert new Initial Block and set focus on it`s first input
     */
    if (!this.blocks.length) {
      this.currentBlockIndex = -1;
      this.insert();
      this.currentBlock.firstInput.focus();
    }
  }

  /**
   * Split current Block
   * 1. Extract content from Caret position to the Block`s end
   * 2. Insert a new Block below current one with extracted content
   *
   * @return {Block}
   */
  public split(): Block {
    const extractedFragment = this.Editor.Caret.extractFragmentFromCaretPosition();
    const wrapper = $.make('div');

    wrapper.append(extractedFragment);

    /**
     * @todo make object in accordance with Tool
     */
    const data = {
      text: $.isEmpty(wrapper) ? '' : wrapper.innerHTML,
    };

    /**
     * Renew current Block
     * @type {Block}
     */
    return this.insert(this.config.initialBlock, data);
  }

  /**
   * Replace current working block
   *
   * @param {String} toolName — plugin name
   * @param {Object} data — plugin data
   *
   * @return {Block}
   */
  public replace(toolName: string, data: BlockToolData = {}): Block {
    const block = this.composeBlock(toolName, data);

    this._blocks.insert(this.currentBlockIndex, block, true);

    return block;
  }

  /**
   * Returns Block by passed index
   * @param {Number} index
   * @return {Block}
   */
  public getBlockByIndex(index): Block {
    return this._blocks[index];
  }

  /**
   * Get Block instance by html element
   * @param {Node} element
   * @returns {Block}
   */
  public getBlock(element: HTMLElement): Block {
    if (!$.isElement(element)) {
      element = element.parentNode as HTMLElement;
    }

    const nodes = this._blocks.nodes,
      firstLevelBlock = element.closest(`.${Block.CSS.wrapper}`),
      index = nodes.indexOf(firstLevelBlock as HTMLElement);

    if (index >= 0) {
      return this._blocks[index];
    }
  }

  /**
   * Remove selection from all Blocks then highlight only Current Block
   */
  public highlightCurrentNode(): void {
    /**
     * Remove previous selected Block's state
     */
    this.clearHighlightings();

    /**
     * Mark current Block as selected
     * @type {boolean}
     */
    this.currentBlock.selected = true;
  }

  /**
   * Remove selection from all Blocks
   */
  public clearHighlightings(): void {
    this.blocks.forEach( (block) => block.selected = false);
  }

  /**
   * 1) Find first-level Block from passed child Node
   * 2) Mark it as current
   *
   *  @param {Node} childNode - look ahead from this node.
   *  @param {string} caretPosition - position where to set caret
   *  @throws Error  - when passed Node is not included at the Block
   */
  public setCurrentBlockByChildNode(childNode: Node, caretPosition: string = 'default'): void {
    /**
     * If node is Text TextNode
     */
    if (!$.isElement(childNode)) {
      childNode = childNode.parentNode;
    }

    const parentFirstLevelBlock = (childNode as HTMLElement).closest(`.${Block.CSS.wrapper}`);

    if (parentFirstLevelBlock) {
      /**
       * Update current Block's index
       * @type {number}
       */
      this.currentBlockIndex = this._blocks.nodes.indexOf(parentFirstLevelBlock as HTMLElement);

      this.Editor.Caret.setToInput(childNode as HTMLElement, caretPosition);
    } else {
      throw new Error('Can not find a Block from this child Node');
    }
  }

  /**
   * Return block which contents passed node
   *
   * @param {Node} childNode
   * @return {Block}
   */
  public getBlockByChildNode(childNode: Node): Block {
    /**
     * If node is Text TextNode
     */
    if (!$.isElement(childNode)) {
      childNode = childNode.parentNode;
    }

    const firstLevelBlock = (childNode as HTMLElement).closest(`.${Block.CSS.wrapper}`);

    return this.blocks.find((block) => block.holder === firstLevelBlock);
  }

  /**
   * Swap Blocks Position
   * @param {Number} fromIndex
   * @param {Number} toIndex
   */
  public swap(fromIndex, toIndex): void {
    /** Move up current Block */
    this._blocks.swap(fromIndex, toIndex);

    /** Now actual block moved up so that current block index decreased */
    this.currentBlockIndex = toIndex;
  }

  /**
   * Sets current Block Index -1 which means unknown
   * and clear highlightings
   */
  public dropPointer(): void {
    this.currentBlockIndex = -1;
    this.clearHighlightings();
  }

  /**
   * Clears Editor
   * @param {boolean} needAddInitialBlock - 1) in internal calls (for example, in api.blocks.render)
   *                                        we don't need to add empty initial block
   *                                        2) in api.blocks.clear we should add empty block
   */
  public clear(needAddInitialBlock: boolean = false): void {
    this._blocks.removeAll();
    this.dropPointer();

    if (needAddInitialBlock) {
      this.insert(this.config.initialBlock);
    }
  }

  /**
   * Bind Events
   * @param {Object} block
   */
  private bindEvents(block: Block): void {
    this.Editor.Listeners.on(
      block.holder, 'keydown',
      (event) => this.Editor.BlockEvents.keydown(event as KeyboardEvent),
      true,
    );
    this.Editor.Listeners.on(block.holder, 'mouseup', (event) => this.Editor.BlockEvents.mouseUp(event));
    this.Editor.Listeners.on(block.holder, 'keyup', (event) => this.Editor.BlockEvents.keyup(event));
    this.Editor.Listeners.on(
      block.holder,
      'dragover',
      (event) => this.Editor.BlockEvents.dragOver(event as DragEvent),
    );
    this.Editor.Listeners.on(
      block.holder,
      'dragleave',
      (event) => this.Editor.BlockEvents.dragLeave(event as DragEvent),
    );
  }
}
