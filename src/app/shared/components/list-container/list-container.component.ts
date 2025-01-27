import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule, FlexModule } from '@ngbracket/ngx-layout';

@Component({
  selector: 'app-list-container',
  standalone: true,
  imports: [FlexModule, FlexLayoutModule, MatCardModule],
  templateUrl: './list-container.component.html',
  styleUrl: './list-container.component.scss'
})
export class ListContainerComponent {

}
