import { EGLView } from "../EGLView";
import { Size, Rect } from "../../../../types";
import { game } from "../../../../globals";

export class ContentStrategy {
    public static EXACT_FIT = 0;
    public static SHOW_ALL = 1;
    public static NO_BORDER = 2;
    public static FIXED_HEIGHT = 3;
    public static FIXED_WIDTH = 4;

    protected _result: { scale: number[], viewport: Rect | null } = {
        scale: [1, 1],
        viewport: null
    };

    protected _buildResult(containerW: number, containerH: number, contentW: number, contentH: number, scaleX: number, scaleY: number) {
        // Makes content fit better the canvas
        if (Math.abs(containerW - contentW) < 2) {
            contentW = containerW;
        }
        if (Math.abs(containerH - contentH) < 2) {
            contentH = containerH;
        }

        const viewport = new Rect(Math.round((containerW - contentW) / 2),
            Math.round((containerH - contentH) / 2),
            contentW, contentH);

        // Translate the content
        if (game.RENDER_TYPE_CANVAS) {
            //TODO: modify something for setTransform
            //(game._renderContext as any).translate(viewport.x, viewport.y + contentH);
        }

        this._result.scale = [scaleX, scaleY];
        this._result.viewport = viewport;
        return this._result;
    }

    public preApply(view: EGLView) {
    }

    public apply(view: EGLView, designedResolution: Size): { scale: number[], viewport: Rect | null } {
        return { "scale": [1, 1], viewport: null };
    }

    public postApply(view: EGLView) {
    }
}