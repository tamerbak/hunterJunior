import {Component, ElementRef, ViewChild} from '@angular/core';
import {NavController, Alert, Toast, SqlStorage, Storage, Picker, PickerColumnOption, Popover} from 'ionic-angular';
import {GooglePlaces} from "../../components/google-places/google-places";
import {EnterpriseAddService} from "../../providers/enterprise-add-service/enterprise-add-service";
import {HomePage} from "../home/home";
import {PopoverAutocompletePage} from "../popover-autocomplete/popover-autocomplete";

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
    private db:any;
    private popover:any;
    private listSectors:any;
    private listJobs:any;

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
            },
            offer: {
                idSector: '',
                sector: '',
                idJob: '',
                job: ''
            }
        };

        this.service.loadSectors().then(listSectors => {
            if (listSectors) {
                this.listSectors = listSectors;
                this.db.set('listSectors', JSON.stringify(listSectors));
            }
        });

        this.service.loadJobs().then(listJobs => {
            if (listJobs) {
                this.listJobs = listJobs;
                this.db.set('listJobs', JSON.stringify(listJobs));
            }
        });
    }

    /**
     * @description function to get the selected result in the google place autocomplete
     */
    showResults(place) {
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
                                    if ((_mail === data.mail) && (_phone === data.phone)) {
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


    /**
     * Sectors picker
     */
    setSectorsPicker() {
        let rating = 0;
        let picker = Picker.create();
        let options:PickerColumnOption[] = new Array<PickerColumnOption>();

        this.db.get('listSectors').then(listSectors => {
            if (listSectors) {
                listSectors = JSON.parse(listSectors);
                for (let i = 1; i < listSectors.length; i++) {
                    options.push({
                        value: listSectors[i].id,
                        text: listSectors[i].label
                    })
                }
            }
            let column = {
                selectedIndex: 0,
                options: options
            };

            picker.addColumn(column);
            picker.addButton('Annuler');
            picker.addButton({
                text: 'Valider',
                handler: data => {
                    this.enterpriseCard.offer.sector = data.undefined.text;
                    this.enterpriseCard.offer.idSector = data.undefined.value;
                    this.filterJobList();
                    this.enterpriseCard.offer.job = '';
                    this.enterpriseCard.offer.idJob = '';
                }
            });
            picker.setCssClass('sectorPicker');
            this.nav.present(picker);

        });
    }

    /**
     * Sectors picker
     */
    setJobsPicker() {
        let rating = 0;
        let picker = Picker.create();
        let options:PickerColumnOption[] = new Array<PickerColumnOption>();


        this.db.get('listJobs').then(
            list => {
                if (list) {
                    list = JSON.parse(list);
                    let q = this.enterpriseCard.offer.idSector;

                    // if the value is an empty string don't filter the items
                    if (!(q === '')) {
                        list = list.filter((v) => {
                            return (v.idsector == q);
                        });
                    }

                    this.listJobs = list;
                    for (let i = 1; i < this.listJobs.length; i++) {
                        options.push({
                            value: this.listJobs[i].id,
                            text: this.listJobs[i].label
                        })
                    }
                    let column = {
                        selectedIndex: 0,
                        options: options
                    };

                    picker.addColumn(column);
                    picker.addButton('Annuler');
                    picker.addButton({
                        text: 'Valider',
                        handler: data => {
                            this.enterpriseCard.offer.job = data.undefined.text;
                            this.enterpriseCard.offer.idJob = data.undefined.value;
                        }
                    });
                    picker.setCssClass('jobPicker');
                    this.nav.present(picker);

                }
            }
        );

        /*this.service.loadJobs(this.enterpriseCard.offer.idSector).then(listJobs => {
            if (listJobs) {
                for (let i = 1; i < listJobs.length; i++) {
                    options.push({
                        value: listJobs[i].id,
                        text: listJobs[i].label
                    })
                }
            }
            let column = {
                selectedIndex: 0,
                options: options
            };

            picker.addColumn(column);
            picker.addButton('Annuler');
            picker.addButton({
                text: 'Valider',
                handler: data => {
                    this.enterpriseCard.offer.job = data.undefined.text;
                    this.enterpriseCard.offer.idJob = data.undefined.value;
                }
            });
            picker.setCssClass('jobPicker');
            this.nav.present(picker);

        });*/
    }

    presentPopover(ev, type) {

        let popover = Popover.create(PopoverAutocompletePage, {
            list : (type === 'secteur') ? this.listSectors : this.listJobs,
            type: type,
            idSector : this.enterpriseCard.offer.idSector
        });
        this.nav.present(popover, {
            ev: ev
        });

        popover.onDismiss(data => {
            if (data) {
                if (type === 'secteur') {
                    this.enterpriseCard.offer.sector = data.label;
                    this.enterpriseCard.offer.idSector = data.id;
                } else if (type === 'job') {
                    this.enterpriseCard.offer.job = data.label;
                    this.enterpriseCard.offer.idJob = data.id;
                }
            }
        });

    }


    filterSectorList (ev) {
        var q = ev.target.value;

        // if the value is an empty string don't filter the items
        if (q.trim() == '') {
            return;
        }

        this.listSectors = this.listSectors.filter((v) => {
            return (v.label.toLowerCase().indexOf(q.toLowerCase()) > -1);
        })
    }

    filterJobList () {

        this.db.get('listJobs').then(
            list => {
                if (list) {
                    list = JSON.parse(list);
                    let q = this.enterpriseCard.offer.idSector;

                    // if the value is an empty string don't filter the items
                    if (!(q === '')) {
                        list = list.filter((v) => {
                            return (v.idsector == q);
                        });
                        this.listJobs = list;
                    }

                }
            }
        );

    }


}
