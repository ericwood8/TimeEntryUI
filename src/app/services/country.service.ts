import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Country } from '../models/country';

@Injectable({
    providedIn: 'root',
})
export class CountryService {
    constructor(private http: HttpClient) { }

    // The active countries for a drop-down, the United States first
    getAll(): Observable<Country[]> {
        return this.http.get<Country[]>('api/countries');
    }
}
