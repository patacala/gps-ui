import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadService {
  activeBtnLoadName: string = '';

  constructor() { }

  setActiveBtnLoad(buttonName: string) {
    this.activeBtnLoadName = buttonName;
  }

  getActiveBtnLoad() {
    return this.activeBtnLoadName;
  }

  clearActiveBtnLoad() {
    this.activeBtnLoadName = '';
  }
}
