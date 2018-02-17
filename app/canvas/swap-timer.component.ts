import { Component, OnInit, OnDestroy } from "@angular/core";
import { RenderLoop } from "./render-loop";

import { Subscription } from "rxjs/Subscription";
import { map, distinctUntilChanged } from "rxjs/operators";

@Component({
    selector: "swap-timer",
    template: "<p>Time to next swap: {{time_next_swap}}</p>",
    styles: [`p {position: absolute; z-index: 1;}`]
})
export class SwapTimer implements OnInit, OnDestroy {

    time_next_swap: number;

    time_updates_sub: Subscription;

    constructor(private render_loop_: RenderLoop) { };

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