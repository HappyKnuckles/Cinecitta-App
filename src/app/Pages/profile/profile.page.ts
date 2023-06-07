import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonModal } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @ViewChild('modal1') modal1!: IonModal;  
  @ViewChild('modal2') modal2!: IonModal;

  currentTags = undefined;
  isOpen: boolean[] = [];  
  
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
  constructor(private router: Router) { 
  }

  ngOnInit() {
  }
  openDetails(index: number) {
    // Toggle the open state for the clicked item
    this.isOpen[index] = !this.isOpen[index];
  }

  openFilm(filmId: number) {
    this.router.navigate(['/filmoverview', filmId]);
  }
  
  toggleImage(){
    this.isToggled = !this.isToggled;
  }

  // openTicket(){
  //   const modal = document.querySelector('#ticketoverview');
  //   modal!.present();
  // }

  cancel() {
    this.modal1.dismiss(null, 'cancel');
    this.modal2.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal1.dismiss(null, 'confirm');
  }

  handleChange(ev: any) {
    this.currentTags = ev.target.value;
  }
}
