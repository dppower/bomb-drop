import { InjectionToken, StaticProvider } from "@angular/core";

import { WEBGL } from "../webgl/webgl-tokens";
import { Camera2d } from "../canvas/camera-2d";
import { Mesh } from "./mesh";
import { MeshData } from "./mesh-data";
import { Primitive } from "./primitive";
import { square_mesh_data } from "./square-mesh";

// Platforms
export const BOXES = new InjectionToken<Mesh[]>("box mesh");
const SQUARE_BUFFER = new InjectionToken<Primitive[]>("square primitive");
const SQUARE_MESH = new InjectionToken<MeshData>("square mesh data");

export const MESH_PROVIDERS: StaticProvider[] = [
    { provide: SQUARE_MESH, useValue: square_mesh_data },
    {
        provide: SQUARE_BUFFER,
        useClass: Primitive,
        deps: [WEBGL, SQUARE_MESH],
        multi: true
    },
    { provide: BOXES, useClass: Mesh, deps: [WEBGL, SQUARE_BUFFER, Camera2d], multi: true },
    { provide: BOXES, useClass: Mesh, deps: [WEBGL, SQUARE_BUFFER, Camera2d], multi: true },
    { provide: BOXES, useClass: Mesh, deps: [WEBGL, SQUARE_BUFFER, Camera2d], multi: true }
];