import { InjectionToken, StaticProvider } from "@angular/core";

import { WEBGL } from "../webgl/webgl-tokens";
import { Camera2d } from "../canvas/camera-2d";
import { Mesh } from "./mesh";
import { MeshData } from "./mesh-data";
import { Primitive } from "./primitive";
import { square_mesh_data } from "./square-mesh";
import { circle_mesh_data } from "./circle-mesh";

// Platforms
export const BOXES = new InjectionToken<Mesh[]>("box mesh");
const SQUARE_BUFFER = new InjectionToken<Primitive[]>("square primitive");
const SQUARE_MESH = new InjectionToken<MeshData>("square mesh data");

// Bombs 
export const BOMB = new InjectionToken<Mesh>("bomb mesh");
const CIRCLE_BUFFER = new InjectionToken<Primitive[]>("circle primitive");
const CIRCLE_MESH = new InjectionToken<MeshData>("cirle mesh data");

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
    { provide: BOXES, useClass: Mesh, deps: [WEBGL, SQUARE_BUFFER, Camera2d], multi: true },
    { provide: CIRCLE_MESH, useValue: circle_mesh_data },
    {
        provide: CIRCLE_BUFFER,
        useFactory: (context: WebGLRenderingContext, mesh: MeshData) =>  new Primitive(context, mesh, 6),
        deps: [WEBGL, CIRCLE_MESH],
        multi: true
    },
    { provide: BOMB, useClass: Mesh, deps: [WEBGL, CIRCLE_BUFFER, Camera2d] }
];