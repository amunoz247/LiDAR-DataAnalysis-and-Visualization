import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
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
  @ViewChild('flexLayoutContainer') flexLayoutContainerElement: ElementRef;

  public pointCloud : PCD[] = [];
  parsedJSON: any;

  pastTime: String;
  public messageCounter: number;
  public selectedLocation: string = this.ds.selectedTopic;

  locationObjects: any;
  objectCount: Number = 0;
  messageOutput: String;

  public barData = [];

  public lineData = [];

  // options for the chart
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  showYAxisLabel = true;
  xAxisBar = 'Object';
  yAxisBar = 'Count';
  timeline: boolean = true;
  updateInterval: NodeJS.Timer;
  updateBar: NodeJS.Timer;
  counter = 1;

  // axis labels for line chart
  xAxisLine = 'Seconds';
  yAxisLine = 'Count';

  public layoutGap: string = '25px';
  private breakpointObserver: BreakpointObserver;

  public barColorScheme = {
    domain: ['#9370DB', '#87CEFA', '#90EE90', '#9370DB', '#FA8072', '#FF7F50']
  };

  public lineColorScheme = {
    domain: ['#FA8072', '#90EE90', '#FF7F50', '#9370DB', '#9370DB', '#87CEFA']
  };


  // Table Headers to be displayed on Webpage
  headers = ["time", "topic", "x", "y", "z", "intensity"]

  public elementStyle: object = {
    'height.px': 20
  };

  public containerStyle: object = {
    'width.px': 256
  }

  constructor(private ds : DataService, private ms : MqttSocketService, private bp: BreakpointObserver){

    bp.observe([
        Breakpoints.XSmall,
    ]).subscribe((result: any) => {
        if (result.matches) {
            this.layoutGap = '8px';
        }
    });

    bp.observe([
        Breakpoints.Small,
    ]).subscribe((result: any) => {
        if (result.matches) {
            this.layoutGap = '25px';
        }
    });

    bp.observe([
        Breakpoints.Medium,
    ]).subscribe((result: any) => {
        if (result.matches) {
            this.layoutGap = '25px';
        }
    });

    // this.barData = [
    //   {
    //     "name": "Vehicles",
    //     "series": this.initLineChart()
    //   },
    //   {
    //     "name": "Pedestrians",
    //     "series": this.initLineChart()
    //   }
    // ];

    this.lineData = [{
      "name": "Objects",
      "series": this.initLineChart()
    }];

    this.updateInterval = setInterval(() => this.addRealTimeData(), 2000);
    // this.updateBar = setInterval(() => this.addObjectData(), 2000);
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

  onResize($event: Event) {
    this.setSize();
  }

  setSize() {
    this.elementStyle['height.px'] = this.flexLayoutContainerElement.nativeElement.offsetHeight;
    this.containerStyle['width.px'] = this.flexLayoutContainerElement.nativeElement.clientWidth;
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
    // Create count variables for bar graph
    let carCount = 0;
    let pedestrianCount = 0;

    // Increament Counter for line graph and series to shift for each update
    this.counter++;
    this.lineData[0].series.shift();

    // Check for selected topic and set objects of that topic to dictionary
    if(this.ds.Data.topic == this.ds.selectedTopic) {
      this.locationObjects = this.ds.Data.objects;

      // Loops through data service object list and calculates volume of objects
      for(let i = 0; i < this.ds.Data.objects.length; i++) {
        let xsize = this.ds.Data.objects[i].maxx - this.ds.Data.objects[i].minx;
        let ysize = this.ds.Data.objects[i].maxy - this.ds.Data.objects[i].miny;
        let zsize = this.ds.Data.objects[i].maxz - this.ds.Data.objects[i].minz;

        let volume = xsize * ysize * zsize;

        // Average volume of pedestrian
        if(volume > 0.1) {
          carCount++;
        }
        else {
          pedestrianCount++;
        }
      }

      // Assign count values for cars and pedestrians
      // const objCountData = [
      //   {
      //     "name": this.counter.toString(),
      //     "value": carCount
      //   },
      //   {
      //     "name": this.counter.toString(),
      //     "value": pedestrianCount
      //   }
      // ];

      this.barData =  [
        {
          "name": "Vehicles",
          "value": carCount
        },
        {
          "name": "Pedestrians",
          "value": pedestrianCount
        }
      ];

      // this.barData[0].series.push(objCountData);
      this.barData = [...this.barData];
    }


    // Obtain total object count for real time line graph
    this.objectCount = this.locationObjects.length;

    // Conditional to check if new messages are coming through
    if(this.pastTime == this.ds.Data.time) {
      this.messageCounter++;
    }
    else {
      this.messageCounter = 0;
    }

    if(this.messageCounter >= 30) {
      this.objectCount = 0;
    }

    // if(this.objectCount == 0)
    //   this.messageOutput = 'No data is currently being streamed.'

    // Assign Real Time Total object count to line graph
    const totalCountData =
    {
      "name": this.counter.toString(),
      //"value": this.ds.Data.objects.length
      "value": this.objectCount 
    }
    this.lineData[0].series.push(totalCountData);
    this.lineData = [...this.lineData];

    this.pastTime = this.ds.Data.time;

  }
}
