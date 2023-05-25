import { DialogAddPlayerComponent } from './../dialog-add-player/dialog-add-player.component';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Game } from 'src/models/game';
import { collection, CollectionReference, doc, docData, DocumentData, Firestore, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})

export class GameComponent implements OnInit {
  game: Game;
  gameId: string;
  docSnap: any;
  docRef: any;
  gameOver = false;
  game$: Observable<any>;
  private coll: CollectionReference<DocumentData>;

  constructor(private route: ActivatedRoute, private firestore: Firestore, public dialog: MatDialog) {
    this.coll = collection(this.firestore, 'games');
  }

  ngOnInit() {
    this.newGame();
    this.setGame();
  }

  newGame() {
    this.game = new Game();
  }

  async setGame() {
    this.route.params.subscribe(async (params) => {
      this.gameId = params['id'];
  
      this.docRef = doc(this.coll, this.gameId);
      this.game$ = docData(this.docRef);
      const game = await this.game$.toPromise();
      this.setCurrentGame(game);
    });
  }

  setCurrentGame(game: any) {
    if (game) {
      this.game.playedCards = game.playedCards;
      this.game.players = game.players;
      this.game.stack = game.stack;
      this.game.currentPlayer = game.currentPlayer;
      this.game.pickCardAnimation = game.pickCardAnimation;
      this.game.currentCard = game.currentCard;
      this.game.playerImages = game.playerImages;
    }
  }

  takeCard() {
    if(this.game.stack.length == 0) {
      this.gameOver = true;
    } else if (!this.game.pickCardAnimation) {
      this.game.currentCard = this.game.stack.pop();
      this.game.pickCardAnimation = true;
      console.log('New card: ' + this.game.currentCard);
      console.log('Game is', this.game);
      this.game.currentPlayer++;
      this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;

      this.saveGame();

      setTimeout(() => {
        this.game.playedCards.push(this.game.currentCard);
        this.game.pickCardAnimation = false;
        this.saveGame();
      }, 1000);
    }
  }

  async saveGame() {
    await updateDoc(this.docRef, this.game.toJson());
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        this.game.players.push(name);
        // this.game.playerImages.push('1.webp')
        this.saveGame();
      }
    });
  }

  // editPlayer(playerId: number) {
  //   const dialogRef = this.dialog.open(EditPlayerComponent);
  //   dialogRef.afterClosed().subscribe((change: string) => {
  //     if (change) {
  //       if (change == "DELETE") {
  //         this.game.players.splice(playerId, 1);
  //       } else {
  //         this.game.playerImages[playerId] = change;
  //       }
  //       this.saveGame();
  //     }
  //   });
  // }


}
