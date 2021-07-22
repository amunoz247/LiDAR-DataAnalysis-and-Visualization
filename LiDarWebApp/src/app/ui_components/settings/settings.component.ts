import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '@app/data.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  selectedColor: string;
  selectedPointSize: Number;
  colors: string[] = ['Red (Default)', 'Green', 'Blue'];
  color: Number;
  color2: string = "rgb(0,0,255)";
  colorFormat: string = 'rgb'
  colorMap: Map<string, number> = new Map<string, number>([
    ["Red (Default)", 0xFF0000 ],
    ["Green", 0x00FF00 ],
    ["Blue", 0x0000FF ]
  ]);

  constructor(private router: Router, private ds: DataService) { }

  ngOnInit(): void {
    this.color2 = numberToHex(this.ds.colorValue);
    console.log(this.color2);
    this.selectedColor = this.colors[0];
    this.selectedPointSize = this.ds.pointSizeValue;
  }

  setChanges() {
    console.log("Settings Updated");
    console.log(parseInt(this.color2.substr(1)));
    console.log(hexToNumber(this.color2));
    this.ds.colorValue = hexToNumber(this.color2);//this.color;//this.colorMap.get(this.selectedColor);
    this.ds.pointSizeValue = this.selectedPointSize;
    this.router.navigateByUrl('/visualizations');
  }





}




let numberToHex = function (i) {
   var r = (i >> 16 & 0xFF).toString(16);
   var g = ((i >> 8) & 0xFF).toString(16);
   var b = (i & 0xFF).toString(16);
   if(r.length == 1)
   {
    r = '0' + r;
   }
   if(g.length == 1)
   {
    g = '0' + g;
   }
   if(b.length == 1)
   {
    b = '0' + b;
   }
   console.log(i);
   return '#'+r+g+b;
}


  let hexToRgb = function (hex){
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  }:null;}

let hexToNumber = function(i) {
  let value = hexToRgb(i);
  return (value.r << 16 )+ (value.g << 8) + value.b; 
  
}

