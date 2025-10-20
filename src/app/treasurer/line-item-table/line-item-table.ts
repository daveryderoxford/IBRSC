import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import {
  AccountLineItem,
  FinancialYear,
  LineItemService,
} from '../line-items';

import { JsonPipe, DecimalPipe, DatePipe } from '@angular/common';

type SortableColumn = 'cbId' | 'date' | 'amount';
type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-line-item-table',
  imports: [JsonPipe, DecimalPipe, DatePipe],
  templateUrl: './line-item-table.html',
  styleUrls: ['./line-item-table.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineItemTable {
  // Inputs
  accountLine = input.required<string>();
  financialYear = input.required<FinancialYear>();

  // State
  private lineItemsResource = computed(() =>
    this.lineItemService.get({ financial_year: this.financialYear() })
  );

  sortColumn = signal<SortableColumn>('date');
  sortDirection = signal<SortDirection>('asc');

  // Selectors (Derived State)
  filteredLineItems = computed(() => {
    const resource = this.lineItemsResource();
    if (resource.state === 'LOADED') {
      return resource.value.filter(
        (item) => item.ibrsc_account_line === this.accountLine()
      );
    }
    return [];
  });

  sortedLineItems = computed(() => {
    const items = [...this.filteredLineItems()];
    const col = this.sortColumn();
    const dir = this.sortDirection();

    return items.sort((a, b) => {
      const valA = a[col];
      const valB = b[col];

      if (valA < valB) return dir === 'asc' ? -1 : 1;
      if (valA > valB) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  positiveTotal = computed(() =>
    this.filteredLineItems()
      .filter((item: AccountLineItem) => item.amount > 0)
      .filter((item: AccountLineItem) => item.amount > 0)
      .reduce((sum: number, item) => sum + Number(item.amount), 0)
  );

  negativeTotal = computed(() =>
    this.filteredLineItems()
      .filter((item) => item.amount < 0)
      .reduce((sum, item) => sum + Number(item.amount), 0)
  );

  // For template access
  lineItemsState = computed(() => this.lineItemsResource().state);
  lineItemsError = computed(() => this.lineItemsResource().error);

  constructor(private lineItemService: LineItemService) {}

  // Actions
  sortBy(column: SortableColumn): void {
    if (this.sortColumn() === column) {
      this.sortDirection.update((dir) => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  getSortIndicator(column: SortableColumn): string {
    if (this.sortColumn() !== column) return '';
    return this.sortDirection() === 'asc' ? '▲' : '▼';
  }
}