import { Component, OnInit } from '@angular/core';
import {CompanyService} from "./company.service";
import {NavigationExtras, Router} from "@angular/router";

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss'],
  providers: [CompanyService]
})
export class CompanyComponent implements OnInit {

  public projects = [];

  constructor(
    private companyService: CompanyService,
    private router: Router
  ) { }

  ngOnInit() {
    this.companyService.getProjects().subscribe(
      data => {
        console.log(data);
        this.projects = data.result;
      }
    );
  }

  goToProjectView(project) {
    const navigationExtras: NavigationExtras = {
      queryParams: { 'id': project.id}
    };
    this.router.navigate(['project'], navigationExtras);
  }

}
