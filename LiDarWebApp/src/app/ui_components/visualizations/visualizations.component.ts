import { Component, OnInit } from '@angular/core';
import { MqttSocketService } from '@app/mqtt/mqttsocket.service';
import { DataService } from '@app/data.service';
import { PCD } from '@app/app.component';
import * as BSON from 'bson';
import * as Pako from 'pako';

@Component({
  selector: 'app-visualizations',
  templateUrl: './visualizations.component.html',
  styleUrls: ['./visualizations.component.css']
})
export class VisualizationsComponent implements OnInit {

  public pointCloud : PCD[] = [];
  parsedJSON: any;

  constructor(private ds : DataService, private ms : MqttSocketService){}

  pageName = 'Data Visualization Dashboard';

  // options for the chart
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Country';
  showYAxisLabel = true;
  yAxisLabel = 'Sales';
  timeline = true;

  colorScheme = {
    domain: ['#9370DB', '#87CEFA', '#FA8072', '#FF7F50', '#90EE90', '#9370DB']
  };

  public barData = [
    {
      "name": "China",
      "value": 2243772
    },
    {
      "name": "USA",
      "value": 1126000
    },
    {
      "name": "Norway",
      "value": 296215
    },
    {
      "name": "Japan",
      "value": 257363
    },
    {
      "name": "Germany",
      "value": 196750
    },
    {
      "name": "France",
      "value": 204617
    }
  ];

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

        //var uncompressedPayload = Pako.inflate(value.payload);
        //this.parsedJSON = BSON.deserialize(value.payload);
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

  onSelect(event) {
    console.log(event);
  }
}
