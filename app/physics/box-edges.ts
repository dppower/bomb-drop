import { Injectable, Inject } from "@angular/core"

import { Vec2, Vec2_T } from "../maths/vec2";
import { BOX_DIMENSIONS, BoxDimensions } from "./constants";
import { EdgeCollider } from "./edge-collider";

@Injectable()
export class BoxEdges {

    private edge_colliders_: EdgeCollider[] = [];
    
    constructor( @Inject(BOX_DIMENSIONS) private box_dimensions_: BoxDimensions[]) {
        this.createColliders();
    };

    createColliders() {
        this.edge_colliders_ = this.box_dimensions_.map(dims => {
            let half = dims.length / 2;
            // Edge 1
            let start_a = { x: dims.x - half, y: 0 };
            let end_a = { x: dims.x - half, y: dims.y + half };
            let a = new EdgeCollider(start_a, end_a);
            // Edge 2
            let start_b = { x: dims.x + half, y: 0 };
            let end_b = { x: dims.x + half, y: dims.y + half };
            let b = new EdgeCollider(start_b, end_b);
            return [a, b];
        }).reduce((a, b) => a.concat(b), []);
    };

    collideWithEdges(center: Vec2_T, radius: number) {
        return this.edge_colliders_
            .map(collider => {
                return collider.collideWithCircle(center, radius);
            })
            .filter(contact => contact.depth < 0)
            .map(contact => Vec2.scale(contact.normal, -contact.depth))
            .reduce((a, b) => Vec2.add(a, b), Vec2.ZERO);
    };
}