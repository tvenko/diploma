import { Component, OnInit } from '@angular/core';
import { ObservationService } from '../shared/services/observation.service';
import { IndexedDBService } from '../shared/services/indexeddb.service';
import { ObservationInputComponent } from '../observation-input/observation-input.component';
import { MdSnackBar } from '@angular/material';

@Component({
  selector: 'app-observations-list',
  templateUrl: './observation-list.component.html',
  styleUrls: ['./observation-list.component.css']
})
export class ObservationListComponent implements OnInit {

  // spremenljivke za shranjevanje podatkov
  observations: any[];
  queueObservations: any[];
  patients: any[] = [];
  patient: any;

  observationsError: boolean;
  observationsWaiting: boolean;
  offline = false;
  patientError = false;
  patientSpinner = true;
  page = 1;
  total = 10;
  offset = 10;
  pagination = true;

  constructor(private observationService: ObservationService,
              private indexedDB: IndexedDBService,
              private observationInput: ObservationInputComponent,
              private snackBar: MdSnackBar) { }

  ngOnInit() {
    // Ob inicializaciji pridobimo meritve in paciente
    this.getObservations();
    this.getPatients();
  }

  /**
   * Metoda, ki se poklice ob inicializaciji in najprej poskusa pridobiti meritve iz streznika, ce to ne uspe, jih
   * poskusi pridobiti iz lokalne shrambe IndexedDB
   */
  getObservations() {
    this.observationsError = false;
    this.observationsWaiting = false;
    this.observations = [];
    // Preverimo ali je izbran pacient za katerega zelimo pridobiti meritve
    if (this.patient) {
      this.observationsWaiting = true;
      // Poskusamo pridobiti meritve s streznika
      setTimeout(() => {  // timeout potreben, da se pravilno nastavi stevilka strani
        this.observationService.getObservationsByPatient
        ('patronaza1', (this.page * 10 - 10), this.offset, this.patient.resource.id).subscribe(
          response => {
            if (response.entry) {
              this.observationsWaiting = false;
              this.offline = false;
              this.observations = response.entry;
              this.total = response.total;  // stevilo vseh meritev, potrebujemo za paginacijo
              for (const observation of this.observations) {
                // Preverimo ali ima meritev podatek o pacientu
                if (observation.resource.subject) {
                  // Za dano meritev pridobimo vse podatke o pacientu in jih dodamo v meritev, saj ima originalna meritev
                  // podatek samo o IDju pacienta
                  this.observationService.getPatient(observation.resource.subject.reference).subscribe(
                    response1 => {
                      observation.patient = response1;
                    }
                  );
                }
              }
            } else {
              this.observationsWaiting = false;
              this.offline = false;
              this.observationsError = true;
            }
          },
          // Meritev s streznika ni bilo mogoce pridobiti zato poskusimo pridobiti meritve iz IndexedDB-ja
          () => {
            console.log('Meritev ni bilo mogoce pridobiti');
            const patientId: string = 'Patient/' + this.patient.resource.id;
            this.indexedDB.getObservationsById(patientId).then((response: any) => {
              this.observations = response;
              if (this.observations.length <= 0) {
                this.observationsError = true;
              } else {
                this.observationsError = false;
                for (const observation of this.observations) {
                  const id = observation.resource.subject.reference.substring(8); // iz Patient/123456 se pretvori v 123456
                  // Za dano meritev pridobimo vse podatke o pacient iz lokalne shrambe
                  this.indexedDB.getPatient(id).then((patient) => {
                    observation.patient = patient;
                  });
                }
              }
            });
            this.indexedDB.getObservationFromQueueByPatient(this.patient.resource.id).then((response: any) => {
              this.queueObservations = response;
              this.observationsError = false;
              console.log(this.queueObservations);
            })
            this.offline = true;
            this.observationsWaiting = false;
            this.pagination = false;
          },
        )}, 10);
    }
    this.observationService.setLocalPatient(this.patient);
  }

  selectPatient() {
    this.page = 1;
    this.getObservations();
  }

  /**
   * Metoda, ki se poklice ob inicializaciji in najprej poskusa iz streznika pridobiti vse nase paciente, ce to ne uspe
   * jih poskusi pridobiti se iz lokalne shrambe
   */
  getPatients() {
    // Poskusimo pridobiti paciente s streznika
    this.observationService.getPatients('patronaza1').subscribe(
      response => {
        this.patients = response.entry;
        this.patientSpinner = false;
      },
      // Ce pacientov ne uspemo pridobiti iz streznika poskusimo se v lokalni shrambi
      () => {
        console.log('pacientov ni bilo mogoce pridoviti');
        this.indexedDB.getAllPatients().then((response: any) => {
          if (response) {
            for (const patient of response) {
              this.patients.push(patient.patient);
            }
          } else {
            this.patientError = true;
          }
          this.patientSpinner = false;
        });
      }
    );
  }

  /**
   * Metoda, ki se poklice ob pritisku na gumb izbrisi ali pa jo klice metoda onSinc()
   * Metoda doda meritev v deleteQueue, jo zbrise iz this.observations, nato jo poskusa zbrisati na strezniku,
   * ce to uspe meritev zbrise iz deleteQueue
   * @param observation - meritev, ki jo poskusamo zbrisati
   * @param i - index v tabeli this.observations, ce brisemo naknadno iz deleteQueue je ta nastavljen na -1
   */
  onDelete(observation, i = -1) {
    // Preverimo ali klicemo metodo iz metode onSinc()
    if (i < 0) {
      // Izbrisemo meritev na strezniku
      this.observationService.deleteObservation(+observation.id).subscribe(
        response => this.indexedDB.deleteObservationDeleteQueue(observation.id)
      );
    } else { // Ce meritev klicemo ob pritisku na gumb izbrisi
      // Meritev dodamo v delteQueue
      this.indexedDB.addToDeleteQueue(observation.resource.id).then(() => {
        this.observations.splice(i, i); // Izbrisemo meritev iz tabele this.observations
        this.indexedDB.getAllObservationsDeleteQueue().then((observations: any) => {
          if (observations) {
            for (const el of observations) {
              this.indexedDB.deleteObservtion(el.id); // Izbrisemo meritev v lokalni shrambi
              this.observationService.deleteObservation(+el.id).subscribe( // Poskusimo izbrisati meritev na strezniku
                response => this.indexedDB.deleteObservationDeleteQueue(el.id) // ce uspe jo zbrisemo tudi v deleteQueue
              );
            }
          }
        });
      }, () => {  // V priemru da je meritev slucajno ze v deleteQueue in jo poskusamo dodati se enkrat
        console.log('meritev je ze v vrsti za brisanje ');
        this.observations.splice(i, i);
        this.indexedDB.getAllObservationsDeleteQueue().then((observations: any) => {
          if (observations) {
            for (const el of observations) {
              this.indexedDB.deleteObservtion(el.id);
              this.observationService.deleteObservation(+el.id).subscribe(
                response => this.indexedDB.deleteObservationDeleteQueue(el.id)
              );
            }
          }
        });
      });
    }
  }

  /**
   * Metoda, ki se poklice ob kliku gumba sinhroniziraj.
   * Metoda poskusa na streznik poslati meritve iz cakalne vrste, pobristi na strezniku meritve v vcakalni vrsti
   * deleteQueue in osvezi meritve, ki jih imamo v lokalni shrambi
   */
  onSinc() {
    Promise.all([this.observationInput.postObservation(), // pocakamo na vse funkcije in nato prikazemo snackBar.
      this.indexedDB.getAllObservationsDeleteQueue()]).then(
      (values: any) => {
        for (const observation of values[1]) {
          this.onDelete(observation);
        }
        this.snackBar.open(
          values[0] + ' poslanih meritev na strežnik, ' + values[1].length + ' izbrisanih meritev na strežniku. ' +
          'Vsi podatki iz lokalne shrambe so zbrisani.' ,
          'OK', {duration: 20000, });
        this.indexedDB.deleteAllObservations();
        this.indexedDB.deleteAllPatients();
      }
    );
  }
}
