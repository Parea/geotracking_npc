import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { SessionPage } from '../session/session';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { NewsessionPage } from '../newsession/newsession';
import { LoadingController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  sessions = [];
  
  constructor(public navCtrl: NavController, public sqlite: SQLite, public platform: Platform, private barcodeScanner: BarcodeScanner, public loadingCtrl: LoadingController) {
    this.platform.ready().then(() => {// Permet de démarrer les codes si le device est prêt
      this.getSessions();
    })
  }

  ionViewWillEnter(){// Dés que l'on rentre dans la vue en éxécute le code
  }

  getSessions(){
    this.sqlite.create({
    name: 'data.db',
    location: 'default'
  })
  .then((db: SQLiteObject) => {// Permet de vérifier si la base de données est créer ou bien bien créer la base
    db.executeSql('SELECT * FROM sessions', {})
    .then((data) => {
      for(let i = 0; i < data.rows.length; i++) {// récuperer tous les tableaux dans la table sessions
        this.sessions.push(data.rows.item(i));
      }
    })
    .catch(e => console.error('error select sessions',e));
  })
  .catch(e => console.log('error DB connection',e));
  }

  openSessionPage(sessionId: any, sessionName: any): void {// Permet d'afficher les informations chaque fois que l'on tape sur les cards 
    this.presentLoading();
    this.navCtrl.push(SessionPage, {id:sessionId, name:sessionName});
  }

  startSession() {
    this.barcodeScanner.scan().then(barcodeData => {
      if(barcodeData.text == 'Start') this.navCtrl.push(NewsessionPage);
     }).catch(err => {
         console.log('Error', err);
     });
    this.presentLoading();
  }

  presentLoading() {
    this.loadingCtrl.create({
      content: 'Veuillez patientez...',
      duration: 2500,
      dismissOnPageChange: true
    }).present();
  }
}
