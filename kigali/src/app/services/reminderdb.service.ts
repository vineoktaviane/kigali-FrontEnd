import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Reminder } from './reminderdata';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';

//this service responsible to get and update the reminder data from the database
@Injectable({
  providedIn: 'root'
})
export class DbService {
  private storage: SQLiteObject;
  remindersList = new BehaviorSubject([]);
  private isDbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private platform: Platform, 
    private sqlite: SQLite, 
    private httpClient: HttpClient,
    private sqlPorter: SQLitePorter,
  ) {
    //for the native functionality it is best to put the function under platform
    this.platform.ready().then(() => {
      this.sqlite.create({
        name: 'reminder.db',
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
 
  fetchReminders(): Observable<Reminder[]> {
    return this.remindersList.asObservable();
  }

    // get the reminder data from the dump.sql this is for debugging purpose only.
    getFakeData() {
      this.httpClient.get(
        'assets/dump.sql', 
        {responseType: 'text'}
      ).subscribe(data => {
        this.sqlPorter.importSqlToDb(this.storage, data)
          .then(_ => {
            this.getReminders();
            this.isDbReady.next(true);
          })
          .catch(error => console.error(error));
      });
    }

  // Get list of reminders
  getReminders(){
    return this.storage.executeSql('SELECT * FROM remindertable', []).then(res => {
      let items: any[] = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) { 
          let hour = res.rows.item(i).r_time.split(":")[0];
          let minute = res.rows.item(i).r_time.split(":")[1];
          items.push({ 
            id: res.rows.item(i).id,
            title: hour +":"+ minute,
            text: "Please take " + res.rows.item(i).r_description + " pills of " + res.rows.item(i).r_title +" "+res.rows.item(i).r_food,
            color: res.rows.item(i).r_foodIcon,
            trigger:{at: new Date(res.rows.item(i).r_date +" "+ res.rows.item(i).r_time)}
           });
        }
      }
      this.remindersList.next(items);
    });
  }

  // Add reminder to the database
  addReminder(r_title, r_description, r_date, r_time, r_food, r_foodIcon) {
    let data = [r_title, r_description, r_date, r_time, r_food, r_foodIcon];
    return this.storage.executeSql('INSERT INTO remindertable (r_title, r_description, r_date, r_time, r_food, r_foodIcon) VALUES (?, ?, ?, ?, ?, ?)', data)
    .then(res => {
      this.getReminders();
    });
  }
 
  // Get single reminder
  getReminder(id): Promise<Reminder> {
    return this.storage.executeSql('SELECT * FROM remindertable WHERE id = ?', [id]).then(res => { 
      return {
        id: res.rows.item(0).id,
        r_title:res.rows.item(0).r_title,
        r_description :res.rows.item(0).r_description,
        r_date :res.rows.item(0).r_date,
        r_time :res.rows.item(0).r_time,
        r_food:res.rows.item(0).r_food,
        r_foodIcon: res.rows.item(0).r_foodIcon
      }
    });
  }


  // Delete reminder
  deleteReminder(id) {
    return this.storage.executeSql('DELETE FROM remindertable WHERE id = ?', [id])
    .then(_ => {
      this.getReminders();
    });
  }
}


