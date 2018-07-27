import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

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
  start: any;
  end: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public sqlite: SQLite, public platform: Platform, private geolocation: Geolocation) {
    this.platform.ready().then(() => {// Permet de démarrer les codes si le device est prêt
      this.getRecord();
      this.sessionId = this.navParams.get('id');
      this.sessionName = this.navParams.get('name');
    })
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SessionPage');
  }

  getRecord() {
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {// Permet de vérifier si la base de données est créer ou bien bien créer la base
        db.executeSql('SELECT * FROM records WHERE session_id = ?', [this.sessionId = this.navParams.get('id')])
          .then((data) => {// récuperer tous les tableaux dans la table sessions
            for (let i = 0; i < data.rows.length; i++) {
              this.records.push(data.rows.item(i));
            }
            console.log('records: ', this.records);
          })
          .catch(e => console.error('error select records: ', e));
      })
      .catch(e => console.log('error DB connection', e));
  }

  setHours(moment: any) {
    // let diff = moment(this.end, 'H:m').diff(moment(this.start, 'H:m'))

    // let d = moment.durat(diff);
    // let totaltime = Math.floor(d.asHours()) + "heures" + moment.utc(diff).format(":mm") + "minutes";
    // console.log('setHours: ', totaltime);

    let current = new Date();
    let Start = current.setHours(this.start(":")[0], this.start(":")[1], 0);
    let End = current.setHours(this.end(":")[0], this.end(":")[1], 0);
    console.log(Start, End)
  }
}
