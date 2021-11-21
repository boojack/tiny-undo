import { InputAction, TinyUndoConfig } from "./types";

type ActionCallback = (actions: InputAction[], currentIndex: number) => void;

// Get the initial default action
const getInitialAction = () => {
  return {
    type: "initialText",
    value: "",
    timestamp: 0,
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
  public runUndo() {
    const cursorPosition = this.actions[this.currentIndex].selectionStart;

    if (this.currentIndex > 0) {
      this.currentIndex--;
    }

    this.element.value = this.actions[this.currentIndex].value;
    this.element.setSelectionRange(cursorPosition, cursorPosition);
    for (const cb of this.listeners) {
      cb(this.actions, this.currentIndex);
    }
  }

  /**
   * Run redo programmatically
   */
  public runRedo() {
    if (this.currentIndex < this.actions.length - 1) {
      this.currentIndex++;
    }

    const cursorPosition = this.actions[this.currentIndex].selectionEnd;

    this.element.value = this.actions[this.currentIndex].value;
    this.element.setSelectionRange(cursorPosition, cursorPosition);
    for (const cb of this.listeners) {
      cb(this.actions, this.currentIndex);
    }
  }

  /**
   * Get the actions
   * @returns The input action data array
   */
  public getActions() {
    return this.actions;
  }

  /**
   * Destory all event listeners: Keydown and Input
   */
  public destroy() {
    this.rmEventListeners();
  }

  /**
   * Subscribe to the input/undo/redo actions
   * @param callback The callback function
   */
  public subscribe(callback: ActionCallback) {
    this.listeners.push(callback);
  }

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

  private addEventListeners() {
    this.element.addEventListener("keydown", this.handleElementKeydown);
    this.element.addEventListener("input", this.handleElementInput);
  }

  private rmEventListeners() {
    this.element.removeEventListener("keydown", this.handleElementKeydown);
    this.element.removeEventListener("input", this.handleElementInput);
  }

  private pushNewAction = (action: InputAction) => {
    const lastAction = this.actions[this.currentIndex];

    if (lastAction && lastAction.type === action.type && action.timestamp - lastAction.timestamp < this.config.interval) {
      lastAction.value = action.value;
      lastAction.selectionEnd = action.selectionEnd;
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
    for (const cb of this.listeners) {
      cb(this.actions, this.currentIndex);
    }
  };
}
