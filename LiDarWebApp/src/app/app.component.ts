import { Component } from '@angular/core';
import { MqttSocketService } from './mqtt/mqttsocket.service';
import { DataService } from './data.service';
import * as Pako from 'pako';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'LiDarWebApp';
  public pointCloud : PCD[] = [];
  parsedJSON: any;

  constructor(private ds : DataService, private ms : MqttSocketService){}

  // Table Headers to be displayed on Webpage
  headers = ["time", "topic", "x", "y", "z", "intensity"]


  ngOnInit()
  {
    //Scope variable to access point cloud class array
    var app = this;

    this.ms.on('mqtt_message', function(value){
        console.log(value);
        //console.log(pcd);
        console.log(this);
        console.log(value.payload);
        var uncompressedPayload = Pako.inflate(value.payload, { to: 'string' });
        this.parsedJSON = JSON.parse(uncompressedPayload);
        console.log(this.parsedJSON);
        console.log(value.payload.length);
        if (app.pointCloud.length > 10){
          var val = app.pointCloud.pop();
          console.log(val);
        }
        app.pointCloud.push({time: value.time, topic: value.topic, x: this.parsedJSON.x, 
          y: this.parsedJSON.y, z: this.parsedJSON.z, intensity: this.parsedJSON.intensity});
        app.ds.Data = app.pointCloud[0];
    });


  }
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
}
