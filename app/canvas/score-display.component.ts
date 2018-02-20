import { Component, OnInit, OnDestroy, HostBinding } from "@angular/core";

import { Subscription } from "rxjs/Subscription";
import { scan, map, bufferTime } from "rxjs/operators";
import { InputManager } from "./input-manager";
import { ScoreTracker } from "../game/score-tracker";

@Component({
    selector: "score-display",
    template: `
    <p>Score</p>
    <p>{{score_total}}</p>
    <p>{{score_change}}</p>
    `,
    styles: [`
    :host {
        position: absolute;
        z-index: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    p {
        font-size: 32px;
        text-align: center;
        height: 48px;
        line-height: 48px;
        width: 100px;
    }
    `]
})
export class ScoreDisplay implements OnInit, OnDestroy {

    @HostBinding("style.width")
    get style_width() {
        if (this.input_manager_.aspect <= this.input_manager_.world_aspect) {
            return "100%";
        }
        else {
            return "auto";
        }
    };

    @HostBinding("style.height")
    get style_height() {
        if (this.input_manager_.aspect <= this.input_manager_.world_aspect) {
            return "auto";
        }
        else {
            return "100%";
        }
    };

    @HostBinding("style.flex-direction")
    get style_flex_direction() {
        if (this.input_manager_.aspect <= this.input_manager_.world_aspect) {
            return "row";
        }
        else {
            return "column";
        }
    };

    @HostBinding("style.justify-content")
    get style_justify_content() {
        if (this.input_manager_.aspect <= this.input_manager_.world_aspect) {           
            return "space-around";
        }
        else {
            return "flex-start";
        }
    };

    score_total: number = 0;
    score_change: number;

    private score_change_sub_: Subscription;

    constructor(private score_tracker_: ScoreTracker,
        private input_manager_: InputManager
    ) { };

    ngOnInit() {
        this.score_change_sub_ = this.score_tracker_.scores
            .pipe(
                map(change => change.score),
                bufferTime(1000),
                map(array => array.reduce((a, b) => a + b, 0))
            )
            .subscribe(change => {
                if (change) {
                    this.score_change = change;
                    this.score_total += change;
                }
                else {
                    this.score_change = null;
                }
            });
    };

    ngOnDestroy() {
        this.score_change_sub_.unsubscribe();
    };
}