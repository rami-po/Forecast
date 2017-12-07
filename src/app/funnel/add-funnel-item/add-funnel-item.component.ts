import {Component, OnInit} from '@angular/core';
import {MatDialogRef, MatIconRegistry} from '@angular/material';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Funnel} from '../funnel-item.model';
import {FunnelService} from '../funnel.service';
import {isNullOrUndefined} from "util";
import {DomSanitizer} from "@angular/platform-browser";

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
  public keyedProjects;
  public inputText;
  myForm: FormGroup;

  public id = null;
  public clientName = null;
  public newClient = false;
  public projectName = null;
  public projectManager = null;
  public estimatedRevenue = null;
  public confidence = null;
  public status = null;
  public estimatedSigningDate = null;
  public projectedStartDate = null;
  public projectDuration = null;
  public isCompleted = false;
  public notes = null;
  public URL = null;
  public priority = null;

  public entries = [
    {name: 'Client', text: '', formValue: 'clientName'},
    {name: 'Project', text: '', formValue: 'projectName'},
    {name: 'PM', text: '', formValue: 'projectManager'},
    {name: 'Notes', text: '', formValue: 'notes'},
    {name: 'URL', text: '', formValue: 'URL'}
  ];

  public numberEntries = [
    {name: 'Duration (weeks)', formValue: 'projectDuration'},
    {name: 'Estimated Revenue', formValue: 'estimatedRevenue'},
    {name: 'Confidence', formValue: 'confidence'},
  ];

  public statusEntry = {
    name: 'Status', formValue: 'status', options: [
      {name: 'Lead', value: 'Lead'},
      {name: 'Initial Contact', value: 'Initial Contact'},
      {name: 'Pitched', value: 'Pitched'},
      {name: 'Scoped', value: 'Scoped'},
      {name: 'SOW Presented', value: 'SOW Presented'},
      {name: 'SOW Negotiation', value: 'SOW Negotiation'},
      {name: 'SOW Signed', value: 'SOW Signed'}
    ]
  };

  public priorityEntry = {
    name: 'Priority', formValue: 'priority', options: [
      {name: 'a', value: 'a'},
      {name: 'b', value: 'b'},
      {name: 'c', value: 'c'}
    ]
  };

  public checkBoxEntries = [
    {name: 'Is Completed?', formValue: 'isCompleted'},
    {name: 'New Client?', formValue: 'newClient'}
  ];

  constructor(public dialogRef: MatDialogRef<AddFunnelItemComponent>,
              private iconRegistry: MatIconRegistry,
              private sanitizer: DomSanitizer,
              private funnelService: FunnelService) {
    iconRegistry.addSvgIcon(
      'drop', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_arrow_drop_down_black_48px.svg'));
  }

  ngOnInit() {
    console.log(this.entries);
    console.log(this.keyedProjects);
    this.initializeEntries();

    this.myForm = new FormGroup({
      clientName: new FormControl(this.clientName, Validators.required),
      newClient: new FormControl(this.newClient, null),
      projectName: new FormControl(this.projectName, Validators.required),
      projectManager: new FormControl(this.projectManager, Validators.required),
      estimatedRevenue: new FormControl(this.estimatedRevenue, Validators.required),
      confidence: new FormControl(this.confidence, Validators.required),
      status: new FormControl(this.status, Validators.required),
      estimatedSigningDate: new FormControl(this.estimatedSigningDate, Validators.required),
      projectedStartDate: new FormControl(this.projectedStartDate, Validators.required),
      projectDuration: new FormControl(this.projectDuration, Validators.required),
      isCompleted: new FormControl(this.isCompleted, null),
      notes: new FormControl(this.notes, null),
      URL: new FormControl(this.URL, null),
      priority: new FormControl(this.priority, Validators.required)
    });
  }

  onSubmit() {
    if (this.myForm.valid) {
      console.log('VALID!');
      const form = this.myForm.value;

      console.log(form.projectName);
      console.log(this.keyedProjects[form.projectName]);

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
          scalaProjectId: this.keyedProjects[form.projectName],
          completed: form.isCompleted,
          notes: form.notes,
          URL: form.URL,
          priority: form.priority
        };
        this.funnelService.updateFunnelItem(funnel).subscribe();
      } else {
        const funnel = new Funnel(
          form.clientName, form.newClient, form.projectName, form.projectManager, form.estimatedRevenue, form.confidence,
          form.status, form.estimatedSigningDate, form.projectedStartDate, form.projectDuration, this.keyedProjects[form.projectName],
          form.isCompleted, form.notes, form.URL, form.priority
        );
        this.funnelService.addFunnelItem(funnel).subscribe();
      }

      this.dialogRef.close(true);
    }
  }

  setProjectName(name) {
    this.entries[1].text = name;
    console.log(this.entries[1].text);
    this.myForm.value.projectName = name;
  }


  initializeEntries() {
    this.entries[0].text = (this.clientName === null ? '' : this.clientName);
    this.entries[1].text = (this.projectName === null ? '' : this.projectName);
    this.entries[2].text = (this.projectManager === null ? '' : this.projectManager);
    this.entries[3].text = (this.notes === null ? '' : this.notes);
    this.entries[4].text = (this.URL === null ? '' : this.URL);

  }

}

