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
