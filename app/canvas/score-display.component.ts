import { Component, OnInit, OnDestroy } from "@angular/core";

import { Subscription } from "rxjs/Subscription";
import { scan, map, bufferTime } from "rxjs/operators";
import { InputManager } from "./input-manager";
import { ScoreTracker } from "../game/score-tracker";

@Component({
    selector: "score-display",
    template: `
    <p>Score:</p>
    <p>{{score_total}}</p>
    <p>{{score_change}}</p>
    `,
    styles: [`
    :host {
        position: absolute; z-index: 1;
    }
    `]
})
export class ScoreDisplay implements OnInit, OnDestroy {

    score_total: number = 0;
    score_change: number;

    private score_change_sub_: Subscription;

    constructor(private score_tracker_: ScoreTracker, private input_manager_: InputManager) { };

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