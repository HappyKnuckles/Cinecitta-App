import { Component, OnInit, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  currentTags = undefined;
  isOpen: boolean = false;
  tags = [
    {
      id: 1,
      name: 'Horror',
    },
    {
      id: 2,
      name: 'Drama',
    },
    {
      id: 3,
      name: 'Komödie',
    },
    {
      id: 4,
      name: 'Schräg',
    },
    {
      id: 5,
      name: 'FSK18',
    },
  ];

  image = "assets/images/default-avatar.png";
  image2 = "assets/images/hellow.png";
  sub: Subscription = new Subscription;
  isToggled: boolean = false;
  constructor() { 
  }

  ngOnInit() {
  }

  openDetails(){
    this.isOpen = !this.isOpen;
  }
  
  toggleImage(){
    this.isToggled = !this.isToggled;
  }

  // openTicket(){
  //   const modal = document.querySelector('#ticketoverview');
  //   modal!.present();
  // }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(null, 'confirm');
  }

  handleChange(ev: any) {
    this.currentTags = ev.target.value;
  }
}
