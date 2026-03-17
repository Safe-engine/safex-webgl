import { log } from '../helper/Debugger'

export const tiffReader = /** @lends tiffReader# */ {
  _littleEndian: false,
  _tiffData: null,
  _fileDirectories: [],

  getUint8: function (offset) {
    return this._tiffData[offset]
  },

  getUint16: function (offset) {
    if (this._littleEndian) return (this._tiffData[offset + 1] << 8) | this._tiffData[offset]
    else return (this._tiffData[offset] << 8) | this._tiffData[offset + 1]
  },

  getUint32: function (offset) {
    const a = this._tiffData
    if (this._littleEndian) return (a[offset + 3] << 24) | (a[offset + 2] << 16) | (a[offset + 1] << 8) | a[offset]
    else return (a[offset] << 24) | (a[offset + 1] << 16) | (a[offset + 2] << 8) | a[offset + 3]
  },

  checkLittleEndian: function () {
    const BOM = this.getUint16(0)

    if (BOM === 0x4949) {
      this.littleEndian = true
    } else if (BOM === 0x4d4d) {
      this.littleEndian = false
    } else {
      console.log(BOM)
      throw TypeError('Invalid byte order value.')
    }

    return this.littleEndian
  },

  hasTowel: function () {
    // Check for towel.
    if (this.getUint16(2) !== 42) {
      throw RangeError('You forgot your towel!')
      return false
    }

    return true
  },

  getFieldTypeName: function (fieldType) {
    const typeNames = this.fieldTypeNames
    if (fieldType in typeNames) {
      return typeNames[fieldType]
    }
    return null
  },

  getFieldTagName: function (fieldTag) {
    const tagNames = this.fieldTagNames

    if (fieldTag in tagNames) {
      return tagNames[fieldTag]
    } else {
      console.log('Unknown Field Tag:', fieldTag)
      return `Tag${fieldTag}`
    }
  },

  getFieldTypeLength: function (fieldTypeName) {
    if (['BYTE', 'ASCII', 'SBYTE', 'UNDEFINED'].indexOf(fieldTypeName) !== -1) {
      return 1
    } else if (['SHORT', 'SSHORT'].indexOf(fieldTypeName) !== -1) {
      return 2
    } else if (['LONG', 'SLONG', 'FLOAT'].indexOf(fieldTypeName) !== -1) {
      return 4
    } else if (['RATIONAL', 'SRATIONAL', 'DOUBLE'].indexOf(fieldTypeName) !== -1) {
      return 8
    }
    return null
  },

  getFieldValues: function (fieldTagName, fieldTypeName, typeCount, valueOffset) {
    const fieldValues = []
    const fieldTypeLength = this.getFieldTypeLength(fieldTypeName)
    const fieldValueSize = fieldTypeLength * typeCount

    if (fieldValueSize <= 4) {
      // The value is stored at the big end of the valueOffset.
      if (this.littleEndian === false) fieldValues.push(valueOffset >>> ((4 - fieldTypeLength) * 8))
      else fieldValues.push(valueOffset)
    } else {
      for (let i = 0; i < typeCount; i++) {
        const indexOffset = fieldTypeLength * i
        if (fieldTypeLength >= 8) {
          if (['RATIONAL', 'SRATIONAL'].indexOf(fieldTypeName) !== -1) {
            // Numerator
            fieldValues.push(this.getUint32(valueOffset + indexOffset))
            // Denominator
            fieldValues.push(this.getUint32(valueOffset + indexOffset + 4))
          } else {
            log('Cant handle this field type or size')
          }
        } else {
          fieldValues.push(this.getBytes(fieldTypeLength, valueOffset + indexOffset))
        }
      }
    }

    if (fieldTypeName === 'ASCII') {
      fieldValues.forEach(function (e, i, a) {
        a[i] = String.fromCharCode(e)
      })
    }
    return fieldValues
  },

  getBytes: function (numBytes, offset) {
    if (numBytes <= 0) {
      log('No bytes requested')
    } else if (numBytes <= 1) {
      return this.getUint8(offset)
    } else if (numBytes <= 2) {
      return this.getUint16(offset)
    } else if (numBytes <= 3) {
      return this.getUint32(offset) >>> 8
    } else if (numBytes <= 4) {
      return this.getUint32(offset)
    } else {
      log('Too many bytes requested')
    }
  },

  getBits: function (numBits, byteOffset, bitOffset) {
    bitOffset = bitOffset || 0
    const extraBytes = Math.floor(bitOffset / 8)
    const newByteOffset = byteOffset + extraBytes
    const totalBits = bitOffset + numBits
    const shiftRight = 32 - numBits
    let shiftLeft, rawBits

    if (totalBits <= 0) {
      console.log('No bits requested')
    } else if (totalBits <= 8) {
      shiftLeft = 24 + bitOffset
      rawBits = this.getUint8(newByteOffset)
    } else if (totalBits <= 16) {
      shiftLeft = 16 + bitOffset
      rawBits = this.getUint16(newByteOffset)
    } else if (totalBits <= 32) {
      shiftLeft = bitOffset
      rawBits = this.getUint32(newByteOffset)
    } else {
      console.log('Too many bits requested')
    }

    return {
      bits: (rawBits << shiftLeft) >>> shiftRight,
      byteOffset: newByteOffset + Math.floor(totalBits / 8),
      bitOffset: totalBits % 8,
    }
  },

  parseFileDirectory: function (byteOffset) {
    const numDirEntries = this.getUint16(byteOffset)
    const tiffFields = []
    let i, entryCount
    for (i = byteOffset + 2, entryCount = 0; entryCount < numDirEntries; i += 12, entryCount++) {
      const fieldTag = this.getUint16(i)
      const fieldType = this.getUint16(i + 2)
      const typeCount = this.getUint32(i + 4)
      const valueOffset = this.getUint32(i + 8)

      const fieldTagName = this.getFieldTagName(fieldTag)
      const fieldTypeName = this.getFieldTypeName(fieldType)
      const fieldValues = this.getFieldValues(fieldTagName, fieldTypeName, typeCount, valueOffset)

      tiffFields[fieldTagName] = { type: fieldTypeName, values: fieldValues }
    }

    this._fileDirectories.push(tiffFields)

    const nextIFDByteOffset = this.getUint32(i)
    if (nextIFDByteOffset !== 0x00000000) {
      this.parseFileDirectory(nextIFDByteOffset)
    }
  },

  clampColorSample: function (colorSample, bitsPerSample) {
    const multiplier = Math.pow(2, 8 - bitsPerSample)

    return Math.floor(colorSample * multiplier + (multiplier - 1))
  },

  /**
   * @function
   * @param {Array} tiffData
   * @param {HTMLCanvasElement} canvas
   * @returns {*}
   */
  parseTIFF: function (tiffData, canvas) {
    canvas = canvas || document.createElement('canvas')

    this._tiffData = tiffData
    this.canvas = canvas

    this.checkLittleEndian()

    if (!this.hasTowel()) {
      return
    }

    const firstIFDByteOffset = this.getUint32(4)

    this._fileDirectories.length = 0
    this.parseFileDirectory(firstIFDByteOffset)

    const fileDirectory = this._fileDirectories[0]

    const imageWidth = fileDirectory['ImageWidth'].values[0]
    const imageLength = fileDirectory['ImageLength'].values[0]

    this.canvas.width = imageWidth
    this.canvas.height = imageLength

    const strips = []

    const compression = fileDirectory['Compression'] ? fileDirectory['Compression'].values[0] : 1

    const samplesPerPixel = fileDirectory['SamplesPerPixel'].values[0]

    const sampleProperties = []

    let bitsPerPixel = 0
    let hasBytesPerPixel = false

    fileDirectory['BitsPerSample'].values.forEach(function (bitsPerSample, i, bitsPerSampleValues) {
      sampleProperties[i] = {
        bitsPerSample: bitsPerSample,
        hasBytesPerSample: false,
        bytesPerSample: undefined,
      }

      if (bitsPerSample % 8 === 0) {
        sampleProperties[i].hasBytesPerSample = true
        sampleProperties[i].bytesPerSample = bitsPerSample / 8
      }

      bitsPerPixel += bitsPerSample
    }, this)
    let bytesPerPixel
    if (bitsPerPixel % 8 === 0) {
      hasBytesPerPixel = true
      bytesPerPixel = bitsPerPixel / 8
    }

    const stripOffsetValues = fileDirectory['StripOffsets'].values
    const numStripOffsetValues = stripOffsetValues.length

    // StripByteCounts is supposed to be required, but see if we can recover anyway.
    let stripByteCountValues
    if (fileDirectory['StripByteCounts']) {
      stripByteCountValues = fileDirectory['StripByteCounts'].values
    } else {
      log('Missing StripByteCounts!')

      // Infer StripByteCounts, if possible.
      if (numStripOffsetValues === 1) {
        stripByteCountValues = [Math.ceil((imageWidth * imageLength * bitsPerPixel) / 8)]
      } else {
        throw Error('Cannot recover from missing StripByteCounts')
      }
    }

    // Loop through strips and decompress as necessary.
    let byteOffset, bitOffset, jIncrement, getHeader, pixel, numBytes, sample, currentSample
    for (let i = 0; i < numStripOffsetValues; i++) {
      const stripOffset = stripOffsetValues[i]
      strips[i] = []

      const stripByteCount = stripByteCountValues[i]

      // Loop through pixels.
      for (
        byteOffset = 0, bitOffset = 0, jIncrement = 1, getHeader = true, pixel = [], numBytes = 0, sample = 0, currentSample = 0;
        byteOffset < stripByteCount;
        byteOffset += jIncrement
      ) {
        // Decompress strip.
        switch (compression) {
          // Uncompressed
          case 1: {
            // Loop through samples (sub-pixels).
            let m
            for (m = 0; m < samplesPerPixel; m++) {
              if (sampleProperties[m].hasBytesPerSample) {
                // XXX: This is wrong!
                const sampleOffset = sampleProperties[m].bytesPerSample * m
                pixel.push(this.getBytes(sampleProperties[m].bytesPerSample, stripOffset + byteOffset + sampleOffset))
              } else {
                const sampleInfo = this.getBits(sampleProperties[m].bitsPerSample, stripOffset + byteOffset, bitOffset)
                pixel.push(sampleInfo.bits)
                // byteOffset = sampleInfo.byteOffset - stripOffset
                // bitOffset = sampleInfo.bitOffset
                throw RangeError('Cannot handle sub-byte bits per sample')
              }
            }

            strips[i].push(pixel)

            if (hasBytesPerPixel) {
              jIncrement = bytesPerPixel
            } else {
              // jIncrement = 0
              throw RangeError('Cannot handle sub-byte bits per pixel')
            }
            break
          }
          // CITT Group 3 1-Dimensional Modified Huffman run-length encoding
          case 2:
            // XXX: Use PDF.js code?
            break

          // Group 3 Fax
          case 3:
            // XXX: Use PDF.js code?
            break

          // Group 4 Fax
          case 4:
            // XXX: Use PDF.js code?
            break

          // LZW
          case 5:
            // XXX: Use PDF.js code?
            break

          // Old-style JPEG (TIFF 6.0)
          case 6:
            // XXX: Use PDF.js code?
            break

          // New-style JPEG (TIFF Specification Supplement 2)
          case 7:
            // XXX: Use PDF.js code?
            break

          // PackBits
          case 32773: {
            // Are we ready for a new block?
            let blockLength
            let iterations
            if (getHeader) {
              getHeader = false

              // The header byte is signed.
              const header = this.getInt8(stripOffset + byteOffset)

              if (header >= 0 && header <= 127) {
                // Normal pixels.
                blockLength = header + 1
              } else if (header >= -127 && header <= -1) {
                // Collapsed pixels.
                iterations = -header + 1
              } else /*if (header === -128)*/ {
                // Placeholder byte?
                getHeader = true
              }
            } else {
              const currentByte = this.getUint8(stripOffset + byteOffset)

              // Duplicate bytes, if necessary.
              for (let m = 0; m < iterations; m++) {
                if (sampleProperties[sample].hasBytesPerSample) {
                  // We're reading one byte at a time, so we need to handle multi-byte samples.
                  currentSample = (currentSample << (8 * numBytes)) | currentByte
                  numBytes++

                  // Is our sample complete?
                  if (numBytes === sampleProperties[sample].bytesPerSample) {
                    pixel.push(currentSample)
                    currentSample = numBytes = 0
                    sample++
                  }
                } else {
                  throw RangeError('Cannot handle sub-byte bits per sample')
                }

                // Is our pixel complete?
                if (sample === samplesPerPixel) {
                  strips[i].push(pixel)
                  pixel = []
                  sample = 0
                }
              }

              blockLength--

              // Is our block complete?
              if (blockLength === 0) {
                getHeader = true
              }
            }

            jIncrement = 1
            break
          }
          // Unknown compression algorithm
          default:
            // Do not attempt to parse the image data.
            break
        }
      }
    }

    if (canvas.getContext) {
      const ctx = this.canvas.getContext('2d')

      // Set a default fill style.
      ctx.fillStyle = 'rgba(255, 255, 255, 0)'

      // If RowsPerStrip is missing, the whole image is in one strip.
      const rowsPerStrip = fileDirectory['RowsPerStrip'] ? fileDirectory['RowsPerStrip'].values[0] : imageLength

      const numStrips = strips.length

      const imageLengthModRowsPerStrip = imageLength % rowsPerStrip
      const rowsInLastStrip = imageLengthModRowsPerStrip === 0 ? rowsPerStrip : imageLengthModRowsPerStrip

      let numRowsInStrip = rowsPerStrip
      let numRowsInPreviousStrip = 0

      const photometricInterpretation = fileDirectory['PhotometricInterpretation'].values[0]

      let extraSamplesValues = []
      let numExtraSamples = 0

      if (fileDirectory['ExtraSamples']) {
        extraSamplesValues = fileDirectory['ExtraSamples'].values
        numExtraSamples = extraSamplesValues.length
      }
      let colorMapValues, colorMapSampleSize
      if (fileDirectory['ColorMap']) {
        colorMapValues = fileDirectory['ColorMap'].values
        colorMapSampleSize = Math.pow(2, sampleProperties[0].bitsPerSample)
      }

      // Loop through the strips in the image.
      for (let i = 0; i < numStrips; i++) {
        // The last strip may be short.
        if (i + 1 === numStrips) {
          numRowsInStrip = rowsInLastStrip
        }

        const numPixels = strips[i].length
        const yPadding = numRowsInPreviousStrip * i

        // Loop through the rows in the strip.
        for (let y = 0, j = 0; y < numRowsInStrip && j < numPixels; y++) {
          // Loop through the pixels in the row.
          for (let x = 0; x < imageWidth; x++, j++) {
            const pixelSamples = strips[i][j]

            let red
            let green
            let blue
            let opacity = 1.0

            if (numExtraSamples > 0) {
              for (let k = 0; k < numExtraSamples; k++) {
                if (extraSamplesValues[k] === 1 || extraSamplesValues[k] === 2) {
                  // Clamp opacity to the range [0,1].
                  opacity = pixelSamples[3 + k] / 256

                  break
                }
              }
            }

            switch (photometricInterpretation) {
              // Bilevel or Grayscale
              // WhiteIsZero
              case 0: {
                let invertValue
                if (sampleProperties[0].hasBytesPerSample) {
                  invertValue = Math.pow(0x10, sampleProperties[0].bytesPerSample * 2)
                }

                // Invert samples.
                pixelSamples.forEach(function (sample, index, samples) {
                  samples[index] = invertValue - sample
                })
                red = green = blue = this.clampColorSample(pixelSamples[0], sampleProperties[0].bitsPerSample)
                break
              }
              // Bilevel or Grayscale
              // BlackIsZero

              case 1: {
                red = green = blue = this.clampColorSample(pixelSamples[0], sampleProperties[0].bitsPerSample)
                break
              }
              // RGB Full Color
              case 2: {
                red = this.clampColorSample(pixelSamples[0], sampleProperties[0].bitsPerSample)
                green = this.clampColorSample(pixelSamples[1], sampleProperties[1].bitsPerSample)
                blue = this.clampColorSample(pixelSamples[2], sampleProperties[2].bitsPerSample)
                break
              }
              // RGB Color Palette
              case 3: {
                if (colorMapValues === undefined) {
                  throw Error('Palette image missing color map')
                }

                const colorMapIndex = pixelSamples[0]

                red = this.clampColorSample(colorMapValues[colorMapIndex], 16)
                green = this.clampColorSample(colorMapValues[colorMapSampleSize + colorMapIndex], 16)
                blue = this.clampColorSample(colorMapValues[2 * colorMapSampleSize + colorMapIndex], 16)
                break
              }
              // Unknown Photometric Interpretation
              default:
                throw RangeError('Unknown Photometric Interpretation:', photometricInterpretation)
                break
            }

            ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`
            ctx.fillRect(x, yPadding + y, 1, 1)
          }
        }

        numRowsInPreviousStrip = numRowsInStrip
      }
    }

    return this.canvas
  },

  // See: http://www.digitizationguidelines.gov/guidelines/TIFF_Metadata_Final.pdf
  // See: http://www.digitalpreservation.gov/formats/content/tiff_tags.shtml
  fieldTagNames: {
    // TIFF Baseline
    0x013b: 'Artist',
    0x0102: 'BitsPerSample',
    0x0109: 'CellLength',
    0x0108: 'CellWidth',
    0x0140: 'ColorMap',
    0x0103: 'Compression',
    0x8298: 'Copyright',
    0x0132: 'DateTime',
    0x0152: 'ExtraSamples',
    0x010a: 'FillOrder',
    0x0121: 'FreeByteCounts',
    0x0120: 'FreeOffsets',
    0x0123: 'GrayResponseCurve',
    0x0122: 'GrayResponseUnit',
    0x013c: 'HostComputer',
    0x010e: 'ImageDescription',
    0x0101: 'ImageLength',
    0x0100: 'ImageWidth',
    0x010f: 'Make',
    0x0119: 'MaxSampleValue',
    0x0118: 'MinSampleValue',
    0x0110: 'Model',
    0x00fe: 'NewSubfileType',
    0x0112: 'Orientation',
    0x0106: 'PhotometricInterpretation',
    0x011c: 'PlanarConfiguration',
    0x0128: 'ResolutionUnit',
    0x0116: 'RowsPerStrip',
    0x0115: 'SamplesPerPixel',
    0x0131: 'Software',
    0x0117: 'StripByteCounts',
    0x0111: 'StripOffsets',
    0x00ff: 'SubfileType',
    0x0107: 'Threshholding',
    0x011a: 'XResolution',
    0x011b: 'YResolution',

    // TIFF Extended
    0x0146: 'BadFaxLines',
    0x0147: 'CleanFaxData',
    0x0157: 'ClipPath',
    0x0148: 'ConsecutiveBadFaxLines',
    0x01b1: 'Decode',
    0x01b2: 'DefaultImageColor',
    0x010d: 'DocumentName',
    0x0150: 'DotRange',
    0x0141: 'HalftoneHints',
    0x015a: 'Indexed',
    0x015b: 'JPEGTables',
    0x011d: 'PageName',
    0x0129: 'PageNumber',
    0x013d: 'Predictor',
    0x013f: 'PrimaryChromaticities',
    0x0214: 'ReferenceBlackWhite',
    0x0153: 'SampleFormat',
    0x022f: 'StripRowCounts',
    0x014a: 'SubIFDs',
    0x0124: 'T4Options',
    0x0125: 'T6Options',
    0x0145: 'TileByteCounts',
    0x0143: 'TileLength',
    0x0144: 'TileOffsets',
    0x0142: 'TileWidth',
    0x012d: 'TransferFunction',
    0x013e: 'WhitePoint',
    0x0158: 'XClipPathUnits',
    0x011e: 'XPosition',
    0x0211: 'YCbCrCoefficients',
    0x0213: 'YCbCrPositioning',
    0x0212: 'YCbCrSubSampling',
    0x0159: 'YClipPathUnits',
    0x011f: 'YPosition',

    // EXIF
    0x9202: 'ApertureValue',
    0xa001: 'ColorSpace',
    0x9004: 'DateTimeDigitized',
    0x9003: 'DateTimeOriginal',
    0x8769: 'Exif IFD',
    0x9000: 'ExifVersion',
    0x829a: 'ExposureTime',
    0xa300: 'FileSource',
    0x9209: 'Flash',
    0xa000: 'FlashpixVersion',
    0x829d: 'FNumber',
    0xa420: 'ImageUniqueID',
    0x9208: 'LightSource',
    0x927c: 'MakerNote',
    0x9201: 'ShutterSpeedValue',
    0x9286: 'UserComment',

    // IPTC
    0x83bb: 'IPTC',

    // ICC
    0x8773: 'ICC Profile',

    // XMP
    0x02bc: 'XMP',

    // GDAL
    0xa480: 'GDAL_METADATA',
    0xa481: 'GDAL_NODATA',

    // Photoshop
    0x8649: 'Photoshop',
  },

  fieldTypeNames: {
    0x0001: 'BYTE',
    0x0002: 'ASCII',
    0x0003: 'SHORT',
    0x0004: 'LONG',
    0x0005: 'RATIONAL',
    0x0006: 'SBYTE',
    0x0007: 'UNDEFINED',
    0x0008: 'SSHORT',
    0x0009: 'SLONG',
    0x000a: 'SRATIONAL',
    0x000b: 'FLOAT',
    0x000c: 'DOUBLE',
  },
}
