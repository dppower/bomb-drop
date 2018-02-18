import { Vec2_T } from "../maths/vec2";
import { CircleCollider } from "./circle-collider";

export type AABB_T = { x0: number, y0: number, x2: number, y2: number };

export class AABB {
    
    get min(): Vec2_T {
        return { x: this.x0, y: this.y0 };
    };

    get max(): Vec2_T {
        return { x: this.x2, y: this.y2 };
    };

    get copy(): AABB_T {
        return { x0: this.x0, y0: this.y0, x2: this.x2, y2: this.y2 };
    };

    constructor(public x0: number, public y0: number,
        public x2: number, public y2: number
    ) { };

    static isOverlapBetweenAABB(b1: AABB, b2: AABB) {
        let a = b1.y2 - b2.y0;
        let b = b1.y0 - b2.y2;

        if (a * b >= 0) return false;

        let c = b1.x2 - b2.x0;
        let d = b1.x0 - b2.x2;

        return c * d < 0;
    };

    static isCircleInAABB(box: AABB, circle: CircleCollider) {
        let r = circle.radius;
        let c = circle.center;
        if (c.x + r > box.x2) return false;
        if (c.x - r < box.x0) return false;
        if (c.y + r > box.y2) return false;
        if (c.y - r < box.y0) return false;
        return true;
    };

    static isPointInAABB(box: AABB, point: Vec2_T) {
        let a = box.y2 - point.y;
        let b = box.y0 - point.y;

        if (a * b >= 0) {
            return false;
        }

        let c = box.x2 - point.x;
        let d = box.x0 - point.x;

        return c * d < 0;
    };
}