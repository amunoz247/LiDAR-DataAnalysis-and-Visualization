import { Component, OnInit } from '@angular/core';
import { MqttSocketService } from '@app/mqtt/mqttsocket.service';
import { DataService } from '@app/data.service';
import { PCD } from '@app/app.component';
import * as BSON from 'bson';
import * as Pako from 'pako';
import * as fzstd from 'fzstd';

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
  showYAxisLabel = true;
  xAxisBar = 'Object';
  yAxisBar = 'Count';
  timeline = true;

  // axis labels for line chart
  xAxisLine = 'Minutes';
  yAxisLine = 'Count';

  public layoutGap: string = '30px';

  public barColorScheme = {
    domain: ['#9370DB', '#87CEFA', '#90EE90', '#9370DB', '#FA8072', '#FF7F50']
  };

  public lineColorScheme = {
    domain: ['#FA8072', '#90EE90', '#FF7F50', '#9370DB', '#9370DB', '#87CEFA']
  };

  public barData = [
    {
      "name": "Vehicles",
      "value": 235
    },
    {
      "name": "Pedestrians",
      "value": 77
    }
  ];

  public multiLineData = [
    {
      "name": "Vehicles",
      "series": [
        {
          "name": "1",
          "value": "8"
        },
        {
          "name": "2",
          "value": "15"
        },
        {
          "name": "3",
          "value": "7"
        },
        {
          "name": "4",
          "value": "8"
        }
      ],
    },
    {
      "name": "Pedestrians",
      "series": [
        {
          "name": "1",
          "value": "12"
        },
        {
          "name": "2",
          "value": "14"
        },
        {
          "name": "3",
          "value": "11"
        },
        {
          "name": "4",
          "value": "9"
        }
      ],
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
        // var uncompressedPayload = Pako.inflate(value.payload, { to: 'string' });
        const compressed = new Uint8Array(value.payload);
        const uncompressedPayload = fzstd.decompress(compressed);
        console.log(uncompressedPayload);
        var string = new TextDecoder().decode(uncompressedPayload);
        console.log(string);
        this.parsedJSON = JSON.parse(string);

        //var uncompressedPayload = Pako.inflate(value.payload);
        //this.parsedJSON = BSON.deserialize(value.payload);
        console.log(this.parsedJSON.y.length);
        console.log(value.payload.length);
        if (app.pointCloud.length > 2){
          var val = app.pointCloud.shift();
          console.log(val);
        }
        console.log(app.pointCloud.length);
        app.pointCloud.push({time: value.time, topic: value.topic, x: this.parsedJSON.x, 
          y: this.parsedJSON.y, z: this.parsedJSON.z, intensity: this.parsedJSON.intensity});
        app.ds.Data = app.pointCloud[0];
    });
  }

  onSelect(event) {
    console.log(event);
  }
}
