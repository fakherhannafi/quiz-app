import { Component, OnInit, NgZone } from '@angular/core';
import { AuthService } from "../../shared/services/auth.service";
import { AngularFireStorage } from "@angular/fire/storage"
import { Router } from "@angular/router";
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;

  title: string;
  content: string;
  description: string;
  image: string = null;
  user: any;

  constructor(
    public authService: AuthService,
    public store: AngularFireStorage, // Inject Firestore service
    public router: Router,
    public ngZone: NgZone
  ) {


  }

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user'))
    this.authService.SetUserData({
      uid: this.user.uid,
      email: this.user.email,
      displayName: this.user.displayName,
      photoURL: this.user.photoURL,
      emailVerified: this.user.emailVerified
    })
  }

  uploadImage(event) {
    // tslint:disable-next-line:prefer-const
    let file = event.target.files[0];
    // tslint:disable-next-line:prefer-const
    let path = `photos/${this.user.uid}/${file.name}`;
    if (file.type.split('/')[0] !== 'image') {
      return alert('Erreur, ce fichier n\'est pas une image');
    } else {
      // tslint:disable-next-line:prefer-const
      let ref = this.store.ref(path);
      // tslint:disable-next-line:prefer-const
      let task = this.store.upload(path, file);
      this.uploadPercent = task.percentageChanges();
      console.log('Image chargée avec succès');
      task.snapshotChanges().pipe(

        finalize(() => {
          this.downloadURL = ref.getDownloadURL();
          this.downloadURL.subscribe(url => {
            console.log(url);
            this.user.photoURL = url
            this.authService.SetUserData({
              uid: this.user.uid,
              email: this.user.email,
              displayName: this.user.displayName,
              photoURL: this.user.photoURL,
              emailVerified: this.user.emailVerified
            })
          });
        }
        )
      ).subscribe();
    }
  }

}
