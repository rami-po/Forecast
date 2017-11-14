import {Component, OnInit} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {MdIconRegistry} from "@angular/material";

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss']
})
export class MainNavComponent implements OnInit {

  constructor(
    private sanitizer: DomSanitizer,
    private iconRegistry: MdIconRegistry
  ) {
    iconRegistry.addSvgIcon(
      'chicklet',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/ic_chicklet.svg'));
  }

  ngOnInit() {
  }

}