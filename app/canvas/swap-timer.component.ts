import { Component, OnInit, OnDestroy, HostBinding } from "@angular/core";

import { RenderLoop } from "./render-loop";
import { InputManager} from "./input-manager";

import { Subscription } from "rxjs/Subscription";
import { map, distinctUntilChanged } from "rxjs/operators";

@Component({
    selector: "swap-timer",
    template: `
    <p id="time">{{time_next_swap}}</p>
    <p id="time-label">Time to next swap</p>
    `,
    styles: [`
    :host {
        position: absolute;
        z-index: 1;
        display: flex;
        flex-direction: column;
        right: 0;
        bottom: 0;
        height: 100%;
        justify-content: flex-end;
        align-items: center;
    }
    p#time {
        font-size: 52px;
        width: 78px;
        height: 78px;
        text-align: center;
        line-height: 78px;
    }
    p#time-label{
        font-size: 20px;
        width: 180px;
        height: 78px;
        text-align: center;
        line-height: 78px;
    }
    `]
})
export class SwapTimer implements OnInit, OnDestroy {

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

    time_next_swap: number;

    time_updates_sub: Subscription;

    constructor(private render_loop_: RenderLoop, private input_manager_: InputManager) { };

    ngOnInit() {
        this.time_updates_sub = this.render_loop_.swap_interval
            .pipe(
                map((time) => Math.floor(time) + 1),
                distinctUntilChanged()
            )
            .subscribe((time) => this.time_next_swap = time);
    };

    ngOnDestroy() {
        this.time_updates_sub.unsubscribe();
    };
}