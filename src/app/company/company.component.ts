import {AfterViewInit, Component, OnInit} from '@angular/core';
import {CompanyService} from "./company.service";
import {NavigationExtras, Router} from "@angular/router";
import {isNull} from "util";

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss'],
  providers: [CompanyService]
})
export class CompanyComponent implements OnInit, AfterViewInit {

  public projects = [];
  public isDataReady = false;
  public isViewReady = false;

  constructor(
    private companyService: CompanyService,
    private router: Router
  ) { }

  ngOnInit() {
    this.companyService.getProjects().subscribe(
      data => {
        data.result.splice(0, 1); // removes Internal
        this.isDataReady = true;
        this.projects = data.result;
      }
    );
  }

  ngAfterViewInit() {
    console.log('!!!!');
    this.isViewReady = true;
    const graph = document.getElementById('graph');
    if (!isNull(graph)) {
      console.log('boidsafsadf');
      graph.style.width = '200px';
    }

  }

  goToProjectView(project) {
    const navigationExtras: NavigationExtras = {
      queryParams: { 'id': project.id}
    };
    this.router.navigate(['project'], navigationExtras);
  }

}
