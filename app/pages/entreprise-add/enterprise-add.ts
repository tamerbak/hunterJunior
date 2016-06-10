import {Component} from '@angular/core';
import {NavController, Alert, Toast} from 'ionic-angular';
import {GooglePlaces} from "../../components/google-places/google-places";
import {EnterpriseAddService} from "../../providers/enterprise-add-service/enterprise-add-service";
import {HomePage} from "../home/home";

@Component({
    templateUrl: 'build/pages/entreprise-add/enterprise-add.html',
    directives: [GooglePlaces],
    providers: [EnterpriseAddService]
})
export class EnterpriseAddPage {

    private enterpriseCard:any;
    private selectedPlace:any;
    private nav:any;
    private service:any;
    private isMailValide:any;

    constructor(private _navController:NavController, _service:EnterpriseAddService) {
        this.service = _service;
        this.nav = _navController;
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
        let alert = Alert.create({
            title: 'Hunter Junior',
            subTitle: 'Identifiez-vous',
            message: 'Afin que vous serez contacté pour votre promotion, merci de saisir votre e-mail et votre téléphone',
            inputs: [
                {
                    name: 'mail',
                    placeholder: 'e-Mail'
                },
                {
                    name: 'phone',
                    placeholder: 'Téléphone',
                    type: 'tel'
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
                        // todo : preload email and phone..
                        if ((data.mail) && (data.phone)) {
                            // Save user account :
                            this.service.addUserAccount(data.mail, data.phone)
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
                                                                message: 'Félicitations! vos données sont bien enregistrer',
                                                                duration: 5000
                                                            });
                                                            this.nav.present(toast);
                                                        })
                                                });
                                        })
                                });
                            alert.dismiss().then(() => {
                                this.nav.pop(HomePage);
                            });

                        } else {
                            // invalid login
                            return false;
                        }
                    }
                }
            ]
        });
        this.nav.present(alert);
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
                if (e.target.value.substring(0, 1) == '0'){
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
        if(this.enterpriseCard.employer.email)
            return !(this.checkEmail(this.enterpriseCard.employer.email));
        else
            return false
    }
}
