import { Injectable, Inject } from "@angular/core";

import { Mesh } from "../geometry/mesh";
import { BOXES } from "../geometry/mesh-providers";
import { ShaderProgram } from "../shaders/shader-program";
import { BASIC_SHADER } from "../shaders/shader-providers";
import { WEBGL } from "../webgl/webgl-tokens";
import { Camera2d } from "../canvas/camera-2d";

@Injectable()
export class SceneRenderer {

    readonly box_colors = ["#5768de", "#87b93f", "#d9563d"];

    constructor(
        @Inject(WEBGL) private gl: WebGLRenderingContext,
        @Inject(BASIC_SHADER) private shader_: ShaderProgram,
        @Inject(BOXES) private boxes_: Mesh[],
        private main_camera_: Camera2d
    ) { };

    initScene() {
        this.shader_.initProgram();

        this.boxes_.forEach((box, index) => {
           box.setUniformColor(this.hexToRGBA(this.box_colors[index]));
        });

        this.boxes_[0].initTransform(8, 4, 1, 4, 4, 0);
        this.boxes_[1].initTransform(20, 4, 1, 4, 4, 0);
        this.boxes_[2].initTransform(32, 4, 1, 4, 4, 0);
    };

    hexToRGBA(hex: string) {
        const valid_hex = /^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})?$/i;
        let matchs = hex.match(valid_hex);

        if (matchs) {
            let r = parseInt(matchs[1], 16) / 255;
            let g = parseInt(matchs[2], 16) / 255;
            let b = parseInt(matchs[3], 16) / 255;
            let a = (matchs[4]) ? parseInt(matchs[4], 16) / 255 : 1;
            return [r, g, b, a];
        }
        else {
            return [1, 1, 1, 1];
        }
    };

    updateScene(dt: number) {
        this.main_camera_.updateViewDimensions();
    };

    drawScene() {
        this.shader_.useProgram();
        
        this.gl.uniformMatrix4fv(
            this.shader_.getUniform("u_projection_matrix"), false, this.main_camera_.projection
        );

        this.boxes_.forEach(box => box.drawMesh(this.shader_));
    };
}