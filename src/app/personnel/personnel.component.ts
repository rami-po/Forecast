import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer} from "@angular/platform-browser";
import {MdIconRegistry} from "@angular/material";
import {ForecastService} from '../forecast/forecast.service';
import {isNullOrUndefined} from 'util';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PersonnelService} from "./personnel.service";
import {FileUploader} from "ng2-file-upload";

@Component({
  selector: 'app-personnel',
  templateUrl: './personnel.component.html',
  styleUrls: ['./personnel.component.scss'],
  providers: [PersonnelService]
})
export class PersonnelComponent implements OnInit {

  public isDataAvailable = false;
  public employee;
  public timelineForm: FormGroup;
  public notesForm: FormGroup;
  public skillsForm: FormGroup;

  private apiBase = document.location.protocol + '//' + window.location.hostname + ':3000/resource';
  public uploader: FileUploader = new FileUploader({url: this.apiBase + '/personnel/picture', itemAlias: 'photo'});

  public items = [
    'Compensation',
    'Review'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private personnelService: PersonnelService,
    private forecastService: ForecastService,
    private iconRegistry: MdIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    iconRegistry.addSvgIcon(
      'remove',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_remove.svg'));
    iconRegistry.addSvgIcon(
      'heart',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_heart.svg'));
    iconRegistry.addSvgIcon(
      'map-marker',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_map_marker.svg'));
    iconRegistry.addSvgIcon(
      'envelope',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_envelope.svg'));
    iconRegistry.addSvgIcon(
      'phone',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_phone.svg'));
  }

  ngOnInit() {

    // override the onAfterAddingfile property of the uploader so it doesn't authenticate with //credentials.
    this.uploader.onAfterAddingFile = (file) => { file.withCredentials = false; };
    // overide the onCompleteItem property of the uploader so we are
    // able to deal with the server response.
    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
      console.log('ImageUpload:uploaded:', item, status, response);
    };

    this.route.params.subscribe(
      data => {
        console.log(data);
        this.forecastService.getEmployee(data.id).subscribe(
          employee => {
            employee = employee.result[0];
            console.log(employee);
            if (!isNullOrUndefined(employee)) {
              this.employee = employee;
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

    this.skillsForm = new FormGroup({
      skill: new FormControl(null, Validators.required)
    });
  }

  submitTimelineForm() {
    if (this.timelineForm.valid) {
      this.personnelService.addTimelineEvent(
        this.employee.id,
        this.timelineForm.value.date,
        this.timelineForm.value.type,
        this.timelineForm.value.event).subscribe(
        (data) => {
          const date = new Date(this.timelineForm.value.date).toISOString();
          if (this.employee.events.length > 0) {
            for (let i = 0; i < this.employee.events.length; i++) {
              const event = this.employee.events[i];
              if (event.date > date) {
                this.addEvent(data.id, i);
                break;
              }
              const j = i + 1;
              if (j == this.employee.events.length) {
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

  fileChange2(event) {
    this.uploader.uploadAll();
  }

  fileChange(event) {
    const files = event.target.files;
    console.log(files);

    if (files.length > 0) {
      const file = files[0];
      console.log(file);
      const formData = new FormData();
      formData.append('file', file);
      console.log(formData);
      console.log(formData.get('file'));
      this.personnelService.uploadPicture(this.employee.id, formData).subscribe();
    }
  }

  removeSkill(skill, index) {
    this.personnelService.removeSkill(skill).subscribe(
      () => {
        this.employee.skills.splice(index, 1);
      }
    );
  }

  removeTimelineEvent(event, index) {
    this.personnelService.removeTimelineEvent(event).subscribe(
      () => {
        this.employee.events.splice(index, 1);
      }
    );
  }

  removeNote(note, index) {
    this.personnelService.removeNote(note).subscribe(
      () => {
        this.employee.notes.splice(index, 1);
      }
    );
  }

  addEvent(id, index) {
    this.employee.events.splice(index, 0, {
      id: id,
      date: new Date(this.timelineForm.value.date).toISOString(),
      type: this.timelineForm.value.type,
      event: this.timelineForm.value.event
    });
    this.timelineForm.reset();
  }

  submitNotesForm() {
    if (this.notesForm.valid) {
      this.personnelService.addNotes(
        this.employee.id,
        this.notesForm.value.notes
      ).subscribe(
        (data) => {
          this.employee.notes.push({
            id: data.id,
            notes: this.notesForm.value.notes
          });
          this.notesForm.reset();
        }
      );
    }
  }

  submitSkillsForm() {
    if (this.skillsForm.valid) {
      this.personnelService.addSkills(
        this.employee.id,
        this.skillsForm.value.skill
      ).subscribe(
        (data) => {
          this.employee.skills.push({
            id: data.id,
            skill: this.skillsForm.value.skill
          });
          this.skillsForm.reset();
        }
      );
    }
  }
}
