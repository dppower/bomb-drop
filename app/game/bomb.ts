import { Mesh } from "../geometry/mesh";
import { ShaderProgram } from "../shaders/shader-program";
import { InputManager } from "../canvas/input-manager";
import { Vec2, Vec2_T } from "../maths/vec2";
import { BoxEdges } from "../physics/box-edges";

export class Bomb {

    get is_destroyed() {
        return this.is_destroyed_;
    };

    private is_destroyed_ = false;

    private is_controlled_ = false;
    private was_released_ = false;
    private gravity = -9.8;

    private time_remaining_: number;
    private arc_length_: number;
    private center_: Vec2;
    private radius_ = 3;

    constructor(private bomb_mesh_: Mesh, private color_array_: number[],
        private color_id_: number, private expiry_time_: number, center: Vec2_T,
        private box_edges_: BoxEdges
    ) {
        this.center_ = new Vec2(center);
        this.time_remaining_ = this.expiry_time_;
        this.arc_length_ = 0;
        this.bomb_mesh_.initTransform(this.center_.x, this.center_.y, 1, this.radius_, this.radius_, 0);
    };

    update(dt: number, inputs: InputManager) {
        this.time_remaining_ -= dt;
        if (this.time_remaining_ < 0) {
            this.is_destroyed_ = true;
            return;
        }
        
        if (inputs.isButtonDown("right")) {
            if (this.isPointInCircle(inputs.position)) {
                this.is_controlled_ = true;
                this.center_.copy(inputs.position);
                this.bomb_mesh_.x = this.center_.x;
                this.bomb_mesh_.y = this.center_.y;
            }
        }

        let world_displace = this.box_edges_.collideWithWorldEdges(this.center_, this.radius_);
        let box_displace = this.box_edges_.collideWithEdges(this.center_, this.radius_);

        let total_displace = Vec2.add(world_displace, box_displace);

        if (!Vec2.isZero(total_displace)) {
            this.center_.copy(Vec2.add(this.center_, total_displace));
            this.bomb_mesh_.x = this.center_.x;
            this.bomb_mesh_.y = this.center_.y;
            this.was_released_ = true;
        }

        if (this.is_controlled_ && inputs.wasButtonReleased("right")) {
            this.was_released_ = true;
        }

        // Check for edge collisions
        if (this.center_.x - this.radius_ < 0 ||
            this.center_.x + this.radius_ > 40 ||
            this.center_.y - this.radius_ < 0 ||
            this.center_.y + this.radius_ > 60
        ) {
            this.was_released_ = true;
        }

        if (this.was_released_) {
            this.center_.y += this.gravity * dt;
            this.bomb_mesh_.y = this.center_.y;
        }

        if (this.center_.y < this.radius_) {
            this.is_destroyed_ = true;
        }
    };

    isPointInCircle(point: Vec2_T) {
        let d = Vec2.magnitude(Vec2.subtract(this.center_, point));
        return d < this.radius_;
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