import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {DomSanitizer} from "@angular/platform-browser";
import {MatIconRegistry} from "@angular/material";
import {ForecastService} from '../forecast/forecast.service';
import {isNullOrUndefined} from 'util';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {FileUploader} from "ng2-file-upload";
import {PersonnelClientService} from "./personnel-client.service";

@Component({
  selector: 'app-personnel-client',
  templateUrl: './personnel-client.component.html',
  styleUrls: ['./personnel-client.component.scss'],
  providers: [PersonnelClientService]
})
export class PersonnelClientComponent implements OnInit {

  public client;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private personnelClientService: PersonnelClientService,
              private forecastService: ForecastService,
              private iconRegistry: MatIconRegistry,
              private sanitizer: DomSanitizer) {
    iconRegistry.addSvgIcon(
      'remove',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_remove.svg'))
      .addSvgIcon(
        'heart',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_heart.svg'))
      .addSvgIcon(
        'map-marker',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_map_marker.svg'))
      .addSvgIcon(
        'envelope',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_envelope.svg'))
      .addSvgIcon(
        'phone',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_phone.svg'));
  }

  ngOnInit() {
    this.route.params.subscribe(
      params => {
        console.log(params);
      }
    );
  }
}
