import { Injectable, Inject } from "@angular/core";

import { Subscription } from "rxjs/Subscription";
import { filter } from "rxjs/operators";

import { Mesh } from "../geometry/mesh";
import { BOXES, SKY, RGB_COLORS } from "../geometry/mesh-providers";
import { BOX_DIMENSIONS, WORLD_HEIGHT, WORLD_WIDTH, BoxDimensions } from "../physics/constants";
import { ShaderProgram } from "../shaders/shader-program";
import { BASIC_SHADER } from "../shaders/shader-providers";
import { WEBGL } from "../webgl/webgl-tokens";
import { Camera2d } from "../canvas/camera-2d";
import { RenderLoop } from "../canvas/render-loop";
import { BombSpawner } from "../game/bomb-spawner";
import { ScoreTracker } from "../game/score-tracker";

@Injectable()
export class SceneRenderer {

    private permutations: number[][];
    private current_permutation = 0;

    private time_to_next_swap = 40;
    private swap_interval_ = 40;

    private blast_duration_ = 0.5;
    private blast_time_remaining_ = [0, 0, 0];
    private blast_scale_ = 0.05;

    private score_sub_: Subscription;

    constructor(
        @Inject(WEBGL) private gl: WebGLRenderingContext,
        @Inject(BASIC_SHADER) private shader_: ShaderProgram,
        @Inject(BOXES) private boxes_: Mesh[],
        @Inject(SKY) private sky_: Mesh,
        @Inject(RGB_COLORS) private rgb_colors: number[][],
        @Inject(BOX_DIMENSIONS) private box_dimensions_: BoxDimensions[],
        @Inject(WORLD_WIDTH) private world_width_: number,
        @Inject(WORLD_HEIGHT) private world_height_: number,
        private render_loop_: RenderLoop,
        private main_camera_: Camera2d,
        private bomb_spawner_: BombSpawner,
        private score_tracker_: ScoreTracker
    ) {
        this.setPermutations();
    };

    setPermutations() {
        this.permutations = [];

        const permute = (arr: number[], m: number[] = []) => {
            if (arr.length === 0) {
                this.permutations.push(m)
            } else {
                for (let i = 0; i < arr.length; i++) {
                    let curr = arr.slice();
                    let next = curr.splice(i, 1);
                    permute(curr.slice(), m.concat(next))
                }
            }
        };
        
        permute([0, 1, 2]);
    };

    initScene() {
        this.shader_.initProgram();
        this.bomb_spawner_.initSpawner();

        // Sky
        this.sky_.setUniformColor([0.729, 0.831, 0.937, 1.0], 3);
        let hw = this.world_width_ / 2;
        let hh = this.world_height_ / 2;
        this.sky_.initTransform(hw, hh, 10, hw, hh, 0);

        // Boxes
        let color_indices = this.permutations[this.current_permutation];
        this.boxes_.forEach((box, index) => {
            let color_index = color_indices[index];
            box.setUniformColor(this.rgb_colors[color_index], color_index);

            let dims = this.box_dimensions_[index];
            let half = dims.length / 2;
            box.initTransform(dims.x, dims.y, 1, half, half, 0);
        });

        this.score_sub_ = this.score_tracker_.scores
            .pipe(
                filter(change => change.box > -1 && change.score === 1)
            )
            .subscribe(change => {
                this.blast_time_remaining_[change.box] = this.blast_duration_;
            });
    };

    updateScene(dt: number) {
        this.time_to_next_swap -= dt;
        if (this.time_to_next_swap < 0) {
            this.permutateColors();
        }
        this.time_to_next_swap = ((this.time_to_next_swap % this.swap_interval_) + this.swap_interval_) % this.swap_interval_;

        this.render_loop_.swap_interval.next(this.time_to_next_swap);

        // Update blast times
        this.blast_time_remaining_ = this.blast_time_remaining_.map(time => {
            let new_time = time - dt;
            return new_time < 0 ? 0 : new_time;
        });
        this.updateBoxes();

        // Update bombs
        this.bomb_spawner_.updateSpawner(dt);
        this.bomb_spawner_.updateBombs(dt, this.permutations[this.current_permutation]);

        // Update camera
        this.main_camera_.updateViewDimensions();
    };

    updateBoxes() {
        this.boxes_.forEach((box, index) => {
            let alpha = this.blast_scale_ * this.blast_time_remaining_[index] / this.blast_duration_;
            let h = this.box_dimensions_[index].length / 2;
            box.scale = h * (1 + alpha);
            box.y = h * (1 + alpha);
        });
    };

    permutateColors() {
        const get_next_index = (): any => {
            let i = Math.floor(Math.random() * 6);
            if (i === this.current_permutation) {
                return get_next_index();
            }
            else {
                this.current_permutation = i;
                return this.current_permutation;
            }
        };
        let i = get_next_index();
        let array = this.permutations[i];

        this.boxes_.forEach((box, index) => {
            box.setUniformColor(this.rgb_colors[array[index]], array[index]);
        });
    };

    drawScene() {
        this.shader_.useProgram();        
        this.gl.uniformMatrix4fv(
            this.shader_.getUniform("u_projection_matrix"), false, this.main_camera_.projection
        );
        // Draw Static
        this.boxes_.forEach(box => box.drawMesh(this.shader_));
        this.sky_.drawMesh(this.shader_);
        // Draw bombs
        this.bomb_spawner_.drawBombs(this.gl, this.main_camera_);
    };

    dispose() {
        this.score_sub_.unsubscribe();
    };
}