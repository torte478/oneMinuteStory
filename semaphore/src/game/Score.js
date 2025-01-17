import Phaser from '../lib/phaser.js';

import Here from '../framework/Here.js';
import Consts from './Consts.js';
import { SignalProcessResult } from './Models.js';
import Enums from './Enums.js';
import Button from '../framework/Button.js';

export default class Score { 

    /** @type {Phaser.GameObjects.Text} */
    _scoreText;

    /** @type {Number[]} */
    _scoreHistory;

    /** @type {Number} */
    _score;

    /** @type {Phaser.GameObjects.Text} */
    _effectText;

    /** @type {Combo} */
    _combo;

    /** @type {Phaser.GameObjects.Image} */
    _fade;

    /** @type {Menu} */
    _menu;

    /** @type {Numer} */
    _startTimeMs;

    /** @type {Number} */
    _maxTimeMs;

    /** @type {Number} */
    _totalScore;

    constructor(restartCallback, nextLevelCallback, callbackContext) {
        const me = this;

        me._scoreHistory = [];
        me._score = 0;

        me._scoreText = Here._.add.text(
            0, 
            -500,
            ' SCORE: 0000 TIME: 0:00 ', 
            {
                fontFamily: 'Monospace',
                fontSize: 48,
                color: '#F0E2E1',
                backgroundColor:'#4A271E'
            })
            .setOrigin(0.5, 0)
            .setDepth(Consts.Depth.GUI_MAX);

        me._effectText = Here._.add.text(
            0, 
            0, 
            '+1', 
            {
                fontFamily: 'Monospace',
                fontSize: 64,
                color: '#57E402',
                fontStyle: 'bold'

            })
            .setStroke('#4A271E', 4)
            .setOrigin(0.5)
            .setDepth(Consts.Depth.GUI_MAX)
            .setAlpha(0);

        me._combo = new Combo();

        me._fade = Here._.add
            .image(0, 0, 'fade')
            .setAlpha(0)
            .setDepth(Consts.Depth.GUI_MAX);

        me._menu = new Menu(restartCallback, nextLevelCallback, callbackContext);
        me._startTimeMs = new Date().getTime();
        me._maxTimeMs = 10 * 1000;
        me._totalScore = 0;
    }

    init(isMainMenu, bonusTime, isFinal, currentLevel) {
        const me = this;

        me._scoreHistory = [];
        me._score = 0;
        me._startTimeMs = new Date().getTime();
        me._maxTimeMs = bonusTime;
        me._isFinal = isFinal;

        me._menu.init(isFinal, currentLevel)

        if (!!isMainMenu)
            return;

        Here._.tweens.add({
            targets: me._scoreText,
            y: 10 - Consts.Viewport.Height / 2,
            duration: 500,
            ease: 'sine.out'
        });
    }

    /**
     * @param {SignalProcessResult} signal 
     */
    processSignal(signal) {
        const me = this;

        if (!!signal.cancel && me._scoreHistory.length > 0) {
            const value = me._scoreHistory[me._scoreHistory.length - 1];
            me._score -= value;
            me._scoreHistory.splice(me._scoreHistory.length - 1, 1);

            if (value > 0)
                me._runEffectTween(value, false);

            me._combo.reset();
            return;
        }

        if (!signal.correct) {
            me._scoreHistory.push(0);
            me._combo.reset();
            return;
        }

        const value = me._combo.success();
        me._scoreHistory.push(value);
        me._score += value;

        me._runEffectTween(value, true);
    }

    /**
     * @param {Number} state 
     */
    updateGUI(state, currentLevel) {
        const me = this;

        if (state == Enums.GameState.GAME)
            me._scoreText.setText(me._buildScoreText(currentLevel));
        else if (state == Enums.GameState.LEVEL_COMPLETED)
            me._menu.update();
    }

    startShowResult(message) {
        const me = this;

        Here._.tweens.add({
            targets: me._scoreText,
            y: -500,
            duration: 500,
            ease: 'sine.in'
        });

        Here._.tweens.add({
            targets: me._fade,
            alpha: { from: 0, to: 0.75 },
            duration: 1000,
            ease: 'sine.out',
            onComplete: () => {
                const timeBonus = Math.max(
                    (me._maxTimeMs - (new Date().getTime() - me._startTimeMs)) / 5000 | 0,
                    0);

                me._totalScore += me._score + timeBonus;
                me._lastTimeBonus = timeBonus;

                me._menu.open(me._score, timeBonus, message, me._totalScore);
            }
        });
    }

    _lastTimeBonus = 0;

    stopShowResult(toMainMenu, callback, context, isRestart) {
        const me = this;
        
        if (!!isRestart)
            me._totalScore -= (me._score + me._lastTimeBonus);

        me._menu.hide(() => {
            Here._.tweens.add({
                targets: me._fade,
                alpha: { from: 0.75, to: 0 },
                duration: 1000,
                ease: 'sin.out',
                onComplete: () => {

                    me._scoreHistory = [];
                    me._score = 0;
                    me._startTimeMs = new Date().getTime();

                    me.init(toMainMenu, me._maxTimeMs, me._isFinal);

                    if (!!callback)
                        callback.call(context);
                }
            });
        }, me);
    }

    _buildScoreText(currentLevel) {
        const me = this;

        const res = [];
        res.push(' LEVEL ')
        res.push(currentLevel.toString())
        res.push(' SCORE ');

        if (me._score < 1000)
            res.push('0');

        if (me._score < 100)
            res.push('0');

        if (me._score < 10)
            res.push('0');

        res.push(me._score.toString());

        res.push(' TIME ');

        const time = new Date().getTime() - me._startTimeMs;
        res.push(Math.floor(time / 60000).toString());
        res.push(':');

        const seconds = (time / 1000) % 60 | 0;
        if (seconds < 10)
            res.push('0');
        res.push(seconds.toString());
        res.push(' ');

        return res.join('');
    }

    _runEffectTween(value, success) {
        const me = this;

        me._effectText
            .setText(me._getEffectText(value, success))
            .setColor(success ? '#57E402' : '#E40207')
            .setAlpha(1)
            .setPosition(-40, 20 - Consts.Viewport.Height / 2);

        Here._.tweens.add({
            targets: me._effectText,
            y: -250,
            alpha: { from: 1, to: 0 },
            duration: 1000,
            ease: 'sine.inout'
        });
    }

    _getEffectText(value, success) {
        if (!success)
            return `-${value}`;

        return value == 1
            ? `+${value}`
            : `COMBO x${value}`;
    }
}

class Combo {

    /** @type {Number} */
    _durationMs;

    /** @type {Number} */
    _maxCounter;

    /** @type {Number} */
    _lastSuccessTimeMs;

    /** @type {Number} */
    _counter;

    constructor() {
        const me = this;

        me._durationMs = 4000;
        me._maxCounter = 5;

        me.reset();
    }

    reset() {
        const me = this;

        me._counter = 0;
        me._lastSuccessTimeMs = 0;
    }

    success() {
        const me = this;

        const now = new Date().getTime();
        const increaseComboCounter = me._lastSuccessTimeMs == 0 || now - me._lastSuccessTimeMs <= me._durationMs;
        me._counter = increaseComboCounter
            ?  Math.min(me._maxCounter, me._counter + 1)
            : 1;
        me._lastSuccessTimeMs = now;

        return me._counter;
    }
}

class Menu {

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Phaser.GameObjects.Text} */
    _totalText;

    /** @type {Phaser.GameObjects.Text} */
    _scoreText;

    /** @type {Phaser.GameObjects.Text} */
    _timeBonusText;

    /** @type {Number} */
    _showStartTimeMs;

    /** @type {Number} */
    _timelineIndex;

    /** @type {Button} */
    _restartButton;

    /** @type {Phaser.GameObjects.Text} */
    _messageLabelText;

    /** @type {Phaser.GameObjects.Text} */
    _message;

    /** @type {String} */
    _wholeMessage;

    /** @type {Button} */
    _nextLevelButton;

    constructor(restartCallback, nextLevelCallback, callbackContext) {
        const me = this;

        me._scoreText = Here._.add.text(
            0, 
            -335, 
            'SCORE: 0', 
            {
                fontFamily: 'Arial Black',
                fontSize: 72,
                color: '#F0E2E1'
            })
            .setOrigin(0.5)
            .setStroke('#4A271E', 8)
            .setVisible(false);

        me._timeBonusText = Here._.add.text(
            0, 
            -250, 
            'TIME BONUS: 0', 
            {
                fontFamily: 'Arial Black',
                fontSize: 72,
                color: '#F0E2E1'
            })
            .setOrigin(0.5)
            .setStroke('#4A271E', 8)
            .setVisible(false);

        me._totalText = Here._.add.text(
            0, 
            -125, 
            'TOTAL: 0', 
            {
                fontFamily: 'Arial Black',
                fontSize: 128,
                color: '#F0E2E1'
            })
            .setOrigin(0.5)
            .setStroke('#4A271E', 16)
            .setVisible(false);

        me._restartButton = new Button({
            x: 250,
            y: 325,
            callback: restartCallback,
            callbackScope: callbackContext,
            text: 'RESTART',
            textStyle: {
                fontFamily: 'Arial Black',
                fontSize: 40,
                color: '#5AB7D4'
            }
        });
        const restartButtonContainer = me._restartButton.getGameObject();
        restartButtonContainer.setVisible(false);

        me._nextLevelButton = new Button({
            x: -200,
            y: 325,
            callback: nextLevelCallback,
            callbackScope: callbackContext,
            text: 'NEXT LEVEL',
            textStyle: {
                fontFamily: 'Arial Black',
                fontSize: 64,
                color: '#5AB7D4'
            }
        });
        const nextLevelButtonContainer = me._nextLevelButton.getGameObject();
        nextLevelButtonContainer.setVisible(false);

        me._messageLabelText = Here._.add.text(
            0, 
            5, 
            'MESSAGE', 
            {
                fontFamily: 'Arial Black',
                fontSize: 50,
                color: '#F0E2E1'
            })
            .setOrigin(0.5)
            .setStroke('#4A271E', 16)
            .setVisible(false);

        me._message = Here._.add.text(
            0, 
            65, 
            '',
            {
                fontFamily: 'Monospace',
                fontSize: 64,
                color: '#F0E2E1',
                wordWrap: { width: 900, useAdvancedWrap: true }
            })
            .setOrigin(0.5, 0)
            .setStroke('#4A271E', 4)
            .setVisible(true);

        me._container = Here._.add.container(0, 0, [
            me._totalText,
            me._scoreText,
            me._timeBonusText,
            restartButtonContainer,
            nextLevelButtonContainer,
            me._messageLabelText,
            me._message
        ])
            .setDepth(Consts.Depth.GUI_MAX);
    }

    getGameObject() {
        const me = this;

        return me._container;
    }

    init(isFinal, currentLevel) {
        const me = this;
        
        me._isFinal = !!isFinal;
    }

    open(score, timeBonus, message, superTotalScore) {
        const me = this;

        me._scoreText.setText(`SCORE: ${score}`);
        me._timeBonusText.setText(`TIME BONUS: ${timeBonus}`);
        me._totalText.setText(`TOTAL: ${score + timeBonus}`);
        me._superTotalScore = superTotalScore;

        me._scoreText.setVisible(true);

        me._showStartTimeMs = new Date().getTime();
        me._timelineIndex = 0;
        me._wholeMessage = message;
    }

    update() {
        const me = this;

        const elapsed = new Date().getTime() - me._showStartTimeMs;

        if (me._timelineIndex == 0 && elapsed > 1000) {
            me._timeBonusText.setVisible(true);
            ++me._timelineIndex;
        }

        if (me._timelineIndex == 1 && elapsed > 2000) {
            me._totalText.setVisible(true);
            ++me._timelineIndex;
        }

        if (me._timelineIndex == 2 && elapsed > 3000) {
            me._messageLabelText.setVisible(true);

            if (!!me._isFinal) {
                //FINAL
                
                const jumpscare = Here._.add.image(0, 0, 'seagull_attack')
                    .setScale(0)
                    .setDepth(Consts.Depth.LIGHTNING + 10);

                Here._.tweens.add({
                    targets: jumpscare,
                    scale: { from: 0, to: 40 },
                    y: 1200,
                    duration: 1000,
                    delay: 7000,
                    ease: 'sine.in',
                    onStart: () => {
                        Here.Audio.stopAll();
                        Here.Audio.play('seagull_jumpscare');
                    },
                    onComplete: () => {
                        
                        Here.Audio.play('ending', { loop: -1, volume: 0.5});
                        const text = 'Thank you for playing!\n\n' + `Total score: ${me._superTotalScore}`;

                            Here._.add.text(0, 0, text, {
                                fontFamily: 'Arial Black',
                                fontSize: 64,
                                color: '#F0E2E1',
                                align: 'center'
                            })
                            .setOrigin(0.5)
                            .setStroke('#4A271E', 16)
                            .setDepth(Consts.Depth.MAX);

                    }
                })

            } else {
                me._nextLevelButton.getGameObject().setVisible(true);
                me._restartButton.getGameObject().setVisible(true);
            }

            ++me._timelineIndex;
        }

        if (me._timelineIndex == 3) {
            const count = ((elapsed - 3000) / 250 )| 0;
            const oldLength = me._message.text.length;
            if (count > oldLength)
                me._message.setText(me._message.text + me._wholeMessage[oldLength]);

            if (me._message.text.length >= me._wholeMessage.length)
                ++me._timelineIndex;
        }
    }

    hide(callback, context) {
        const me = this;

        Here._.tweens.add({
            targets: me._container,
            x: 1000,
            duration: 1000,
            ease: 'sine.in',
            onComplete: () => {
                me._scoreText.setVisible(false);
                me._timeBonusText.setVisible(false);
                me._totalText.setVisible(false);
                me._messageLabelText.setVisible(false);
                me._message.setText('');
                me._restartButton.getGameObject().setVisible(false);
                me._nextLevelButton.getGameObject() .setVisible(false);

                me._container.x = 0;

                callback.call(context);
            }
        })
    }
}