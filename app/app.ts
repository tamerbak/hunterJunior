import {Component, ViewChild} from '@angular/core';
import {App, ionicBootstrap, Platform, Nav} from 'ionic-angular';
import {StatusBar} from 'ionic-native';
import {HomePage} from "./pages/home/home";
import {AboutPage} from "./pages/about/about";


@Component({
  templateUrl: 'build/app.html'
})
class HunterJunior {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = HomePage;
  pages: Array<{title: string, component: any}>;

  constructor(private platform: Platform) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Capturer une opportunité', component: HomePage },
      { title: 'À propos ', component: AboutPage }
    ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}

ionicBootstrap(HunterJunior, [], {backButtonText:'Retour'});
