import { Directive, HostListener, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { CrudService, NamedCrudService } from '../services/crud.service';
import { apiMessage } from '../services/api-error';
import { PageQuery, Paginated } from '../models/paginated';
import { ariaSort, forgetSort, loadSort, nextSort, saveSort, sortMark } from '../utils/grid-sort';

/**
 * What every list-and-form screen does: show the rows, search them, open one in the form (a copy), save it (add or update), delete it, and say why when the API
 * refuses (spec item E10). A screen extends this with its service, its words and the few steps that are its own:
 *
 *   `service`, `noun`, `idKey`, `newRow()`  are required;
 *   `prepare(row, isNew)`      fixes up a row before it is sent (drop empty child rows, fill what the form does not);
 *   `prepareEdit(copy)`        fixes up the copy that goes into the form (a date for the date box, child rows that may be null);
 *   `start()`                  loads what else the screen needs (drop-down lists) as well as the rows;
 *   `find(text)`               searches in another way than the API's find-by-name.
 *
 * The templates use the same names everywhere: `rows`, `selectedRow`, `searchText`, `add()`, `edit(row)`, `submit(row)`, `delete(id)`, `cancel()`, `search()`.
 */
@Directive()
export abstract class CrudScreen<T> implements OnInit {
  rows: T[] = [];
  selectedRow: T | null = null;
  searchText = '';

  protected abstract readonly service: CrudService<T>;
  /** What a row is called in a message, in lower case: "project". */
  protected abstract readonly noun: string;
  /** The property that holds the row's key (0 or missing means a new row). */
  protected abstract readonly idKey: keyof T & string;
  /** What the message says when the API refuses a name (400). */
  protected readonly badInputMessage: string = 'Name is bad or has special characters!';

  protected abstract newRow(): T;

  ngOnInit(): void {
    this.start();
  }

  protected start(): void {
    this.load();
  }

  protected load(): void {
    this.service.getAll().subscribe((rows) => { this.rows = rows; });
  }

  /** The rows that match the text typed in the search box (the API's find-by-name: names that start with it). */
  protected find(text: string): Observable<T[]> {
    return this.service instanceof NamedCrudService ? this.service.findByName(text) : this.service.getAll();
  }

  search(): void {
    this.selectedRow = null;
    const text = this.searchText.trim();
    if (!text) {
      this.load();
      return;
    }
    this.find(text).subscribe({
      next: (rows) => { this.rows = rows; },
      error: (e) => console.error(e)
    });
  }

  add(): void {
    this.selectedRow = this.newRow();
  }

  edit(row: T): void {
    // edit a COPY: changing the row itself would change what the grid shows
    this.selectedRow = this.prepareEdit({ ...row });
  }

  cancel(): void {
    this.selectedRow = null;
  }

  protected prepare(row: T, isNew: boolean): void { }

  protected prepareEdit(copy: T): T {
    return copy;
  }

  submit(row: T): void {
    const isNew = !this.idOf(row);
    this.prepare(row, isNew);
    if (isNew) {
      (row as Record<string, unknown>)[this.idKey] = 0;
    }
    const call = isNew ? this.service.create(row) : this.service.update(this.idOf(row)!, row);
    const action = isNew ? 'adding' : 'updating';
    call.subscribe({
      // the form stays open when the API refuses, so what was typed is not lost
      next: () => { this.selectedRow = null; this.load(); },
      error: (error) => this.showSaveError(action, error)
    });
  }

  delete(id: number): void {
    if (!confirm('Are you sure you want to delete this?')) {
      return;
    }
    this.service.delete(id).subscribe({
      next: () => this.load(),
      error: (error) => this.showDeleteError(error)
    });
  }

  protected idOf(row: T): number | undefined {
    return row[this.idKey] as number | undefined;
  }

  private capitalNoun(): string {
    return this.noun.charAt(0).toUpperCase() + this.noun.slice(1);
  }

  protected showSaveError(action: string, error: HttpErrorResponse): void {
    if (error.status == 400) { alert(apiMessage(error, this.badInputMessage)); }
    else if (error.status == 422) { alert(apiMessage(error, `${this.capitalNoun()} already exists!`)); }
    else if (error.status == 404) { alert(`This ${this.noun} no longer exists!`); this.selectedRow = null; this.load(); }
    else { alert(apiMessage(error, `Problem while ${action}!`)); }
  }

  protected showDeleteError(error: HttpErrorResponse): void {
    if (error.status == 400) { alert('It cannot be deleted because it is in use!'); }
    else if (error.status == 404) { alert('It no longer exists!'); this.load(); }
    else { alert(apiMessage(error, 'Problem while deleting!')); }
  }
}

/** A service whose list endpoint pages, sorts and searches on the server (spec item E03). */
export interface PagedCrudService<T> extends CrudService<T> {
  getPage(query: PageQuery): Observable<Paginated<T>>;
}

/**
 * A screen whose rows are paged, sorted and searched by the server (E03): it holds only the page it shows. Adds the page, the sort (kept between visits), the
 * column-header sort arrows and the right-click "Clear sort" menu to what a `CrudScreen` does. A screen says its `gridKey` (where the sort is remembered), the
 * `sortableColumns` and the `defaultSort`, and may set a different `pageSize`.
 */
@Directive()
export abstract class PagedCrudScreen<T> extends CrudScreen<T> {
  protected abstract override readonly service: PagedCrudService<T>;
  protected abstract readonly gridKey: string;
  abstract readonly sortableColumns: string[];
  abstract readonly defaultSort: string;

  pageSize = 10;
  currentPage = 0;
  total = 0;                       // rows that match the search, over all pages
  sort = '';                       // the sort the person left, else the default (set in start)
  sortMenu: { x: number; y: number } | null = null;   // the right-click menu (Clear sort), where it is open
  loaded = false;                  // true once a page has arrived, so "No rows" is not shown while waiting

  protected override start(): void {
    this.sort = loadSort(this.gridKey, this.sortableColumns, this.defaultSort);
    super.start();
  }

  protected override load(): void {
    this.service.getPage({ pageIndex: this.currentPage, pageSize: this.pageSize, sort: this.sort, search: this.searchText }).subscribe((page) => {
      // a page past the end (the last row of the last page was deleted): go back to the last page there is
      if (page.data.length === 0 && page.count > 0 && this.currentPage > 0) {
        this.currentPage = Math.ceil(page.count / this.pageSize) - 1;
        this.load();
        return;
      }
      this.total = page.count;
      this.rows = page.data;
      this.loaded = true;
      this.pageLoaded();
    });
  }

  /** Called when a page has arrived (a screen that adds names to its rows does it here). */
  protected pageLoaded(): void { }

  override search(): void {
    this.currentPage = 0;
    this.load();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  /** Sorts by that column; a second click on the same column reverses the order. The choice is kept for the next visit. */
  sortBy(column: string): void {
    this.sort = nextSort(this.sort, column);
    saveSort(this.gridKey, this.sort);
    this.currentPage = 0;
    this.load();
  }

  sortMark(column: string): string {
    return sortMark(this.sort, column);
  }

  ariaSort(column: string): 'ascending' | 'descending' | null {
    return ariaSort(this.sort, column);
  }

  /** Back to the default order and forget the saved sort. */
  clearSort(): void {
    this.sort = this.defaultSort;
    forgetSort(this.gridKey);
    this.sortMenu = null;
    this.currentPage = 0;
    this.load();
  }

  openSortMenu(event: MouseEvent): void {
    event.preventDefault();
    this.sortMenu = { x: event.clientX, y: event.clientY };
  }

  @HostListener('document:click')
  @HostListener('document:keydown.escape')
  closeSortMenu(): void {
    this.sortMenu = null;
  }
}
