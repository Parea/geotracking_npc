import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { LatLng } from '@ionic-native/google-maps';

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
  sessionName: any;
  records = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public sqlite: SQLite, public platform: Platform, private geolocation: Geolocation) {
    this.platform.ready().then(() => {// Permet de démarrer les codes si le device est prêt
      this.sessionId = this.navParams.get('id');
      this.sessionName = this.navParams.get('name');
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SessionPage');
  }

  getRecord(sessionId){
    this.sqlite.create({
    name: 'data.db',
    location: 'default'
  })
  .then((db: SQLiteObject) => {// Permet de vérifier si la base de données est créer ou bien bien créer la base
    db.executeSql('SELECT * FROM records WHERE session_id ='+ this.sessionId , {})
    .then((data) => {// récuperer tous les tableaux dans la table sessions
        this.records = data;
    })
    .catch(e => console.error('error select records',e));
  })
  .catch(e => console.log('error DB connection',e));
  }
}
