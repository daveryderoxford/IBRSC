import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ToolbarComponent } from '../shared/components/toolbar.component';
import { MatAnchor } from "@angular/material/button";
import { FinancialYear, FINANCIAL_YEARS, accounts } from './model/odin';
import { AccountLineItem, lineItemURL, processRaw } from './model/line-items';
import { LineItemTable } from './line-item-table/line-item-table';

@Component({
  selector: 'app-account-viewer',
  imports: [
    ToolbarComponent,
    LineItemTable,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatInputModule,
    MatAnchor
],
  templateUrl: './account-viewer.html',
  styleUrls: ['./account-viewer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountViewer {

  financialYears = FINANCIAL_YEARS;

  // State Signals
  selectedYear = signal<FinancialYear>('2023-2024');
  selectedCatogory = signal<string | undefined>(undefined);

  jsonText = new FormControl('');

  items = signal<AccountLineItem[]>([]);

  lineItemParams = computed( () => ({
    financial_year: this.selectedYear(),
    account_to_show: accounts[0]
  })); 

  loadData() {
    window.open(lineItemURL(this.lineItemParams()));
  }

  processData() {
    const text = this.jsonText.value;

    const items = processRaw(text, this.selectedYear());
      this.items.set(items);
  }
}