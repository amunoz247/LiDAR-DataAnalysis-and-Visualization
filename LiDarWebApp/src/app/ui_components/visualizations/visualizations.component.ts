/* Visualization Dashboard Component.
  Class to initialize bar chart and line graph and
  pass in near real time data from the data service. */
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

  // Create Point Cloud and JSON Array to store and pass incoming data from backend to front end dataservice
  public pointCloud : PCD[] = [];
  parsedJSON: any;

  // Create time and message count variables
  pastTime: String;
  public messageCounter: number;

  // Get Selected Topic from the dataservice
  public selectedLocation: string = this.ds.selectedTopic;

  // Additional Variables to store object information
  locationObjects: any;
  objectCount: Number = 0;
  carCount: number = 0;
  pedestrianCount: number = 0;
  messageOutput: String;

  // Initialize Chart Arrays
  public barData = [];
  public lineData = [];

  // Initialize Options for the charts
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

  // Axis labels for line chart
  xAxisLine = 'Seconds';
  yAxisLine = 'Count';

  // Gap for between the charts/material cards
  public layoutGap: string = '25px';

  // Observer to resize items when window resized
  private breakpointObserver: BreakpointObserver;

  // Color Schemes for both charts
  public barColorScheme = {
    domain: ['#9370DB', '#87CEFA', '#90EE90', '#9370DB', '#FA8072', '#FF7F50']
  };

  public lineColorScheme = {
    domain: ['#FA8072', '#90EE90', '#FF7F50', '#9370DB', '#9370DB', '#87CEFA']
  };

  // Table Headers to be displayed on Webpage
  headers = ["time", "topic", "x", "y", "z", "intensity"]

  // Stores general height and width of items
  public elementStyle: object = {
    'height.px': 20
  };

  public containerStyle: object = {
    'width.px': 256
  }

  constructor(private ds : DataService, private ms : MqttSocketService, private bp: BreakpointObserver){

    // Breakpoint variables to resize items in window
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

    // Set Line Graph
    this.lineData = [{
      "name": "Objects",
      "series": this.initLineChart()
    }];

    // Updates graphs every two seconds
    this.updateInterval = setInterval(() => this.addRealTimeData(), 2000);
  }


  ngOnInit()
  {
    //Scope variable to access point cloud class array
    var app = this;

    this.ms.on('mqtt_message', function(value){
        const compressed = new Uint8Array(value.payload);
        const uncompressedPayload = fzstd.decompress(compressed);
        var string = new TextDecoder().decode(uncompressedPayload);
        console.log(string);
        this.parsedJSON = JSON.parse(string);

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

  // Allows for charts to be interactable
  onSelect(event) {
    console.log(event);
  }

  // Resizes window in the event of a change
  onResize($event: Event) {
    this.setSize();
  }

  // Sets size of the window using flex layout
  setSize() {
    this.elementStyle['height.px'] = this.flexLayoutContainerElement.nativeElement.offsetHeight;
    this.containerStyle['width.px'] = this.flexLayoutContainerElement.nativeElement.clientWidth;
  }

  // Function to initialize line chart
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

  // Function to add data to both charts
  addRealTimeData() {
    // Set Car and Pedestrian Counts
    this.carCount = 0;
    this.pedestrianCount = 0;

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
          this.carCount++;
        }
        else {
          this.pedestrianCount++;
        }
      }

      // Assign count values for cars and pedestrians
      // const objCountData = [
      //   {
      //     "name": this.counter.toString(),
      //     "value": carCount
      //   },
      //   {
      //     "name2": this.counter.toString(),
      //     "value2": pedestrianCount
      //   }
      // ];

      // this.barData[0].series.push(objCountData);
      // this.barData = [...this.barData];

      // Pass in count values to bar chart
      this.barData =  [
        {
          "name": "Vehicles",
          "value": this.carCount
        },
        {
          "name": "Pedestrians",
          "value": this.pedestrianCount
        }
      ];
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

    // If no messages are coming through then set counts to 0
    if(this.messageCounter >= 30) {
      this.objectCount = 0;
      this.carCount = 0;
      this.pedestrianCount = 0;
    }

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
