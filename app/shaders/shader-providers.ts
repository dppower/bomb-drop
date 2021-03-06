﻿import { StaticProvider, InjectionToken } from "@angular/core";

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
            uniforms: ["u_base_color", "u_color_factor"],
            source: `
            #version 100
            precision mediump float;
            uniform vec4 u_base_color;
            uniform float u_color_factor;
            void main(void) {
            gl_FragColor = vec4(u_color_factor * u_base_color.rgb, u_base_color.a);
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
            uniforms: ["u_base_color", "u_arc_length"],
            source: `
            #version 100
            precision mediump float;
            const float PI = 3.14159265358979323846;
            uniform vec4 u_base_color;
            uniform float u_arc_length;
            varying vec2 v_radius;
            void main(void) {
            vec2 normal = normalize(v_radius);
            float a = acos(normal.y);
            if (normal.x < 0.0) {
                a = 2.0 * PI - a;
            }
            float factor = a < u_arc_length ? 0.6 : 1.0;
            gl_FragColor = vec4(factor * u_base_color.xyz, 1.0);
            }`
        }
    },
    {
        provide: BOMB_SHADER,
        useClass: ShaderProgram,
        deps: [WEBGL, BOMB_VERTEX_SHADER, BOMB_FRAGMENT_SHADER, ActiveProgramAttributes]
    }
];
