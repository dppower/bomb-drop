import { Injectable, Inject } from "@angular/core"

import { Vec2, Vec2_T } from "../maths/vec2";
import { BOX_DIMENSIONS, BoxDimensions, WORLD_HEIGHT, WORLD_WIDTH } from "./constants";
import { EdgeCollider } from "./edge-collider";

@Injectable()
export class BoxEdges {

    private edge_colliders_: EdgeCollider[] = [];

    private world_edges_: EdgeCollider[] = [];
    
    constructor( @Inject(BOX_DIMENSIONS) private box_dimensions_: BoxDimensions[],
        @Inject(WORLD_WIDTH) private world_width_: number,
        @Inject(WORLD_HEIGHT) private world_height_: number
    ) {
        this.createColliders();
    };

    createColliders() {
        // Box Edges
        this.edge_colliders_ = this.box_dimensions_.map(dims => {
            let half = dims.length / 2;
            // Edge 1
            let a = new EdgeCollider(
                { x: dims.x - half, y: 0 },
                { x: dims.x - half, y: dims.y + half }
            );
            // Edge 2
            let b = new EdgeCollider(
                { x: dims.x + half, y: 0 },
                { x: dims.x + half, y: dims.y + half }
            );
            return [a, b];
        }).reduce((a, b) => a.concat(b), []);

        // Left
        this.world_edges_.push(
            new EdgeCollider(
                { x: 0, y: 0 },
                { x: 0, y: this.world_height_ }
            )
        );
        // Top
        this.world_edges_.push(
            new EdgeCollider(
                { x: 0, y: this.world_height_ },
                { x: this.world_width_, y: this.world_height_ }
            )
        );
        // Right
        this.world_edges_.push(
            new EdgeCollider(
                { x: this.world_width_, y: this.world_height_ },
                { x: this.world_width_, y: 0 }
            )
        );
        // Bottom
        this.world_edges_.push(
            new EdgeCollider(
                { x: this.world_width_, y: 0 },
                { x: 0, y: 0 }
            )
        );
    };

    collideWithWorldEdges(center: Vec2_T, radius: number) {
        return this.world_edges_
            .map(collider => {
                return collider.collideWithCircle(center, radius);
            })
            .filter(contact => contact.depth < 0)
            .map(contact => Vec2.scale(contact.normal, -contact.depth))
            .reduce((a, b) => Vec2.add(a, b), Vec2.ZERO);
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