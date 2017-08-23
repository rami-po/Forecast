import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ProjectService} from './project.service';
import {MainService} from '../main/main.service';
import {isUndefined} from 'util';


@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, AfterViewInit {

  @Input() public projectId;
  @Input() public tableEnabled = true;
  public params;
  public projectName;

  constructor(
    private route: ActivatedRoute,
    private mainService: MainService
  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(
      params => {

        if (!isUndefined(params.id)) {
          this.projectId = params.id;
          this.params = '?projectId=' + params.id;
        } else {
          this.params = '?projectId=' + this.projectId;
        }

        this.mainService.getProjects('/' + this.projectId).subscribe(
          data => {
            this.projectName = data.result[0].name;
          }
        );

      }
    );
  }

  ngAfterViewInit() {
    if (this.tableEnabled) {
      const graph = document.getElementById('graph');
      // graph.style.width = '1000px';
      // const marginTop = '600px';
      // const title = document.getElementById('title');
      // const side = document.getElementById('side');
      // const table = document.getElementById('table');
      // const header = document.getElementById('header');
      // header.style.marginTop = marginTop;
      // title.style.marginTop = marginTop;
      // side.style.marginTop = marginTop;
      // table.style.marginTop = '187px';
    }
  }
}
