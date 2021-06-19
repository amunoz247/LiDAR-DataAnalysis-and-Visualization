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


export class RendererComponent implements AfterViewInit {
  private pcdScene: Scene;
  private pcamera: PerspectiveCamera;
  private pcdPoints: Points;
  public renderer: WebGLRenderer;
  public controls: OrbitControls;

  @ViewChild( 'canvas' ) canvasReference: ElementRef;
  get canvas(): HTMLCanvasElement { return this.canvasReference.nativeElement; }

  constructor( private ds: DataService, readonly zone: NgZone ) {
    this.pcdScene = new Scene();
    this.pcamera = new PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
  }

  @Input() color: string | number | Color = 0x000000;
  @Input() alpha = 0;
  
  ngAfterViewInit()
  {

    var stats = new STATS();
    stats.showPanel( 1 );
    document.body.appendChild( stats.dom );

    var geometry = new BufferGeometry();
    var positions = new Array(80000 * 3);
    var colors = new Array(80000 * 3);
    for (var index = 0; index < 80000 * 3; index++) {
      positions[index] = 0;
      colors[index] = 0;
    }
    
    if ( positions.length > 0 ) geometry.addAttribute( 'position', new Float32BufferAttribute( positions, 3 ) );
    //if ( normal.length > 0 ) geometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( normal, 3 ) );
    if ( colors.length > 0 ) geometry.addAttribute( 'color', new Float32BufferAttribute( colors, 3 ) );

    // geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
    var material = new PointsMaterial( { size: 1.0, color: 0xffffff, vertexColors: true });
    this.pcdPoints = new Points( geometry, material );
    this.pcdScene.add( this.pcdPoints );
    this.pcdScene.background = new Color(0x000000);

    //this.pcamera = new PerspectiveCamera(50, 4 / 3, .5, 1000); // camera
    this.pcamera.updateProjectionMatrix();
    this.pcamera.position.set(50, 50, 50);
    //this.pcamera.lookAt(0, 0, 0);
    this.pcamera.lookAt( this.pcdScene.position );


    this.renderer = new WebGLRenderer( { canvas: this.canvas, antialias: true, alpha: true } ); // render
    this.renderer.setPixelRatio( devicePixelRatio );
    this.renderer.setClearColor( this.color, this.alpha );
    this.renderer.setSize( window.innerWidth/2, window.innerHeight/2 );
    this.renderer.autoClear = true;
    //document.getElementById('demo').appendChild(this.renderer.domElement);

    this.controls = new OrbitControls( this.pcamera, this.canvas );
    this.controls.autoRotate = false;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.update();

    this.pcamera.position.x = 0;
    this.pcamera.position.z = 30;


    this.zone.runOutsideAngular( _ => 
    {
      const animate = () =>
      {
        this.renderer.clear();
        requestAnimationFrame( animate );
        stats.begin();
        this.updateBuffer();

        this.controls.update();
        this.render();
                stats.end();

      };
      animate();
    } )
  }
  updateBuffer() { 
    var vertices = [];
    var vertX = this.ds.Data['x'];
    var vertY = this.ds.Data['y'];
    var vertZ = this.ds.Data['z'];
    var intensity = this.ds.Data['intensity']; 
    console.log("vertx: ", this.ds.Data['x']);
    const positions = this.pcdPoints.geometry.attributes.position.array;
    const colors = this.pcdPoints.geometry.attributes.color.array;


    for ( var i=0; i < vertX.length; i++ ){
      this.pcdPoints.geometry.attributes.position.setXYZ(i, vertX[i], vertY[i], vertZ[i]);
      this.pcdPoints.geometry.attributes.color.setXYZ(i, 255, 0, 0);
      //vertices.push(vertX[i], vertY[i], vertZ[i]);
    }

    // for(var index = 0; index < vertices.length; index++) {
    //   positions[index] = vertices[index];
    //   this.pcdPoints.geometry.attributes.color.array[index] = colors[index];
    //   if(isNaN(positions[index]))
    //   console.log(positions[index])
    // }

    // if(vertices.length < this.pcdPoints.geometry.drawRange.count && isFinite(this.pcdPoints.geometry.drawRange.count)) {
    //   //console.log(mesh.geometry.drawRange.count);
    //   for(var index = vertices.length; index < this.pcdPoints.geometry.drawRange.count; index++) {
    //     this.pcdPoints.geometry.attributes.position.array[index] = 0;
    //     //this.pcdPoints.geometry.attributes.color.array[index] = 0;
    //   }
    // }

    //console.log(position.length/3.0);
    //console.log(mesh.geometry);
    this.pcdPoints.geometry.attributes.position.needsUpdate = true;
    this.pcdPoints.geometry.attributes.color.needsUpdate = true;
    this.pcdPoints.geometry.setDrawRange(0, vertX.length*3);
    this.pcdPoints.geometry.computeBoundingSphere();
    console.log(this.pcdPoints.geometry);
  }
  render() { console.log('Hello Im working'); this.renderer.render( this.pcdScene, this.pcamera ); }
}



/***************Test Code that renders rotating cube into scene using THREE.js***************/

/*export class RendererComponent
{
  private renderer: WebGLRenderer;
  private pcamera: PerspectiveCamera;
  private cubeScene: Scene;
  @ViewChild( 'canvas' ) canvasReference: ElementRef;
  get canvas(): HTMLCanvasElement { return this.canvasReference.nativeElement; }

  constructor( readonly zone: NgZone ) {}

  @Input() color: string | number | Color = 0xffffff;
  @Input() alpha = 0;
  
  ngAfterViewInit()
  {
    this.cubeScene = new Scene();
    this.pcamera = new PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    this.renderer = new WebGLRenderer( { canvas: this.canvas, antialias: true, alpha: true } );
    this.renderer.setPixelRatio( devicePixelRatio );
    //this.renderer.setClearColor( this.color, this.alpha );
    this.renderer.setSize( window.innerWidth/2, window.innerHeight/2 );
    this.renderer.autoClear = true;

    var geometry = new BoxGeometry( 1, 1, 1 );
    var material = new MeshBasicMaterial( { color: 0x00ff00 } );
    var cube = new Mesh( geometry, material );
    //this.cubeScene.add( cube );
        this.cubeScene.background = new Color(0x000000);


    this.pcamera.position.z = 5;


    this.zone.runOutsideAngular( _ => 
    {
      const animate = () =>
      {
        requestAnimationFrame( animate );
          // cube.rotation.x += 0.01;
          // cube.rotation.y += 0.01;
          this.render();
      };
      animate();
    } )
  }
  render() { console.log('Hello Im working'); this.renderer.render( this.cubeScene, this.pcamera ); }
}*/