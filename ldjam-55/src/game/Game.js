import Phaser from '../lib/phaser.js';

import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import RoadComponent from './RoadComponent.js';
import InteriorComponent from './InteriorComponent.js';
import Components from './Components.js';

export default class Game {

    /** @type {Phaser.GameObjects.Text} */
    _log;

    /** @type {Components} */
    _components;

    constructor() {
        const me = this;

        Here._.add.image(3500, 400, 'back03');
        Here._.add.image(4500, 400, 'back04');

        const moneyCamera = Here._.cameras.add(800, 0, 200, 200).setScroll(3000, 0);
        const stratagemCamera = Here._.cameras.add(0, 0, 100, 800).setScroll(4000, 0);

        const events = new Phaser.Events.EventEmitter();
        me._components = new Components();
        me._components.road = new RoadComponent(events);
        me._components.interior = new InteriorComponent(events);

        me._components.road._components = me._components;
        me._components.interior._components = me._components;

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            me._log = Here._.add.text(10, 10, '', { fontSize: 18, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);

            moneyCamera.ignore(me._log);
            me._components.interior._camera.ignore(me._log);
            stratagemCamera.ignore(me._log);
        });
    }

    update(delta) {
        const me = this;

        if (Here.Controls.isPressedOnce(Enums.Keyboard.RESTART) 
            && Utils.isDebug(Config.Debug.Global))
            Here._.scene.restart({ isRestart: true });

        me._components.update(delta);

        Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
            const mouse = Here._.input.activePointer;

            let text = 
                `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}`;

            me._log.setText(text);
        });
    }
}