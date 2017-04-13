import React, { Component } from 'react'
import PropTypes from 'prop-types'

const style = {
  width: '100%',
  height: '100%',
}

const DIRECTION_UP     = 'up'
const DIRECTION_DOWN   = 'down'
const DIRECTION_LEFT   = 'left'
const DIRECTION_RIGHT  = 'right'

const ZOOM_IN   = 'zoom_in'
const ZOOM_OUT  = 'zoom_out'

const ROTATE_0    = 0
const ROTATE_90   = 90
const ROTATE_180  = 180
const ROTATE_270  = 270

const initState = {
  imageSrc: null,
  imageWidthInit: null,
  imageWidthCurrent: null,
  imageHeightInit: null,
  imageHeightCurrent: null,
  imagePositionTop: null,
  imagePositionLeft: null,
  imageRotate: ROTATE_0,
  isImageRotating: false,
  isMouseDown: false,
  cursorPosition: null,
}

class ReactThumbCropper extends Component {

  static propsTypes = {
    maxSize: PropTypes.number,
    minSize: PropTypes.number,
    moveStep: PropTypes.number,
    moveInterval: PropTypes.number,
    cropAreaWidth: PropTypes.number,
    cropAreaHeight: PropTypes.number,
    cropRadius: PropTypes.number,
    cropBackgroundColor: PropTypes.string,
    zoomStep: PropTypes.number,
    defaultUploadedImageHeight: PropTypes.number,
    setCroppedImage: PropTypes.func.isRequired,
    dropHolder: PropTypes.element.isRequired,
    holderNavUp: PropTypes.element,
    holderNavDown: PropTypes.element,
    holderNavLeft: PropTypes.element,
    holderNavRight: PropTypes.element,
    holderNavZoomIn: PropTypes.element,
    holderNavZoomOut: PropTypes.element,
    holderNavRotate: PropTypes.element,
    holderControlsReset: PropTypes.element,
    holderControlsCrop: PropTypes.element,
  }

  static defaultProps = {
    maxSize: 500000,
    minSize: 1000,
    moveStep: 2,
    moveInterval: 10,
    cropAreaWidth: 350,
    cropAreaHeight: 350,
    cropRadius: 128,
    cropBackgroundColor: 'rgba(256, 256, 256, 0.7)',
    zoomStep: 10,
    defaultUploadedImageHeight: 500,
    holderNavUp: <span>&#129029;</span>,
    holderNavDown: <span>&#129031;</span>,
    holderNavLeft: <span>&#129028;</span>,
    holderNavRight: <span>&#129030;</span>,
    holderNavZoomIn: <span>&#10133;</span>,
    holderNavZoomOut: <span>&#10134;</span>,
    holderNavRotate: <span>&#8635;</span>,
    holderControlsReset: <span>reset</span>,
    holderControlsCrop: <span>crop</span>,
  }

  constructor(props) {
    super(...arguments)
    this.state = initState
    this.image = null
    this.moveTimerId = null
    this._moveImage = this._moveImage.bind(this)
    this._moveImageStop = this._moveImageStop.bind(this)
    this._moveImageStart = this._moveImageStart.bind(this)
    this._getCenter = this._getCenter.bind(this)
    this._zoom = this._zoom.bind(this)
    this._uploadFile = this._uploadFile.bind(this)
  }

  handleOnDrop(event) {
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer.files.length) {
      const file = event.dataTransfer.files[0]
      this._uploadFile(file)
    }
  }

  handleFileSelect(event) {
    event.preventDefault()
    let file
    if (event.dataTransfer) {
      file = event.dataTransfer.files[0]
    } else {
      file = event.target.files[0]
    }
    this._uploadFile(file)
  }

  _uploadFile(file) {
    const fileReader = new FileReader()
    this.image = new Image()
    fileReader.readAsDataURL(file)
    fileReader.onloadend = () => {
      this.image.src = fileReader.result
      const positionState = this._getUploadedImagePosition(this.image.width, this.image.height)
      this.setState({
        imageSrc: this.image.src,
        ...positionState
      })
    }
  }

  handleOnDragOver(event) {
    event.preventDefault()
  }

  _getUploadedImagePosition = (imageWidth, imageHeight) => {
    const height = Math.min(imageHeight, this.props.defaultUploadedImageHeight)
    const width = Math.floor(height / imageHeight * imageWidth)

    return {
      imageWidthInit: imageWidth,
      imageWidthCurrent: width,
      imageHeightInit: imageHeight,
      imageHeightCurrent: height,
      imagePositionTop: Math.floor( (height - this.props.cropAreaHeight) / 2 ) * -1,
      imagePositionLeft: Math.floor( (width - this.props.cropAreaWidth) / 2 ) * -1,
    }
  }

  handleMoveUp() {
    this._moveImageStart(DIRECTION_UP)
  }

  handleMoveDown() {
    this._moveImageStart(DIRECTION_DOWN)
  }

  handleMoveLeft() {
    this._moveImageStart(DIRECTION_LEFT)
  }

  handleMoveRight() {
    this._moveImageStart(DIRECTION_RIGHT)
  }

  _moveImageStart(direction) {
    this.moveTimerId = setInterval(() => {
      this._moveImage(direction)
    }, this.props.moveInterval)
  }

  _moveImageStop() {
    if ( this.moveTimerId ) {
      clearTimeout(this.moveTimerId);
    }
  }

  _moveImage(direction) {
    const {
      imageWidthCurrent,
      imageHeightCurrent,
      imagePositionTop,
      imagePositionLeft,
    } = this.state
    const {
      moveStep,
      cropAreaHeight,
      cropAreaWidth
    } = this.props
    switch(direction) {
      case DIRECTION_UP:
        this.setState({
          imagePositionTop: Math.min(imagePositionTop + moveStep, 0)
        })
        break
      case DIRECTION_DOWN:
        this.setState({
          imagePositionTop: Math.max(imagePositionTop - moveStep, cropAreaHeight - imageHeightCurrent)
        })
        break
      case DIRECTION_LEFT:
        this.setState({
          imagePositionLeft: Math.min(imagePositionLeft + moveStep, 0)
        })
        break
      case DIRECTION_RIGHT:
        this.setState({
          imagePositionLeft: Math.max(cropAreaWidth - imageWidthCurrent, imagePositionLeft - moveStep)
        })
        break
      default:
        break
    }
  }

  _moveImageRelative(x, y) {
    const {
      imageWidthCurrent,
      imageHeightCurrent,
      imagePositionTop,
      imagePositionLeft,
      cursorPosition,
    } = this.state
    const {
      cropAreaHeight,
      cropAreaWidth,
    } = this.props
    const top = imagePositionTop + (y - cursorPosition.y)
    const left = imagePositionLeft + (x - cursorPosition.x)
    if (
      top > 0
      || left > 0
      || imageHeightCurrent - (top * -1 + cropAreaHeight) < 0
      || imageWidthCurrent - (left * -1 + cropAreaWidth) < 0
    ) {
      return
    }
    this.setState({
      imagePositionTop: top,
      imagePositionLeft: left,
    })
  }

  _getCenter() {
    const { imagePositionTop, imagePositionLeft } = this.state
    const { cropAreaHeight, cropAreaWidth } = this.props
    return {
      x: Math.floor(cropAreaWidth / 2 - imagePositionLeft),
      y: Math.floor(cropAreaHeight / 2 - imagePositionTop),
    }
  }

  _zoom(type) {
    const {
      zoomStep,
      cropAreaHeight,
      cropAreaWidth,
    } = this.props
    const {
      imageHeightInit,
      imageHeightCurrent,
      imageWidthInit,
      imageWidthCurrent,
      imagePositionTop,
      imagePositionLeft,
    } = this.state
    let heightNew
    switch(type) {
      case ZOOM_IN:
        heightNew = imageHeightCurrent + zoomStep
        break
      case ZOOM_OUT:
        heightNew = imageHeightCurrent - zoomStep
        break
      default:
        return
    }
    const widthNew = Math.floor(imageWidthInit / imageHeightInit * heightNew)
    if (
      heightNew > imageHeightInit
      || heightNew < cropAreaHeight
      || widthNew > imageWidthInit
      || widthNew < cropAreaWidth
    ) {
      return
    }
    let top = Math.min(imagePositionTop - ((heightNew - imageHeightCurrent) / 2), 0)
    if ( (heightNew - cropAreaHeight) * -1 > top ) {
      top = (heightNew - cropAreaHeight) * -1
    }
    let left = Math.min(imagePositionLeft - ((widthNew - imageWidthCurrent) / 2), 0)
    if ( (widthNew - cropAreaWidth) * -1 > left ) {
      left = (widthNew - cropAreaWidth) * -1
    }
    this.setState({
      imageHeightCurrent: heightNew,
      imageWidthCurrent: widthNew,
      imagePositionTop: top,
      imagePositionLeft: left,
    })
  }

  handleZoomIn() {
    this.moveTimerId = setInterval(() => {
      this._zoom(ZOOM_IN)
    }, this.props.moveInterval)
  }

  handleZoomOut() {
    this.moveTimerId = setInterval(() => {
      this._zoom(ZOOM_OUT)
    }, this.props.moveInterval)
  }

  rotate() {
    this.setState({
      isImageRotating: true
    })
    const {
      imageWidthInit,
      imageHeightInit,
      imageHeightCurrent,
      imageWidthCurrent,
      imagePositionTop,
      imagePositionLeft,
      imageRotate,
    } = this.state
    const canvas = document.createElement('canvas')
    canvas.width = imageHeightInit
    canvas.height = imageWidthInit
    const context = canvas.getContext('2d')
    context.save()
    let rotate
    switch (imageRotate) {
      default:
      case ROTATE_0:
        rotate = ROTATE_90
        context.rotate(rotate*Math.PI/180)
        context.drawImage(this.image, 0, -this.image.height)
        break
      case ROTATE_90:
        rotate = ROTATE_180
        context.rotate(rotate*Math.PI/180)
        context.drawImage(this.image, -this.image.width, -this.image.height)
        break
      case ROTATE_180:
        rotate = ROTATE_270
        context.rotate(rotate*Math.PI/180)
        context.drawImage(this.image, -this.image.width, 0)
        break
      case ROTATE_270:
        rotate = ROTATE_0
        context.rotate(rotate*Math.PI/180)
        context.drawImage(this.image, 0, 0)
        break
    }
    context.restore()
    this.setState({
      imageSrc: canvas.toDataURL(),
      imageWidthInit: imageHeightInit,
      imageHeightInit: imageWidthInit,
      imageWidthCurrent: imageHeightCurrent,
      imageHeightCurrent: imageWidthCurrent,
      imagePositionTop: imagePositionLeft,
      imagePositionLeft: imagePositionTop,
      imageRotate: rotate,
      isImageRotating: false,
    })
  }

  handleReset() {
    this.image = null
    this.setState({...initState})
  }

  handleCrop() {
    const {
      cropAreaWidth,
      cropAreaHeight,
      cropRadius,
    } = this.props
    const {
      imageSrc,
      imageHeightInit,
      imageHeightCurrent,
      imagePositionTop,
      imagePositionLeft,
    } = this.state
    const canvas = document.createElement('canvas')
    canvas.width = cropRadius * 2
    canvas.height = cropRadius * 2
    const context = canvas.getContext('2d')
    const image = new Image()
    image.onload = () => {
      const zoomKf = imageHeightInit / imageHeightCurrent
      const sx = Math.floor((imagePositionLeft * -1 + (cropAreaWidth / 2 - cropRadius)) * zoomKf)
      const sy = Math.floor((imagePositionTop * -1 + (cropAreaHeight / 2 - cropRadius)) * zoomKf)
      const sWidth = Math.floor(canvas.width * zoomKf)
      const sHeight = Math.floor(canvas.height * zoomKf)
      const dx = 0
      const dy = 0
      const dWidth = canvas.width
      const dHeight = canvas.height
      context.save();
      context.beginPath();
      context.arc(cropRadius, cropRadius, cropRadius, 0, Math.PI*2, true);
      context.closePath();
      context.clip();
      context.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
      this.props.setCroppedImage(canvas.toDataURL('image/png'))
    }
    image.src = imageSrc
  }

  handleOnWheel(event) {
    event.preventDefault()
    let zoomType = ZOOM_IN
    if (event.deltaY > 0) {
      zoomType = ZOOM_OUT
    }
    this._zoom(zoomType)
  }

  handleOnMouseDown(event) {
    if (!this.state.cursorPosition) {
      this.setState({
        cursorPosition: {
          x: event.pageX,
          y: event.pageY,
        }
      })
    }
  }

  handleOnMouseUp() {
    if (this.state.cursorPosition) {
      this.setState({
        cursorPosition: null
      })
    }
  }

  handleOnMouseLeave() {
    if (this.state.cursorPosition) {
      this.setState({
        cursorPosition: null
      })
    }
  }

  handleOnMouseMove(event) {
    if (this.state.cursorPosition) {
      this._moveImageRelative(event.pageX, event.pageY)
      this.setState({
        cursorPosition: {
          x: event.pageX,
          y: event.pageY,
        }
      })
    }
  }

  renderImageCropper() {
    return <div className="reactThumbCropper_cropper">
        <div
        style={{
          width: this.props.cropAreaWidth,
          height: this.props.cropAreaHeight,
          position: 'relative',
          overflow: 'hidden',
        }}
        onWheel={::this.handleOnWheel}
        onMouseMove={::this.handleOnMouseMove}
        onMouseLeave={::this.handleOnMouseLeave}
        onMouseDown={::this.handleOnMouseDown}
        onMouseUp={::this.handleOnMouseUp}
        className="reactThumbCropper_image"
      >
        <svg style={{
          position: 'absolute',
          top: 0,
          left: 0,
        }} width="350" height="350">
          <defs>
            <mask
              id="mask" x="0" y="0"
              width={this.props.cropAreaWidth}
              height={this.props.cropAreaHeight}
            >
              <rect
                x="0" y="0"
                width={this.props.cropAreaWidth}
                height={this.props.cropAreaHeight}
                fill="#fff"
              />
              <circle cx="175" cy="175" r="128" />
            </mask>
          </defs>
          <rect
            x="0" y="0"
            width={this.props.cropAreaWidth}
            height={this.props.cropAreaHeight}
            mask="url(#mask)"
            fill={this.props.cropBackgroundColor}
          />
        </svg>
        <img
          style={{
            position: 'absolute',
            top: this.state.imagePositionTop,
            left: this.state.imagePositionLeft,
            height: this.state.imageHeightCurrent,
            zIndex: -1,
          }}
          src={this.state.imageSrc} />
      </div>
      <div className="reactThumbCropper_navs">
        <button
          className="reactThumbCropper_up"
          onMouseDown={::this.handleMoveUp}
          onMouseUp={this._moveImageStop}
        >{this.props.holderNavUp}</button>
        <button
          className="reactThumbCropper_down"
          onMouseDown={::this.handleMoveDown}
          onMouseUp={this._moveImageStop}
        >{this.props.holderNavDown}</button>
        <button
          className="reactThumbCropper_left"
          onMouseDown={::this.handleMoveLeft}
          onMouseUp={this._moveImageStop}
        >{this.props.holderNavLeft}</button>
        <button
          className="reactThumbCropper_right"
          onMouseDown={::this.handleMoveRight}
          onMouseUp={this._moveImageStop}
        >{this.props.holderNavRight}</button>
        <button
          className="reactThumbCropper_zoomIn"
          onMouseDown={::this.handleZoomIn}
          onMouseUp={this._moveImageStop}
        >{this.props.holderNavZoomIn}</button>
        <button
          className="reactThumbCropper_zoomOut"
          onMouseDown={::this.handleZoomOut}
          onMouseUp={this._moveImageStop}
        >{this.props.holderNavZoomOut}</button>
        <button
          onClick={::this.rotate}
          disabled={this.state.isImageRotating}
        >{this.props.holderNavRotate}</button>
      </div>
      <div className="reactThumbCropper_controls">
        <button
          className="reactThumbCropper_reset"
          onClick={::this.handleReset}
        >{this.props.holderControlsReset}</button>
        <button
          className="reactThumbCropper_crop"
          onClick={::this.handleCrop}
        >{this.props.holderControlsCrop}</button>
      </div>
    </div>
  }

  renderImageUploader() {
    return <div
      style={style}
      className="reactThumbCropper_uploader"
      onDragOver={::this.handleOnDragOver}
      onDrop={::this.handleOnDrop}
    >
      <input
        style={{
          display: 'none',
        }}
        type="file"
        className="reactThumbCropper_inputFile"
        id="reactThumbCropper_inputFile"
        multiple={false}
        onChange={::this.handleFileSelect}
      />
      <label
        style={{cursor: 'pointer'}}
        htmlFor="reactThumbCropper_inputFile">
        {this.props.dropHolder}
      </label>
    </div>
  }

  render() {
    return <div className="reactThumbCropper">
      {!this.state.imageSrc && ::this.renderImageUploader()}
      {!!this.state.imageSrc && ::this.renderImageCropper()}
    </div>
  }
}

export default ReactThumbCropper
