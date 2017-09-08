import { Component, OnInit } from '@angular/core';
import { MdDialogRef } from '@angular/material';

@Component({
  selector: 'app-status-message',
  templateUrl: './status-message.component.html',
  styleUrls: ['./status-message.component.scss']
})
export class StatusMessageDialogComponent implements OnInit {
  public messages: any;
  public title: string;
  public dismissible: boolean = false;
  public success: boolean = false;
  public error: boolean = false;
  public warning: boolean = false;
  public custom: boolean = false;

  constructor(
    private dialogRef: MdDialogRef<StatusMessageDialogComponent>,
  ) { }

  ngOnInit() { }

}

