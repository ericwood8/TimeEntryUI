import { Component } from '@angular/core';
import { Holiday } from '../../models/holiday';
import { HolidayService } from '../../services/holiday.service';
import { CommonModule, DatePipe } from '@angular/common';
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
      this.holidayService.update(holiday.holidayId, holiday).subscribe(() => {
        console.log("Updated successfully!");
        this.load();
      }, (error) => {
        if (error.status == 400) { alert("Name is bad or has special characters!"); }
        // duplicates are fine
        else { alert("Problem while updating! " + error.message); }
      });
    }
    else {
      holiday.holidayId = 0;
      this.holidayService.create(holiday).subscribe((holiday) => { this.holidays.push(holiday); },
        (error) => {
          if (error.status == 400) { alert("Name is bad or has special characters! " + error.message); }
          // duplicates are fine
          else { alert("Problem while adding! " + error.message); }
        });
    }
    this.selectedRow = null;
  }

  delete(id: number): void {
    if(confirm("Are you sure you want to delete this?")){
      this.holidayService.delete(id).subscribe(() => {
        console.log("Deleted successfully!");
        this.holidays = this.holidays.filter((p) => p.holidayId !== id);
      }, (error) => { alert("Problem while deleting! " + error.message); });
    }
  }

  add(): void {
    this.selectedRow = { name: 'Christmas', sY_IsoCountry_Alpha3Code: 'USA', date: new Date()};
  }

  edit(holiday: Holiday): void {
    this.selectedRow = { ...holiday };
    const dateStr = new DatePipe('en-US').transform(this.selectedRow.date, 'YYYY-MM-dd');
    this.selectedRow.date = new Date(dateStr!);
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
}