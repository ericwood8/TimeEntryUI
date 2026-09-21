import { Component } from '@angular/core';
import { Holiday } from '../../models/holiday';
import { HolidayService } from '../../services/holiday.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-holiday',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './holiday.component.html',
  styleUrl: './holiday.component.css'
})
export class HolidayComponent {
  holidays: Holiday[] = [];
  selectedRow: Holiday | null = null;
  searchText = '';

  constructor(private holidayService: HolidayService) { }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.holidayService.getAll().subscribe((data) => { this.holidays = data; });
  }

  submit(holiday: Holiday): void {
    if (holiday.holidayId) {
      this.holidayService.update(holiday.holidayId, holiday).subscribe({
        next: () => {
          console.log("Updated successfully!");
          this.load();
        },
        error: (error) => this.showError("updating", error)
      });
    }
    else {
      holiday.holidayId = 0;
      this.holidayService.create(holiday).subscribe({
        next: () => { this.load(); },
        error: (error) => this.showError("adding", error)
      });
    }
    this.selectedRow = null;
  }

  delete(id: number): void {
    if (confirm("Are you sure you want to delete this?")) {
      this.holidayService.delete(id).subscribe({
        next: () => {
          console.log("Deleted successfully!");
          this.holidays = this.holidays.filter((p) => p.holidayId !== id);
        },
        error: (error) => {
          if (error.status == 400) { alert("It cannot be deleted because it is in use!"); }
          else if (error.status == 404) { alert("It no longer exists!"); this.load(); }
          else { alert("Problem while deleting! " + error.message); }
        }
      });
    }
  }

  add(): void {
    this.selectedRow = { sY_IsoCountry_Alpha3Code: '', date: new Date().toISOString().substring(0, 10), name: '' };
  }

  edit(holiday: Holiday): void {
    this.selectedRow = { ...holiday };
    // the date box wants yyyy-MM-dd; the API sends a full timestamp
    this.selectedRow.date = this.selectedRow.date.substring(0, 10);
  }

  cancel(): void {
    this.selectedRow = null;
  }

  search(): void {
    this.selectedRow = null;
    this.holidayService.findByName(this.searchText).subscribe({
      next: (data) => { this.holidays = data; },
      error: (e) => console.error(e)
    });
  }

  private showError(action: string, error: any): void {
    if (error.status == 400) { alert("Name is bad or has special characters!"); }
    else if (error.status == 404) { alert("This holiday no longer exists!"); this.load(); }
    else { alert("Problem while " + action + "! " + error.message); }
  }
}
