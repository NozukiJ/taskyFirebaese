// interval-set-add.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IntervalSetService } from '../../core/services/intervalSet.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-interval-set-add',
  templateUrl: './interval-set-add.component.html',
  styleUrls: ['./interval-set-add.component.css'],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatDialogModule, FormsModule, CommonModule]
})
export class IntervalSetAddComponent {
  newInterval: any = { name: '', years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0 };

  constructor(
    public dialogRef: MatDialogRef<IntervalSetAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private intervalSetService: IntervalSetService
  ) {}

  addInterval() {
    this.intervalSetService.addIntervalToIntervalSet(this.data.intervalSetId, this.newInterval).then(() => {
      this.dialogRef.close(true); // 成功した場合はtrueを返す
    });
  }

  onCancel(): void {
    this.dialogRef.close(false); // キャンセル時にはfalseを返す
  }
}
