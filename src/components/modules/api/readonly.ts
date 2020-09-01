import { ReadOnly } from '../../../../types/api';
import ApiModule from './base';

/**
 * @class ReadOnlyAPI
 * @classdesc ReadOnly API
 */
export default class ReadOnlyAPI extends ApiModule {
  /**
   * Available methods
   */
  public get methods(): ReadOnly {
    return {
      toggle: (state): Promise<boolean> => this.toggle(state),
    };
  }

  /**
   * Set or toggle read-only state
   *
   * @param {boolean|undefined} state - set or toggle state
   *
   * @returns {boolean} current value
   */
  public toggle(state?: boolean): Promise<boolean> {
    return this.Editor.ReadOnly.toggle(state);
  }
}
