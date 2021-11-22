/**
 * Initalize the TinyUndo config
 * @param initialValue: The initial value of the editor
 * @param interval: The interval in milliseconds to merge actions
 * @param maxSize: The maximum number of actions to keep
 * @param initialActions: The initial actions to add to the editor
 * @param initialIndex: The initial index of the initial actions
 */
export interface TinyUndoConfig {
  initialValue: string;
  interval: number;
  maxSize?: number;
  initialActions?: InputAction[];
  initialIndex?: number;
}

/**
 * Record of an input action
 * @param type: The type of action: insertText...(refer: https://rawgit.com/w3c/input-events/v1/index.html#interface-InputEvent-Attributes)
 * @param value: The value of inputer element
 * @param timestamp: The timestamp of the action and can be used to the uuid
 * @param selectionStart: The cursor position before the action started
 * @param selectionEnd: The cursor position after the action ended
 */
export interface InputAction {
  type: string;
  value: string;
  timestamp: number;
  selectionStart: number;
  selectionEnd: number;
}

type ActionCallback = (actions: InputAction[], currentIndex: number) => void;

// Get the initial default action
const getInitialAction = () => {
  return {
    type: "initialText",
    value: "",
    timestamp: Date.now(),
    selectionStart: 0,
    selectionEnd: 0,
  };
};

const defaultConfig: TinyUndoConfig = {
  initialValue: "",
  interval: 300,
};

/**
 * Manage the undo/redo state programmatically for plain-text input element.
 */
export default class TinyUndo {
  private element: HTMLTextAreaElement | HTMLInputElement;
  private config: TinyUndoConfig;
  private actions: InputAction[];
  private currentIndex: number;

  private listeners: ActionCallback[] = [];

  /**
   * Creates an instance of TinyUndo.
   * @param element The binded textarea or input element
   * @param config The configuration object
   */
  constructor(element: HTMLTextAreaElement | HTMLInputElement, config: Partial<TinyUndoConfig> = defaultConfig) {
    this.element = element;
    this.config = {
      ...defaultConfig,
      ...config,
    };

    if (this.config.initialActions && this.config.initialActions.length > 0) {
      this.actions = this.config.initialActions;

      if (this.config.initialIndex !== undefined && this.config.initialIndex < this.actions.length) {
        this.currentIndex = this.config.initialIndex;
      } else {
        this.currentIndex = this.actions.length - 1;
      }
    } else {
      this.actions = [getInitialAction()];
      this.currentIndex = 0;

      if (this.config.initialValue !== "") {
        this.actions.push({
          type: "insertText",
          value: this.config.initialValue,
          timestamp: Date.now(),
          selectionStart: 0,
          selectionEnd: this.config.initialValue.length,
        });
        this.currentIndex++;
      }
    }

    this.element.value = this.actions[this.currentIndex].value;
    this.addEventListeners();
  }

  /**
   * Run undo programmatically
   */
  public runUndo = () => {
    const cursorPosition = this.actions[this.currentIndex].selectionStart;

    if (this.currentIndex > 0) {
      this.currentIndex--;
    }

    this.element.value = this.actions[this.currentIndex].value;
    this.element.setSelectionRange(cursorPosition, cursorPosition);
    this.dispatchChange();
  };

  /**
   * Run redo programmatically
   */
  public runRedo = () => {
    if (this.currentIndex < this.actions.length - 1) {
      this.currentIndex++;
    }

    const cursorPosition = this.actions[this.currentIndex].selectionEnd;

    this.element.value = this.actions[this.currentIndex].value;
    this.element.setSelectionRange(cursorPosition, cursorPosition);
    this.dispatchChange();
  };

  /**
   * Get the actions
   * @returns The input action data array
   */
  public getActions = () => {
    return this.actions;
  };

  /**
   * set state
   */
  public setState = (actions: InputAction[], index: number) => {
    this.actions = [...actions];
    this.currentIndex = index < this.actions.length ? index : this.actions.length - 1;
    this.dispatchChange();
  };

  /**
   * Reset state
   */
  public resetState = () => {
    this.actions = [getInitialAction()];
    this.currentIndex = 0;
    this.dispatchChange();
  };

  /**
   * Destory all event listeners: Keydown and Input
   */
  public destroy = () => {
    this.rmEventListeners();
  };

  /**
   * Subscribe to the input/undo/redo actions
   * @param callback The callback function
   */
  public subscribe = (callback: ActionCallback) => {
    this.listeners.push(callback);
  };

  /**
   * Handle the keydown event
   * Prevent the default action of the undo/redo event
   * Keybindings:
   * - ctrl/cmd+z: undo
   * - ctrl/cmd+shift+z, ctrl/cmd+y: redo
   */
  private handleElementKeydown = (event: Event) => {
    const keyboardEvent = event as KeyboardEvent;

    if (keyboardEvent.key === "z" && !keyboardEvent.shiftKey && (keyboardEvent.metaKey || keyboardEvent.ctrlKey)) {
      event.preventDefault();
      this.runUndo();
    } else if (
      (keyboardEvent.key === "z" && keyboardEvent.shiftKey && (keyboardEvent.metaKey || keyboardEvent.ctrlKey)) ||
      (keyboardEvent.key === "y" && (keyboardEvent.metaKey || keyboardEvent.ctrlKey))
    ) {
      event.preventDefault();
      this.runRedo();
    }
  };

  /**
   * Handle the input event
   */
  private handleElementInput = (event: Event) => {
    const inputEvent = event as InputEvent;
    const lastAction = this.actions[this.currentIndex];

    this.pushNewAction({
      type: inputEvent.inputType,
      value: this.element.value,
      timestamp: Date.now(),
      selectionStart: this.element.selectionEnd - (this.element.value.length - lastAction.value.length),
      selectionEnd: this.element.selectionEnd,
    });
  };

  private addEventListeners = () => {
    this.element.addEventListener("keydown", this.handleElementKeydown);
    this.element.addEventListener("input", this.handleElementInput);
  };

  private rmEventListeners = () => {
    this.element.removeEventListener("keydown", this.handleElementKeydown);
    this.element.removeEventListener("input", this.handleElementInput);
  };

  private pushNewAction = (action: InputAction) => {
    const lastAction = this.actions[this.currentIndex];

    if (lastAction && lastAction.type === action.type && action.timestamp - lastAction.timestamp < this.config.interval) {
      this.actions[this.currentIndex] = {
        ...lastAction,
        value: action.value,
        selectionEnd: action.selectionEnd,
        timestamp: action.timestamp,
      };
    } else {
      if (this.config.maxSize && this.currentIndex >= this.config.maxSize) {
        this.actions.shift();
        this.actions[0] = getInitialAction();
      } else {
        this.currentIndex++;
      }
      this.actions[this.currentIndex] = action;
      this.actions = this.actions.slice(0, this.currentIndex + 1);
    }
    this.dispatchChange();
  };

  private dispatchChange = () => {
    for (const cb of this.listeners) {
      cb([...this.actions], this.currentIndex);
    }
  };
}
