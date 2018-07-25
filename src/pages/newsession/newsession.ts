import { HomePage } from './../home/home';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { LatLng } from '@ionic-native/google-maps';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';
import { LoadingController } from 'ionic-angular';

declare var google;

@Component({
  selector: 'page-newsession',
  templateUrl: 'newsession.html',
})
export class NewsessionPage {
  @ViewChild('map') mapElement: ElementRef;

  currentMapTrack = null;
  isTracking = false;
  trackedRoute = [];
  previousTracks = [];
  latlng: LatLng;
  map: any;
  lat: any;
  lng: any;
  name: any;
  sessionId: 1;
  positionSubscription: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public sqlite: SQLite, public platform: Platform, private geolocation: Geolocation, public loadingCtrl: LoadingController) {
    this.platform.ready().then(() => {// Permet de démarrer les codes si le device est prêt
      this.geolocation.getCurrentPosition().then((position) => {
        this.latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
        this.addMarker(this.latlng);

        //this.insertRecord(this.sessionId);
        this.loadMap();
        this.startTracking();
      }).catch((error) => {
        console.log('Error getting location', error);
      });
    });
  }

  loadMap() {//Charge la map au moment du lancement 
    let mapOptions = {
      center: this.latlng,
      zoom: 18,
      mapTypeId: google.maps.MapTypeId.SATELLITE,
      frequency: 1000,
      enableHighAccuracy: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    console.log('Map is ready!');
  }

  loadHistoryRoutes() {//historique du parcours fait
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {// Permet de vérifier si la base de données est créer ou bien bien créer la base
        db.executeSql('SELECT * FROM records', {})
          .then((data) => {
            this.previousTracks = data;

            console.log('data: ', data);
          })
      })
  }

  startTracking() {//demarre le tracking
    this.isTracking = true;
    this.trackedRoute = [];

    let watchOption = {
      frequency: 1000,
      enableHighAccuracy: true,
      timeout: 3000
    }

    this.positionSubscription = this.geolocation.watchPosition(watchOption).pipe(filter((p) => p.coords !== undefined)).subscribe(data => {

      this.trackedRoute.push({ lat: data.coords.latitude, lng: data.coords.longitude });
      this.latlng = new LatLng(data.coords.latitude, data.coords.longitude);
      this.redrawPath(this.trackedRoute);
      //this.insertRecord();
      this.addMarker(this.latlng);

    });
    console.log('startTracking: this.positionSubscription ', this.positionSubscription);
  }

  stopTracking() {//Arrête tracking
    let newRoute = { finished: new Date().getTime(), path: this.trackedRoute };
    this.previousTracks.push(newRoute);

    this.isTracking = false;
    this.positionSubscription.unsubscribe();
    this.presentLoading();

    console.log('stopTracking: this.positionSubscription ', this.positionSubscription);
  }

  insertRecord() {
    this.sqlite.create({//validation et insertion lat, lng en cours dans la base de données
      name: 'data.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {// Permet de vérifier si la base de données est créer ou bien bien créer la base
        let date = Date();
        let insertRecord = "INSERT INTO `records` (lat, lng, created_at) VALUES ('" + this.lat + "', '" + this.lng + "', '" + date + "');";
        
        console.log('insertrecord: ', insertRecord);

        db.executeSql(insertRecord, {})
          .then((data) => {
            console.log('nouveau record enregistré');
          })
          .catch(e => console.error('error insertRecord: ', e));
      })
      .catch(e => console.log('error DB connection', e));
  }

  insertSession() {//validation et insertion de la session en cours dans la base de données
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {// Permet de vérifier si la base de données est créer ou bien bien créer la base
        let date = Date();
        let insertSession = "INSERT INTO `sessions` (name, created_at) VALUES ('" + this.name + "', '" + date + "');";

        console.log('insertSession: ', insertSession);

        db.executeSql(insertSession, {})
          .then((data) => {
            this.name = data;
            console.log('nouvel session enregistré');
          })
          .catch(e => console.error('error insertSession: ', e));
      })
      .catch(e => console.log('error DB connection', e));
    this.insertRecord();
    this.updateRecord(this.sessionId);
    this.navCtrl.push(HomePage);
  }

  updateRecord(sessionId){
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    })
      .then((db: SQLiteObject) => {// Permet de vérifier si la base de données est créer ou bien bien créer la base
        db.executeSql('UPDATE `records` SET session_id = ?', {sessionId})
          // .then((data) => {// récuperer tous les tableaux dans la table sessions
          //   this.sessionId = data;
            
          // })
          // .catch(e => console.error('error update session_id: ', e));
          console.log('update session_id: ', this.sessionId);
      })
      .catch(e => console.log('error DB connection', e));
  }

  addMarker(latlng) {//ajoute un marker

    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latlng
    });

    let content = "<h4>Début!</h4>";

    this.addInfoWindow(marker, content);

  }

  addInfoWindow(marker, content) {//information afficher au moment du tap sur le marker

    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
  }

  redrawPath(path) {//Trace une ligne pour faire le chemin qui aétait parcouru
    if (this.currentMapTrack) {
      this.currentMapTrack.setMap(null);
    }

    if (path.length > 1) {
      this.currentMapTrack = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#ff00ff',
        strokeOpacity: 1.0,
        strokeWeight: 3
      });
      this.currentMapTrack.setMap(this.map);
    }
  }


  presentLoading() {//affiche le loading
    this.loadingCtrl.create({
      content: 'Veuillez patientez...',
      duration: 2500,
      dismissOnPageChange: true
    }).present();
  }

  showHistoryRoute(route) {
    this.redrawPath(route);
  }
}
