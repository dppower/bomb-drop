import {
    Directive, HostListener, ElementRef, 
    HostBinding, DoCheck, OnDestroy, OnInit
} from "@angular/core";

import { distinctUntilChanged, debounceTime, tap } from "rxjs/operators";
import { Subject } from "rxjs/Subject";
import { Subscription } from "rxjs/Subscription";
import { TouchEventTypes, MultiTouch } from "./touch-utility";
import { Vec2_T } from "../maths/vec2";
import { InputManager } from "./input-manager";

@Directive({
    selector: "[canvas-controller]"
})
export class CanvasController implements OnInit, DoCheck, OnDestroy {

    @HostBinding("width") canvas_width: number;
    @HostBinding("height") canvas_height: number;

    get client_width() {
        let width = (<HTMLCanvasElement>this.canvas_ref_.nativeElement).clientWidth;
        return width > 1920 ? 1920 : width;
    };

    get client_height() {
        let height = (<HTMLCanvasElement>this.canvas_ref_.nativeElement).clientHeight;
        return height > 1080 ? 1080 : height;
    };
    
    readonly resize_events = new Subject<{ width: number, height: number }>();
    private resize_sub_: Subscription;

    constructor(private input_manager_: InputManager, private canvas_ref_: ElementRef) { };

    ngOnInit() {
        this.resize_sub_ = this.resize_events.pipe(
            distinctUntilChanged((x, y) => x.width === y.width && x.height === y.height),
            tap(changes => { this.input_manager_.aspect = changes.width / changes.height; }),
            debounceTime(20)
        )
        .subscribe((changes) => {           
            this.canvas_width = changes.width;
            this.canvas_height = changes.height;
        });
    };

    ngDoCheck() {
        this.resize_events.next({ width: this.client_width, height: this.client_height });
    };

    @HostListener("mouseenter", ["$event"])
    setFocus(event: MouseEvent) {
        (<HTMLCanvasElement>event.target).focus();
    };

    @HostListener("mouseleave", ["$event"])
    lostFocus(event: MouseEvent) {
        // TODO want to reset all current key binds to false
    };

    @HostListener("contextmenu")
    hideContextMenu() {
        return false;
    };

    @HostListener("wheel", ["$event"])
    onMouseWheel(event: WheelEvent) {
        let scroll: 1 | -1 = (event.deltaY > 0) ? 1 : -1;
        this.input_manager_.setWheelDirection(scroll);
        return false;
    };

    @HostListener("mouseup", ["$event"])
    setMouseUp(event: MouseEvent) {
        event.stopPropagation();
        if (event.button === 0) {
            this.input_manager_.setMouseButton("left", false);
        }
        else if (event.button === 2) {
            this.input_manager_.setMouseButton("right", false);
        } 
    };

    @HostListener("mousedown", ["$event"])
    setMouseDown(event: MouseEvent) {
        event.stopPropagation();
        if (event.button === 0) {
            this.input_manager_.setMouseButton("left", true);
        }
        else if (event.button === 2) {
            this.input_manager_.setMouseButton("right", true);
        }
    };

    @HostListener("mousemove", ["$event"])
    setMouseMovement(event: MouseEvent) {
        event.stopPropagation();
        let x = event.clientX / this.client_width;
        let y = 1 - (event.clientY / this.client_height);
        this.input_manager_.setMousePosition({ x, y });
        return false;
    };

    // Touch Events
    @HostListener("touchstart", ["$event"])
    setTouchStart(event: TouchEvent) {
        this.input_manager_.touch_events.next(this.parseTouchEvent(event));
    };

    @HostListener("touchend", ["$event"])
    setTouchEnd(event: TouchEvent) {
        this.input_manager_.touch_events.next(this.parseTouchEvent(event));
    };

    @HostListener("touchmove", ["$event"])
    setTouchMove(event: TouchEvent) {
        event.preventDefault();
        this.input_manager_.touch_events.next(this.parseTouchEvent(event));
    };

    @HostListener("touchcancel", ["$event"])
    setTouchCancel(event: TouchEvent) {
        this.input_manager_.touch_events.next(this.parseTouchEvent(event));
    };

    parseTouchEvent(event: TouchEvent): MultiTouch {
        let touches: { [identifier: number]: Vec2_T } = {};
        for (let index in event.changedTouches) {
            if (Number.isNaN(+index)) continue;
            let touch = event.changedTouches.item(+index);
            let x = touch.clientX / this.client_width;
            let y = 1 - (touch.clientY / this.client_height);           
            let point = this.input_manager_.canvasCoordsToWorldPosition({ x, y });
            touches[touch.identifier] = point;
        }
        return { type: (<TouchEventTypes>event.type), touches };
    };

    ngOnDestroy() {
        this.resize_sub_.unsubscribe();
    };
}