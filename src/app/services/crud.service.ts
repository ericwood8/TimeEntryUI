import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * The five calls every table's API answers: list, get by id, create, update, delete (spec item E04). A service for a table extends this with its route and adds
 * the calls that are its own (a page of the list, a lookup, the rows under a parent).
 */
export abstract class CrudService<T> {
    protected constructor(protected readonly http: HttpClient, protected readonly apiUrl: string) { }

    // Get all the rows
    getAll(): Observable<T[]> {
        return this.http.get<T[]>(this.apiUrl);
    }

    // Get a row by ID
    getById(id: number): Observable<T> {
        return this.http.get<T>(`${this.apiUrl}/${id}`);
    }

    // Create a new row
    create(row: T): Observable<T> {
        return this.http.post<T>(this.apiUrl, row);
    }

    // Update a row
    update(id: number, row: T): Observable<T> {
        return this.http.put<T>(`${this.apiUrl}/${id}`, row);
    }

    // Delete a row
    delete(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}

/** A table whose rows have a name: the API finds the rows with a name (an empty list when none match). */
export abstract class NamedCrudService<T> extends CrudService<T> {
    // Find by Name
    findByName(name: string): Observable<T[]> {
        return this.http.get<T[]>(`${this.apiUrl}/${encodeURIComponent(name)}`);
    }
}
