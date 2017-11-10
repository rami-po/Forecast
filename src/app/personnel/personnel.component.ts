import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ForecastService} from '../forecast/forecast.service';
import {isNullOrUndefined} from 'util';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PersonnelService} from "./personnel.service";

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

  public items = [
    'Compensation',
    'blah',
    'bleh',
    'bloh?'
  ];

  constructor(private route: ActivatedRoute,
              private router: Router,
              private personnelService: PersonnelService,
              private forecastService: ForecastService) {
  }

  ngOnInit() {

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
        () => {
          this.employee.events.push({
            id: this.employee.id,
            date: new Date(this.timelineForm.value.date).toISOString(),
            type: this.timelineForm.value.type,
            event: this.timelineForm.value.event
          });
        }
      );
    }
  }

  submitNotesForm() {
    if (this.notesForm.valid) {
      this.personnelService.addNotes(
        this.employee.id,
        this.notesForm.value.notes
      ).subscribe(
        () => {
          this.employee.notes.push({
            id: this.employee.id,
            notes: this.notesForm.value.notes
          });
        }
      );
      console.log('VALID!!');
    }
  }

  submitSkillsForm() {
    if (this.skillsForm.valid) {
      this.personnelService.addSkills(
        this.employee.id,
        this.skillsForm.value.skill
      ).subscribe(
        () => {
          this.employee.skills.push({
            id: this.employee.id,
            skill: this.skillsForm.value.skill
          });
        }
      );
    }
  }
}
