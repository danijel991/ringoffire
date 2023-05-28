import { DialogAddPlayerComponent } from './../dialog-add-player/dialog-add-player.component';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Game } from 'src/models/game';
import { collection, CollectionReference, doc, docData, DocumentData, Firestore, updateDoc } from '@angular/fire/firestore';
import { EditPlayerComponent } from '../edit-player/edit-player.component';

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
  private col: CollectionReference<DocumentData>;

  constructor(
    private route: ActivatedRoute,
    private firestore: Firestore,
    public dialog: MatDialog
  ) {
    this.col = collection(firestore, 'games');
  }

  ngOnInit() {
    this.newGame();
    this.route.params.subscribe((params) => {
      this.gameId = params['id'];
      this.setGame();
    });
  }

  newGame() {
    this.game = new Game();
  }

  async setGame() {
    this.docRef = doc(this.col, this.gameId);
    this.game$ = docData(this.docRef);
    this.game$.subscribe(currentGame => {
      this.game.players = currentGame.players;
      this.game.player_images = currentGame.player_images;
      this.game.stack = currentGame.stack;
      this.game.playedCards = currentGame.playedCards;
      this.game.currentPlayer = currentGame.currentPlayer;
      this.game.pickCardAnimation = currentGame.pickCardAnimation;
      this.game.currentCard = currentGame.currentCard;
    });
  }

  takeCard() {
    if (this.game.stack.length === 0) {
      this.gameOver = true;
    } else if (!this.game.pickCardAnimation) {
      this.game.currentCard = this.game.stack.pop();
      this.game.pickCardAnimation = true;
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

  editPlayer(playerId: number) {
    const dialogRef = this.dialog.open(EditPlayerComponent);
    dialogRef.afterClosed().subscribe((change: string) => {
      if (change) {
        if (change == 'DELETE') {
          this.game.players.splice(playerId, 1);
          this.game.player_images.splice(playerId, 1);
        } else
          this.game.player_images[playerId] = change;
        this.saveGame();
      }
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        this.game.players.push(name);
        this.game.player_images.push('1.webp');
        this.saveGame();
      }
    });
  }

  saveGame() {
    updateDoc(this.docRef, this.game.toJson());
  }
}
