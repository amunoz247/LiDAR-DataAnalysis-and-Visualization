import { Component, OnInit } from '@angular/core';
import { MqttSocketService } from '@app/mqtt/mqttsocket.service';
import { DataService } from '@app/data.service';
import { PCD } from '@app/app.component';
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

  locationObjects: any;
  objectCount: Number = 0;
  messageOutput: String;

  public barData = [
    {
      "name": "Vehicles",
      "value": 11
    },
    {
      "name": "Pedestrians",
      "value": 8
    }
  ];

  public lineData = [
    {
      "name": "Objects",
      "series": [
        {
          "name": "1",
          "value": "8"
        },
        {
          "name": "2",
          "value": "15"
        }
      ],
    }
  ];

  // options for the chart
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisBar = 'Object';
  yAxisBar = 'Count';
  updateInterval: NodeJS.Timer;
  counter = 1;

  // axis labels for line chart
  xAxisLine = 'Seconds';
  yAxisLine = 'Count';

  public layoutGap: string = '30px';

  public barColorScheme = {
    domain: ['#9370DB', '#87CEFA', '#90EE90', '#9370DB', '#FA8072', '#FF7F50']
  };

  public lineColorScheme = {
    domain: ['#FA8072', '#90EE90', '#FF7F50', '#9370DB', '#9370DB', '#87CEFA']
  };


  // Table Headers to be displayed on Webpage
  headers = ["time", "topic", "x", "y", "z", "intensity"]

  constructor(private ds : DataService, private ms : MqttSocketService){

    this.lineData = [{
      "name": "Objects",
      "series": this.initLineChart()
    }];

    this.updateInterval = setInterval(() => this.addRealTimeData(), 2000);
  }


  ngOnInit()
  {
    //Scope variable to access point cloud class array
    var app = this;

    this.ms.on('mqtt_message', function(value){
        console.log(value);
        //console.log(pcd);
        // console.log(this);
        // console.log(value.payload);
        console.log(value.objects);
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
          y: this.parsedJSON.y, z: this.parsedJSON.z, intensity: this.parsedJSON.intensity, 
          objects: value.objects});
        app.ds.Data = app.pointCloud[0];
    });
  }

  onSelect(event) {
    console.log(event);
  }

  initLineChart() {
    const array = [];
    for (let i = 0; i < 100; i++) {
      array.push({
        "name": '0',
        "value": 0
      });
    }
    return array;
  }

  addRealTimeData() {
    this.counter++;
    this.lineData[0].series.shift();

    if(this.ds.Data.topic == this.ds.selectedTopic)
      this.locationObjects = this.ds.Data.objects;

    this.objectCount = this.locationObjects.length;

    // if(this.objectCount == 0)
    //   this.messageOutput = 'No data is currently being streamed.'

    const objCountData =
    {
      "name": this.counter.toString(),
      //"value": this.ds.Data.objects.length
      "value": this.locationObjects.length
    }
    this.lineData[0].series.push(objCountData);
    this.lineData = [...this.lineData];
  }
}
