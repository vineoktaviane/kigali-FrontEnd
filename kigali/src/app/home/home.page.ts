import { Component, ViewChild, ElementRef } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder, NativeGeocoderResult, NativeGeocoderOptions } from '@ionic-native/native-geocoder/ngx';
import { DataService } from "../services/data.service";
import { Data } from '../shared/data';
import { Platform } from '@ionic/angular';

import { Router } from '@angular/router';
import { parse } from 'url';
import { async } from '@angular/core/testing';
import { JsonPipe } from '@angular/common';

declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  @ViewChild('map', { static: false }) mapElement: ElementRef;
 
  map: any;
  latitude: number;
  longitude: number; 
  result: any;
  medicineNameInput: string;
  insuranceNameInput: string;
  infoWindows: any = [];
  userLocationLat:number;
  userLocationLong: number;
  latLngUser:any;
  locationData: any=[];
  trial: any=[];

  unselectedkm5 = true;
  selectedkm5 = false;
  unselectedkm10 = true;
  selectedkm10 = false;
  unselectedkm20 = true;
  selectedkm20 = false;
  unselectedkm = false;
  selectedkm = true;
  selected_value: any;

  public searchMedicine: string = "";
  public searchInsurance: string = "";
  public pharmacyFilterResult : any =[];
  public pharmacyFilterResultByMedicine: any = [];
  public pharmacyFilterResultByInsurance: any = [];
  public pharmacyFilterResultByBoth: any = [];
  public pharmacyFilterByDistance: any=[];
  public pharmacyFilterResultByOpenNow: any = [];
  
  checkOpenNow = false;
  filterDistance = false;
  openNow;
  showResult = false;
  showMedicineInfo = false;
  showInsuranceInfo = false;
  showUp = false;
  showDown = false;
  date: any;
  day : any;
  hour : any;
  days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  constructor(
    private geolocation: Geolocation,
    private router : Router,
    private dataService: DataService,
    private platform:Platform) {}

  ngOnInit() 
  {
    this.loadMap();
  }

  loadMap() {
    this.getDatabase();
    this.geolocation.getCurrentPosition().then((resp) => {
    this.userLocationLat = resp.coords.latitude;
    this.userLocationLong = resp.coords.longitude;
    this.ShowMapMarkers();
  }).catch((error) => {
    console.log('Error getting location', error);
  }); 
};

//get database and update the database format
  getDatabase()
  {
    this.date = new Date();
    this.day = this.days[ this.date.getDay() ]
    this.hour = this.date.getHours();
    var newArrayInsurance = [];
    var newArrayMedicine = [];
    var newArrayOpeningtimes = [];
    
    this.dataService.getData().subscribe(data =>
      {
        this.locationData = data;
        console.log(this.locationData);
        for(var i=0; i<this.locationData.length; i++)
        {
          newArrayInsurance  = this.locationData[i].insurances.split(",");
          newArrayMedicine  = this.locationData[i].medicines.split(",");
          this.locationData[i].insurances = newArrayInsurance;
          this.locationData[i].medicines = newArrayMedicine;
          this.locationData[i].openingtimes.replace("\\", "");
          newArrayOpeningtimes = JSON.parse(this.locationData[i].openingtimes);
          this.locationData[i].openingtimes = newArrayOpeningtimes;
          var location = new google.maps.LatLng(this.locationData[i].latitude, this.locationData[i].longitude);
          this.latLngUser = new google.maps.LatLng(this.userLocationLat, this.userLocationLong);
          var distance = google.maps.geometry.spherical.computeDistanceBetween(this.latLngUser,location);
          var distanceKilometers = (distance * 0.001).toFixed(2);
          this.locationData[i].distance = distanceKilometers;
          for(var j = 0; j<this.locationData[i].openingtimes.length; j++)
            {
            if(this.locationData[i].openingtimes[j].day === this.day && this.hour >= this.locationData[i].openingtimes[j].open && this.hour < this.locationData[i].openingtimes[j].close)
            {
              this.openNow = true;
              break;
            }
            else
            {
              this.openNow = false;
            }
          }
          this.locationData[i].opennow = this.openNow;
        }
        this.locationData = this.locationData.sort((a,b)=> (a.distance > b.distance ? 1 : -1));
        console.log(this.locationData);
      });
      return this.locationData;
  }
  
  //show the google maps markers on the pharmacy location provided
  ShowMapMarkers()
  {
    this.latLngUser = new google.maps.LatLng(this.userLocationLat, this.userLocationLong);
      let mapOptions = {
        center: this.latLngUser,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      //customize the icon for user location 
      var markerIcon=
      {
        url: 'https://www.flaticon.com/svg/static/icons/svg/1828/1828677.svg',
        scaledSize: new google.maps.Size(30,30),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(20,40)
      }
      var map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
       
      let markerUserLocation = new google.maps.Marker({
        position:new google.maps.LatLng(this.userLocationLat, this.userLocationLong),
        icon:markerIcon,
        map
      });
      //check if there is no filter input
      if(!this.searchMedicine && !this.searchInsurance)
      {
        console.log("no user input");
        this.selectedkm = false;
        this.showResult = false;
        this.showDown = false;
        this.showUp=false;
      }
      else
      {
        //to fetch the json data and show the location of the available pharmacy
        this.locationData = this.pharmacyFilterResult; 
        console.log(this.locationData);
        //loop through the json array and show the pharmacy location
      }
      
      //function to add markers for each pharmacy
      for(var data of this.locationData)
          {
          var location = new google.maps.LatLng(data.latitude, data.longitude);
          this.latLngUser = new google.maps.LatLng(this.userLocationLat, this.userLocationLong);
          var distance = google.maps.geometry.spherical.computeDistanceBetween(this.latLngUser,location);
          var distanceKilometers = (distance * 0.001).toFixed(2);
          var marker2 = new google.maps.Marker(
            {
              position:new google.maps.LatLng(data.latitude, data.longitude),
              map,
              name:data.name,
              medicines: data.medicines,
              insurances: data.insurances,
              address : data.address,
              id: data.id,
              image: data.image,
              openingtimes: JSON.stringify(data.openingtimes),
              latitude: data.latitude,
              longitude: data.longitude,
              phone: data.phone,
              distance: distanceKilometers,
              openNow : data.opennow
            }
          );
          this.addInfoWindowToMarker(marker2);
        };
  }

  //update the markers based on the filtered result
  showMapMarkers2()
  {
    this.latLngUser = new google.maps.LatLng(this.userLocationLat, this.userLocationLong);
      let mapOptions = {
        center: this.latLngUser,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      //custom marker for user location
      var markerIcon=
      {
        url: 'https://www.flaticon.com/svg/static/icons/svg/1828/1828677.svg',
        scaledSize: new google.maps.Size(30,30),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(20,40)
      }
      var map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
      let markerUserLocation = new google.maps.Marker({
        position:new google.maps.LatLng(this.userLocationLat, this.userLocationLong),
        map,
        icon:markerIcon
      });
      //put the marker on each pharmacy filter result
   for(var data of this.pharmacyFilterResult)
          {
          var location = new google.maps.LatLng(data.latitude, data.longitude);
          this.latLngUser = new google.maps.LatLng(this.userLocationLat, this.userLocationLong);
          var distance = google.maps.geometry.spherical.computeDistanceBetween(this.latLngUser,location);
          var distanceKilometers = (distance * 0.001).toFixed(2);
          var marker2 = new google.maps.Marker(
            {
              position:new google.maps.LatLng(data.latitude, data.longitude),
              map,
              name:data.name,
              medicines: data.medicines,
              insurances: data.insurances,
              address : data.address,
              id: data.id,
              image: data.image,
              openingtimes: JSON.stringify(data.openingtimes),
              latitude: data.latitude,
              longitude: data.longitude,
              phone: data.phone,
              distance: distanceKilometers,
              openNow : data.openNow
            }
          );
          this.addInfoWindowToMarker(marker2);
        };
      }

  //add info window with the detailed information for each pharmacy
  addInfoWindowToMarker(marker)
  {
    var infoWindowContent
    if(marker.openNow === true)
    {
      infoWindowContent = '<div id="content">' +
      '<h5 style="color:#69bb7b">' + marker.name +'</h5>'+
      '<p>' + 'Address:' + marker.address +'</p>' +
      '<p style="color:#69bb7b">' + "Open Now" +'</p>' +
      '<p>' + 'Distance:' + marker.distance +'km' +'</p>' +
      '<ion-button color="new" id="' + marker.id +'">' +'See more'+'</ion-button>'+
      '</div>';
    }
    else
    {
      infoWindowContent = '<div id="content">' +
      '<h5 style="color:#69bb7b">' + marker.name +'</h5>'+
      '<p>' + 'Address:' + marker.address +'</p>' +
      '<p style="color:red">' + "close Now" +'</p>' +
      '<p>' + 'Distance:' + marker.distance +'km' +'</p>' +
      '<ion-button color="new" id="' + marker.id +'">' +'See more'+'</ion-button>'+
      '</div>';
    }
    
    let infoWindow = new google.maps.InfoWindow({
      content:infoWindowContent
    });
    marker.addListener('click',()=>{
      this.closeAllInfoWindows();
      infoWindow.open(this.map, marker);
    });

    google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
      document.getElementById(marker.id).addEventListener('click', () => {
              console.log("button clicked" + marker.id);
              this.router.navigate(['/detail'],{
                queryParams:marker
              });
          });
    });
    this.infoWindows.push(infoWindow);
  };

  
//close info window when the user click on the close button
  closeAllInfoWindows()
  {
    for(let window of this.infoWindows)
    {
      window.close();
    }
  };

  
  //filter pharmacy based on the user input
  setFilteredResult() {
    this.selectedkm = true;
    this.selectedkm5 = false;
    this.selectedkm10 = false;
    this.selectedkm20 = false;
    this.checkOpenNow = false;
    //if the user only fill in the insurance
    if(this.searchMedicine !="" && this.searchInsurance =="")
    {
      this.filterMedicine(this.searchMedicine.toLowerCase());
      if(this.pharmacyFilterResultByMedicine.length < 0)
      {
        this.showResult = false;
        this.showMedicineInfo = false;
        this.showInsuranceInfo = false;
      }
      else
      {
        this.showResult = true;
        this.showUp = true;
        this.showDown = false;
        this.showMedicineInfo = true;
        this.showInsuranceInfo = false;
      }
      this.pharmacyFilterResult = this.pharmacyFilterResultByMedicine;
    }
    //if user only fill in the medicine
    else if (this.searchInsurance != "" && this.searchMedicine=="")
    {
      this.filterInsurance(this.searchInsurance.toLowerCase());
      console.log(this.pharmacyFilterResultByInsurance)
      console.log (this.pharmacyFilterResultByInsurance.length)
      if(this.pharmacyFilterResultByInsurance.length < 0)
      {
        this.showResult = false
        this.showInsuranceInfo = false;
        this.showMedicineInfo = false;
      }
      else
      {
        this.showResult = true;
        this.showUp = true;
        this.showDown = false;
        this.showInsuranceInfo = true;
        this.showMedicineInfo = false;
      }
      this.pharmacyFilterResult = this.pharmacyFilterResultByInsurance;
    }
    //if the user fill in medicine and insurance
    else if (this.searchMedicine != "" && this.searchInsurance != "")
    {
      this.filterBoth(this.searchMedicine.toLowerCase(), this.searchInsurance.toLowerCase()); 
      console.log("both 1");
      this.pharmacyFilterResult = this.pharmacyFilterResultByBoth;
      this.showResult = true;
      this.showMedicineInfo = true;
      this.showInsuranceInfo = true;
    }
    this.loadMap();  
  }

  filterInsurance(searchIns) {
    //this.searchInsurance = "";
    this.pharmacyFilterResultByInsurance = this.locationData.filter(item => {
      return (item.insurances.some(insurance => insurance === (searchIns)));
    });
  };

  filterMedicine(searchMed) {
    this.pharmacyFilterResultByMedicine = this.locationData.filter(item => {
      return (item.medicines.some(medicine => medicine === (searchMed)));
    });
  };

  filterBoth(searchMed, searchIns)
  {
    console.log("coba");
    console.log(this.pharmacyFilterResult);
    this.pharmacyFilterResultByBoth = this.locationData.filter(item => {
    return (item.insurances.some(insurance => insurance === (searchIns))&& (item.medicines.some(medicine => medicine === (searchMed)) ));
    });
  }

  //to filter the pharmacy that opens now
  filterOpenNow()
{
  if(this.checkOpenNow == true)
  {
    if (this.searchMedicine == "" && this.searchInsurance == "")
    {
      this.getDatabase();
      console.log("check open now");
      console.log(this.locationData);
      this.pharmacyFilterResultByOpenNow = this.locationData.filter(item=>{
        return(item.opennow == true)});
      
      if(this.pharmacyFilterResultByOpenNow.length<0)
      {
        this.showResult = false;
        this.showUp = false;
        this.showDown = false;
      }
      else
      {
        this.showResult=true;
        this.showUp = true;
        this.showDown = false;
      }
    }
    else if (this.searchMedicine !="" && this.searchInsurance == "")
    {
      this.pharmacyFilterResultByOpenNow = this.pharmacyFilterResultByMedicine.filter(item=>{
        return(item.opennow == true)});
    }
    else if (this.searchMedicine =="" && this.searchInsurance !="")
    {
      this.pharmacyFilterResultByOpenNow = this.pharmacyFilterResultByInsurance.filter(item=>{
        return(item.opennow ==true)});
    }
    else if (this.searchMedicine!="" && this.searchInsurance!="")
    {
      this.pharmacyFilterResultByOpenNow = this.pharmacyFilterResultByBoth.filter(item=>{
        return(item.opennow == true)});
    }
    else if (this.pharmacyFilterByDistance == true)
    {
      this.pharmacyFilterResultByOpenNow = this.pharmacyFilterResultByBoth.filter(item=>{
        return(item.opennow == true)});
    }
   
  }
  else if(this.checkOpenNow == false)
  {
    if (this.searchMedicine == "" && this.searchInsurance == "")
    {
      this.getDatabase();
      this.pharmacyFilterResultByOpenNow = this.locationData.filter(item=>{
        return(item.opennow == true)||(item.opennow==false)});
      
      if(this.pharmacyFilterResultByOpenNow.length<0)
      {
        this.showResult = false;
        this.showUp = false;
        this.showDown = false;
      }
      else
      {
        this.showResult=true;
        this.showUp = true;
        this.showDown = false;
      }
    }
    else if (this.searchMedicine !="" && this.searchInsurance == "")
    {
      this.pharmacyFilterResultByOpenNow = this.pharmacyFilterResultByMedicine.filter(item=>{
        return(item.opennow == true)||(item.opennow==false)});
    }
    else if (this.searchMedicine =="" && this.searchInsurance !="")
    {
      this.pharmacyFilterResultByOpenNow = this.pharmacyFilterResultByInsurance.filter(item=>{
        return(item.opennow ==true)||(item.opennow==false)});
    }
    else if (this.searchMedicine!="" && this.searchInsurance!="")
    {
      this.pharmacyFilterResultByOpenNow = this.pharmacyFilterResultByBoth.filter(item=>{
        return(item.opennow == true)||(item.opennow==false)});
    }
    else if (this.pharmacyFilterByDistance == true)
    {
      this.pharmacyFilterResultByOpenNow = this.pharmacyFilterResultByBoth.filter(item=>{
        return(item.opennow == true)});
    }
  }
  this.pharmacyFilterResult = this.pharmacyFilterResultByOpenNow; 
  this.showMapMarkers2();
  }
  
  //using angular router to redirect the page to pharmacy detail page
  goToDetail(pharmacy)
  {
    this.router.navigate(['/detail'],
    {
      queryParams:{
        name:pharmacy.name,
        medicines: pharmacy.medicines,
        insurances: pharmacy.insurances,
        address : pharmacy.address,
        id: pharmacy.id,
        image: pharmacy.image,
        openingtimes: JSON.stringify(pharmacy.openingtimes),
        latitude: pharmacy.latitude,
        longitude: pharmacy.longitude,
        phone: pharmacy.phone,
        distance: pharmacy.distance,
        openNow : pharmacy.opennow
      }
    })
  }

  //toggle for the arrow button in pharmacy filter result
  Toggle()
  {
    if(this.showUp)
    {
      this.showResult = false;
      this.showUp = false;
      this.showDown = true;
    }
    else if(this.showDown)
    {
      this.showResult = true;
      this.showUp = true;
      this.showDown = false;
    }
  }

// km2()
// {
//   this.checkOpenNow = false;
//   this.selectedkm5 = true;
//   this.selectedkm20 = false;
//   this.selectedkm10 = false;
//   this.filterDistance = true;
//   this.selectedkm = false;
//   console.log("filter 2km")
  
//   if (this.searchMedicine == "" && this.searchInsurance == "")
//   {
//     console.log(this.locationData);
//     console.log(this.locationData[1].distance);
//     this.pharmacyFilterByDistance = this.locationData.filter(item=>{
//       console.log(item.distance);
//       return(item.distance < 2)});
//     this.showInsuranceInfo = false;
//     this.showMedicineInfo = false;
//     if(this.pharmacyFilterByDistance.length<0)
//     {
//       this.showResult = false;
//       this.showUp = false;
//       this.showDown = false;
//     }
//     else
//     {
//       this.showResult=true;
//       this.showUp = true;
//       this.showDown = false;
//     }
//   }
//   else if (this.searchMedicine !="" && this.searchInsurance == "")
//   {
//     this.pharmacyFilterByDistance = this.pharmacyFilterResultByMedicine.filter(item=>{
//       return(parseFloat(item.distance) < 2)});
//   }
//   else if (this.searchMedicine =="" && this.searchInsurance !="")
//   {
//     this.pharmacyFilterByDistance = this.pharmacyFilterResultByInsurance.filter(item=>{
//       return(parseFloat(item.distance) < 2)});
//   }
//   else if (this.searchMedicine!="" && this.searchInsurance!="")
//   {
//     this.pharmacyFilterByDistance = this.pharmacyFilterResultByBoth.filter(item=>{
//       return(parseFloat(item.distance) < 2)});
//   }
//   this.pharmacyFilterResult = this.pharmacyFilterByDistance;
//   this.showMapMarkers2();
  
// }

// km5()
// {
//   this.checkOpenNow = false;
//   this.selectedkm10 = true;
//   this.selectedkm20 = false;
//   this.selectedkm5= false
//   this.filterDistance = true;
//   this.selectedkm = false;
//   console.log("filter 5km")
//   if (this.searchMedicine == "" && this.searchInsurance == "")
//   {
//     this.pharmacyFilterByDistance = this.locationData.filter(item=>{
//       return(item.distance< 5)});
//     this.showInsuranceInfo = false;
//     this.showMedicineInfo = false;
//     if(this.pharmacyFilterByDistance.length<0)
//     {
//       this.showResult = false;
//       this.showUp = false;
//       this.showDown = false;
//     }
//     else
//     {
//       this.showResult=true;
//       this.showUp = true;
//       this.showDown = false;
//     }
//   }
//   else if (this.searchMedicine !="" && this.searchInsurance == "")
//   {
//     this.pharmacyFilterByDistance = this.pharmacyFilterResultByMedicine.filter(item=>{
//       return(item.distance < 5)});
//   }
//   else if (this.searchMedicine =="" && this.searchInsurance !="")
//   {
//     this.pharmacyFilterByDistance = this.pharmacyFilterResultByInsurance.filter(item=>{
//       return(item.distance < 5)});
//   }
//   else if (this.searchMedicine!="" && this.searchInsurance!="")
//   {
//     this.pharmacyFilterByDistance = this.pharmacyFilterResultByBoth.filter(item=>{
//       return(item.distance < 5)});
//   }
//   this.pharmacyFilterResult = this.pharmacyFilterByDistance; 
//   this.showMapMarkers2();
// }

// km10()
// {
//   this.checkOpenNow = false;
//   this.selectedkm20 = true;
//   this.selectedkm10 = false;
//   this.selectedkm5= false;
//   this.selectedkm = false;
//   this.filterDistance = true;
//   console.log("filter 10km")
//   if (this.searchMedicine == "" && this.searchInsurance == "")
//   {
//     this.pharmacyFilterByDistance = this.locationData.filter(item=>{
//       console.log(item.distance);
//       return(item.distance < 10)});
//     this.showInsuranceInfo = false;
//     this.showMedicineInfo = false;
//     if(this.pharmacyFilterByDistance.length<0)
//     {
//       this.showResult = false;
//       this.showUp = false;
//       this.showDown = false;
//     }
//     else
//     {
//       this.showResult=true;
//       this.showUp = true;
//       this.showDown = false;
//     }
//   }
//   else if (this.searchMedicine !="" && this.searchInsurance == "")
//   {
//     this.pharmacyFilterByDistance = this.pharmacyFilterResultByMedicine.filter(item=>{
//       return(item.distance < 10)});
//   }
//   else if (this.searchMedicine =="" && this.searchInsurance !="")
//   {
//     this.pharmacyFilterByDistance = this.pharmacyFilterResultByInsurance.filter(item=>{
//       return(item.distance < 10)});
//   }
//   else if (this.searchMedicine!="" && this.searchInsurance!="")
//   {
//     this.pharmacyFilterByDistance = this.pharmacyFilterResultByBoth.filter(item=>{
//       return(item.distance < 10)});
//   }
//   this.pharmacyFilterResult = this.pharmacyFilterByDistance;
//   this.showMapMarkers2();
// }

// noMax()
// {
//   this.checkOpenNow = false;
//   this.selectedkm = true;
//   this.selectedkm20 = false;
//   this.selectedkm10 = false;
//   this.selectedkm5= false;
//   this.filterDistance = true;
  
//   if (this.searchMedicine == "" && this.searchInsurance == "")
//   {
//     this.pharmacyFilterByDistance = this.locationData.filter(item=>{
//       return(item.distance < 10000)});
//     this.showInsuranceInfo = false;
//     this.showMedicineInfo = false;
//     if(this.pharmacyFilterByDistance.length<0)
//     {
//       this.showResult = false;
//       this.showUp = false;
//       this.showDown = false;
//     }
//     else
//     {
//       this.showResult=true;
//       this.showUp = true;
//       this.showDown = false;
//     }
//   }
//   else if (this.searchMedicine !="" && this.searchInsurance == "")
//   {
//     this.pharmacyFilterByDistance = this.pharmacyFilterResultByMedicine.filter(item=>{
//       return(item.distance < 10000)});
//   }
//   else if (this.searchMedicine =="" && this.searchInsurance !="")
//   {
//     this.pharmacyFilterByDistance = this.pharmacyFilterResultByInsurance.filter(item=>{
//       return(item.distance < 10000)});
//   }
//   else if (this.searchMedicine!="" && this.searchInsurance!="")
//   {
//     this.pharmacyFilterByDistance = this.pharmacyFilterResultByBoth.filter(item=>{
//       return(item.distance < 10000)});
//   }
//   this.pharmacyFilterResult = this.pharmacyFilterByDistance; 
//   this.showMapMarkers2();
// }


  
}