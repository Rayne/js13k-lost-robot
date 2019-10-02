import {SlidingMean} from "./SlidingMean.js";

export const RENDER_MODE_SENSOR_RANGE = 'SENSOR_RANGE';
export const RENDER_MODE_CUSTOM_RATIO = 'CUSTOM_RATIO';

export let APP_CONFIG = {
    DEBUG: {
        render_log: false,
        render_mode: RENDER_MODE_SENSOR_RANGE,
        render_mode_ratio: 1, // Native ratio (1:1)
        render_groundtruth: false,
        render_quadtree_all: false,
        render_quadtree_boxes: false,
        render_quadtree_cells: false,
        render_quadtree_queries: false,
        render_quadtree_segments: false,
        add_noise_to_sensors: true,
        frames: {
            slidingMean: new SlidingMean(60, 60),
            tickEnd: Date.now() - 60,
            tickBegin: Date.now(),
        },
        quadtree: {
            rects: [],
            segments: [],
        }
    },
    // resize_canvas: true,
    mapStates: {},
    relative_camera_enabled: true,
    touch2keys: {},
    touch_control_enabled: false,
};

document.APP_CONFIG = APP_CONFIG;
