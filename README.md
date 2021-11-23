# Tiny Undo

Manage the undo/redo state programmatically for plain-text input element.

## What does it solved?

- Programming-friendly undo/redo handler (just like VSCode's behavior);
- Get/set the undo/redo state, and subscribe its changes;
- Run undo/redo programmatically;

## How to use it?

1. Install package: `yarn add tiny-undo` or `npm install tiny-undo`
2. A simple example in pure html&javascript:

   ```javascript
   // 1. Get a textarea element instance
   const textareaEl = document.querySelector("textarea");
   // 2. Create a TinyUndo instance with the element
   const tinyUndo = new TinyUndo(textareaEl);
   // 3. done 🎉
   ```

3. And use it in React:

   ```typescript
   // ...
   const editorRef = useRef<HTMLTextAreaElement>(null);

   useEffect(() => {
     const tinyUndo = new TinyUndo(editorRef.current!);

     return () => {
       tinyUndo.destroy();
     };
   }, []);
   // ...
   ```

4. (Optional) With initial configuration:

   ```typescript
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

   const config: TinyUndoConfig = {
     initialValue: "",
     interval: 500,
   };
   const tinyUndo = new TinyUndo(textareaEl, config);
   // ...
   ```

## More Advanced Examples

- **Historical undo/redo editor in React**

  Please imagine that you can undo/redo with the historical data **even if the browser has refreshed or restarted**, and just need to save the tinyUndo data in the localstorage that can be done.

  **[👀 Preview](https://memos.justsven.top)** / [⌨️ Source code](https://github.com/boojack/insmemo-web/commit/82d6a8bb880fd9f0e333c871f8c63ac6b19eff7b)

- **An undo/redo state visualization editor in Vue**

  Just a simple example in vue to show how tiny-undo works.

  **[👀 Preview](https://boojack.github.io/tiny-undo-editor/)** / [⌨️ Source code](https://github.com/boojack/tiny-undo-editor)

## References

- [kommitters/editorjs-undo](https://github.com/kommitters/editorjs-undo)
- [inputType values of InputEvent](https://rawgit.com/w3c/input-events/v1/index.html#interface-InputEvent-Attributes)
