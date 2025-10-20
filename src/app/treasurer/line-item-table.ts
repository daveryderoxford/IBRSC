import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { AccountLineItem } from './line-items';

@Component({
  selector: 'app-line-item-table',
  imports: [DecimalPipe, DatePipe, MatTableModule, MatSortModule],
  templateUrl: './line-item-table.html',
  styleUrls: ['./line-item-table.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineItemTableComponent {
  // Inputs
  lineItems = input.required<AccountLineItem[]>();

  displayedColumns: string[] = ['id', 'date', 'amount', 'memo', 'to_from', 'notes'];

  total = computed(() =>
    this.lineItems()
      .reduce((sum, item) => sum + Number(item.amount), 0)
  );

  positiveTotal = computed(() =>
    this.lineItems()
      .filter((item) => item.amount > 0)
      .reduce((sum, item) => sum + Number(item.amount), 0)
  );

  negativeTotal = computed(() =>
    this.lineItems()
      .filter((item) => item.amount < 0)
      .reduce((sum, item) => sum + Number(item.amount), 0)
  );
}
