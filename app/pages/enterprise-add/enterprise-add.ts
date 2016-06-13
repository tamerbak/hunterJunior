import {Component} from '@angular/core';
import {NavController, Alert, Toast, SqlStorage, Storage} from 'ionic-angular';
import {GooglePlaces} from "../../components/google-places/google-places";
import {EnterpriseAddService} from "../../providers/enterprise-add-service/enterprise-add-service";
import {HomePage} from "../home/home";

@Component({
    templateUrl: 'build/pages/enterprise-add/enterprise-add.html',
    directives: [GooglePlaces],
    providers: [EnterpriseAddService]
})
export class EnterpriseAddPage {

    private enterpriseCard:any;
    private selectedPlace:any;
    private nav:any;
    private service:any;
    private isMailValide:any;
    private db:any

    constructor(private _navController:NavController, _service:EnterpriseAddService) {
        this.service = _service;
        this.nav = _navController;
        this.db = new Storage(SqlStorage);
        this.enterpriseCard = {
            employer: {
                firstName: '',
                lastName: '',
                phone: '',
                mail: ''
            },
            enterprise: {
                name: '',
                address: ''
            }
        }
    }

    /**
     * @description function to get the selected result in the google place autocomplete
     */
    showResults(place) {
        debugger;
        this.selectedPlace = place;
        this.enterpriseCard.enterprise.address = place.formatted_address;

    }

    sendCard() {

        let _phone:string;
        let _mail:string;

        this.db.get('userData').then(userData => {
            if (userData) {
                userData = JSON.parse(userData);
                _phone = userData.phone;
                _mail = userData.mail;
            }

            let alert = Alert.create({
                title: 'Hunter Junior',
                subTitle: 'Identifiez-vous',
                message: 'Afin de vous attribuer cette capture d’opportunité, merci de saisir ou de valider votre adresse email et numéro de téléphone',
                inputs: [
                    {
                        name: 'mail',
                        placeholder: 'e-Mail',
                        value: _mail ? _mail : ''
                    },
                    {
                        name: 'phone',
                        placeholder: 'Téléphone',
                        type: 'tel',
                        value: _phone ? _phone : ''
                    }
                ],
                buttons: [
                    {
                        text: 'Annuler',
                        role: 'cancel',
                        handler: data => {
                            console.log('Cancel clicked');
                        }
                    },
                    {
                        text: 'Ok',
                        handler: data => {

                            if ((data.mail) && (data.phone)) {
                                if ((_mail) && (_phone)) {
                                    // used to hunt..
                                    if ((_mail===data.mail) && (_phone === data.phone)) {
                                        // same account
                                        this.loadDataOldHunter();
                                    } else {
                                        // he changed his phone or mail..
                                        // Save his other account :
                                        let userData = {
                                            phone: data.phone,
                                            mail: data.mail
                                        };
                                        this.db.set('userData', JSON.stringify(userData));
                                        this.loadDataNewHunter(data.mail, data.phone);
                                    }

                                } else {
                                    // first hunt :
                                    // Save user account :
                                    let userData = {
                                        phone: data.phone,
                                        mail: data.mail
                                    };
                                    this.db.set('userData', JSON.stringify(userData));
                                    this.loadDataNewHunter(data.mail, data.phone);
                                }
                                /* Data loaded now we pop to home*/
                                alert.dismiss().then(() => {
                                    this.nav.pop(HomePage);
                                });
                            } else {
                                // invalid data
                                return false;
                            }

                        }
                    }
                ]
            });
            this.nav.present(alert);
        });


    }

    /**
     * Loading employer data and ignoring already existed user
     */
    loadDataOldHunter() {
        this.service.addEmployerAccount(
            this.enterpriseCard.employer.mail,
            this.enterpriseCard.employer.phone)
            .then(employerAccountData => {
                this.service.updateEmployerCivility('',
                    this.enterpriseCard.employer.lastName,
                    this.enterpriseCard.employer.firstName,
                    this.enterpriseCard.enterprise.name, '', '',
                    employerAccountData.employer.id, employerAccountData.employer.entreprises[0].id)
                    .then(employerCivilityData => {
                        this.service.updateEmployerAddress(
                            employerAccountData.employer.entreprises[0].id,
                            this.selectedPlace.adr_address)
                            .then(employerAddressData => {
                                let toast = Toast.create({
                                    message: 'Félicitations! vos données sont bien enregistrées.',
                                    duration: 5000
                                });
                                this.nav.present(toast);
                            })
                    });
            })
    }

    /**
     * Load new hunter's data before loading employer's one
     * @param _mail
     * @param _phone
     */
    loadDataNewHunter(_mail, _phone) {
        this.service.addUserAccount(_mail, _phone)
            .then(userAccountData => {
                this.service.addEmployerAccount(
                    this.enterpriseCard.employer.mail,
                    this.enterpriseCard.employer.phone)
                    .then(employerAccountData => {
                        this.service.updateEmployerCivility('',
                            this.enterpriseCard.employer.lastName,
                            this.enterpriseCard.employer.firstName,
                            this.enterpriseCard.enterprise.name, '', '',
                            employerAccountData.employer.id, employerAccountData.employer.entreprises[0].id)
                            .then(employerCivilityData => {
                                this.service.updateEmployerAddress(
                                    employerAccountData.employer.entreprises[0].id,
                                    this.selectedPlace.adr_address)
                                    .then(employerAddressData => {
                                        let toast = Toast.create({
                                            message: 'Félicitations! vos données sont bien enregistrées.',
                                            duration: 5000
                                        });
                                        this.nav.present(toast);
                                    })
                            });
                    })
            });
    }

    /**
     * @description validate phone data field and call the function that search for it in the server
     */
    watchPhone(e) {
        /*if (this.enterpriseCard.employer.phone) {
         if (this.enterpriseCard.employer.phone.length == 9) {
         //get the 9th entered character
         return;
         }
         if (this.enterpriseCard.employer.phone.length > 9) {
         this.enterpriseCard.employer.phone = this.enterpriseCard.employer.phone.substring(0, 9);
         return;
         }
         }*/

        if (e.target.value) {
            //this.isPhoneNumValid = false;
            if (e.target.value.includes('.')) {
                e.target.value = e.target.value.replace('.', '');
            }
            if (e.target.value.length > 9) {
                e.target.value = e.target.value.substring(0, 9);
            }
            if (e.target.value.length == 9) {
                if (e.target.value.substring(0, 1) == '0') {
                    e.target.value = e.target.value.substring(1, e.target.value.length);
                }
                //this.isPhoneNumValid = true;
            }

        }
    }

    /**
     * @description show error msg if phone is not valid
     */
    showPhoneError() {
        if (this.enterpriseCard.employer.phone)
            return (this.enterpriseCard.employer.phone.length != 9);
    }

    watchEmail(e) {
        this.isMailValide = this.checkEmail(e.target.value);
    }

    /**
     * @description check if an email is valid
     * @param id of the email component
     */
    checkEmail(email) {
        var EMAIL_REGEXP = /^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
        var isMatchRegex = EMAIL_REGEXP.test(email);
        return isMatchRegex;
    }

    /**
     * @description validate the email format
     */
    showEmailError() {
        if (this.enterpriseCard.employer.email)
            return !(this.checkEmail(this.enterpriseCard.employer.email));
        else
            return false
    }
}
