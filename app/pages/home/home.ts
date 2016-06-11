import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {EnterpriseAddPage} from '../enterprise-add/enterprise-add';

@Component({
  templateUrl: 'build/pages/home/home.html'
})
export class HomePage {

  constructor(private _navController:NavController) {
  }

  toEnterpriseAddPage(){
    this._navController.push(EnterpriseAddPage);
  }
}
