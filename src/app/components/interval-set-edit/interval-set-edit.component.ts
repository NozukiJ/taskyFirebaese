import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IntervalSetService } from '../../core/services/intervalSet.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-interval-set-edit',
  templateUrl: './interval-set-edit.component.html',
  styleUrls: ['./interval-set-edit.component.css'],
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatDialogModule, FormsModule, CommonModule]
})
export class IntervalSetEditComponent {
  interval: any;

  constructor(
    public dialogRef: MatDialogRef<IntervalSetEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private intervalSetService: IntervalSetService
  ) {
    this.interval = { ...data.interval }; // 渡されたインターバルデータをコピー
  }

  saveInterval() {
    this.intervalSetService.updateIntervalInIntervalSet(this.data.intervalSetId, this.interval).then(() => {
      this.dialogRef.close(true);
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
