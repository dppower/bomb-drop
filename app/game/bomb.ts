import { Mesh } from "../geometry/mesh";
import { ShaderProgram } from "../shaders/shader-program";
import { Vec2, Vec2_T } from "../maths/vec2";

export class Bomb {

    get is_destroyed() {
        return this.is_destroyed_;
    };

    private is_destroyed_ = false;

    private time_remaining_: number;
    private arc_length_: number;
    private position_: Vec2;

    constructor(private bomb_mesh_: Mesh, private color_array_: number[],
        private color_id_: number, private expiry_time_: number,  position: Vec2_T
    ) {
        this.position_ = new Vec2(position);
        this.time_remaining_ = this.expiry_time_;
        this.arc_length_ = 0;
        this.bomb_mesh_.initTransform(this.position_.x, this.position_.y, 1, 3, 3, 0);
    };

    update(dt: number) {
        this.time_remaining_ -= dt;
        if (this.time_remaining_ < 0) {
            this.is_destroyed_ = true;
        }
        
        return this.is_destroyed_;
    };

    draw(context: WebGLRenderingContext, shader: ShaderProgram) {
        if (this.is_destroyed_) return;
        this.bomb_mesh_.setUniformColor(this.color_array_, this.color_id_);

        this.arc_length_ = 1 - (this.time_remaining_ / this.expiry_time_);
        this.arc_length_ = this.arc_length_ * 2 * Math.PI;

        context.uniform1f(shader.getUniform("u_arc_length"), this.arc_length_);

        this.bomb_mesh_.drawMesh(shader);
    };
}