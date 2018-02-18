import { Injectable, Inject, Injector } from "@angular/core";

import { BOMB_SHADER } from "../shaders/shader-providers";
import { BOMBS, RGB_COLORS } from "../geometry/mesh-providers";
import { Mesh } from "../geometry/mesh";
import { ShaderProgram} from "../shaders/shader-program";
import { Bomb } from "./bomb";
import { Camera2d } from "../canvas/camera-2d";
import { InputManager } from "../canvas/input-manager";
import { BoxEdges } from "../physics/box-edges";

@Injectable()
export class BombSpawner {

    // Allow for 5 active bombs at a time, replace destroyed ones
    private active_bombs_: Bomb[] = [];

    // Order to add new bombs
    private spawn_order_ = [2, 1, 3, 0, 4];

    // Slots
    private bomb_position_x = [4, 12, 20, 28, 36];
    private bomb_position_y = 50;

    // Spawn timer
    private time_to_next_spawn_ = 1;
    private current_spawn_interval_ = 5;
    private total_time_ = 0;
    private total_bombs_to_spawn_ = 120;

    // Bomb expiry
    private expiry_range_ = 6;
    private min_expiry_ = 5;

    private selected_bomb_: number;

    constructor(
        @Inject(BOMB_SHADER) private shader_: ShaderProgram,
        @Inject(BOMBS) private bomb_meshes_: Mesh[],
        @Inject(RGB_COLORS) private rgb_colors: number[][],
        private input_manager_: InputManager,
        private box_edges_: BoxEdges
    ) { };

    initSpawner() {
        this.shader_.initProgram();
    };

    createBomb(index: number) {
        let expiry_time = Math.floor(Math.random() * this.expiry_range_) + this.min_expiry_;
        let color_index = Math.floor(Math.random() * this.rgb_colors.length);
        let bomb = new Bomb(
            this.bomb_meshes_[index], this.rgb_colors[color_index], color_index,
            expiry_time, { x: this.bomb_position_x[index], y: this.bomb_position_y }, this.box_edges_
        );
        this.active_bombs_[index] = bomb;
    };

    updateSpawner(dt: number) {
        if (this.total_bombs_to_spawn_ > 0) {
            this.time_to_next_spawn_ -= dt;
            this.total_time_ += dt;
            if (this.time_to_next_spawn_ < 0) {
                let index = -1;

                for (let i = 0; i < this.spawn_order_.length; i++) {
                    let slot = this.spawn_order_[i];
                    if (!this.active_bombs_[slot]) {
                        index = slot;
                        break;
                    }
                    else if (this.active_bombs_[slot].is_destroyed) {
                        index = slot;
                        break;
                    }
                }

                if (index > -1) {
                    this.createBomb(index);
                    this.total_bombs_to_spawn_ -= 1;
                    if (this.total_time_ > 120) {
                        this.current_spawn_interval_ = 0.5;
                    }
                    else {
                        this.current_spawn_interval_ = 5 - 0.0375 * this.total_time_;
                    }
                    this.time_to_next_spawn_ = this.current_spawn_interval_;
                }
            }
        }
        this.updateBombs(dt);
    };

    updateBombs(dt: number) {
        if (this.input_manager_.isButtonPressed("left")) {
            this.active_bombs_.forEach((bomb, index) => {
                let is_selected = bomb.isPointInBomb(this.input_manager_.position);
                if (is_selected) {
                    this.selected_bomb_ = index;
                }
            })
        }
        if (this.input_manager_.wasButtonReleased("left")) {
            this.selected_bomb_ = null;
        }

        this.active_bombs_.forEach((bomb, index) => {
            let is_selected = this.selected_bomb_ === index;
            bomb.update(dt, this.input_manager_, is_selected);
        });
    };

    drawBombs(context: WebGLRenderingContext, camera: Camera2d) {
        this.shader_.useProgram();

        context.uniformMatrix4fv(
            this.shader_.getUniform("u_projection_matrix"), false, camera.projection
        );

        this.active_bombs_.forEach(bomb => bomb.draw(context, this.shader_));
    };
}