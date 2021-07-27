/**************************************************************************
 * Renderer Component
 * Author: Andrew Munoz
 * Date: June 2021
 * Purpose: Renders the 3D point cloud mesh. Takes in data from the
 * singleton DataService and uses the three.js library to render the
 * points within a scene.
 *************************************************************************/

import { AfterViewInit, Component,  Input, ViewChild, ElementRef, ContentChild, NgZone } from '@angular/core';
import { DataService } from '../data.service';
import { Color, WebGLRenderer, PerspectiveCamera, BoxGeometry, BufferGeometry, Float32BufferAttribute, Points,
  PointsMaterial, MeshBasicMaterial, Mesh, Scene } from 'three';
import { OrbitControls } from '@avatsaev/three-orbitcontrols-ts';
import * as STATS from 'stats-js';

@Component
({
  selector: 'three-renderer',
  template: '<canvas #canvas></canvas>'
})

// Main Class
export class RendererComponent implements AfterViewInit {
  private pcdScene: Scene;
  private pcamera: PerspectiveCamera;
  private pcdPoints: Points;
  public renderer: WebGLRenderer;
  public controls: OrbitControls;

  @ViewChild( 'canvas' ) canvasReference: ElementRef;
  get canvas(): HTMLCanvasElement { return this.canvasReference.nativeElement; }

  // Constructor builds three scene and camera
  constructor( private ds: DataService, readonly zone: NgZone ) {
    this.pcdScene = new Scene();
    this.pcamera = new PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  }

  @Input() color: string | number | Color = 0x000000;
  @Input() alpha = 0;
  
  // Main Function that implements on Init
  ngAfterViewInit()
  {
    // Create Stats variable to run and show fps of app in upper left corner
    var stats = new STATS();
    var showStats = false; // Needs to be switched to true to make panel show in if statement below

    if(showStats) {
      stats.showPanel( 1 );
      document.body.appendChild( stats.dom );
    }

    // Create three elements 
    var geometry = new BufferGeometry();
    var positions = new Array(80000 * 3);
    var colors = new Array(80000 * 3);
    for (var index = 0; index < 80000 * 3; index++) {
      positions[index] = 0;
      colors[index] = 0;
    }
    
    if ( positions.length > 0 ) geometry.addAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
    if ( colors.length > 0 ) geometry.addAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

    // Set three material, points, scene and camera elements to default values
    var material = new PointsMaterial( { size: this.ds.pointSizeValue, color: 0xffffff, vertexColors: true });
    this.pcdPoints = new Points( geometry, material );
    this.pcdScene.add( this.pcdPoints );
    this.pcdScene.background = new Color(0x000000);

    this.pcamera.updateProjectionMatrix();
    this.pcamera.position.set(0, -25, 0);
    this.pcamera.lookAt( this.pcdScene.position );

    // Set three renderer and controls
    this.renderer = new WebGLRenderer( { canvas: this.canvas, antialias: true, alpha: true } ); // render
    this.renderer.setPixelRatio( devicePixelRatio );
    this.renderer.setClearColor( this.color, this.alpha );
    this.renderer.setSize( window.innerWidth/2, window.innerHeight/2 );
    this.renderer.autoClear = true;

    this.controls = new OrbitControls( this.pcamera, this.canvas );
    this.controls.autoRotate = false;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.update();

    this.pcamera.position.x = 0;
    this.pcamera.position.z = 30;

    // Function runs animate outside of Angular to not overload the app
    this.zone.runOutsideAngular( _ => 
    {
      const animate = () =>
      {
        this.renderer.clear();
        requestAnimationFrame( animate );
        stats.begin();

        // Checks that data is coming through and that the topic matches the selected topic
        if(this.ds.Data != null && this.ds.Data.topic == this.ds.selectedTopic) {
          console.log(this.ds.Data);
          console.log(this.ds.Data.topic + ' ' + this.ds.selectedTopic);
          console.log(this.ds.Data.topic);
          this.updateBuffer();
        }

        this.controls.update();
        this.render();
        stats.end();
      };
      animate();
    } )
  }

  // Function that updates the position and color of the points
  updateBuffer() { 
    var vertices = [];
    var vertX = this.ds.Data['x'];
    var vertY = this.ds.Data['y'];
    var vertZ = this.ds.Data['z'];
    var intensity = this.ds.Data['intensity'];
    const colorPicked = new Color(this.ds.colorValue);
    const positions = this.pcdPoints.geometry.attributes.position.array;
    const colors = this.pcdPoints.geometry.attributes.color.array;

    for ( var i=0; i < vertX.length; i++ ){
      this.pcdPoints.geometry.attributes.position.setXYZ(i, vertX[i], vertY[i], vertZ[i]);
      this.pcdPoints.geometry.attributes.color.setXYZ(i, colorPicked.r, colorPicked.g, colorPicked.b);
    }

    this.pcdPoints.geometry.attributes.position.needsUpdate = true;
    this.pcdPoints.geometry.attributes.color.needsUpdate = true;
    this.pcdPoints.geometry.setDrawRange(0, vertX.length*3);
    this.pcdPoints.geometry.computeBoundingSphere();
    console.log(this.ds.Data['x'].length);
  }

  // Call to render function which renders the main scene
  render() { console.log('Render is being called'); this.renderer.render( this.pcdScene, this.pcamera ); }
}
