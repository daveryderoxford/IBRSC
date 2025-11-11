import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ToolbarComponent } from '../shared/components/toolbar.component';
import { MatButtonModule } from "@angular/material/button";
import { AccountLineItem } from './model/line-items';
import { LineItemTable } from './line-item-table/line-item-table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { filter } from 'rxjs';
import { LoadDataDialog } from './load-data-dialog';

@Component({
  selector: 'app-account-viewer',
  imports: [
    ToolbarComponent,
    LineItemTable,
    MatButtonModule,
    MatDialogModule
],
  templateUrl: './account-viewer.html',
  styleUrls: ['./account-viewer.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountViewer {
  private readonly dialog = inject(MatDialog);

  items = signal<AccountLineItem[]>([]);

  openLoadDataDialog(): void {
    const dialogRef = this.dialog.open(LoadDataDialog, {
      width: '600px',
    });
    dialogRef.afterClosed().pipe(
      filter((result): result is AccountLineItem[] => !!result)
    ).subscribe(result => {
      this.items.set(result);
    });
  }
}