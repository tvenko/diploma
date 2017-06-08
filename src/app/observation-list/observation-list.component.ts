import { Component, OnInit } from '@angular/core';
import { ObservationService } from '../shared/services/observation.service';
import { IndexedDBService } from '../shared/services/indexeddb.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-observations-list',
  templateUrl: './observation-list.component.html',
  styleUrls: ['./observation-list.component.css']
})
export class ObservationListComponent implements OnInit {

  observations: any[];
  user: {name: string, surname: string, email: string, password: string, id: number};
  observationsError: boolean;
  observationsWaiting: boolean;
  offline = false;
  page = 1;
  total = 10;
  offset = 20;

  constructor(private observationService: ObservationService,
              private indexedDB: IndexedDBService,
              private router: Router) { }

  ngOnInit() {
    this.user = this.indexedDB.getUser();
    this.getObservations();
  }

  getObservations() {
    this.observationsWaiting = true;
    this.observationService.getObservations('patronaza', (this.page * 10 - 10), this.offset).subscribe(
      response => {
        this.observationsWaiting = false;
        this.offline = false;
        this.observations = response.entry;
        this.total = response.total;
      },
      error => {
        console.log('Meritev ni bilo mogoce pridobiti');
        this.indexedDB.getObservationRange((this.page * 10 - 10), (this.page * 10 - 10) + this.offset).then((response) => {
          this.observations = response[1];
          this.indexedDB.getAllObservations().then((all) => this.total = all.length);
          if (this.observations.length = 0) {
            this.observationsError = true;
          }
        });
        this.offline = true;
        this.observationsWaiting = false;
      },
    );
  }

  storeObservations() {
    for (const observation of this.observations) {
      this.indexedDB.addObservation(
        observation.resource.code.text,
        observation.resource.valueQuantity.value,
        observation.resource.valueQuantity.unit,
        observation.resource.meta.lastUpdated,
        observation.resource.id
      );
    }
  }
}
