import {Component, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Funnel} from '../funnel-item.model';
import {FunnelService} from '../funnel.service';

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
      clientName: new FormControl(null, Validators.required),
      newClient: new FormControl(null, Validators.required),
      projectName: new FormControl(null, Validators.required),
      projectManager: new FormControl(null, Validators.required),
      estimatedRevenue: new FormControl(null, Validators.required),
      confidence: new FormControl(null, Validators.required),
      status: new FormControl(null, Validators.required),
      estimatedSigningDate: new FormControl(null, Validators.required),
      projectedStartDate: new FormControl(null, Validators.required),
      projectDuration: new FormControl(null, Validators.required),
      scalaProjectId: new FormControl(null, Validators.required),
      isCompleted: new FormControl(null, Validators.required),
      notes: new FormControl(null, Validators.required)
    });
  }

  onSubmit() {
    if (this.myForm.valid) {
      const form = this.myForm.value;

      const funnel = new Funnel(
        form.clientName, form.newClient, form.projectName, form.projectManager, form.estimatedRevenue, form.confidence,
        form.status, form.estimatedSigningDate, form.projectedStartDate, form.projectDuration, form.scalaProjectId,
        form.isCompleted, form.notes
      );

      this.funnelService.addFunnelItem(funnel).subscribe();

      this.dialogRef.close(true);
    }
  }

  getFix(name) {
    return true;
  }

}

