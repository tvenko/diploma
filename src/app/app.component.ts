import {Component, OnInit} from '@angular/core';
import { ObiskiService } from './shared/services/obiski.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  obiski;

  constructor(private obiskiService: ObiskiService) {}

  ngOnInit() {
    console.log('obiski: ' + this.obiski);
    this.getObiski();
  }

  getObiski() {
    this.obiskiService.get('999888777').subscribe (
      (obiski) => this.obiski = obiski.results,
      (error) => console.log('Napaka ' + error)
      );
  }
}
