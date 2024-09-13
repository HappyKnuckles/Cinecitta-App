import { Component } from '@angular/core';
import { addIcons } from "ionicons";
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { homeOutline, home, videocam, newspaperOutline, personOutline, person, newspaper } from 'ionicons/icons';

@Component({
	selector: 'app-tabs',
	templateUrl: 'tabs.page.html',
	styleUrls: ['tabs.page.scss'],
	standalone: true,
	imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel]
})
export class TabsPage {
	constructor() {
		addIcons({ homeOutline, home, videocam, newspaperOutline, personOutline, person, newspaper });
	}
}
