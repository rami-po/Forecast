import {Component, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Funnel} from '../funnel-item.model';
import {FunnelService} from '../funnel.service';
import {isNullOrUndefined} from "util";

@Component({
  selector: 'app-add-funnel-item',
  templateUrl: './add-funnel-item.component.html',
  styleUrls: ['./add-funnel-item.component.scss'],
  providers: [FunnelService]
})
export class AddFunnelItemComponent implements OnInit {
  public title: string;
  public dismissible = false;
  public success = false;
  public error = false;
  public warning = false;
  public custom = false;
  public input = false;
  public projects;
  public inputText;
  myForm: FormGroup;

  public id = null;
  public clientName = null;
  public newClient = null;
  public projectName = null;
  public projectManager = null;
  public estimatedRevenue = null;
  public confidence = null;
  public status = null;
  public estimatedSigningDate = null;
  public projectedStartDate = null;
  public projectDuration = null;
  public scalaProjectId = null;
  public isCompleted = null;
  public notes = null;

  public entries = [
    {name: 'Client Name', formValue: 'clientName'},
    {name: 'Project Name', formValue: 'projectName'},
    {name: 'Project Manager', formValue: 'projectManager'},
    {name: 'Notes', formValue: 'notes'}
  ];

  public numberEntries = [
    {name: 'Project Duration (weeks)', formValue: 'projectDuration'},
    {name: 'Estimated Revenue', formValue: 'estimatedRevenue'},
    {name: 'Confidence', formValue: 'confidence'},
  ];

  public selectEntries = [
    {name: 'Is Completed?', formValue: 'isCompleted', options: [
      {name: 'Yes', id: true},
      {name: 'No', id: false}
      ]},
    {name: 'New Client?', formValue: 'newClient', options: [
      {name: 'Yes', id: true},
      {name: 'No', id: false}
    ]},
    {name: 'Status', formValue: 'status', options: [
      {name: 'Initial Contact', value: 'Initial Contact'},
      {name: 'Pitched', id: 'Pitched'},
      {name: 'Scoped', id: 'Scoped'},
      {name: 'SOW Presented', id: 'SOW Presented'},
      {name: 'SOW Negotiation', id: 'SOW Negotiation'},
      {name: 'SOW Signed', id: 'SOW Signed'}
      ]}
  ];

  constructor(public dialogRef: MdDialogRef<AddFunnelItemComponent>,
              private funnelService: FunnelService) {
  }

  ngOnInit() {
    this.selectEntries.push({name: 'Scala Project', formValue: 'scalaProjectId', options: this.projects});

    this.myForm = new FormGroup({
      clientName: new FormControl(this.clientName, Validators.required),
      newClient: new FormControl(this.newClient, Validators.required),
      projectName: new FormControl(this.projectName, Validators.required),
      projectManager: new FormControl(this.projectManager, Validators.required),
      estimatedRevenue: new FormControl(this.estimatedRevenue, Validators.required),
      confidence: new FormControl(this.confidence, Validators.required),
      status: new FormControl(this.status, Validators.required),
      estimatedSigningDate: new FormControl(this.estimatedSigningDate, Validators.required),
      projectedStartDate: new FormControl(this.projectedStartDate, Validators.required),
      projectDuration: new FormControl(this.projectDuration, Validators.required),
      scalaProjectId: new FormControl(this.scalaProjectId, Validators.required),
      isCompleted: new FormControl(this.isCompleted, Validators.required),
      notes: new FormControl(this.notes, Validators.required)
    });
  }

  onSubmit() {
    if (this.myForm.valid) {
      const form = this.myForm.value;



      if (this.id !== null) {
        const funnel = {
          id: this.id,
          client_name: form.clientName,
          is_new_client: form.newClient,
          project_name: form.projectName,
          project_manager: form.projectManager,
          revenue: form.estimatedRevenue,
          confidence: form.confidence,
          status: form.status,
          signing_date: form.estimatedSigningDate,
          start_date: form.projectedStartDate,
          duration_weeks: form.projectDuration,
          project_id: form.scalaProjectId,
          completed: form.isCompleted,
          notes: form.notes
        };
        this.funnelService.updateFunnelItem(funnel).subscribe();
      } else {
        const funnel = new Funnel(
          form.clientName, form.newClient, form.projectName, form.projectManager, form.estimatedRevenue, form.confidence,
          form.status, form.estimatedSigningDate, form.projectedStartDate, form.projectDuration, form.scalaProjectId,
          form.isCompleted, form.notes
        );
        this.funnelService.addFunnelItem(funnel).subscribe();
      }

      this.dialogRef.close(true);
    }
  }

  getFix(name) {
    return true;
  }

}

