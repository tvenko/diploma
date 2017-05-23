import { Component, OnInit } from '@angular/core';
import { ObservationService } from '../shared/services/observation.service';

@Component({
  selector: 'app-observations-list',
  templateUrl: './observation-list.component.html',
  styleUrls: ['./observation-list.component.css']
})
export class ObservationListComponent implements OnInit {

  observations: any[];

  constructor(private observationService: ObservationService) { }

  ngOnInit() {
    this.observationService.getObservations().subscribe(
      response => {
        this.observations = response.entry;
        console.log(this.observations);
        for (const o of this.observations) {
          console.log(o);
        }
      }
    );
  }

}
