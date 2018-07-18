import { Component } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';

/**
 * Generated class for the SessionPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-session',
  templateUrl: 'session.html',
})
export class SessionPage {

  sessionId: 0;

  constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform) {
    this.platform.ready().then(() => {// Permet de démarrer les codes si le device est prêt
      this.sessionId = this.navParams.get('id');
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SessionPage');
  }

 
}
