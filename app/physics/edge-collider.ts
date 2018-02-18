import { Vec2, Vec2_C, Vec2_T } from "../maths/vec2";

export class EdgeCollider {

    readonly edge_normal: Vec2_C;
    readonly inverse_normal: Vec2_C;
    readonly edge_vector: Vec2_C;
    readonly inverse_vector: Vec2_C;

    constructor(
        readonly start: Vec2_C,
        readonly end: Vec2_C
    ) {
        this.edge_vector = Vec2.subtract(this.end, this.start);
        this.inverse_vector = Vec2.subtract(this.start, this.end);
        this.edge_normal = Vec2.normalise(Vec2.perRight(this.edge_vector));
        this.inverse_normal = Vec2.normalise(Vec2.inverse(this.edge_normal));
    };

    collideWithCircle(center: Vec2_T, radius: number, use_edge_normal = false) {

        let ec = Vec2.subtract(center, this.end);
        if (Vec2.dot(ec, this.inverse_vector) < 0) {
            let depth = Vec2.magnitude(ec) - radius;
            return { depth, normal: Vec2.normalise(ec) };
        }
        else {
            let sc = Vec2.subtract(center, this.start);
            if (Vec2.dot(sc, this.edge_vector) < 0) {
                let depth = Vec2.magnitude(sc) - radius;
                return { depth, normal: Vec2.normalise(sc) };
            }
            else {
                let dp = Vec2.dot(sc, this.edge_normal);

                if (use_edge_normal || dp > 0) {
                    let depth = dp - radius;
                    return { depth, normal: this.edge_normal };
                }
                else if (dp < 0) {
                    let depth = -dp - radius;
                    return { depth, normal: this.inverse_normal };
                }               
                else {
                    return { depth: radius, normal: this.edge_normal };
                }
            }
        }
    };
}