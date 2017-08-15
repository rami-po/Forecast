import { Component, OnInit } from '@angular/core';
import {CompanyService} from "./company.service";

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss'],
  providers: [CompanyService]
})
export class CompanyComponent implements OnInit {

  public projects = [];

  constructor(
    private companyService: CompanyService
  ) { }

  ngOnInit() {
    this.companyService.getProjects().subscribe(
      data => {
        console.log(data);
        this.projects = data.result;
      }
    );
  }

}
