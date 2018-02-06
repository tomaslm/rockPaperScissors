import Player from './Player.js';
import PIXI from 'pixi.js';
import { Observable } from 'rxjs';

export default class Game {
  width;
  height;
  statusText;
  players = [];
  constructor(config) {
    this.width = config.width || 800;
    this.height = config.height || 600;
    const Renderer = config.webgl
      ? PIXI.autoDetectRenderer
      : PIXI.CanvasRenderer;
    this.renderer = new Renderer(
      this.width,
      this.height,
      config.rendererOptions
    );
    document.body.appendChild(this.renderer.view);
    this.animationLoop = new PIXI.AnimationLoop(this.renderer);
    this.animationLoop.on('prerender', this.update.bind(this));
    this.statusText = new PIXI.Text('example');
    this.statusText.position.set(this.width / 2, this.height * 0.1);
    this.statusText.anchor.set(0.5, 0.5);
    this.statusText.on('pointerdown', this.playOnce);
    this.stage.addChild(this.statusText);
    this.start();
  }
  update() {
    for (let i = 0; i < this.stage.children.length; i++) {
      if (this.stage.children[i].update) {
        this.stage.children[i].update(this.animationLoop.delta);
      }
    }
  }

  start() {
    let player1 = new Player(0.1 * this.width, this.height / 2, Math.PI);
    this.stage.addChild(player1);
    let player2 = new Player(0.9 * this.width, this.height / 2, -Math.PI);
    this.stage.addChild(player2);

    this.players = [player1, player2];
    this.playOnce();

    this.animationLoop.start();
    // end game and create player options
  }

  playOnce() {
    const obs1 = this.players[0].chooseOption();
    const obs2 = this.players[1].chooseOption();

    Observable.zip(obs1, obs2).subscribe(pair => {
      const opt1 = pair['0'];
      const opt2 = pair['1'];
      let text;
      if (opt1.wins(opt2)) {
        text = 'Player 1 is the winner!';
      } else if (opt1.looses(opt2)) {
        text = 'Player 2 is the winner!';
      } else {
        text = 'We have a draw here!';
      }
      this.statusText.text = text;
    });
  }

  stop() {
    this.animationLoop.stop();
  }

  get stage() {
    return this.animationLoop.stage;
  }

  set stage(stage) {
    this.animationLoop.stage = stage;
  }
}
