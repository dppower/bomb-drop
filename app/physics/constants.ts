import { InjectionToken, StaticProvider } from "@angular/core";

export const WORLD_WIDTH = new InjectionToken<number>("the width of the physical world");
export const WORLD_HEIGHT = new InjectionToken<number>("the height of the physical world");

export const WORLD_CONSTANTS: StaticProvider[] = [
    { provide: WORLD_HEIGHT, useValue: 60 },
    { provide: WORLD_WIDTH, useValue: 40 }
];