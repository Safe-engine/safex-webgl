import { director, game } from '../../../..';
import { Size } from '../../cocoa/Geometry';
import { EGLView } from '../EGLView';
import { ContainerStrategy } from './ContainerStrategy';
import { ContentStrategy } from './ContentStrategy';

export class EGLInstance {
  _viewName = '';
  _initialized = false;

  initialize() {
    this._initialized = true;
  }

  getViewName(): string {
    return this._viewName;
  }

  setViewName(viewName: string) {
    if (viewName != null && viewName.length > 0) {
      this._viewName = viewName;
    }
  }
}

// Container scale strategys
export class EqualToFrame extends ContainerStrategy {
  apply(view: EGLView) {
    const frameH = view._frameSize.height;
    const containerStyle = game.container!.style;
    this._setupContainer(view, view._frameSize.width, view._frameSize.height);
    // Setup container's margin and padding
    if (view._isRotated) {
      containerStyle.margin = '0 0 0 ' + frameH + 'px';
    }
    else {
      containerStyle.margin = '0px';
    }
  }
}

export class ProportionalToFrame extends ContainerStrategy {
  apply(view: EGLView, designedResolution: Size) {
    const frameW = view._frameSize.width;
    const frameH = view._frameSize.height;
    const containerStyle = game.container!.style;
    const designW = designedResolution.width;
    const designH = designedResolution.height;
    const scaleX = frameW / designW;
    const scaleY = frameH / designH;
    let containerW: number;
    let containerH: number;

    scaleX < scaleY ? (containerW = frameW, containerH = designH * scaleX) : (containerW = designW * scaleY, containerH = frameH);

    // Adjust container size with integer value
    const offx = Math.round((frameW - containerW) / 2);
    const offy = Math.round((frameH - containerH) / 2);
    containerW = frameW - 2 * offx;
    containerH = frameH - 2 * offy;

    this._setupContainer(view, containerW, containerH);
    // Setup container's margin and padding
    if (view._isRotated) {
      containerStyle.margin = '0 0 0 ' + frameH + 'px';
    }
    else {
      containerStyle.margin = '0px';
    }
    containerStyle.paddingLeft = offx + 'px';
    containerStyle.paddingRight = offx + 'px';
    containerStyle.paddingTop = offy + 'px';
    containerStyle.paddingBottom = offy + 'px';
  }
}

export class EqualToWindow extends EqualToFrame {
  preApply(view: EGLView) {
    super.preApply(view);
    view._frame = document.documentElement;
  }

  apply(view: EGLView) {
    super.apply(view);
    this._fixContainer();
  }
}

export class ProportionalToWindow extends ProportionalToFrame {
  preApply(view: EGLView) {
    super.preApply(view);
    view._frame = document.documentElement;
  }

  apply(view: EGLView, designedResolution: Size) {
    super.apply(view, designedResolution);
    this._fixContainer();
  }
}

export class OriginalContainer extends ContainerStrategy {
  apply(view: EGLView) {
    this._setupContainer(view, game.canvas!.width, game.canvas!.height);
  }
}

// Content scale strategys
export class ExactFit extends ContentStrategy {
  apply(view: EGLView, designedResolution: Size) {
    const containerW = game.canvas!.width;
    const containerH = game.canvas!.height;
    const scaleX = containerW / designedResolution.width;
    const scaleY = containerH / designedResolution.height;

    return this._buildResult(containerW, containerH, containerW, containerH, scaleX, scaleY);
  }
}

export class ShowAll extends ContentStrategy {
  apply(view: EGLView, designedResolution: Size) {
    const containerW = game.canvas!.width;
    const containerH = game.canvas!.height;
    const designW = designedResolution.width;
    const designH = designedResolution.height;
    const scaleX = containerW / designW;
    const scaleY = containerH / designH;
    let scale = 0;
    let contentW: number;
    let contentH: number;

    scaleX < scaleY ? (scale = scaleX, contentW = containerW, contentH = designH * scale)
      : (scale = scaleY, contentW = designW * scale, contentH = containerH);

    return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
  }
}

export class NoBorder extends ContentStrategy {
  apply(view: EGLView, designedResolution: Size) {
    const containerW = game.canvas!.width;
    const containerH = game.canvas!.height;
    const designW = designedResolution.width;
    const designH = designedResolution.height;
    const scaleX = containerW / designW;
    const scaleY = containerH / designH;
    let scale: number;
    let contentW: number;
    let contentH: number;

    scaleX < scaleY ? (scale = scaleY, contentW = designW * scale, contentH = containerH)
      : (scale = scaleX, contentW = containerW, contentH = designH * scale);

    return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
  }
}

export class FixedHeight extends ContentStrategy {
  apply(view: EGLView, designedResolution: Size) {
    const containerW = game.canvas!.width;
    const containerH = game.canvas!.height;
    const designH = designedResolution.height;
    const scale = containerH / designH;
    const contentW = containerW;
    const contentH = containerH;

    return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
  }

  postApply(view: EGLView) {
    director._winSizeInPoints = view.getVisibleSize();
  }
}

export class FixedWidth extends ContentStrategy {
  apply(view: EGLView, designedResolution: Size) {
    const containerW = game.canvas!.width;
    const containerH = game.canvas!.height;
    const designW = designedResolution.width;
    const scale = containerW / designW;
    const contentW = containerW;
    const contentH = containerH;

    return this._buildResult(containerW, containerH, contentW, contentH, scale, scale);
  }

  postApply(view: EGLView) {
    director._winSizeInPoints = view.getVisibleSize();
  }
}
