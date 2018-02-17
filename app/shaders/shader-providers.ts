import { StaticProvider, InjectionToken } from "@angular/core";

import { WEBGL } from "../webgl/webgl-tokens";
import { ShaderProgram } from "./shader-program";
import { VertexShaderSource, FragmentShaderSource } from "./shader";
import { ActiveProgramAttributes } from "./active-program-attributes";

const BASIC_VERTEX_SHADER = new InjectionToken<VertexShaderSource>("vertex-shader");
const BASIC_FRAGMENT_SHADER = new InjectionToken<FragmentShaderSource>("fragment-shader");
export const BASIC_SHADER = new InjectionToken<ShaderProgram>("uniform shader");

const BOMB_VERTEX_SHADER = new InjectionToken<VertexShaderSource>("bomb-vertex-shader");
const BOMB_FRAGMENT_SHADER = new InjectionToken<FragmentShaderSource>("bomb-fragment-shader");
export const BOMB_SHADER = new InjectionToken<ShaderProgram>("bomb-uniform shader");

export const SHADER_PROVIDERS: StaticProvider[] = [
    { provide: ActiveProgramAttributes, useClass: ActiveProgramAttributes, deps: [] },
    {
        provide: BASIC_VERTEX_SHADER, useValue: {
            attributes: ["POSITION"],
            uniforms: ["u_view_matrix", "u_projection_matrix"],
            source: `
            #version 100
            attribute vec3 POSITION;
            uniform mat4 u_view_matrix;
            uniform mat4 u_projection_matrix;
            void main(void) {
            gl_Position = u_projection_matrix * u_view_matrix * vec4(POSITION, 1.0);
            }`
        }
    },
    {
        provide: BASIC_FRAGMENT_SHADER, useValue: {
            attributes: [],
            uniforms: ["u_base_color"],
            source: `
            #version 100
            precision mediump float;
            uniform vec4 u_base_color;
            void main(void) {
            gl_FragColor = u_base_color;
            }`
        }
    },
    {
        provide: BASIC_SHADER,
        useClass: ShaderProgram,
        deps: [WEBGL, BASIC_VERTEX_SHADER, BASIC_FRAGMENT_SHADER, ActiveProgramAttributes]
    },
    {
        provide: BOMB_VERTEX_SHADER, useValue: {
            attributes: ["POSITION"],
            uniforms: ["u_view_matrix", "u_projection_matrix"],
            source: `
            #version 100
            attribute vec3 POSITION;
            uniform mat4 u_view_matrix;
            uniform mat4 u_projection_matrix;
            varying vec2 v_radius;
            void main(void) {
            v_radius = POSITION.xy;
            gl_Position = u_projection_matrix * u_view_matrix * vec4(POSITION, 1.0);
            }`
        }
    },
    {
        provide: BOMB_FRAGMENT_SHADER, useValue: {
            attributes: [],
            uniforms: ["u_base_color", "u_angle"],
            source: `
            #version 100
            precision mediump float;
            uniform vec4 u_base_color;
            uniform float u_angle;
            varying vec2 v_radius;
            void main(void) {
            gl_FragColor = u_base_color;
            }`
        }
    },
    {
        provide: BOMB_SHADER,
        useClass: ShaderProgram,
        deps: [WEBGL, BOMB_VERTEX_SHADER, BOMB_FRAGMENT_SHADER, ActiveProgramAttributes]
    }
];
