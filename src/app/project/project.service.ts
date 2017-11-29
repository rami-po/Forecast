import {Injectable} from '@angular/core';
import {Http, Headers, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {DatePipe} from '@angular/common';
import {ForecastService} from '../forecast/forecast.service';
import {isNullOrUndefined} from 'util';
import {MatDialog, MatDialogRef, MatDialogConfig} from '@angular/material';
import {MilestonePromptComponent} from './milestone-prompt/milestone-prompt.component';

@Injectable()
export class ProjectService {
  constructor(
    private dialog: MatDialog
  ) { }

  openDialog(): Observable<boolean> {
    let dialogRef: MatDialogRef<MilestonePromptComponent>;
    dialogRef = this.dialog.open(MilestonePromptComponent);

    return dialogRef.afterClosed();
  }



}
