import InteriorComponent from "./InteriorComponent.js";
import MoneyComponent from "./MoneyComponent.js";
import RoadComponent from "./RoadComponent.js";
import SpecEffects from "./SpecEffects.js";
import StratagemComponent from "./StratagemComponent.js";

export default class {

    /** @type {RoadComponent} */
    road;

    /** @type {InteriorComponent} */
    interior;

    /** @type {MoneyComponent} */
    money;

    /** @type {StratagemComponent} */
    stratagem;

    specEffects = new SpecEffects();

    update(delta) {
        const me = this;

        me.road.update(delta);
        me.interior.update(delta);
        me.money.update(delta);
        me.stratagem.update(delta);
    }
}