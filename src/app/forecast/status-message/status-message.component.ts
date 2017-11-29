import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-status-message',
  templateUrl: './status-message.component.html',
  styleUrls: ['./status-message.component.scss']
})
export class StatusMessageDialogComponent implements OnInit {
  public messages: any;
  public options: any;
  public title: string;
  public dismissible = false;
  public success = false;
  public error = false;
  public warning = false;
  public custom = false;
  public input = false;
  public inputText;

  constructor(
    public dialogRef: MatDialogRef<StatusMessageDialogComponent>
  ) { }

  ngOnInit() { }

  onKey(event) {
    this.inputText = event.target.value;
  }

  resolve(option) {
    option['isResolved'] = !option['isResolved'];
  }

}

