import { Mesh } from "../geometry/mesh";
import { ShaderProgram } from "../shaders/shader-program";
import { Vec2, Vec2_T } from "../maths/vec2";

export class Bomb {

    private is_destroyed_ = false;

    private position_: Vec2;

    constructor(private bomb_mesh_: Mesh, private color_array_: number[],
        private color_id_: number, private time_remaining_: number, position: Vec2_T
    ) {
        this.position_ = new Vec2(position);

        this.bomb_mesh_.initTransform(this.position_.x, this.position_.y, 1, 2.5, 2.5, 0);
    };

    update(dt: number) {
        this.time_remaining_ -= dt;
        if (this.time_remaining_ < 0) {
            this.is_destroyed_ = true;
        }
        return this.is_destroyed_;
    };

    draw(shader: ShaderProgram) {
        if (this.is_destroyed_) return;
        this.bomb_mesh_.setUniformColor(this.color_array_, this.color_id_);
        this.bomb_mesh_.drawMesh(shader);
    };
}