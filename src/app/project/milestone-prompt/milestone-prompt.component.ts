import {Component, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';

@Component({
  selector: 'app-milestone-prompt',
  templateUrl: './milestone-prompt.component.html',
  styleUrls: ['./milestone-prompt.component.scss']
})
export class MilestonePromptComponent implements OnInit {

  constructor(private dialogRef: MdDialogRef<MilestonePromptComponent>) {
  }

  ngOnInit() {
  }

}
