# Tiny Undo

Manage the undo/redo state programmatically for plain-text input element.

## What does it solved?

- Programming-friendly undo/redo handler (just like VSCode's behavior);
- Get/set the undo/redo state, and subscribe its changes;
- Run undo/redo programmatically;

## How to use it?

1. Install package: `npm install tiny-undo` or `yarn add tiny-undo`
2. A simple example:

   ```typescript
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

## More Advanced Examples

- **Historical undo/redo with storage in React**

  Please imagine that you can undo/redo with the historical data **even if the browser has refreshed or restarted**, and just need to save the tinyUndo data in the localstorage that can be done.

  [👀 Preview](https://memos.justsven.top) / [⌨️ Source code](https://github.com/boojack/insmemo-web/commit/82d6a8bb880fd9f0e333c871f8c63ac6b19eff7b)

- **An undo/redo state visualization editor in Vue**
  ![screenshot](https://cdn.jellow.site/Fj4OSuNf62-cBX0clJGYx4-_imnxv2.png)

  [👀 Preview](https://boojack.github.io/tiny-undo-editor/) / [⌨️ Source code](https://github.com/boojack/tiny-undo-editor)

---

## References

- [kommitters/editorjs-undo](https://github.com/kommitters/editorjs-undo)
- [inputType values of InputEvent](https://rawgit.com/w3c/input-events/v1/index.html#interface-InputEvent-Attributes)
