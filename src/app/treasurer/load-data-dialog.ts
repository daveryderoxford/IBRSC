import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { accounts, FINANCIAL_YEARS, FinancialYear } from './model/odin';
import { lineItemURL, processRaw } from './model/line-items';

@Component({
  selector: 'app-load-data-dialog',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Load Account Data</h2>
    <mat-dialog-content class="load-data-content">
      <p>Select a financial year and click "Load Data" to open the Odin query in a new tab. Once the data has loaded, copy the JSON output and paste it into the text area below, then click "Process".</p>
      <div class="dialog-controls">
        <mat-form-field appearance="outline">
          <mat-label>Financial Year</mat-label>
          <mat-select [(ngModel)]="selectedYear">
            @for (year of financialYears; track year) {
              <mat-option [value]="year">{{ year }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <button mat-stroked-button (click)="loadData()">
          Load data
        </button>
      </div>
      <mat-form-field class="json-input-field">
        <mat-label>Odin JSON</mat-label>
        <textarea matInput [formControl]="jsonText" cdkTextareaAutosize cdkAutosizeMinRows="5"></textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-flat-button color="primary" (click)="processData()" [disabled]="!jsonText.value">Process</button>
    </mat-dialog-actions>
  `,
  styles: [
    `.load-data-content { display: flex; flex-direction: column; }`,
    `.dialog-controls { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }`,
    `.json-input-field { width: 100%; }`
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadDataDialog {
  financialYears = FINANCIAL_YEARS;
  selectedYear = signal<FinancialYear>('2023-2024');
  jsonText = new FormControl('');

  lineItemParams = computed(() => ({
    financial_year: this.selectedYear(),
    account_to_show: accounts[0]
  }));

  constructor(public dialogRef: MatDialogRef<LoadDataDialog>) {}

  loadData() {
    window.open(lineItemURL(this.lineItemParams()));
  }

  processData() {
    const text = this.jsonText.value;
    if (text) {
      const items = processRaw(text, this.selectedYear());
      this.dialogRef.close(items);
    }
  }
}