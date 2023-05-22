import { DialogAddPlayerComponent } from './../dialog-add-player/dialog-add-player.component';
import { Component, OnInit } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { Firestore, collection, doc, docData, updateDoc } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

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

  constructor(private firestore: Firestore, private route: ActivatedRoute, public dialog: MatDialog) { };

  ngOnInit(): void {
    this.newGame();
    this.route.params.subscribe(async (params) => {
      console.log('id:', params['id']);  // Access 'id' using bracket notation

      const gameId = params['id'];
      const docRef = doc(this.firestore, gameId);
      const gameData = docData(docRef);
      this.game$ = gameData;

      this.game$.subscribe((response) => {
        this.game.currentPlayer = response.currentPlayer;
        this.game.playedCards = response.playedCards;
        this.game.players = response.players;
        this.game.stack = response.stack;
      });
    }); 
  }


  async newGame() {
    this.game = new Game();
  }

  async updateGame() {
    const gameDocRef = doc(this.firestore, 'games',);
    await updateDoc(gameDocRef, this.game.toJson());
  }

  takeCard() {
    if (!this.pickCardAnimation) {
      this.currentCard = this.game.stack.pop();
      this.pickCardAnimation = true;

      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
      setTimeout(() => {
        this.game.playedCards.push(this.currentCard);
        this.pickCardAnimation = false;
      }, 1000);
    }
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);


    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        this.game.players.push(name);
      }
    });
  }




}
