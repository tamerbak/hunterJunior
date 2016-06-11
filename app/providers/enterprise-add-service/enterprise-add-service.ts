import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the EnterpriseAddService provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class EnterpriseAddService {
  data: any = null;
  addEmployerData:any = null;
  addAddressData:any = null;
  addUserData:any = null;
  private sqlURL : string = 'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/sql';
  private calloutURL:string = 'http://vitonjobv1.datqvvgppi.us-west-2.elasticbeanstalk.com/api/business';

  constructor(public http: Http) {}

  load() {
    if (this.data) {
      // already loaded data
      return Promise.resolve(this.data);
    }

    // don't have the data yet
    return new Promise(resolve => {
      // We're using Angular Http provider to request the data,
      // then on the response it'll map the JSON data to a parsed JS object.
      // Next we process the data and resolve the promise with the new data.
      this.http.get('path/to/data.json')
        .map(res => res.json())
        .subscribe(data => {
          // we've got back the raw data, now generate the core schedule data
          // and save the data for later reference
          this.data = data;
          resolve(this.data);
        });
    });
  }

  /**
   * @description Insert a user_account if it does not exist
   * @param email
   * @param phone
   * @param password
   */
  addEmployerAccount(email: string, phone: number, password:string){

    //Prepare the request
    let login:any =
    {
      'class': 'com.vitonjob.callouts.auth.AuthToken',
      'email': email,
      'telephone': "+" + phone,
      'password': password,
      'role': 'employeur'
    };
    login = JSON.stringify(login);
    var encodedLogin = btoa(login);
    var dataLog = {
      'class': 'fr.protogen.masterdata.model.CCallout',
      'id': 130,
      'args': [{
        'class': 'fr.protogen.masterdata.model.CCalloutArguments',
        label: 'requete authentification',
        value: encodedLogin
      }]
    };
    let body = JSON.stringify(dataLog);

    return new Promise(resolve => {
      let headers = new Headers();
      headers.append("Content-Type", 'application/json');
      this.http.post(this.calloutURL, body, {headers:headers})
          .map(res => res.json())
          .subscribe(data => {
            this.addEmployerData = data;
            resolve(this.addEmployerData);
          });
    })
  }

  /**
   * @description Insert a user_account if it does not exist
   * @param email
   * @param phone
   * @param password
   */
  addUserAccount(email: string, phone: number, password:string='HunterJunior'){

    //Prepare the request
    var login =
    {
      'class': 'com.vitonjob.callouts.auth.AuthToken',
      'email': email,
      'telephone': "+" + phone,
      'password': password,
      'role': 'employeur'
    };
    let loginString = JSON.stringify(login);
    let encodedLogin = btoa(loginString);
    let dataLog = {
      'class': 'fr.protogen.masterdata.model.CCallout',
      'id': 130,
      'args': [{
        'class': 'fr.protogen.masterdata.model.CCalloutArguments',
        label: 'requete authentification',
        value: encodedLogin
      }]
    };
    let body = JSON.stringify(dataLog);

    return new Promise(resolve => {
      let headers = new Headers();
      headers.append("Content-Type", 'application/json');
      this.http.post(this.calloutURL, body, {headers:headers})
          .map(res => res.json())
          .subscribe(data => {
            this.addUserData = data;
            resolve(this.addUserData);
          });
    })
  }


  updateEmployerCivility(title, lastname, firstname, companyname, siret, ape, employerID, entrepriseId){
    var sql = "update user_employeur set ";
    sql = sql + " titre='" + title + "', ";
    sql = sql + " nom='" + lastname + "', prenom='" + firstname + "' where pk_user_employeur=" + employerID + ";";
    sql = sql + " update user_entreprise set nom_ou_raison_sociale='" + companyname + "', ";
    sql = sql + "siret='" + siret + "', ";
    sql = sql + "ape_ou_naf='" + ape + "' where  pk_user_entreprise=" + entrepriseId;

    return new Promise(resolve => {
      let headers = new Headers();
      headers.append("Content-Type", 'text/plain');
      this.http.post(this.sqlURL, sql, {headers:headers})
          .map(res => res.json())
          .subscribe(data => {
            this.data = data;
            console.log(this.data);
            resolve(this.data);
          });
    })
  }

  /**
   * @description update employer and jobyer personal address
   * @param enterpriseId,
   * @param address
   */
  updateEmployerAddress(enterpriseId: string, address: any){
    //formating the address
    let street = "";
    let cp = "";
    let ville = "";
    let pays = "";

    if(address){
      street = this.getStreetFromGoogleAddress(address);
      cp = this.getZipCodeFromGoogleAddress(address);
      ville = this.getCityFromGoogleAddress(address);
      pays = this.getCountryFromGoogleAddress(address);
      //  Now we need to save the address
      let addressData = {
        'class': 'com.vitonjob.localisation.AdressToken',
        'street': street,
        'cp': cp,
        'ville': ville,
        'pays': pays,
        'role':'employeur',
        'id': enterpriseId,
        'type': 'personnelle'
      };
      let addressDataString = JSON.stringify(addressData);
      let encodedAddress = btoa(addressDataString);
      let data = {
        'class': 'fr.protogen.masterdata.model.CCallout',
        'id': 138,
        'args': [{
          'class': 'fr.protogen.masterdata.model.CCalloutArguments',
          label: 'Adresse',
          value: encodedAddress
        }]
      };
      let stringData = JSON.stringify(data);
      return new Promise(resolve => {
        let headers = new Headers();
        headers.append("Content-Type", 'application/json');
        this.http.post(this.calloutURL, stringData, {headers:headers})
            .subscribe(data => {
              this.addAddressData = data;
              resolve(this.addAddressData);
            });
      });
    }
  }



  /**
   * @description function to get the street name from an address returned by the google places service
   * @param address
   */
  getStreetFromGoogleAddress(address){
    var streetIndex = address.indexOf("street-address");
    var street = '';
    if (streetIndex > 0) {
      streetIndex = streetIndex + 16;
      var sub = address.substring(streetIndex, address.length - 1);
      var endStreetIndex = sub.indexOf('</');
      street = sub.substring(0, endStreetIndex);
    }
    return street;
  }

  /**
   * @description function to get the zip code from an address returned by the google places service
   * @param address
   */
  getZipCodeFromGoogleAddress(address){
    var cpIndex = address.indexOf("postal-code");
    var cp = '';
    if (cpIndex > 0) {
      cpIndex = cpIndex + 13;
      var subcp = address.substring(cpIndex, address.length - 1);
      var endCpIndex = subcp.indexOf('</');
      cp = subcp.substring(0, endCpIndex);
    }
    return cp;
  }

  /**
   * @description function to get the city name from an address returned by the google places service
   * @param address
   */
  getCityFromGoogleAddress(address){
    var villeIndex = address.indexOf("locality");
    var ville = '';
    if (villeIndex > 0) {
      villeIndex = villeIndex + 10;
      var subville = address.substring(villeIndex, address.length - 1);
      var endvilleIndex = subville.indexOf('</');
      ville = subville.substring(0, endvilleIndex);
    }
    return ville;
  }

  /**
   * @description function to get the country name from an address returned by the google places service
   * @param address
   */
  getCountryFromGoogleAddress(address){
    var paysIndex = address.indexOf("country-name");
    var pays = '';
    if (paysIndex > 0) {
      paysIndex = paysIndex + 14;
      var subpays = address.substring(paysIndex, address.length - 1);
      var endpaysIndex = subpays.indexOf('</');
      pays = subpays.substring(0, endpaysIndex);
    }
    return pays;
  }






  
}

