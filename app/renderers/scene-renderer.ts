import { Injectable, Inject } from "@angular/core";

import { Mesh } from "../geometry/mesh";
import { BOXES, RGB_COLORS } from "../geometry/mesh-providers";
import { ShaderProgram } from "../shaders/shader-program";
import { BASIC_SHADER } from "../shaders/shader-providers";
import { WEBGL } from "../webgl/webgl-tokens";
import { Camera2d } from "../canvas/camera-2d";
import { RenderLoop } from "../canvas/render-loop";
import { BombSpawner } from "../game/bomb-spawner";

@Injectable()
export class SceneRenderer {

    private permutations: number[][];
    private current_permutation = 0;

    private time_to_next_swap = 40;
    private swap_interval_ = 40;

    constructor(
        @Inject(WEBGL) private gl: WebGLRenderingContext,
        @Inject(BASIC_SHADER) private shader_: ShaderProgram,
        @Inject(BOXES) private boxes_: Mesh[],
        @Inject(RGB_COLORS) private rgb_colors: number[][],
        private render_loop_: RenderLoop,
        private main_camera_: Camera2d,
        private bomb_spawner_: BombSpawner
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

        let color_indices = this.permutations[this.current_permutation];
        this.boxes_.forEach((box, index) => {
            let color_index = color_indices[index];
            box.setUniformColor(this.rgb_colors[color_index], color_index);
        });

        this.boxes_[0].initTransform(8, 4, 1, 4, 4, 0);
        this.boxes_[1].initTransform(20, 4, 1, 4, 4, 0);
        this.boxes_[2].initTransform(32, 4, 1, 4, 4, 0);
    };

    

    updateScene(dt: number) {
        this.time_to_next_swap -= dt;
        if (this.time_to_next_swap < 0) {
            this.permutateColors();
        }
        this.time_to_next_swap = ((this.time_to_next_swap % this.swap_interval_) + this.swap_interval_) % this.swap_interval_;

        this.render_loop_.swap_interval.next(this.time_to_next_swap);

        this.bomb_spawner_.updateSpawner(dt);
        this.bomb_spawner_.updateBombs(dt);
        this.main_camera_.updateViewDimensions();
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
        this.boxes_.forEach(box => box.drawMesh(this.shader_));

        this.bomb_spawner_.drawBombs(this.gl, this.main_camera_);
    };
}