export function createDropCaret(className?: string) {
  const dropCaret = document.createElement("span");
  dropCaret.classList.add("drop-caret");
  if (className) dropCaret.classList.add(className);
  const innerSpan = document.createElement("span");
  dropCaret.appendChild(innerSpan);
  return dropCaret;
}

interface Point {
  x: number;
  y: number;
}
export const caretRangeFromPoint = (
  point: Point,
  scope: Node = document.body,
) => {
  const treeWalker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
  while (treeWalker.nextNode()) {
    const current = treeWalker.currentNode;
    const range = document.createRange();
    range.setStart(current, 0);
    range.setEnd(current, current.textContent?.length || 0);
    const checkMatchX = (point: Point, range: DOMRect) =>
      point.x >= range.x && point.x <= range.x + range.width;
    const checkMatchY = (point: Point, range: DOMRect) =>
      point.y >= range.y && point.y <= range.y + range.height;
    const checkIsIn = (point: Point, range: DOMRect) =>
      checkMatchX(point, range) && checkMatchY(point, range);
    const rects = range.getClientRects();
    for (const rect of rects) {
      if (checkIsIn(point, rect)) {
        const findSmallestChunk = (
          text: string,
          startX: number,
        ): Range | undefined => {
          const middle = text.slice(0, text.length / 2).length;
          const chunks = [
            { start: startX, end: startX + middle },
            { start: startX + middle, end: startX + text.length },
          ];
          for (const chunk of chunks) {
            const range = document.createRange();
            range.setStart(current, chunk.start);
            range.setEnd(current, chunk.end);
            const rects = range.getClientRects();
            for (const rect of rects) {
              if (checkIsIn(point, rect)) {
                if (range.toString().length === 1) return range;
                else return findSmallestChunk(range.toString(), chunk.start);
              }
            }
          }
        };
        const foundRange = findSmallestChunk(current.textContent || "", 0);
        if (foundRange) {
          const rect = foundRange.getBoundingClientRect();
          const relX = point.x - rect.x;
          const diff = rect.width - relX;
          foundRange.collapse(diff > rect.width / 2);
          return foundRange;
        } else throw new Error("range not found");
      }
    }
  }
};
