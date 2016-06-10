import {Component} from '@angular/core';
import {AppVersion} from "ionic-native/dist/index";


@Component({
  templateUrl: 'build/pages/about/about.html'
})
export class AboutPage {

  releaseDate:string;
  appName: string;
  version: string;
  versionCode: string;
  versionNumber: string;
  constructor() {
    this.releaseDate = '10 Juin 2016';
    //this.appName = AppVersion.getAppName();
    //this.version = AppVersion.getPackageName();
    //this.versionCode = AppVersion.getVersionCode();
    AppVersion.getVersionNumber().then( _version => {
       this.versionNumber = _version
    });

  }
}
