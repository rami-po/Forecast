import {AfterViewInit, Component, OnInit} from '@angular/core';
import {CompanyService} from './company.service';
import {NavigationExtras, Router} from '@angular/router';
import {isNull} from 'util';
import {ForecastService} from '../forecast/forecast.service';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss'],
  providers: [CompanyService]
})
export class CompanyComponent implements OnInit {

  public projects = [];
  public isDataReady = false;

  constructor(
    private mainService: ForecastService,
    private router: Router
  ) { }

  ngOnInit() {
    console.log('ngOnInit - CompanyComponent');
    this.mainService.getProjects('?active=1').subscribe(
      data => {
        data.result.splice(0, 1); // removes Internal
        this.isDataReady = true;
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
