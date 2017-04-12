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

class ReactThumbCropper extends Component {

  static propsTypes = {
    maxSize: PropTypes.number,
    minSize: PropTypes.number,
    moveStep: PropTypes.number,
    moveInterval: PropTypes.number,
    cropAreaWidth: PropTypes.number,
    cropAreaHeight: PropTypes.number,
    zoomStep: PropTypes.number,
    defaultUploadedImageHeight: PropTypes.number,
    dropHolder: PropTypes.element.isRequired
  }

  static defaultProps = {
    maxSize: 500000,
    minSize: 1000,
    moveStep: 2,
    moveInterval: 10,
    cropAreaWidth: 350,
    cropAreaHeight: 350,
    zoomStep: 10,
    defaultUploadedImageHeight: 500,
  }

  constructor(props) {
    super(...arguments)
    this.state = {
      imageSrc: null,
      imageWidthInit: null,
      imageWidthCurrent: null,
      imageHeightInit: null,
      imageHeightCurrent: null,
      imagePositionTop: null,
      imagePositionLeft: null,
    }
    this.moveTimerId = null
    this._moveImage = this._moveImage.bind(this)
    this._moveImageStop = this._moveImageStop.bind(this)
    this._moveImageStart = this._moveImageStart.bind(this)
    this._getCenter = this._getCenter.bind(this)
    this._zoom = this._zoom.bind(this)
  }

  handleOnDrop(event) {
    event.preventDefault()
    event.stopPropagation()
    if (event.dataTransfer.files.length) {
      const file = event.dataTransfer.files[0]
      const fileReader = new FileReader()
      const image = new Image()
      fileReader.readAsDataURL(file)
      fileReader.onloadend = () => {
        image.src = fileReader.result
        const positionState = this._getUploadedImagePosition(image.width, image.height)
        this.setState({
          imageSrc: fileReader.result,
          ...positionState
        })
      }
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

  renderImageUploader() {
    return <div
      style={style}
      className="reactThumbCropper_uploader"
      onDragOver={::this.handleOnDragOver}
      onDrop={::this.handleOnDrop}
    >
      {this.props.dropHolder}
    </div>
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
    } = {...this.state}
    const { moveStep, cropAreaHeight, cropAreaWidth } = this.props
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
    if (heightNew > imageHeightInit || heightNew < cropAreaHeight) {
      return
    }
    const widthNew = Math.floor(imageWidthInit / imageHeightInit * heightNew)
    this.setState({
      imageHeightCurrent: heightNew,
      imageWidthCurrent: widthNew,
      imagePositionTop: imagePositionTop - ((heightNew - imageHeightCurrent) / 2),
      imagePositionLeft: imagePositionLeft - ((widthNew - imageWidthCurrent) / 2),
    })
  }

  handleZoomIn() {
    this._zoom(ZOOM_IN)
    // this.moveTimerId = setInterval(() => {
    //   this._zoom(ZOOM_IN)
    // }, this.props.moveInterval)
  }

  handleZoomOut() {
    this._zoom(ZOOM_OUT)
    // this.moveTimerId = setInterval(() => {
    //   this._zoom(ZOOM_OUT)
    // }, this.props.moveInterval)
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
        className="reactThumbCropper_image"
      >
        <img
          style={{
            position: 'absolute',
            top: this.state.imagePositionTop,
            left: this.state.imagePositionLeft,
            height: this.state.imageHeightCurrent,
          }}
          src={this.state.imageSrc} />
      </div>
      <div className="reactThumbCropper_controls">
        <button
          className="reactThumbCropper_up"
          onMouseDown={::this.handleMoveUp}
          onMouseUp={this._moveImageStop}
        >Верх</button>
        <button
          className="reactThumbCropper_down"
          onMouseDown={::this.handleMoveDown}
          onMouseUp={this._moveImageStop}
        >Вниз</button>
        <button
          className="reactThumbCropper_left"
          onMouseDown={::this.handleMoveLeft}
          onMouseUp={this._moveImageStop}
        >Влево</button>
        <button
          className="reactThumbCropper_right"
          onMouseDown={::this.handleMoveRight}
          onMouseUp={this._moveImageStop}
        >Вправо</button>
        <button
          onClick={::this.handleZoomIn}
          className="reactThumbCropper_zoomIn"
        >Увеличить</button>
        <button
          onClick={::this.handleZoomOut}
          className="reactThumbCropper_zoomOut"
        >Уменьшить</button>
        <button

        >Повернуть</button>
      </div>
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
