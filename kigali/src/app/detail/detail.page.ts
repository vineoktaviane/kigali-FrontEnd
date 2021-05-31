import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Geolocation } from '@ionic-native/geolocation/ngx';


declare var google;
@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {
  @ViewChild('mapHome', { static: false }) mapElement: ElementRef;
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  map: any;
  pharmacy : any = {};
  insurances : any = [];
  openingtimes : any = [];
  open:any=[];
  opennow;
  latitude: number;
  longitude: number;
  pharmacylat: number;
  pharmacylong:number;
  pharmacyphone:number;
  pharmacydistance:number;
  walkingMinutes: any;
  carMinutes: any;
  locationUser: any;
  locationPharmacy:any;
  showDown=true;
  showUp=false;
  showMore = false;
  constructor(private route:ActivatedRoute, private geolocation: Geolocation) { 
  }

  ngOnInit() {
    this.loadMap();
    this.route.queryParams.subscribe(res=>
      {
        var open = [];
        console.log(res);
        this.pharmacy = res;
        this.insurances = this.pharmacy.insurances;
        open = JSON.parse(this.pharmacy.openingtimes);
        this.openingtimes = open;
        console.log(this.openingtimes);
        this.opennow = this.pharmacy.openNow;
        this.pharmacylat = this.pharmacy.latitude;
        this.pharmacylong = this.pharmacy.longitude;
        this.pharmacyphone = this.pharmacy.phone;
        this.pharmacydistance = this.pharmacy.distance;
      });
      
      
  }

  loadMap() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.locationUser = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      this.locationPharmacy = new google.maps.LatLng(this.pharmacylat, this.pharmacylong);
     
      let mapOptions = {
        center: new google.maps.LatLng(this.pharmacylat, this.pharmacylong),
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      var map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      
      this.directionsDisplay.setMap(map);
      this.directionsService.route({
        origin:this.locationUser,
        destination:this.locationPharmacy,
        travelMode:'DRIVING'
      },(response,status)=>
      {
        if(status==='OK')
        {
          this.directionsDisplay.setDirections(response);
        }
        else
        {
          window.alert(status);
        }
      });

      var serviceDriving = new google.maps.DistanceMatrixService();
      serviceDriving.getDistanceMatrix({
        origins:[this.locationUser],
        destinations:[this.locationPharmacy],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways:false,
        avoidTolls:false
      },
      (response,status)=>{
        if(status !== 'OK')
        {
          console.log(status);
        }
        else
        {
          this.carMinutes = (response.rows[0].elements[0].duration.text).toString();
          console.log(this.carMinutes)
        }
      })

      var serviceWalking = new google.maps.DistanceMatrixService();
      serviceWalking.getDistanceMatrix({
        origins:[this.locationUser],
        destinations:[this.locationPharmacy],
        travelMode: google.maps.TravelMode.WALKING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways:false,
        avoidTolls:false
      },
      (response,status)=>{
        if(status !== 'OK')
        {
          console.log(status);
        }
        else
        {
          this.walkingMinutes = (response.rows[0].elements[0].duration.text).toString();
          console.log(this.walkingMinutes)
        }
      })
      
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  
  navigate()
  {
    console.log(this.pharmacylat);
    window.open('https://www.google.com/maps/dir/?api=1&destination='+ this.pharmacylat +',' + this.pharmacylong);
  }
  call() {
    window.open(`tel:${this.pharmacyphone}`, '_system');
  }

  Toggle()
  {
    if(this.showUp)
    {
      this.showMore = false;
      this.showUp = false;
      this.showDown = true;
    }
    else if(this.showDown)
    {
      this.showMore = true;
      this.showUp = true;
      this.showDown = false;
    }
  }

}