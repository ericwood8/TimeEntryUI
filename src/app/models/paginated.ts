import { HttpParams } from '@angular/common/http';

/** One page of a list from the API (E03): the rows of the page and how many rows match in all. */
export interface Paginated<T> {
    pageIndex: number;
    count: number;
    data: T[];
}

/** What a list endpoint accepts: ?pageIndex=&pageSize=&sort=name:desc&search=text */
export interface PageQuery {
    pageIndex: number;
    pageSize: number;
    sort?: string;
    search?: string;
}

export function pageParams(query: PageQuery): HttpParams {
    let params = new HttpParams().set('pageIndex', query.pageIndex).set('pageSize', query.pageSize);
    if (query.sort) { params = params.set('sort', query.sort); }
    if (query.search?.trim()) { params = params.set('search', query.search.trim()); }
    return params;
}
