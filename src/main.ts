import "./style.css";
import { caretRangeFromPoint, createDropCaret } from "./utils";

let dragged: HTMLElement | null = null;
let display: string = "";
let ghost: HTMLDivElement;
let draggingKey = "dragging";

const editor = document.querySelector('[contenteditable="true"');
const draggable = document.querySelector(".draggable");
let dropCaret: HTMLElement | null = null;
if (draggable) {
  draggable.addEventListener("dragstart", (event) => {
    dropCaret = createDropCaret();
    const e = event as DragEvent;
    if (e.dataTransfer) {
      e.dataTransfer.clearData();
      e.dataTransfer.setData("text/plain", draggingKey);

      dragged = e.target as HTMLElement;

      ghost = document.createElement("div");
      ghost.id = "drag-ghost";
      ghost.style.position = "absolute";
      ghost.style.top = "-1000px";
      document.body.appendChild(ghost);
      ghost.appendChild(dragged.cloneNode(true));
      e.dataTransfer.setDragImage(ghost, 0, 0);

      setTimeout(() => {
        if (dragged) {
          display = dragged.style.display;
          dragged.style.display = "none";
        }
      });
    }
  });
  draggable.addEventListener("dragend", (e) => {
    dragged = draggable as HTMLElement;
    if (dropCaret) {
      dropCaret.remove();
      dropCaret = null;
    }
    if (ghost.parentNode) {
      ghost.parentNode.removeChild(ghost);
    }
    setTimeout(() => {
      if (dragged) {
        dragged.style.display = display;
        dragged = null;
      }
    });
  });
}

if (editor) {
  let x: number, y: number;

  editor.addEventListener("dragenter", (event) => {
    const e = event as DragEvent;
    if (e.dataTransfer?.getData("text/plain") === draggingKey) {
      e.preventDefault();
    }
  });
  editor.addEventListener("dragleave", (event) => {
    const e = event as DragEvent;
    if (e.dataTransfer?.getData("text/plain") === draggingKey) {
      e.preventDefault();
    }
  });
  editor.addEventListener("dragover", (event) => {
    const e = event as DragEvent;
    if (dragged) {
      e.preventDefault();
      if (x !== e.x || y !== e.y) {
        x = e.x;
        y = e.y;
        let caretRange: Range | null | undefined;
        if (document.caretRangeFromPoint !== undefined) {
          caretRange = document.caretRangeFromPoint(x, y);
        } else if (document.caretPositionFromPoint !== undefined) {
          caretRange = ((pos) => {
            if (pos) {
              const range = document.createRange();
              range.setStart(pos.offsetNode, pos.offset);
              return range;
            }
            return null;
          })(document.caretPositionFromPoint(x, y));
        } else {
          caretRange = caretRangeFromPoint({ x, y }, e.target as Node);
        }
        if (caretRange && dropCaret) {
          caretRange.insertNode(dropCaret);
          setTimeout(() => {
            caretRange?.startContainer.parentElement?.normalize();
          });
        }
      }
    }
  });
  editor.addEventListener("drop", (event) => {
    const e = event as DragEvent;
    if (e.dataTransfer?.getData("text/plain") === draggingKey) {
      e.preventDefault();
      if (dropCaret && dragged) {
        dropCaret.parentElement?.insertBefore(dragged, dropCaret);
      }
    }
  });
}
