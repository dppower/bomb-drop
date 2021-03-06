import { Component, ViewChild, AfterViewInit } from "@angular/core";

import { WebglDirective } from "../webgl/webgl.directive";

@Component({
    selector: 'main-canvas',
    template: `
    <canvas webgl canvas-controller></canvas>
    <score-display></score-display>
    <swap-timer></swap-timer>
    `,
    styles: [`
    canvas {
        height: 100%;
        width: 100%;
        border: none;
        position: absolute;
        z-index: 0;
    }
    `]
})
export class MainCanvas implements AfterViewInit {

    @ViewChild(WebglDirective) webgl_context_: WebglDirective;

    constructor() { };
    
    ngAfterViewInit() {
        this.webgl_context_.createContext();
    };
}