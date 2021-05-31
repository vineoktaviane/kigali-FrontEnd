import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ReminderPage } from './reminder.page';

import { ReminderPageRoutingModule } from './reminder-routing.module'

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([{ path: '', component: ReminderPage }]),
    ReminderPageRoutingModule,
  ],
  declarations: [ReminderPage]
})
export class ReminderPageModule {}
