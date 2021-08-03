/* MQTT Socket Service Class.
  Uses socketio library to connect to Flask backend
  through websokcets to pull in data. */
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
 providedIn: 'root'
})

//Class that connects to Flask App through websockets and emits MQTT messages
export class MqttSocketService extends Socket {
 constructor() {
   super({url: 'http://localhost:5000', options: { origin: '*:*' , withCredentials: false} 
   //, transport : ['websocket']}
   });
 }

 public dispatch(messageType: string, payload: any) {
   this.emit(messageType, payload);
 }

 public subscribeToMessage(messageType: string): Observable<any> {
   return this.fromEvent(messageType);
 }
}