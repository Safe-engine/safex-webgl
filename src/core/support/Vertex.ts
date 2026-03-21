import { p, Point } from '../cocoa/Geometry'
import { degreesToRadians } from '../platform'
import { vertex2 } from '../platform/Types'
import { pCross, pDot, pMidpoint, pMult, pNormalize, pPerp, pSub } from './PointExtension'

export const vertexLineToPolygon = function (points: number[], stroke: number, vertices: number[], offset: number, nuPoints: number) {
  nuPoints += offset
  if (nuPoints <= 1) return

  stroke *= 0.5
  let idx, i
  const nuPointsMinus = nuPoints - 1
  for (i = offset; i < nuPoints; i++) {
    idx = i * 2
    const p1 = p(points[i * 2], points[i * 2 + 1])
    let perpVector

    if (i === 0) perpVector = pPerp(pNormalize(pSub(p1, p(points[(i + 1) * 2], points[(i + 1) * 2 + 1]))))
    else if (i === nuPointsMinus) perpVector = pPerp(pNormalize(pSub(p(points[(i - 1) * 2], points[(i - 1) * 2 + 1]), p1)))
    else {
      const p0 = p(points[(i - 1) * 2], points[(i - 1) * 2 + 1])
      const p2 = p(points[(i + 1) * 2], points[(i + 1) * 2 + 1])

      const p2p1 = pNormalize(pSub(p2, p1))
      const p0p1 = pNormalize(pSub(p0, p1))

      // Calculate angle between vectors
      const angle = Math.acos(pDot(p2p1, p0p1))

      if (angle < degreesToRadians(70)) perpVector = pPerp(pNormalize(pMidpoint(p2p1, p0p1)))
      else if (angle < degreesToRadians(170)) perpVector = pNormalize(pMidpoint(p2p1, p0p1))
      else perpVector = pPerp(pNormalize(pSub(p2, p0)))
    }
    perpVector = pMult(perpVector, stroke)

    vertices[idx * 2] = p1.x + perpVector.x
    vertices[idx * 2 + 1] = p1.y + perpVector.y
    vertices[(idx + 1) * 2] = p1.x - perpVector.x
    vertices[(idx + 1) * 2 + 1] = p1.y - perpVector.y
  }

  // Validate vertexes
  offset = offset === 0 ? 0 : offset - 1
  for (i = offset; i < nuPointsMinus; i++) {
    idx = i * 2
    const idx1 = idx + 2

    const v1 = vertex2(vertices[idx * 2], vertices[idx * 2 + 1])
    const v2 = vertex2(vertices[(idx + 1) * 2], vertices[(idx + 1) * 2 + 1])
    const v3 = vertex2(vertices[idx1 * 2], vertices[idx1 * 2])
    const v4 = vertex2(vertices[(idx1 + 1) * 2], vertices[(idx1 + 1) * 2 + 1])

    //BOOL fixVertex = !ccpLineIntersect(ccp(p1.x, p1.y), ccp(p4.x, p4.y), ccp(p2.x, p2.y), ccp(p3.x, p3.y), &s, &t);
    const fixVertexResult = vertexLineIntersect(v1.x, v1.y, v4.x, v4.y, v2.x, v2.y, v3.x, v3.y)
    if (!fixVertexResult.isSuccess) if (fixVertexResult.value < 0.0 || fixVertexResult.value > 1.0) fixVertexResult.isSuccess = true

    if (fixVertexResult.isSuccess) {
      vertices[idx1 * 2] = v4.x
      vertices[idx1 * 2 + 1] = v4.y
      vertices[(idx1 + 1) * 2] = v3.x
      vertices[(idx1 + 1) * 2 + 1] = v3.y
    }
  }
}

/**
 * returns whether or not the line intersects
 * @param {Number} Ax
 * @param {Number} Ay
 * @param {Number} Bx
 * @param {Number} By
 * @param {Number} Cx
 * @param {Number} Cy
 * @param {Number} Dx
 * @param {Number} Dy
 * @return {Object}
 */
export const vertexLineIntersect = function (
  Ax: number,
  Ay: number,
  Bx: number,
  By: number,
  Cx: number,
  Cy: number,
  Dx: number,
  Dy: number,
) {
  let newX
  // FAIL: Line undefined
  if ((Ax === Bx && Ay === By) || (Cx === Dx && Cy === Dy)) return { isSuccess: false, value: 0 }

  //  Translate system to make A the origin
  Bx -= Ax
  By -= Ay
  Cx -= Ax
  Cy -= Ay
  Dx -= Ax
  Dy -= Ay

  // Length of segment AB
  const distAB = Math.sqrt(Bx * Bx + By * By)

  // Rotate the system so that point B is on the positive X axis.
  const theCos = Bx / distAB
  const theSin = By / distAB
  newX = Cx * theCos + Cy * theSin
  Cy = Cy * theCos - Cx * theSin
  Cx = newX
  newX = Dx * theCos + Dy * theSin
  Dy = Dy * theCos - Dx * theSin
  Dx = newX

  // FAIL: Lines are parallel.
  if (Cy === Dy) return { isSuccess: false, value: 0 }

  // Discover the relative position of the intersection in the line AB
  const t = (Dx + ((Cx - Dx) * Dy) / (Dy - Cy)) / distAB

  // Success.
  return { isSuccess: true, value: t }
}

/**
 * returns wheter or not polygon defined by vertex list is clockwise
 * @param {Array} verts
 * @return {Boolean}
 */
export const vertexListIsClockwise = function (verts: Point[]) {
  for (let i = 0, len = verts.length; i < len; i++) {
    const a = verts[i]
    const b = verts[(i + 1) % len]
    const c = verts[(i + 2) % len]

    if (pCross(pSub(b, a), pSub(c, b)) > 0) return false
  }

  return true
}
