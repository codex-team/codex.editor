declare var Module: any;

import { IBlocksAPI } from '../interfaces/api';
import IInputOutputData from '../interfaces/input-output-data';

/**
 * @class BlocksAPI
 * provides with methods working with Block
 */
export default class BlocksAPI extends Module implements IBlocksAPI {

  /**
   * Save Editor config. API provides passed configuration to the Blocks
   * @param {EditorsConfig} config
   */
  constructor({config}) {
    super({config});
  }

  /**
   * Available methods
   * @return {IBlocksAPI}
   */
  get methods(): IBlocksAPI {
    return {
      clear: () => this.clear(),
      delete: () => this.delete(),
      moveDown: () => this.moveDown(),
      moveUp: () => this.moveUp(),
      render: (data: IInputOutputData) => this.render(data),
    };
  }

  /**
   * Clear Editor's area
   */
  public clear(): void {
    this.Editor.BlockManager.clear(true);
  }

  /**
   * Deletes Block
   * @param blockIndex
   */
  public delete(blockIndex?: number): void {
    this.Editor.BlockManager.removeBlock(blockIndex);
    this.Editor.Toolbar.close();

    /**
     * in case of last block deletion
     * Insert new initial empty block
     */
    if (this.Editor.BlockManager.blocks.length === 0) {
      this.Editor.BlockManager.insert();
    }

    /**
     * In case of deletion first block we need to set caret to the current Block
     */
    if (this.Editor.BlockManager.currentBlockIndex === 0) {
      this.Editor.Caret.setToBlock(this.Editor.BlockManager.currentBlock);
    } else {
      this.Editor.BlockManager.navigatePrevious(true);
    }
  }

  /**
   * Moves block down
   */
  public moveDown(): void {
    console.log('moving down', this.Editor.BlockManager);
  }

  /**
   * Moves block up
   */
  public moveUp(): void {
    console.log('moving up', this.Editor.BlockManager);
  }

  /**
   * Fills Editor with Blocks data
   * @param {IInputOutputData} data — Saved Editor data
   */
  public render(data: IInputOutputData): void {
    this.Editor.BlockManager.clear();
    this.Editor.Renderer.render(data.items);
  }

}
