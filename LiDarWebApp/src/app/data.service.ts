import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {HttpClient, HttpHeaders } from '@angular/common/http';
import { PCD } from './app.component';

@Injectable({
  providedIn: 'root',
})
export class DataService {

  public Data : PCD;

  topicURL : string = 'http://localhost:5000/topics';
  public selectedTopic : string = 'test15thVirginiaSE';

  constructor(private http: HttpClient) { }

  getTopic(): Observable<string[]>{
    return this.http.get<string[]>(this.topicURL)
  }

}

// export class topics {

// }
