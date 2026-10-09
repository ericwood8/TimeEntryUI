import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Holiday } from '../models/holiday';
import { NamedCrudService } from './crud.service';

@Injectable({
    providedIn: 'root',
})
export class HolidayService extends NamedCrudService<Holiday> {
    constructor(http: HttpClient) {
        super(http, 'api/holidays');
    }
}
