// The sort of a paged grid, as the list endpoints take it: "column" or "column:asc" / "column:desc" (spec item E03).
// The server does the sorting; this keeps the choice between visits so a grid opens the way the person left it.

const storageKey = (gridKey: string) => `gridSort:${gridKey}`;

/**
 * The sort saved for a grid, or the fallback when there is none, storage is unavailable, or the saved column is not one the grid can sort by any more
 * (the server answers an unknown column with a 400, so a stale value must never be sent).
 */
export function loadSort(gridKey: string, sortableColumns: string[], fallback: string): string {
  try {
    const saved = localStorage.getItem(storageKey(gridKey));
    const [column, direction] = (saved ?? '').split(':');
    if (column && sortableColumns.includes(column) && (direction === 'asc' || direction === 'desc')) {
      return saved!;
    }
  } catch {
    // storage unavailable or unreadable: no saved sort
  }
  return fallback;
}

/** Remember the sort of a grid. */
export function saveSort(gridKey: string, sort: string): void {
  try {
    localStorage.setItem(storageKey(gridKey), sort);
  } catch {
    // storage unavailable: the sort just is not remembered
  }
}

/** Forget the saved sort of a grid (the "Clear sort" menu): the grid opens in its default order again. */
export function forgetSort(gridKey: string): void {
  try {
    localStorage.removeItem(storageKey(gridKey));
  } catch {
    // storage unavailable: there was nothing saved
  }
}

/** What a click on a column header gives: another column sorts ascending, the sorted column flips its direction. */
export function nextSort(current: string, column: string): string {
  const [currentColumn, direction] = current.split(':');
  return column + ':' + (currentColumn === column && direction === 'asc' ? 'desc' : 'asc');
}

/** The arrow shown after the caption of the sorted column. */
export function sortMark(current: string, column: string): string {
  const [currentColumn, direction] = current.split(':');
  return currentColumn === column ? (direction === 'asc' ? ' ▲' : ' ▼') : '';
}

/** The value of the header's aria-sort attribute, so a screen reader announces which column is sorted and how. */
export function ariaSort(current: string, column: string): 'ascending' | 'descending' | null {
  const [currentColumn, direction] = current.split(':');
  return currentColumn === column ? (direction === 'asc' ? 'ascending' : 'descending') : null;
}
