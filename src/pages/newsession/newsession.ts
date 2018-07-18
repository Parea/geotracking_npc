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
  positionSubscription: Subscription;

  constructor(public navCtrl: NavController, public navParams: NavParams, public sqlite: SQLite, public platform: Platform, private geolocation: Geolocation, public loadingCtrl: LoadingController) {
    this.platform.ready().then(() => {// Permet de démarrer les codes si le device est prêt
      this.geolocation.getCurrentPosition().then((position) => {
        this.latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          console.log('GetCurrent :' + position); 
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          this.addMarker(this.latlng);

          this.insertRecord();
          this.loadMap();
          this.startTracking();
      }).catch((error) => {
        console.log('Error getting location', error);
      });
    });
  }

  loadMap() {
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

  startTracking() {
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
      console.log('records');
      this.insertRecord();
      this.addMarker(this.latlng);
    });
      console.log('startTracking: this.positionSubscription ', this.positionSubscription );
  }

  insertRecord() {
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    })
    .then((db: SQLiteObject) => {// Permet de vérifier si la base de données est créer ou bien bien créer la base
      let date = Date();
      let insertRecord = "INSERT INTO `records` (lat, lng, created_at) VALUES ('"+this.lat+"', '"+this.lng+"', '"+date+"');";
      
      db.executeSql(insertRecord, {})
      .then((data) => {
        console.log('nouveau record enregistré', data);
      })
      .catch(e => console.error('error insert record',e));
    })
    .catch(e => console.log('error DB connection',e));
  }


  addMarker(latlng){
 
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latlng
    });
   
    let content = "<h4>Début!</h4>";         
   
    this.addInfoWindow(marker, content);
   
  }

  addInfoWindow(marker, content){
 
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });
   
    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
  }

  redrawPath(path) {
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

  stopTracking() {
    console.log('stopTracking: this.positionSubscription ', this.positionSubscription );
    
    this.isTracking = false;
    this.positionSubscription.unsubscribe();
    this.presentLoading();
  }

  presentLoading() {
    this.loadingCtrl.create({
      content: 'Veuillez patientez...',
      duration: 3000,
      dismissOnPageChange: true
    }).present();
  }
  // showHistoryRoute(route) {
  //   this.redrawPath(route);
  // }
}
