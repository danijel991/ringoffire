import { DialogAddPlayerComponent } from './../dialog-add-player/dialog-add-player.component';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreDocument, DocumentSnapshot } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';

interface Game {
  players: string[];
  stack: string[];
  playedCards: string[];
  currentPlayer: number;
  toJson(): string;
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  pickCardAnimation = false;
  currentCard: string = '';
  game: Game;
  game$: Observable<Game>;

  constructor(private route: ActivatedRoute, private firestore: AngularFirestore, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.newGame();
    this.route.params.subscribe(async (params) => {
      console.log('id:', params['id']);  // Access 'id' using bracket notation

      const gameId = params['id'];
      const docRef: AngularFirestoreDocument<Game> = this.firestore.collection('game').doc<Game>(gameId);
      
      this.game$ = docRef.snapshotChanges().pipe(
        map((action: DocumentSnapshot<Game>) => {
          const data = action.data();
          const id = action.id;
          return { id, ...data };
        })
      );

      this.game$.subscribe((game: Game) => {
        console.log('Game update', game);
        this.game = game;
      });
    });
  }

  newGame() {
    this.game = {
      players: [],
      stack: [],
      playedCards: [],
      currentPlayer: 0,
      toJson: function () {
        return JSON.stringify(this);
      }
    };
  }

  async updateGame() {
    // Update the game in Firestore
    const gameId = this.route.snapshot.params['id'];
    const gameDocRef: AngularFirestoreDocument<Game> = this.firestore.collection('game').doc<Game>(gameId);
    await gameDocRef.update(this.game);
  }

  takeCard() {
    if (!this.pickCardAnimation) {
      this.currentCard = this.game.stack.pop();
      this.pickCardAnimation = true;
      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
      this.game.playedCards.push(this.currentCard);
      this.pickCardAnimation = false;
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      this.game.players.push(name);
    });
  }
}
