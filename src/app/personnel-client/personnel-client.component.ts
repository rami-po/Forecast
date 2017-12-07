import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer} from "@angular/platform-browser";
import {MatIconRegistry} from "@angular/material";
import {ForecastService} from '../forecast/forecast.service';
import {isNullOrUndefined} from 'util';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {FileUploader} from "ng2-file-upload";
import {PersonnelClientService} from "./personnel-client.service";
import {PersonnelService} from "../personnel/personnel.service";

@Component({
  selector: 'app-personnel-client',
  templateUrl: './personnel-client.component.html',
  styleUrls: ['./personnel-client.component.scss'],
  providers: [PersonnelService]
})
export class PersonnelClientComponent implements OnInit {

  public isDataAvailable = false;
  public client;
  public projects;
  public timelineForm: FormGroup;
  public notesForm: FormGroup;
  public items = [
    'Compensation',
    'Review'
  ];

  constructor(private route: ActivatedRoute,
              private router: Router,
              private personnelService: PersonnelService,
              private forecastService: ForecastService,
              private iconRegistry: MatIconRegistry,
              private sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'remove',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_remove.svg'))
      .addSvgIcon(
        'heart',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_heart.svg'))
      .addSvgIcon(
        'map-marker',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_map_marker.svg'))
      .addSvgIcon(
        'envelope',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_envelope.svg'))
      .addSvgIcon(
        'phone',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_phone.svg'));
  }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        console.log(params);
        this.personnelService.getPersonnelData(params.id, 'client').subscribe(
          client => {
            client = client.result[0];
            console.log(client);
            if (!isNullOrUndefined(client)) {
              this.client = client;
              this.projects = client.projects;
              this.isDataAvailable = true;
            } else {
              this.router.navigate(['404']);

            }
          }
        );
      }
    );

    this.timelineForm = new FormGroup({
      date: new FormControl(null, Validators.required),
      type: new FormControl(null, Validators.required),
      event: new FormControl(null, Validators.required)
    });

    this.notesForm = new FormGroup({
      notes: new FormControl(null, Validators.required)
    });
  }
  removeTimelineEvent(event, index) {
    this.personnelService.removeTimelineEvent(event).subscribe(
      () => {
        this.client.events.splice(index, 1);
      }
    );
  }

  removeNote(note, index) {
    this.personnelService.removeNote(note).subscribe(
      () => {
        this.client.notes.splice(index, 1);
      }
    );
  }

  addEvent(id, index) {
    this.client.events.splice(index, 0, {
      id: id,
      date: new Date(this.timelineForm.value.date).toISOString(),
      type: this.timelineForm.value.type,
      event: this.timelineForm.value.event
    });
    this.timelineForm.reset();
  }

  submitTimelineForm() {
  if (this.timelineForm.valid) {
    this.personnelService.addTimelineEvent(
      this.client.id,
      this.timelineForm.value.date,
      this.timelineForm.value.type,
      this.timelineForm.value.event).subscribe(
      (data) => {
        const date = new Date(this.timelineForm.value.date).toISOString();
        if (this.client.events.length > 0) {
          for (let i = 0; i < this.client.events.length; i++) {
            const event = this.client.events[i];
            if (event.date > date) {
              this.addEvent(data.id, i);
              break;
            }
            const j = i + 1;
            if (j == this.client.events.length) {
              this.addEvent(data.id, j);
              break;
            }
          }
        } else {
          this.addEvent(data.id, 0);
        }
      }
    );
  }
}

  submitNotesForm() {
    if (this.notesForm.valid) {
      this.personnelService.addNotes(
        this.client.id,
        this.notesForm.value.notes
      ).subscribe(
        (data) => {
          this.client.notes.push({
            id: data.id,
            notes: this.notesForm.value.notes
          });
          this.notesForm.reset();
        }
      );
    }
  }

}