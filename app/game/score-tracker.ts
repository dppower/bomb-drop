import { Injectable } from "@angular/core";

import { Subject } from "rxjs/Subject";

@Injectable()
export class ScoreTracker {

    readonly scores = new Subject<{ box: number, score: number }>();

    constructor() { };

    /**
     * @param box_index -1 for no box, else 0, 1, 2
     * @param score either 1 or -1
     */
    addScore(box_index: number, score: 1 | -1) {
        this.scores.next({ box: box_index, score });
    }
}