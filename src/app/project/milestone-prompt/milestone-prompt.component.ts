import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-milestone-prompt',
  templateUrl: './milestone-prompt.component.html',
  styleUrls: ['./milestone-prompt.component.scss']
})
export class MilestonePromptComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<MilestonePromptComponent>) {
  }

  ngOnInit() {
  }

}
