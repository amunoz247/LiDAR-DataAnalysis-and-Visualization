import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  selectedColor: string;
  colors: string[] = ['Red', 'Green', 'Blue'];

  constructor() { }

  ngOnInit(): void {
  }

}
