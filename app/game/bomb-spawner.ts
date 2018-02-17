import { Injectable, Inject, Injector } from "@angular/core";

import { BOMB_SHADER } from "../shaders/shader-providers";
import { BOMB, RGB_COLORS } from "../geometry/mesh-providers";
import { Mesh } from "../geometry/mesh";
import { ShaderProgram} from "../shaders/shader-program";
import { Bomb } from "./bomb";
import { Camera2d } from "../canvas/camera-2d";

@Injectable()
export class BombSpawner {

    private active_bombs_: Bomb[] = [];

    constructor(
        @Inject(BOMB_SHADER) private shader_: ShaderProgram,
        @Inject(BOMB) private bomb_mesh_: Mesh,
        @Inject(RGB_COLORS) private rgb_colors: number[][],
    ) { };

    initSpawner() {
        this.shader_.initProgram();
    };

    createBomb() {
        let bomb = new Bomb(this.bomb_mesh_, this.rgb_colors[0], 0, 5, { x: 20, y: 50 });
        this.active_bombs_.push(bomb);
    };

    updateBombs(dt: number) {
        this.active_bombs_.forEach(bomb => bomb.update(dt));
    };

    drawBombs(context: WebGLRenderingContext, camera: Camera2d) {
        this.shader_.useProgram();

        context.uniformMatrix4fv(
            this.shader_.getUniform("u_projection_matrix"), false, camera.projection
        );

        this.active_bombs_.forEach(bomb => bomb.draw(context, this.shader_));
    };
}