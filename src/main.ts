import "./style.css";

let draggingKey = "dragging";
let dragged: HTMLElement | null = null;
let display: string = "";

const observeDrop = (domNode: Node) => {
  const targetNode = domNode;

  const config = { childList: true, subtree: true };

  const callback: MutationCallback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        if (dragged) {
          const sel = document.getSelection();
          if (
            sel &&
            sel.rangeCount &&
            !!sel.getRangeAt(0).toString().match(draggingKey)
          ) {
            const range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(dragged);
            range.collapse(true);
            observer.disconnect();
            mutation.target.normalize();
          } else {
            console.log({ mutation });
            const node = mutation.addedNodes[0];
            if (node?.textContent && node?.parentNode) {
              const sel = document.getSelection();
              sel?.removeAllRanges();
              console.log("HERE!");
              const start = node.textContent.indexOf(draggingKey);
              const end = start + draggingKey.length;
              const range = document.createRange();
              range.setStart(node, start);
              range.setEnd(node, end);
              range.deleteContents();
              range.insertNode(dragged);
              range.collapse(true);
              observer.disconnect();
              mutation.target.normalize();
            }
          }
        }
      }
    }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);

  return observer;
};

// const draggables = document.querySelectorAll(".draggable");
const editor = document.querySelector('[contenteditable="true"');
// startObserving(editor);

if (editor) {
  document.addEventListener("dragstart", (e: DragEvent) => {
    const _draggable = e?.target as HTMLElement | null;
    if (_draggable?.classList.contains("draggable") && e.dataTransfer) {
      e.dataTransfer.clearData();
      e.dataTransfer.setData("text/plain", draggingKey);
      dragged = _draggable;
      observeDrop(editor);
      setTimeout(() => {
        if (dragged) {
          display = dragged.style.display;
          dragged.style.display = "none";
        }
      });
    }
  });

  editor.addEventListener("dragend", (e) => {
    const _draggable = e?.target as HTMLElement | null;
    if (_draggable?.classList.contains("draggable")) {
      dragged = _draggable;
      setTimeout(() => {
        if (dragged) {
          dragged.style.display = display;
        }
      });
    }
  });
}
