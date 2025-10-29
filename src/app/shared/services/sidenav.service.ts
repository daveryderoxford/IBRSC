import { Injectable, signal } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {
  #sidenav = signal<MatSidenav | undefined>(undefined);

  setSidenav(sidenav: MatSidenav) {
    this.#sidenav.set(sidenav);
  }
  
  open() {
    return this.#sidenav()?.open();
  }
  
  close() {
    return this.#sidenav()?.close();
  }
  
  toggle(): void {
    this.#sidenav()?.toggle();
  }
}
