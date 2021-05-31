import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { BarcodedbService } from './../services/barcodedb.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';


@Component({
  selector: 'app-scan', 
  templateUrl: 'scan.page.html',
  styleUrls: ['scan.page.scss']
})
export class ScanPage {
  scannedCode = null;
  medicineDatas:any = [];
  medicineName:string = "";
  medicineDescription:string = "";
  medicineSideEffect:string = "";
  medicineDosage:string = "";
  barcodeData: any[] = [];
  noScanHistory = true;
  show = false

  constructor(private barcodeScanner: BarcodeScanner,private router : Router, private platform:Platform, public http: HttpClient, private db: BarcodedbService,private toast: ToastController) {
  }

  ngOnInit() {
    this.db.dbState().subscribe((res) => {
      if(res){
        this.db.fetchBarcodes().subscribe(item => {
          this.barcodeData = item;
          console.log(this.barcodeData);
          if(this.barcodeData.length === 0)
          {
            this.noScanHistory = true;
          }
          else
          {
            this.noScanHistory = false;
            console.log("ada");
          }
        })
      }
    });
  }

  Service()
  {
    return this.http.get('http://51.195.117.140:9000/codescanners/');
  }

  getMedicineData()
  {
    this.Service().subscribe(data =>
      {
        this.medicineDatas = data;
        console.log(this.medicineDatas);
      });
  }


  Scan()
  {
    this.getMedicineData();
    this.barcodeScanner.scan().then((barcodeData)=>{
      this.scannedCode = barcodeData.text
      for(var i = 0 ; i < this.medicineDatas.length; i++)
    {
      if(barcodeData.text == this.medicineDatas[i].eannumber)
      {
      this.medicineName = this.medicineDatas[i].medicinename;
      this.medicineDescription = this.medicineDatas[i].meddescription;
      this.medicineSideEffect = this.medicineDatas[i].medeffects;
      this.medicineDosage = this.medicineDatas[i].meddosage;
      this.storeBarcodeHistory();
      }
      else
      {
        this.medicineName = "not found";
        this.medicineDescription = "not found";
        this.medicineSideEffect = "not found";
        this.medicineDosage = "not found";
      }
    }
    },(err)=>{
      alert(JSON.stringify(err));
    });
    console.log(this.scannedCode);
    
  }

  storeBarcodeHistory() {
    this.db.addBarcode(
      this.scannedCode,
      this.medicineName,
      this.medicineDescription,
      this.medicineSideEffect,
      this.medicineDosage
    )
  }

  //delete the reminder with the specific ID from database 
  deleteBarcodeHistory(id){
    this.db.deleteBarcode(id).then(async(res) => {
      let toast = await this.toast.create({
        message: 'Scanned history deleted',
        duration: 2500
      });
      toast.present();      
    });
  }
  
  showHistory()
  {
    this.show = true;
  }

  hideHistory()
  {
    this.show = false;
  }

  openReminder()
  {
    this.router.navigate(['/reminder'])
  }
}
