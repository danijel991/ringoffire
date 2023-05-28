import { Firestore, collection, addDoc, CollectionReference, DocumentData } from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from 'src/models/game';

@Component({
  selector: 'app-start-screen',
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss']
})
export class StartScreenComponent implements OnInit {
  private coll: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore, private router: Router) {
    this.coll = collection(this.firestore, 'games');
  }

  ngOnInit(): void {
  }

  newGame() {
    let game = new Game();
    addDoc(this.coll, game.toJson())
      .then((gameInfo: any) => {
        this.router.navigateByUrl('/game/' + gameInfo.id);
      });
  }
}
