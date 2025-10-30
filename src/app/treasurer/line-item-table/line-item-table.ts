import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { format } from 'date-fns';
import { AccountLineItem } from '../model/line-items';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

interface CategorySummary {
  category: string;
  net: number;
  income: number;
  expenditure: number;
  count: number;
}

@Component({
  selector: 'app-line-item-table',
  imports: [DecimalPipe,
    MatTableModule,
    MatSortModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatIconModule],
  templateUrl: './line-item-table.html',
  styleUrls: ['./line-item-table.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineItemTable {
  lineItems = input.required<AccountLineItem[]>();

  searchControl = new FormControl('');
  searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    ), { initialValue: '' }
  );

  selectedAccountLines = signal<string[]>([]);

  sortState = signal<Sort>({ active: '', direction: '' });

  accountLines = computed(() => {
    const lines = this.lineItems().map(item => item.ibrsc_account_line);
    return [...new Set(lines)].sort();
  });

  filteredLineItems = computed(() => {
    const searchTerm = this.searchTerm()?.toLowerCase() ?? '';
    const selected = this.selectedAccountLines();
    const items = this.lineItems();

    const filteredBySearch = !searchTerm ? items : items.filter(item =>
      (item.cbId?.toString() ?? '').includes(searchTerm) ||
      (this.formatDate(item.date)?.toLowerCase() ?? '').includes(searchTerm) ||
      (item.amount?.toString() ?? '').includes(searchTerm) ||
      (item.ibrsc_account_line?.toLowerCase() ?? '').includes(searchTerm) ||
      (item.memo?.toLowerCase() ?? '').includes(searchTerm) ||
      (item.to_from?.toLowerCase() ?? '').includes(searchTerm) ||
      (item.notes?.toLowerCase() ?? '').includes(searchTerm)
    );

    if (!selected || selected.length === 0) {
      return filteredBySearch;
    }
    return filteredBySearch.filter(item => selected.includes(item.ibrsc_account_line));
  });

  sortedLineItems = computed(() => {
    return applySort(this.sortState(), this.filteredLineItems());
  });

  clearSelection() {
    this.selectedAccountLines.set([]);
  }

  displayedColumns = computed(() => this.selectedAccountLines()?.length === 1 ?
    ['id', 'date', 'amount', 'memo', 'to_from', 'notes'] :
    ['id', 'date', 'amount', 'catagory', 'memo', 'to_from', 'notes']);

  total = computed(() =>
    this.filteredLineItems()
      .reduce((sum, item) => sum + item.amount, 0)
  );

  positiveTotal = computed(() =>
    this.filteredLineItems()
      .filter((item) => item.amount > 0)
      .reduce((sum, item) => sum + item.amount, 0)
  );

  negativeTotal = computed(() =>
    this.filteredLineItems()
      .filter((item) => item.amount < 0)
      .reduce((sum, item) => sum + item.amount, 0)
  );

  categorySummaries = computed<CategorySummary[]>(() => {
    const selectedLines = this.selectedAccountLines();
    const allItems = this.filteredLineItems();

    if (selectedLines.length <= 1) {
      return [];
    }

    return selectedLines.map(category => {
      const categoryItems = allItems.filter(item => item.ibrsc_account_line === category);

      const income = categoryItems.filter(i => i.amount > 0).reduce((sum, i) => sum + i.amount, 0);
      const expenditure = categoryItems.filter(i => i.amount < 0).reduce((sum, i) => sum + i.amount, 0);

      return {
        category,
        income,
        expenditure,
        net: income + expenditure,
        count: categoryItems.length,
      };
    }).sort((a, b) => a.category.localeCompare(b.category));
  });

  formatDate(value: Date): string {
    try {
      return format(value, 'dd-MM-yy');
    } catch (e) {
      const val = value ? value.toString() : 'Value undefned';
      console.log('Date transfore error: ' + val);
      return val;
    }
  }

  exportToCsv() {
    const summaries = this.categorySummaries();
    const details = this.sortedLineItems();
    const columns = this.displayedColumns();
    let csvContent = '';

    // Helper to escape CSV values
    const escapeCsv = (value: any): string => {
      if (value == null) {
        return '';
      }
      const strValue = String(value);
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    };

    // Add Category Summaries
    if (summaries.length > 0) {
      csvContent += 'Category,Count,Net,Income,Expenditure\n';
      summaries.forEach(summary => {
        const row = [
          summary.category,
          summary.count,
          summary.net,
          summary.income,
          summary.expenditure
        ].map(escapeCsv).join(',');
        csvContent += row + '\n';
      });
      csvContent += '\n'; // Add a blank line for separation
    }

    // Add Detailed Line Items
    if (details.length > 0) {
      csvContent += columns.join(',') + '\n';
      details.forEach(item => {
        const row = columns.map(col => {
          switch (col) {
            case 'id': return item.cbId;
            case 'date': return this.formatDate(item.date);
            case 'catagory': return item.ibrsc_account_line;
            default: return item[col as keyof AccountLineItem];
          }
        }).map(escapeCsv).join(',');
        csvContent += row + '\n';
      });
    }

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `account_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function applySort(sort: Sort, data: AccountLineItem[]) {

  const sortedData = [...data];
  if (!sort.active || sort.direction === '') {
    return sortedData;
  }

  sortedData.sort((a, b) => {
    const isAsc = sort.direction === 'asc';
    switch (sort.active) {
      case 'amount':
        return compare(a.amount, b.amount, isAsc);
      case 'date':
        return compare(a.date.toISOString(), b.date.toISOString(), isAsc);
      case 'id':
        return compare(a.cbId, b.cbId, isAsc);
      case 'catagory':
        return compare(a.ibrsc_account_line, b.ibrsc_account_line, isAsc);
      default:
        return 0;
    }
  });
  return sortedData;
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
