import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { Barcode } from './barcodedata'


@Injectable({
  providedIn: 'root'
})
export class BarcodedbService {
  private storage: SQLiteObject;
  barcodeList = new BehaviorSubject([]);
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private platform: Platform, 
    private sqlite: SQLite,  
    private httpClient: HttpClient,
    private sqlPorter: SQLitePorter) {
      //for the native functionality it is best to put the function under platform
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: 'barcode.db',
        location: 'default'
      })
      .then((db: SQLiteObject) => {
          this.storage = db;
          this.getFakeData();
      });
    });
    }

    
  dbState() {
    return this.isDbReady.asObservable();
  }
 
  fetchBarcodes(): Observable<Barcode[]> {
    return this.barcodeList.asObservable();
  }

    // get the reminder data from the dump.sql this is for debugging purpose only.
    getFakeData() {
      this.httpClient.get(
        'assets/dumpbarcode.sql', 
        {responseType: 'text'}
      ).subscribe(data => {
        this.sqlPorter.importSqlToDb(this.storage, data)
          .then(_ => {
            this.getBarcodes();
            this.isDbReady.next(true);
          })
          .catch(error => console.error(error));
      });
    }

  // Get list of reminders
  getBarcodes(){
    return this.storage.executeSql('SELECT * FROM barcodetable', []).then(res => {
      let items: any[] = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) { 
          items.push({ 
            id: res.rows.item(i).id,
            ean: res.rows.item(i).r_ean,
            name:res.rows.item(i).r_name,
            description: res.rows.item(i).r_description,
            effect: res.rows.item(i).r_effect,
            dosage:res.rows.item(i).r_dosage
           });
        }
      }
      this.barcodeList.next(items);
    });
  }

  // Add scanned bardoce data to the barcode database
  addBarcode(r_ean, r_name, r_description, r_effect, r_dosage) {
    let data = [r_ean, r_name, r_description, r_effect, r_dosage];
    return this.storage.executeSql('INSERT INTO barcodetable (r_ean, r_name, r_description, r_effect, r_dosage) VALUES (?, ?, ?, ?, ?)', data)
    .then(res => {
      this.getBarcodes();
    });
  }


  // Delete barcode
  deleteBarcode(id) {
    return this.storage.executeSql('DELETE FROM barcodetable WHERE id = ?', [id])
    .then(_ => {
      this.getBarcodes();
    });
  }
}

