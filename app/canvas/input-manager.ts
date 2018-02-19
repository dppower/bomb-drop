import { Injectable, Inject } from "@angular/core";

import { WORLD_HEIGHT, WORLD_WIDTH } from "../physics/constants";
import { Vec2, Vec2_T } from "../maths/vec2";

export interface PointerState {
    left: boolean;
    right: boolean;
    wheel: number;
    position: Vec2;
    delta: Vec2;
};

const InitialPointerState: PointerState = {
    left: false,
    right: false,
    wheel: 0,
    position: new Vec2(),
    delta: new Vec2()
};

@Injectable()
export class InputManager {

    get aspect() {
        return this.current_aspect_ratio_;
    };

    get world_aspect() {
        return this.world_aspect_;
    };

    set aspect(value: number) {
        this.current_aspect_ratio_ = value;
    };

    get delta() {
        return this.current_pointer_state_.delta;
    };

    get position() {
        return this.current_pointer_state_.position;
    };

    get wheel() {
        return this.current_pointer_state_.wheel;
    };
    
    private previous_pointer_state_: PointerState;
    private current_pointer_state_: PointerState;

    private current_aspect_ratio_: number = 1.5;
    private world_aspect_: number;

    constructor(
        @Inject(WORLD_WIDTH) private world_width_: number,
        @Inject(WORLD_HEIGHT) private world_height_: number,
    ) {
        // Initialise state
        this.previous_pointer_state_ = Object.assign({}, InitialPointerState);
        this.current_pointer_state_ = Object.assign({}, InitialPointerState);

        this.world_aspect_ = this.world_width_ / this.world_height_;
    };

    setMousePosition(coordinates: Vec2_T) {
        let position = this.canvasCoordsToWorldPosition(coordinates);
        let current_delta = Vec2.subtract(position, this.previous_pointer_state_.position);
        this.current_pointer_state_.position.copy(position);
        this.current_pointer_state_.delta.copy(current_delta);
    };

    canvasCoordsToWorldPosition(coordinates: Vec2_T) {
        if (this.current_aspect_ratio_ > this.world_aspect_) {
            let w = this.world_height_ * this.current_aspect_ratio_;
            let x = w * coordinates.x - (w - this.world_width_) / 2;
            return { x, y: coordinates.y * this.world_height_ }
        }
        else if (this.current_aspect_ratio_ < this.world_aspect_) {
            let h = this.world_width_ / this.current_aspect_ratio_
            let y = h * coordinates.y - (h - this.world_height_) / 2;
            return { x: coordinates.x * this.world_width_, y }
        }
        else {
            return { x: coordinates.x * this.world_width_, y: coordinates.y * this.world_height_ };
        }
    };

    setWheelDirection(value: 1 | -1) {
        this.current_pointer_state_.wheel = value;
    };
    
    setMouseButton(button: "left" | "right", state: boolean) {
        this.current_pointer_state_[button] = state;
    };

    isButtonDown(button: "left" | "right") {
        return this.current_pointer_state_[button];
    };

    wasButtonDown(button: "left" | "right") {
        return this.previous_pointer_state_[button];
    };

    isButtonPressed(button: "left" | "right") {
        if (this.isButtonDown(button) === true && this.wasButtonDown(button) === false) {
            return true;
        }
        return false;
    };

    wasButtonReleased(button: "left" | "right") {
        if (!this.isButtonDown(button) && this.wasButtonDown(button)) {
            return true;
        }
        return false;
    };

    update() {
        // Reset inputs
        this.previous_pointer_state_["left"] = this.current_pointer_state_["left"];
        this.previous_pointer_state_["right"] = this.current_pointer_state_["right"];
        this.previous_pointer_state_["wheel"] = this.current_pointer_state_["wheel"];
        this.previous_pointer_state_["position"].copy(this.current_pointer_state_["position"]);
        this.previous_pointer_state_["delta"].copy(this.current_pointer_state_["delta"]);

        this.current_pointer_state_["delta"].setZero();
        this.current_pointer_state_.wheel = 0;
    };
}