import ISanitizerConfig from './sanitizer-config';
import IInputOutputData from './input-output-data';
import IToolSettings from './tools/tool-settings';
import ITool from './tools/tool';

/**
 * Editor Instance config
 */
export default interface IEditorConfig {

  /**
   * Element to append Editor
   */
  holderId: string;

  /**
   * Map of used Tools with or without configuration
   */
  tools: {[toolName: string]: ITool|IToolSettings};

  /**
   * This Tool will be added by default
   * Name should be equal a one Tool's key of Editor's Tools
   */
  initialBlock: string;

  /**
   * Blocks list in JSON-format
   */
  data?: IInputOutputData;

  /**
   * First Block placeholder
   */
  placeholder?: string;

  /**
   * Define tags not to be stripped off while pasting
   * @see {@link sanitizer}
   */
  sanitizer?: ISanitizerConfig;

  /**
   * Do not show toolbar
   */
  hideToolbar?: boolean;

  /**
   * Editor initialization callback
   */
  onReady?(): void;

  /**
   * Trigger callback if Content has beed changed
   */
  onChange?(): void;
}
