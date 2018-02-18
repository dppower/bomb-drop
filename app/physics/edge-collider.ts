import { Vec2, Vec2_C, Vec2_T } from "../maths/vec2";

export class EdgeCollider {

    private edge_normal_: Vec2_C;
    private inverse_normal_: Vec2_C;
    private edge_vector_: Vec2_C;
    private inverse_vector_: Vec2_C;

    constructor(
        readonly start: Vec2_C,
        readonly end: Vec2_C
    ) {
        this.edge_vector_ = Vec2.subtract(this.end, this.start);
        this.inverse_vector_ = Vec2.subtract(this.start, this.end);
        this.edge_normal_ = Vec2.normalise(Vec2.perRight(this.edge_vector_));
        this.inverse_normal_ = Vec2.normalise(Vec2.inverse(this.edge_normal_));
    };

    collideWithCircle(center: Vec2_T, radius: number) {

        let ec = Vec2.subtract(center, this.end);
        if (Vec2.dot(ec, this.inverse_vector_) < 0) {
            let depth = Vec2.magnitude(ec) - radius;
            return { depth, normal: Vec2.normalise(ec) };
        }
        else {
            let sc = Vec2.subtract(center, this.start);
            if (Vec2.dot(sc, this.edge_vector_) < 0) {
                let depth = Vec2.magnitude(sc) - radius;
                return { depth, normal: Vec2.normalise(sc) };
            }
            else {
                let dp = Vec2.dot(sc, this.edge_normal_);

                if (dp < 0) {
                    let depth = -dp - radius;
                    return { depth, normal: this.inverse_normal_ };
                }
                else if (dp > 0) {
                    let depth = dp - radius;
                    return { depth, normal: this.edge_normal_ };
                }
                else {
                    return { depth: radius, normal: this.edge_normal_ };
                }
            }
        }
    };
}