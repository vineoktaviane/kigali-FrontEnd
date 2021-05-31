import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Data } from '../shared/data';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { HttpClient } from '@angular/common/http';
import {map} from 'rxjs/operators'


@Injectable({
  providedIn: 'root'
}) 
export class DataService {
  public pharmacyDetails: any =[];
  

  constructor(public geolocation: Geolocation,public http: HttpClient) {};

  getData()
  {
    return this.http.get('http://51.195.117.140:9000/pharmacys/')
  }
}
