import { Component } from '@angular/core';
import { MqttSocketService } from './mqtt/mqttsocket.service';
import { DataService } from './data.service';
import * as Pako from 'pako';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

// Main App Component Class
export class AppComponent {
  title = 'LiDarWebApp';

  constructor(private ds : DataService, private ms : MqttSocketService){}

  ngOnInit(){}
}

// Point Cloud class to handle data from MQTT messages
export class PCD{
  time:string;
  topic:string;

  //Payload point cloud values
  x:[];
  y:[];
  z:[];
  intensity:[];
  objects:any;
}
