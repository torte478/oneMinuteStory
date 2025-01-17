import Phaser from '../lib/phaser.js';

import Animation from '../game/utils/Animation.js';
import Utils from '../game/utils/Utils.js';

import Core from '../game/Core.js';
import Consts from '../game/Consts.js';

export default class Game extends Phaser.Scene {

	/** @type {Core} */
	_core;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        Utils.runLoadingBar(this);

        me.load.tilemapCSV('level', `assets/level.csv`);

        Utils.loadSpriteSheet(me, 'main', Consts.Unit);
        Utils.loadSpriteSheet(me, 'tilemap', Consts.Unit);
        Utils.loadSpriteSheet(me, 'big', Consts.Unit * 2);
        Utils.loadSpriteSheet(me, 'player', Consts.Unit * 2);
        Utils.loadSpriteSheet(me, 'gun', Consts.Unit * 2);
        Utils.loadSpriteSheet(me, 'square', Consts.Unit * 2);
        Utils.loadSpriteSheet(me, 'charge_bar', 600, 50);
        Utils.loadSpriteSheet(me, 'triangle', Consts.Unit * 4, Consts.Unit * 3);
        Utils.loadSpriteSheet(me, 'circle', Consts.Unit * 2);
        Utils.loadSpriteSheet(me, 'charger', Consts.Unit * 3);
        Utils.loadSpriteSheet(me, 'enemy_catcher', 300, 150);
        Utils.loadSpriteSheet(me, 'container_spawn', 150, 150);
        Utils.loadSpriteSheet(me, 'cave', 600, 600);
        Utils.loadSpriteSheet(me, 'boss', 500);

        Utils.loadImage(me, 'background');
        Utils.loadImage(me, 'hub');
        Utils.loadImage(me, 'fade');
        Utils.loadImage(me, 'hub_outside');
        Utils.loadImage(me, 'hub_outside_top');
        Utils.loadImage(me, 'particle');
        Utils.loadImage(me, 'collider');

        Utils.loadWav(me, 'button_click');
        Utils.loadWav(me, 'charger');
        Utils.loadWav(me, 'action');
        Utils.loadWav(me, 'enemy_catched');
        Utils.loadWav(me, 'hit');
        Utils.loadWav(me, 'warning');

        Utils.loadMp3(me, 'laserShoot');
        Utils.loadMp3(me, 'jump');
        Utils.loadMp3(me, 'walk_snow');
        Utils.loadMp3(me, 'music1');
        Utils.loadMp3(me, 'music3');
    }

    create() {
        const me = this;

        Animation.init(me);

        me._core = new Core(me);
    }

    update(time, delta) {
        const me = this;

        me._core.update(delta);
    }
}