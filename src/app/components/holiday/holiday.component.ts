import { Component, inject } from '@angular/core';
import { Holiday } from '../../models/holiday';
import { HolidayService } from '../../services/holiday.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudScreen } from '../crud-screen';

@Component({
  selector: 'app-holiday',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './holiday.component.html',
  styleUrl: './holiday.component.css'
})
export class HolidayComponent extends CrudScreen<Holiday> {
  protected readonly service = inject(HolidayService);
  protected readonly noun = 'holiday';
  protected readonly idKey = 'holidayId';

  protected newRow(): Holiday {
    return { sY_IsoCountry_Alpha3Code: '', date: new Date().toISOString().substring(0, 10), name: '' };
  }

  protected override prepareEdit(copy: Holiday): Holiday {
    // the date box wants yyyy-MM-dd; the API sends a full timestamp
    copy.date = copy.date.substring(0, 10);
    return copy;
  }
}
