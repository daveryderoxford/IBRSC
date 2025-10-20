import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ToolbarComponent } from '../shared/components/toolbar.component';
import { LineItemTableComponent } from './line-item-table';
import { FinancialYear, LineItemService } from './line-items';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'app-account-viewer',
  standalone: true,
  imports: [
    ToolbarComponent,
    LineItemTableComponent,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatInputModule,
    JsonPipe
  ],
  templateUrl: './account-viewer.html',
  styleUrls: ['./account-viewer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountViewer {
  protected lineItemService = inject(LineItemService);

  // Constants
  readonly financialYears: FinancialYear[] = [
    '2024 - 2025',
    '2023 - 2024',
    '2022 - 2023',
  ];

  // State Signals
  selectedYear = signal<FinancialYear>('2023 - 2024');
  selectedCatogory = signal<string | undefined>(undefined);

  lineItemParams = computed( () => ({
    financial_year: this.selectedYear()
  }));

  lineItems = this.lineItemService.getLineItemsResource(this.lineItemParams);

  // Derived State (Selectors)
  catagories = computed(() => {
    const lines = this.lineItems.value().map( item => item.ibrsc_account_line);
    return [...new Set(lines)].sort();
  });

  filteredItems = computed(() => this.lineItems.value()
    .filter(item => item.ibrsc_account_line === this.selectedCatogory())
  );
}