import { Injectable } from '@angular/core';
import { PCD } from './app.component';

@Injectable({
  providedIn: 'root',
})
export class DataService {

  public Data : PCD;

  constructor() { }
}

