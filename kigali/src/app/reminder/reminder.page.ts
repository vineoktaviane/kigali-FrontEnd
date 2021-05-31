import { LocalNotifications } from '@ionic-native/local-notifications/ngx';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from "@angular/forms";
import { DbService } from './../services/reminderdb.service';
import { ToastController } from '@ionic/angular';
import { Router } from "@angular/router";
import { combineAll } from 'rxjs/operators';

@Component({
  selector: 'app-reminder',
  templateUrl: 'reminder.page.html',
  styleUrls: ['reminder.page.scss']
})
export class ReminderPage {
  pillNameInput:any;
  pillInput:number;
  pillDaysInput:number;
  food:string;
  foodIcon:string;
  
  unselectedBeforeMeal = true;
  selectedBeforeMeal = false;
  unselectedBetweenMeal = true;
  selectedBetweenMeal = false;
  unselectedAfterMeal = true;
  selectedAfterMeal = false;
  timeset=<any>{};
  localNotificationArray: any = [];
  noReminder = true;
  addReminder = false;
  showAddButton = true;
  year = new Date().getFullYear();
  month = new Date().getMonth();
  day = new Date().getDate();

  mainForm: FormGroup;
  Data: any[] = []

  constructor(
    private localNotifications: LocalNotifications,
    private db: DbService,
    public formBuilder: FormBuilder,
    private toast: ToastController,
    private router: Router) {}
//when the user load the application the reminder service will fetch the data from the database
    ngOnInit() {
      this.db.dbState().subscribe((res) => {
        if(res){
          this.db.fetchReminders().subscribe(item => {
            this.Data = item;
            this.localNotifications.schedule(this.Data);
            console.log(this.localNotifications.getIds());
            console.log(this.Data);
            if(this.Data.length === 0)
            {
              this.noReminder = true;
            }
            else
            {
              this.noReminder = false;
            }
          })
        }
      });
      this.mainForm = this.formBuilder.group({
        title: [''],
        description: [''],
        date: [''],
        time: [''],
        // repeatNotification : ['']
      });
    }

   //store the reminder data based on user input to the database
    storeData() {
      var tanggal = this.mainForm.value.date.split("T")[0];
      var jamUniversal = this.mainForm.value.time.split("T")[1];
      var jam = jamUniversal.split('.')[0];
      var cobatanggal = new Date(this.year, this.month, this.day, 8, 10 );
      let cobatanggal2 = new Date(tanggal+" "+jam)
      console.log(this.mainForm.value.date);
      console.log(tanggal);
      console.log(this.mainForm.value.time);
      console.log(jamUniversal);
      console.log(jam);
      console.log(cobatanggal);
      console.log(cobatanggal2)

      this.db.addReminder(
        this.mainForm.value.title,
        this.mainForm.value.description,
        tanggal,
        jam,
        this.food,
        this.foodIcon
      ).then((res) => {
        this.mainForm.reset();
        this.addReminder = false;
        this.showAddButton = true;
      })
    }

//delete the reminder with the specific ID from database 
    deleteReminder(id){
      this.db.deleteReminder(id).then(async(res) => {
        let toast = await this.toast.create({
          message: 'Reminder deleted',
          duration: 2500
        });
        toast.present();      
      });
      this.localNotifications.cancel(id);
    }

  // setReminder()
  // {
  //   let hour = this.timeset.split(':')[0];
  //   let minute = this.timeset.split(':')[1];
  //   console.log(this.pillNameInput);
  //   console.log(this.pillInput);
  //   console.log(this.pillDaysInput);
  //   console.log(this.food);
  //   console.log(this.timeset);
  //   console.log(hour);
  //   console.log(minute);
  //     var obj = 
  //     {
  //       id: this.localNotificationArray.length + 1,
  //       title: "It's time to take your medicine",
  //       text: "please take " + this.pillInput +" pills of "+ this.pillNameInput,
  //       trigger:{at: new Date(this.year, this.month, this.day, hour, minute )},
  //       data: {
  //        medicine: this.pillNameInput,
  //        amount: this.pillInput,
  //        time: hour + ":" + minute, 
  //        repeat: this.pillDaysInput,
  //        food: this.food,
  //        foodImage: this.foodImage}
  //     }
  //   this.localNotificationArray.push(obj);
  //   this.noReminder = false;
  //   console.log(this.localNotificationArray);
  //   this.localNotifications.schedule(this.localNotificationArray);
  //   alert("scheduled at" + this.timeset);
  //   this.addReminder = false;
  //   this.showAddButton = true;
  // }

  //get the value of the food icon
  beforeMeal()
  {
    this.food = "before meal";
    this.foodIcon = "assets/icon/utensils-solid.png"
    this.selectedBeforeMeal = true;
    this.selectedBetweenMeal = false;
    this.selectedAfterMeal = false;
  }
  betweenMeal()
  {
    this.food="between meal";
    this.foodIcon = "assets/icon/between.png";
    this.selectedBetweenMeal = true;
    this.selectedBeforeMeal = false;
    this.selectedAfterMeal = false;
  }
  afterMeal()
  {
    this.food="after meal";
    this.foodIcon = "assets/icon/after.png";
    this.selectedAfterMeal = true;
    this.selectedBeforeMeal = false;
    this.selectedBetweenMeal = false;
  }

  //to open the add reminder section
  openAddReminder()
  {
    this.addReminder = true;
    this.showAddButton = false
  }

  //close the add reminder section
  closeAddReminder()
  {
    this.addReminder = false;
    this.showAddButton = true;
  }
}
