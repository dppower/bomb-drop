import { Vec2, Vec2_T } from "../maths/vec2";

export class CircleCollider {

    get radius() {
        return this.radius_;
    };

    get center() {
        return this.center_;
    };

    constructor(private center_: Vec2, private radius_: number) { };

    collideWithCircle(collider: CircleCollider) {
        let d = Vec2.magnitude(Vec2.subtract(this.center, collider.center));
        return this.doRadiiOverlap(this.radius_, collider.radius_, d);
    };

    doRadiiOverlap(r1: number, r2: number, distance: number) {
        return r1 + r2 > distance;
    };

    isPointInCircle(point: Vec2_T) {
        let d = Vec2.magnitude(Vec2.subtract(this.center, point));
        return d < this.radius_;
    };
}