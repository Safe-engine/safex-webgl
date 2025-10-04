/****************************************************************************
 * Converted to ES Module and TypeScript by GitHub Copilot
 ****************************************************************************/

import { cc } from './Boot';

type Point = { x: number; y: number };
type Color = { r: number; g: number; b: number; a: number };

export class DrawingPrimitiveWebGL {
    private _renderContext: WebGLRenderingContext;
    private _initialized: boolean = false;
    private _shader: any = null;
    private _colorLocation: string = "u_color";
    private _colorArray: Float32Array;
    private _pointSizeLocation: string = "u_pointSize";
    private _pointSize: number = -1;
    private _glProgramState: any = null;

    constructor(ctx?: WebGLRenderingContext) {
        if (!ctx) ctx = _renderContext;
        if (!(ctx instanceof WebGLRenderingContext)) {
            throw new Error("Can't initialise DrawingPrimitiveWebGL. context need is WebGLRenderingContext");
        }
        this._renderContext = ctx;
        this._colorArray = new Float32Array([1.0, 1.0, 1.0, 1.0]);
    }

    private lazy_init() {
        if (!this._initialized) {
            this._shader = shaderCache.programForKey(SHADER_POSITION_UCOLOR);
            this._shader._addUniformLocation(this._colorLocation);
            this._shader._addUniformLocation(this._pointSizeLocation);
            this._glProgramState = GLProgramState.getOrCreateWithGLProgram(this._shader);
            this._initialized = true;
        }
    }

    drawInit() {
        this._initialized = false;
    }

    drawPoint(point: Point) {
        this.lazy_init();
        const glContext = this._renderContext;
        this._glProgramState.apply();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        glContext.enableVertexAttribArray(VERTEX_ATTRIB_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, this._colorArray);
        this._shader.setUniformLocationWith1f(this._pointSizeLocation, this._pointSize);

        const pointBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, pointBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, new Float32Array([point.x, point.y]), glContext.STATIC_DRAW);
        glContext.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 2, glContext.FLOAT, false, 0, 0);

        glContext.drawArrays(glContext.POINTS, 0, 1);
        glContext.deleteBuffer(pointBuffer);

        incrementGLDraws(1);
    }

    drawPoints(points: Point[], numberOfPoints: number) {
        if (!points || points.length === 0) return;
        this.lazy_init();
        const glContext = this._renderContext;
        this._glProgramState.apply();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        glContext.enableVertexAttribArray(VERTEX_ATTRIB_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, this._colorArray);
        this._shader.setUniformLocationWith1f(this._pointSizeLocation, this._pointSize);

        const pointBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, pointBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, this._pointsToTypeArray(points), glContext.STATIC_DRAW);
        glContext.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 2, glContext.FLOAT, false, 0, 0);

        glContext.drawArrays(glContext.POINTS, 0, points.length);
        glContext.deleteBuffer(pointBuffer);

        incrementGLDraws(1);
    }

    private _pointsToTypeArray(points: Point[]): Float32Array {
        const typeArr = new Float32Array(points.length * 2);
        for (let i = 0; i < points.length; i++) {
            typeArr[i * 2] = points[i].x;
            typeArr[i * 2 + 1] = points[i].y;
        }
        return typeArr;
    }

    drawLine(origin: Point, destination: Point) {
        this.lazy_init();
        const glContext = this._renderContext;
        this._glProgramState.apply();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        glContext.enableVertexAttribArray(VERTEX_ATTRIB_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, this._colorArray);

        const pointBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, pointBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, this._pointsToTypeArray([origin, destination]), glContext.STATIC_DRAW);
        glContext.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 2, glContext.FLOAT, false, 0, 0);

        glContext.drawArrays(glContext.LINES, 0, 2);
        glContext.deleteBuffer(pointBuffer);

        incrementGLDraws(1);
    }

    drawRect(origin: Point, destination: Point) {
        this.drawLine({ x: origin.x, y: origin.y }, { x: destination.x, y: origin.y });
        this.drawLine({ x: destination.x, y: origin.y }, { x: destination.x, y: destination.y });
        this.drawLine({ x: destination.x, y: destination.y }, { x: origin.x, y: destination.y });
        this.drawLine({ x: origin.x, y: destination.y }, { x: origin.x, y: origin.y });
    }

    drawSolidRect(origin: Point, destination: Point, color: Color) {
        const vertices = [
            origin,
            { x: destination.x, y: origin.y },
            destination,
            { x: origin.x, y: destination.y }
        ];
        this.drawSolidPoly(vertices, 4, color);
    }

    drawPoly(vertices: Point[], numOfVertices: number, closePolygon: boolean) {
        this.lazy_init();
        const glContext = this._renderContext;
        this._glProgramState.apply();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        glContext.enableVertexAttribArray(VERTEX_ATTRIB_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, this._colorArray);

        const pointBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, pointBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, this._pointsToTypeArray(vertices), glContext.STATIC_DRAW);
        glContext.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 2, glContext.FLOAT, false, 0, 0);

        if (closePolygon)
            glContext.drawArrays(glContext.LINE_LOOP, 0, vertices.length);
        else
            glContext.drawArrays(glContext.LINE_STRIP, 0, vertices.length);
        glContext.deleteBuffer(pointBuffer);

        incrementGLDraws(1);
    }

    drawSolidPoly(poli: Point[], numberOfPoints: number, color: Color) {
        this.lazy_init();
        if (color)
            this.setDrawColor(color.r, color.g, color.b, color.a);

        const glContext = this._renderContext;
        this._glProgramState.apply();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        glContext.enableVertexAttribArray(VERTEX_ATTRIB_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, this._colorArray);

        const pointBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, pointBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, this._pointsToTypeArray(poli), glContext.STATIC_DRAW);
        glContext.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 2, glContext.FLOAT, false, 0, 0);
        glContext.drawArrays(glContext.TRIANGLE_FAN, 0, poli.length);
        glContext.deleteBuffer(pointBuffer);

        incrementGLDraws(1);
    }

    drawCircle(center: Point, radius: number, angle: number, segments: number, drawLineToCenter: boolean) {
        this.lazy_init();

        let additionalSegment = 1;
        if (drawLineToCenter)
            additionalSegment++;

        const coef = 2.0 * Math.PI / segments;
        const vertices = new Float32Array((segments + 2) * 2);

        for (let i = 0; i <= segments; i++) {
            const rads = i * coef;
            const j = radius * Math.cos(rads + angle) + center.x;
            const k = radius * Math.sin(rads + angle) + center.y;
            vertices[i * 2] = j;
            vertices[i * 2 + 1] = k;
        }
        vertices[(segments + 1) * 2] = center.x;
        vertices[(segments + 1) * 2 + 1] = center.y;

        const glContext = this._renderContext;
        this._glProgramState.apply();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        glContext.enableVertexAttribArray(VERTEX_ATTRIB_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, this._colorArray);

        const pointBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, pointBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, vertices, glContext.STATIC_DRAW);
        glContext.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 2, glContext.FLOAT, false, 0, 0);

        glContext.drawArrays(glContext.LINE_STRIP, 0, segments + additionalSegment);
        glContext.deleteBuffer(pointBuffer);

        incrementGLDraws(1);
    }

    drawQuadBezier(origin: Point, control: Point, destination: Point, segments: number) {
        this.lazy_init();

        const vertices = new Float32Array((segments + 1) * 2);

        let t = 0.0;
        for (let i = 0; i < segments; i++) {
            vertices[i * 2] = Math.pow(1 - t, 2) * origin.x + 2.0 * (1 - t) * t * control.x + t * t * destination.x;
            vertices[i * 2 + 1] = Math.pow(1 - t, 2) * origin.y + 2.0 * (1 - t) * t * control.y + t * t * destination.y;
            t += 1.0 / segments;
        }
        vertices[segments * 2] = destination.x;
        vertices[segments * 2 + 1] = destination.y;

        const glContext = this._renderContext;
        this._glProgramState.apply();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        glContext.enableVertexAttribArray(VERTEX_ATTRIB_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, this._colorArray);

        const pointBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, pointBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, vertices, glContext.STATIC_DRAW);
        glContext.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 2, glContext.FLOAT, false, 0, 0);

        glContext.drawArrays(glContext.LINE_STRIP, 0, segments + 1);
        glContext.deleteBuffer(pointBuffer);

        incrementGLDraws(1);
    }

    drawCubicBezier(origin: Point, control1: Point, control2: Point, destination: Point, segments: number) {
        this.lazy_init();

        const vertices = new Float32Array((segments + 1) * 2);

        let t = 0;
        for (let i = 0; i < segments; i++) {
            vertices[i * 2] = Math.pow(1 - t, 3) * origin.x + 3.0 * Math.pow(1 - t, 2) * t * control1.x + 3.0 * (1 - t) * t * t * control2.x + t * t * t * destination.x;
            vertices[i * 2 + 1] = Math.pow(1 - t, 3) * origin.y + 3.0 * Math.pow(1 - t, 2) * t * control1.y + 3.0 * (1 - t) * t * t * control2.y + t * t * t * destination.y;
            t += 1.0 / segments;
        }
        vertices[segments * 2] = destination.x;
        vertices[segments * 2 + 1] = destination.y;

        const glContext = this._renderContext;
        this._glProgramState.apply();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        glContext.enableVertexAttribArray(VERTEX_ATTRIB_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, this._colorArray);

        const pointBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, pointBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, vertices, glContext.STATIC_DRAW);
        glContext.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 2, glContext.FLOAT, false, 0, 0);
        glContext.drawArrays(glContext.LINE_STRIP, 0, segments + 1);
        glContext.deleteBuffer(pointBuffer);

        incrementGLDraws(1);
    }

    drawCatmullRom(points: Point[], segments: number) {
        this.drawCardinalSpline(points, 0.5, segments);
    }

    drawCardinalSpline(config: Point[], tension: number, segments: number) {
        this.lazy_init();

        const vertices = new Float32Array((segments + 1) * 2);
        let p: number, lt: number, deltaT = 1.0 / config.length;
        for (let i = 0; i < segments + 1; i++) {
            const dt = i / segments;
            if (dt === 1) {
                p = config.length - 1;
                lt = 1;
            } else {
                p = Math.floor(dt / deltaT);
                lt = (dt - deltaT * p) / deltaT;
            }
            const newPos = cardinalSplineAt(
                getControlPointAt(config, p - 1),
                getControlPointAt(config, p),
                getControlPointAt(config, p + 1),
                getControlPointAt(config, p + 2),
                tension, lt
            );
            vertices[i * 2] = newPos.x;
            vertices[i * 2 + 1] = newPos.y;
        }

        const glContext = this._renderContext;
        this._glProgramState.apply();
        this._shader.setUniformForModelViewAndProjectionMatrixWithMat4();
        glContext.enableVertexAttribArray(VERTEX_ATTRIB_POSITION);
        this._shader.setUniformLocationWith4fv(this._colorLocation, this._colorArray);

        const pointBuffer = glContext.createBuffer();
        glContext.bindBuffer(glContext.ARRAY_BUFFER, pointBuffer);
        glContext.bufferData(glContext.ARRAY_BUFFER, vertices, glContext.STATIC_DRAW);
        glContext.vertexAttribPointer(VERTEX_ATTRIB_POSITION, 2, glContext.FLOAT, false, 0, 0);
        glContext.drawArrays(glContext.LINE_STRIP, 0, segments + 1);
        glContext.deleteBuffer(pointBuffer);

        incrementGLDraws(1);
    }

    setDrawColor(r: number, g: number, b: number, a: number) {
        this._colorArray[0] = r / 255.0;
        this._colorArray[1] = g / 255.0;
        this._colorArray[2] = b / 255.0;
        this._colorArray[3] = a / 255.0;
    }

    setPointSize(pointSize: number) {
        this._pointSize = pointSize * contentScaleFactor();
    }

    setLineWidth(width: number) {
        if ((this._renderContext as any).lineWidth)
            (this._renderContext as any).lineWidth(width);
    }
}

// Optionally attach to cc namespace for compatibility
DrawingPrimitiveWebGL