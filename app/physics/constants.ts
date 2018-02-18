import { InjectionToken, StaticProvider } from "@angular/core";

export const WORLD_WIDTH = new InjectionToken<number>("the width of the physical world");
export const WORLD_HEIGHT = new InjectionToken<number>("the height of the physical world");

export interface BoxDimensions {
    x: number;
    y: number;
    length: number;
}

export const BOX_DIMENSIONS = new InjectionToken<BoxDimensions[]>("box dimensions");

export const WORLD_CONSTANTS: StaticProvider[] = [
    { provide: WORLD_HEIGHT, useValue: 60 },
    { provide: WORLD_WIDTH, useValue: 40 },
    {
        provide: BOX_DIMENSIONS,
        useValue: [{ x: 8, y: 4, length: 8 }, { x: 20, y: 4, length: 8 }, { x: 32, y: 4, length: 8 }]
    }
];