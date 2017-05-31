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

  constructor(private observationService: ObservationService,
              private indexedDB: IndexedDBService,
              private router: Router) { }

  ngOnInit() {
    this.user = this.indexedDB.getUser();
    this.getObservations();
  }

  getObservations() {
    console.log('check');
    this.observationsWaiting = true;
    this.observationService.getObservations().subscribe(
      response => {
        this.observationsWaiting = false;
        this.observations = response.entry;
        console.log(this.observations);
      },
      error => {
        console.log('Meritev ni bilo mogoce pridobiti');
        this.observationsError = true;
        this.observationsWaiting = false;
      },
    );
  }

  onLogOut() {
    this.indexedDB.unsetUser();
    this.router.navigate(['/prijava']);
  }

}
