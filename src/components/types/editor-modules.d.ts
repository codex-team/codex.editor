import UI from '../modules/ui';
import BlockEvents from '../modules/blockEvents';
import Listeners from '../modules/listeners';
import Toolbar from '../modules/toolbar/index';
import InlineToolbar from '../modules/toolbar/inline';
import Toolbox from '../modules/toolbar/toolbox';
import BlockSettings from '../modules/toolbar/blockSettings';
import Events from '../modules/events';
import Shortcuts from '../modules/shortcuts';
import Paste from '../modules/paste';
import DragNDrop from '../modules/dragNDrop';
import ModificationsObserver from '../modules/modificationsObserver';
import Renderer from '../modules/renderer';
import Sanitizer from '../modules/sanitizer';
import Tools from '../modules/tools';
import API from '../modules/api/index';
import Caret from '../modules/caret';
import BlockManager from '../modules/blockManager';
import BlocksAPI from '../modules/api/blocks';
import CaretAPI from '../modules/api/caret';
import EventsAPI from '../modules/api/events';
import ListenersAPI from '../modules/api/listeners';
import SanitizerAPI from '../modules/api/sanitizer';
import ToolbarAPI from '../modules/api/toolbar';
import StylesAPI from '../modules/api/styles';
import SelectionAPI from '../modules/api/selection';
import SaverAPI from '../modules/api/saver';
import Saver from '../modules/saver';

export interface EditorModules {
  UI: UI;
  BlockEvents: BlockEvents;
  Listeners: Listeners;
  Toolbar: Toolbar;
  InlineToolbar: InlineToolbar;
  Toolbox: Toolbox;
  BlockSettings: BlockSettings;
  Events: Events;
  Shortcuts: Shortcuts;
  Paste: Paste;
  DragNDrop: DragNDrop;
  ModificationsObserver: ModificationsObserver;
  Renderer: Renderer;
  Sanitizer: Sanitizer;
  Tools: Tools;
  API: API;
  Caret: Caret;
  Saver: Saver;
  BlockManager: BlockManager;
  BlocksAPI: BlocksAPI;
  CaretAPI: CaretAPI;
  EventsAPI: EventsAPI;
  ListenerAPI: ListenersAPI;
  SanitizerAPI: SanitizerAPI;
  SaverAPI: SaverAPI;
  SelectionAPI: SelectionAPI;
  StylesAPI: StylesAPI;
  ToolbarAPI: ToolbarAPI;
}
