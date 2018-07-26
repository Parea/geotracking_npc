import { Component } from '@angular/core';
import { Platform, NavController, NavParams } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { HomePage } from '../home/home';
/**
 * Generated class for the WelcomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-welcome',
  templateUrl: 'welcome.html',
})
export class WelcomePage {

  database: SQLiteObject;

  constructor(public navCtrl: NavController, public navParams: NavParams, public sqlite: SQLite, private platform: Platform) {
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad WelcomePage');
    this.platform.ready().then(() => {
      this.initDb();
    })
  }

  initDb(){
    this.sqlite.create({
    name: 'data.db',
    location: 'default'
  })
  .then((db: SQLiteObject) => {// Permet de crée la base de données avant de crée les tables
    console.log('Db created');
    this.database = db;
    this.createTableSessions();
  })
  .catch(e => console.log('error DB creation',e));
  }
  
  createTableSessions() {// Création de la table sessions
    this.database.executeSql('CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, created_at TEXT)', {})
    .then(() => {
      console.log('Table sessions created great!');
      this.createTableRecords();
    })
    .catch(e => console.error('error table sessions creation',e));
  }
  
  createTableRecords() {// Création de la table records
    this.database.executeSql('CREATE TABLE IF NOT EXISTS records (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id INTEGER DEFAULT 0, save INTEGER DEFAULT 0, lat TEXT, lng TEXT, created_at TEXT, start TEXT, end TEXT)', {})
    .then(() => {
      console.log('Table records created great!');
      this.navCtrl.setRoot(HomePage);// Permet d'accéder directement sur la Page home de l'appli
    })
    .catch(e => console.log('error table records creation',e));
  }
}
