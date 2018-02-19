import { Mesh } from "../geometry/mesh";
import { ShaderProgram } from "../shaders/shader-program";
import { InputManager } from "../canvas/input-manager";
import { Vec2, Vec2_T } from "../maths/vec2";
import { BoxEdges } from "../physics/box-edges";
import { CircleCollider } from "../physics/circle-collider";

export class Bomb {

    get collider() {
        return this.collider_;
    };

    get color_id() {
        return this.color_id_;
    };

    get is_destroyed() {
        return this.is_destroyed_;
    };

    setDestroyed() {
        this.is_destroyed_ = true;
    };

    set awake(value: boolean) {
        this.is_awake_ = value;
    };

    private is_destroyed_ = false;
    
    private is_awake_ = false;
    private gravity = -9.8;

    private time_remaining_: number;
    private arc_length_: number;

    private center_: Vec2;
    private radius_ = 3;
    private collider_: CircleCollider;

    constructor(private bomb_mesh_: Mesh, private color_array_: number[],
        private color_id_: number, private expiry_time_: number, center: Vec2_T,
        private box_edges_: BoxEdges
    ) {
        this.center_ = new Vec2(center);
        this.collider_ = new CircleCollider(this.center_, this.radius_);
        this.time_remaining_ = this.expiry_time_;
        this.arc_length_ = 0;
        this.bomb_mesh_.initTransform(this.center_.x, this.center_.y, 1, this.radius_, this.radius_, 0);
    };

    update(dt: number, inputs: InputManager, is_selected: boolean, touch_delta: Vec2_T) {
        this.time_remaining_ -= dt;
        if (this.time_remaining_ < 0) {
            this.is_destroyed_ = true;
            return true;
        }

        // Apply movement
        if (is_selected) {
            this.is_awake_ = true;
            let velocity = Vec2.scale(inputs.delta, dt * 60);
            Vec2.add(this.center_, velocity, this.center_);
        }
        else if (touch_delta) {
            this.is_awake_ = true;
            let velocity = Vec2.scale(touch_delta, dt * 60);
            Vec2.add(this.center_, velocity, this.center_);
        }


        // Apply gravity
        if (!is_selected && this.is_awake_) {
            this.center_.y += this.gravity * dt;
        }

        // Handle contacts
        let world_displace = this.box_edges_.collideWithWorldEdges(this.center_, this.radius_);
        let box_displace = this.box_edges_.collideWithEdges(this.center_, this.radius_);

        let total_displace = Vec2.add(world_displace, box_displace);

        if (!Vec2.isZero(total_displace)) {
            this.center_.copy(Vec2.add(this.center_, total_displace));
        }

        // Update mesh position
        this.bomb_mesh_.x = this.center_.x;
        this.bomb_mesh_.y = this.center_.y;

        if (this.center_.y < this.radius_) {
            this.is_destroyed_ = true;
            return true;
        }
        return false;
    };

    isPointInBomb(point: Vec2_T) {
        return this.collider_.isPointInCircle(point);
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