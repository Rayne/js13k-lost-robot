import {SlidingMean} from "./SlidingMean.js";

export let APP_CONFIG = {
    DEBUG: {
        render_log: false,
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
