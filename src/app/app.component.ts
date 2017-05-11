import {Component, OnInit} from '@angular/core';
import { ObiskiService } from './shared/services/obiski.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private worker: ServiceWorker;
  obiski;

  constructor(private obiskiService: ObiskiService) {}

  ngOnInit() {
    this.getObiski();
  }

  getObiski() {
    this.obiskiService.get('999888777').subscribe (
      (obiski) => this.obiski = obiski.results,
      (error) => console.log('Napaka ' + error)
      );
  }
/*
  initServiceWorker() {
    navigator.serviceWorker.register('./sw.js').then(registration => {
      console.log(`Registered service worker with scope ${registration.scope}`);
    }).catch(err => {
      console.log(`Could not register service worker. Reason: ${err}`);
    });
  }*/
}
