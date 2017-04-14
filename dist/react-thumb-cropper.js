'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var style = {
  width: '100%',
  height: '100%'
};

var DIRECTION_UP = 'up';
var DIRECTION_DOWN = 'down';
var DIRECTION_LEFT = 'left';
var DIRECTION_RIGHT = 'right';

var ZOOM_IN = 'zoom_in';
var ZOOM_OUT = 'zoom_out';

var ROTATE_0 = 0;
var ROTATE_90 = 90;
var ROTATE_180 = 180;
var ROTATE_270 = 270;

var initState = {
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
  errorMsg: null
};

var ReactThumbCropper = function (_Component) {
  _inherits(ReactThumbCropper, _Component);

  function ReactThumbCropper(props) {
    _classCallCheck(this, ReactThumbCropper);

    var _this = _possibleConstructorReturn(this, (ReactThumbCropper.__proto__ || Object.getPrototypeOf(ReactThumbCropper)).apply(this, arguments));

    _this._getUploadedImagePosition = function (imageWidth, imageHeight) {
      var height = Math.min(imageHeight, _this.props.defaultUploadedImageHeight);
      var width = Math.floor(height / imageHeight * imageWidth);

      return {
        imageWidthInit: imageWidth,
        imageWidthCurrent: width,
        imageHeightInit: imageHeight,
        imageHeightCurrent: height,
        imagePositionTop: Math.floor((height - _this.props.cropAreaHeight) / 2) * -1,
        imagePositionLeft: Math.floor((width - _this.props.cropAreaWidth) / 2) * -1
      };
    };

    _this.state = initState;
    _this.image = null;
    _this.moveTimerId = null;
    _this._moveImage = _this._moveImage.bind(_this);
    _this._moveImageStop = _this._moveImageStop.bind(_this);
    _this._moveImageStart = _this._moveImageStart.bind(_this);
    _this._getCenter = _this._getCenter.bind(_this);
    _this._zoom = _this._zoom.bind(_this);
    _this._uploadFile = _this._uploadFile.bind(_this);
    return _this;
  }

  _createClass(ReactThumbCropper, [{
    key: 'handleOnDrop',
    value: function handleOnDrop(event) {
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer.files.length) {
        var file = event.dataTransfer.files[0];
        this._uploadFile(file);
      }
    }
  }, {
    key: 'handleFileSelect',
    value: function handleFileSelect(event) {
      event.preventDefault();
      var file = void 0;
      if (event.dataTransfer) {
        file = event.dataTransfer.files[0];
      } else {
        file = event.target.files[0];
      }
      this._uploadFile(file);
    }
  }, {
    key: '_uploadFile',
    value: function _uploadFile(file) {
      var _this2 = this;

      if (file.size > this.props.maxSize) {
        this.setState({
          errorMsg: this.props.errorImageMaxSize(file.size, this.props.maxSize)
        });
        return;
      }

      var fileReader = new FileReader();
      this.image = new Image();
      fileReader.readAsDataURL(file);
      fileReader.onloadend = function () {
        _this2.image.src = fileReader.result;
      };
      fileReader.onerror = function () {
        if (_this2.props.errorFileUpload) {
          _this2.setState({
            errorMsg: _this2.props.errorFileUpload()
          });
        }
      };
      this.image.onload = function () {
        var width = _this2.image.width;
        var height = _this2.image.height;
        if (width < _this2.props.cropAreaWidth || height < _this2.props.cropAreaHeight) {
          _this2.setState({
            errorMsg: _this2.props.errorImageWidthHeight(width, height, _this2.props.cropAreaHeight, _this2.props.cropAreaWidth)
          });
          return;
        }
        var positionState = _this2._getUploadedImagePosition(_this2.image.width, _this2.image.height);
        _this2.setState(_extends({
          imageSrc: _this2.image.src,
          errorMsg: null
        }, positionState));
      };
      this.image.onerror = function () {
        _this2.setState({
          errorMsg: _this2.props.errorFileUpload()
        });
      };
    }
  }, {
    key: 'handleOnDragOver',
    value: function handleOnDragOver(event) {
      event.preventDefault();
    }
  }, {
    key: 'handleMoveUp',
    value: function handleMoveUp(event) {
      event.stopPropagation();
      this._moveImageStart(DIRECTION_UP);
    }
  }, {
    key: 'handleMoveDown',
    value: function handleMoveDown(event) {
      event.stopPropagation();
      this._moveImageStart(DIRECTION_DOWN);
    }
  }, {
    key: 'handleMoveLeft',
    value: function handleMoveLeft(event) {
      event.stopPropagation();
      this._moveImageStart(DIRECTION_LEFT);
    }
  }, {
    key: 'handleMoveRight',
    value: function handleMoveRight(event) {
      event.stopPropagation();
      this._moveImageStart(DIRECTION_RIGHT);
    }
  }, {
    key: '_moveImageStart',
    value: function _moveImageStart(direction) {
      var _this3 = this;

      this.moveTimerId = setInterval(function () {
        _this3._moveImage(direction);
      }, this.props.moveInterval);
    }
  }, {
    key: '_moveImageStop',
    value: function _moveImageStop() {
      if (this.moveTimerId) {
        clearTimeout(this.moveTimerId);
      }
    }
  }, {
    key: '_moveImage',
    value: function _moveImage(direction) {
      var _state = this.state,
          imageWidthCurrent = _state.imageWidthCurrent,
          imageHeightCurrent = _state.imageHeightCurrent,
          imagePositionTop = _state.imagePositionTop,
          imagePositionLeft = _state.imagePositionLeft;
      var _props = this.props,
          moveStep = _props.moveStep,
          cropAreaHeight = _props.cropAreaHeight,
          cropAreaWidth = _props.cropAreaWidth;

      switch (direction) {
        case DIRECTION_UP:
          this.setState({
            imagePositionTop: Math.min(imagePositionTop + moveStep, 0)
          });
          break;
        case DIRECTION_DOWN:
          this.setState({
            imagePositionTop: Math.max(imagePositionTop - moveStep, cropAreaHeight - imageHeightCurrent)
          });
          break;
        case DIRECTION_LEFT:
          this.setState({
            imagePositionLeft: Math.min(imagePositionLeft + moveStep, 0)
          });
          break;
        case DIRECTION_RIGHT:
          this.setState({
            imagePositionLeft: Math.max(cropAreaWidth - imageWidthCurrent, imagePositionLeft - moveStep)
          });
          break;
        default:
          break;
      }
    }
  }, {
    key: '_moveImageRelative',
    value: function _moveImageRelative(x, y) {
      var _state2 = this.state,
          imageWidthCurrent = _state2.imageWidthCurrent,
          imageHeightCurrent = _state2.imageHeightCurrent,
          imagePositionTop = _state2.imagePositionTop,
          imagePositionLeft = _state2.imagePositionLeft,
          cursorPosition = _state2.cursorPosition;
      var _props2 = this.props,
          cropAreaHeight = _props2.cropAreaHeight,
          cropAreaWidth = _props2.cropAreaWidth;

      var top = imagePositionTop + (y - cursorPosition.y);
      var left = imagePositionLeft + (x - cursorPosition.x);
      if (top > 0 || left > 0 || imageHeightCurrent - (top * -1 + cropAreaHeight) < 0 || imageWidthCurrent - (left * -1 + cropAreaWidth) < 0) {
        return;
      }
      this.setState({
        imagePositionTop: top,
        imagePositionLeft: left
      });
    }
  }, {
    key: '_getCenter',
    value: function _getCenter() {
      var _state3 = this.state,
          imagePositionTop = _state3.imagePositionTop,
          imagePositionLeft = _state3.imagePositionLeft;
      var _props3 = this.props,
          cropAreaHeight = _props3.cropAreaHeight,
          cropAreaWidth = _props3.cropAreaWidth;

      return {
        x: Math.floor(cropAreaWidth / 2 - imagePositionLeft),
        y: Math.floor(cropAreaHeight / 2 - imagePositionTop)
      };
    }
  }, {
    key: '_zoom',
    value: function _zoom(type) {
      var _props4 = this.props,
          zoomStep = _props4.zoomStep,
          cropAreaHeight = _props4.cropAreaHeight,
          cropAreaWidth = _props4.cropAreaWidth;
      var _state4 = this.state,
          imageHeightInit = _state4.imageHeightInit,
          imageHeightCurrent = _state4.imageHeightCurrent,
          imageWidthInit = _state4.imageWidthInit,
          imageWidthCurrent = _state4.imageWidthCurrent,
          imagePositionTop = _state4.imagePositionTop,
          imagePositionLeft = _state4.imagePositionLeft;

      var heightNew = void 0;
      switch (type) {
        case ZOOM_IN:
          heightNew = imageHeightCurrent + zoomStep;
          break;
        case ZOOM_OUT:
          heightNew = imageHeightCurrent - zoomStep;
          break;
        default:
          return;
      }
      var widthNew = Math.floor(imageWidthInit / imageHeightInit * heightNew);
      if (heightNew > imageHeightInit || heightNew < cropAreaHeight || widthNew > imageWidthInit || widthNew < cropAreaWidth) {
        return;
      }
      var top = Math.min(imagePositionTop - (heightNew - imageHeightCurrent) / 2, 0);
      if ((heightNew - cropAreaHeight) * -1 > top) {
        top = (heightNew - cropAreaHeight) * -1;
      }
      var left = Math.min(imagePositionLeft - (widthNew - imageWidthCurrent) / 2, 0);
      if ((widthNew - cropAreaWidth) * -1 > left) {
        left = (widthNew - cropAreaWidth) * -1;
      }
      this.setState({
        imageHeightCurrent: heightNew,
        imageWidthCurrent: widthNew,
        imagePositionTop: top,
        imagePositionLeft: left
      });
    }
  }, {
    key: 'handleZoomIn',
    value: function handleZoomIn(event) {
      var _this4 = this;

      event.stopPropagation();
      this.moveTimerId = setInterval(function () {
        _this4._zoom(ZOOM_IN);
      }, this.props.moveInterval);
    }
  }, {
    key: 'handleZoomOut',
    value: function handleZoomOut(event) {
      var _this5 = this;

      event.stopPropagation();
      this.moveTimerId = setInterval(function () {
        _this5._zoom(ZOOM_OUT);
      }, this.props.moveInterval);
    }
  }, {
    key: 'rotate',
    value: function rotate(event) {
      event.stopPropagation();
      this.setState({
        isImageRotating: true
      });
      var _state5 = this.state,
          imageWidthInit = _state5.imageWidthInit,
          imageHeightInit = _state5.imageHeightInit,
          imageHeightCurrent = _state5.imageHeightCurrent,
          imageWidthCurrent = _state5.imageWidthCurrent,
          imagePositionTop = _state5.imagePositionTop,
          imagePositionLeft = _state5.imagePositionLeft,
          imageRotate = _state5.imageRotate;

      var canvas = document.createElement('canvas');
      canvas.width = imageHeightInit;
      canvas.height = imageWidthInit;
      var context = canvas.getContext('2d');
      context.save();
      var rotate = void 0;
      switch (imageRotate) {
        default:
        case ROTATE_0:
          rotate = ROTATE_90;
          context.rotate(rotate * Math.PI / 180);
          context.drawImage(this.image, 0, -this.image.height);
          break;
        case ROTATE_90:
          rotate = ROTATE_180;
          context.rotate(rotate * Math.PI / 180);
          context.drawImage(this.image, -this.image.width, -this.image.height);
          break;
        case ROTATE_180:
          rotate = ROTATE_270;
          context.rotate(rotate * Math.PI / 180);
          context.drawImage(this.image, -this.image.width, 0);
          break;
        case ROTATE_270:
          rotate = ROTATE_0;
          context.rotate(rotate * Math.PI / 180);
          context.drawImage(this.image, 0, 0);
          break;
      }
      context.restore();
      this.setState({
        imageSrc: canvas.toDataURL(),
        imageWidthInit: imageHeightInit,
        imageHeightInit: imageWidthInit,
        imageWidthCurrent: imageHeightCurrent,
        imageHeightCurrent: imageWidthCurrent,
        imagePositionTop: imagePositionLeft,
        imagePositionLeft: imagePositionTop,
        imageRotate: rotate,
        isImageRotating: false
      });
    }
  }, {
    key: 'handleReset',
    value: function handleReset() {
      this.image = null;
      this.setState(_extends({}, initState));
    }
  }, {
    key: 'handleCrop',
    value: function handleCrop() {
      var _this6 = this;

      var _props5 = this.props,
          cropAreaWidth = _props5.cropAreaWidth,
          cropAreaHeight = _props5.cropAreaHeight,
          cropRadius = _props5.cropRadius;
      var _state6 = this.state,
          imageSrc = _state6.imageSrc,
          imageHeightInit = _state6.imageHeightInit,
          imageHeightCurrent = _state6.imageHeightCurrent,
          imagePositionTop = _state6.imagePositionTop,
          imagePositionLeft = _state6.imagePositionLeft;

      var canvas = document.createElement('canvas');
      canvas.width = cropRadius * 2;
      canvas.height = cropRadius * 2;
      var context = canvas.getContext('2d');
      var image = new Image();
      image.onload = function () {
        var zoomKf = imageHeightInit / imageHeightCurrent;
        var sx = Math.floor((imagePositionLeft * -1 + (cropAreaWidth / 2 - cropRadius)) * zoomKf);
        var sy = Math.floor((imagePositionTop * -1 + (cropAreaHeight / 2 - cropRadius)) * zoomKf);
        var sWidth = Math.floor(canvas.width * zoomKf);
        var sHeight = Math.floor(canvas.height * zoomKf);
        var dx = 0;
        var dy = 0;
        var dWidth = canvas.width;
        var dHeight = canvas.height;
        context.save();
        context.beginPath();
        context.arc(cropRadius, cropRadius, cropRadius, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();
        context.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
        _this6.props.setCroppedImage(canvas.toDataURL('image/png'));
      };
      image.src = imageSrc;
    }
  }, {
    key: 'handleOnWheel',
    value: function handleOnWheel(event) {
      event.preventDefault();
      var zoomType = ZOOM_IN;
      if (event.deltaY > 0) {
        zoomType = ZOOM_OUT;
      }
      this._zoom(zoomType);
    }
  }, {
    key: 'handleOnMouseDown',
    value: function handleOnMouseDown(event) {
      if (!this.state.cursorPosition) {
        this.setState({
          cursorPosition: {
            x: event.pageX,
            y: event.pageY
          }
        });
      }
    }
  }, {
    key: 'handleOnMouseUp',
    value: function handleOnMouseUp() {
      if (this.state.cursorPosition) {
        this.setState({
          cursorPosition: null
        });
      }
    }
  }, {
    key: 'handleOnMouseLeave',
    value: function handleOnMouseLeave() {
      if (this.state.cursorPosition) {
        this.setState({
          cursorPosition: null
        });
      }
    }
  }, {
    key: 'handleOnMouseMove',
    value: function handleOnMouseMove(event) {
      if (this.state.cursorPosition) {
        this._moveImageRelative(event.pageX, event.pageY);
        this.setState({
          cursorPosition: {
            x: event.pageX,
            y: event.pageY
          }
        });
      }
    }
  }, {
    key: 'renderImageCropper',
    value: function renderImageCropper() {
      return _react2.default.createElement(
        'div',
        { className: 'reactThumbCropper_cropper' },
        _react2.default.createElement(
          'div',
          {
            style: {
              width: this.props.cropAreaWidth,
              height: this.props.cropAreaHeight,
              position: 'relative',
              overflow: 'hidden'
            },
            onWheel: this.handleOnWheel.bind(this),
            onMouseMove: this.handleOnMouseMove.bind(this),
            onMouseLeave: this.handleOnMouseLeave.bind(this),
            onMouseDown: this.handleOnMouseDown.bind(this),
            onMouseUp: this.handleOnMouseUp.bind(this),
            className: 'reactThumbCropper_image'
          },
          _react2.default.createElement(
            'svg',
            { style: {
                position: 'absolute',
                top: 0,
                left: 0
              }, width: '350', height: '350' },
            _react2.default.createElement(
              'defs',
              null,
              _react2.default.createElement(
                'mask',
                {
                  id: 'mask', x: '0', y: '0',
                  width: this.props.cropAreaWidth,
                  height: this.props.cropAreaHeight
                },
                _react2.default.createElement('rect', {
                  x: '0', y: '0',
                  width: this.props.cropAreaWidth,
                  height: this.props.cropAreaHeight,
                  fill: '#fff'
                }),
                _react2.default.createElement('circle', { cx: '175', cy: '175', r: '128' })
              )
            ),
            _react2.default.createElement('rect', {
              x: '0', y: '0',
              width: this.props.cropAreaWidth,
              height: this.props.cropAreaHeight,
              mask: 'url(#mask)',
              fill: this.props.cropBackgroundColor
            })
          ),
          _react2.default.createElement('img', {
            style: {
              position: 'absolute',
              top: this.state.imagePositionTop,
              left: this.state.imagePositionLeft,
              height: this.state.imageHeightCurrent,
              zIndex: -1
            },
            src: this.state.imageSrc })
        ),
        _react2.default.createElement(
          'div',
          { className: 'reactThumbCropper_navs' },
          _react2.default.createElement(
            'button',
            {
              className: 'reactThumbCropper_up',
              onMouseDown: this.handleMoveUp.bind(this),
              onMouseUp: this._moveImageStop
            },
            this.props.holderNavUp
          ),
          _react2.default.createElement(
            'button',
            {
              className: 'reactThumbCropper_down',
              onMouseDown: this.handleMoveDown.bind(this),
              onMouseUp: this._moveImageStop
            },
            this.props.holderNavDown
          ),
          _react2.default.createElement(
            'button',
            {
              className: 'reactThumbCropper_left',
              onMouseDown: this.handleMoveLeft.bind(this),
              onMouseUp: this._moveImageStop
            },
            this.props.holderNavLeft
          ),
          _react2.default.createElement(
            'button',
            {
              className: 'reactThumbCropper_right',
              onMouseDown: this.handleMoveRight.bind(this),
              onMouseUp: this._moveImageStop
            },
            this.props.holderNavRight
          ),
          _react2.default.createElement(
            'button',
            {
              className: 'reactThumbCropper_zoomIn',
              onMouseDown: this.handleZoomIn.bind(this),
              onMouseUp: this._moveImageStop
            },
            this.props.holderNavZoomIn
          ),
          _react2.default.createElement(
            'button',
            {
              className: 'reactThumbCropper_zoomOut',
              onMouseDown: this.handleZoomOut.bind(this),
              onMouseUp: this._moveImageStop
            },
            this.props.holderNavZoomOut
          ),
          _react2.default.createElement(
            'button',
            {
              onClick: this.rotate.bind(this),
              disabled: this.state.isImageRotating
            },
            this.props.holderNavRotate
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'reactThumbCropper_controls' },
          _react2.default.createElement(
            'button',
            {
              className: 'reactThumbCropper_reset',
              onClick: this.handleReset.bind(this)
            },
            this.props.holderControlsReset
          ),
          _react2.default.createElement(
            'button',
            {
              className: 'reactThumbCropper_crop',
              onClick: this.handleCrop.bind(this)
            },
            this.props.holderControlsCrop
          )
        )
      );
    }
  }, {
    key: 'renderImageUploader',
    value: function renderImageUploader() {
      return _react2.default.createElement(
        'div',
        {
          style: style,
          className: 'reactThumbCropper_uploader',
          onDragOver: this.handleOnDragOver.bind(this),
          onDrop: this.handleOnDrop.bind(this)
        },
        _react2.default.createElement('input', {
          style: {
            display: 'none'
          },
          type: 'file',
          className: 'reactThumbCropper_inputFile',
          id: 'reactThumbCropper_inputFile',
          multiple: false,
          onChange: this.handleFileSelect.bind(this)
        }),
        _react2.default.createElement(
          'label',
          {
            style: { cursor: 'pointer' },
            htmlFor: 'reactThumbCropper_inputFile' },
          this.props.dropHolder
        )
      );
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        {
          style: {
            userSelect: 'none'
          },
          className: 'reactThumbCropper'
        },
        !!this.state.errorMsg && _react2.default.createElement(
          'div',
          { className: 'reactThumbCropper_error' },
          this.state.errorMsg
        ),
        !this.state.imageSrc && this.renderImageUploader.call(this),
        !!this.state.imageSrc && this.renderImageCropper.call(this)
      );
    }
  }]);

  return ReactThumbCropper;
}(_react.Component);

ReactThumbCropper.propsTypes = {
  maxSize: _propTypes2.default.number,
  moveStep: _propTypes2.default.number,
  moveInterval: _propTypes2.default.number,
  cropAreaWidth: _propTypes2.default.number,
  cropAreaHeight: _propTypes2.default.number,
  cropRadius: _propTypes2.default.number,
  cropBackgroundColor: _propTypes2.default.string,
  zoomStep: _propTypes2.default.number,
  defaultUploadedImageHeight: _propTypes2.default.number,
  setCroppedImage: _propTypes2.default.func.isRequired,
  dropHolder: _propTypes2.default.element.isRequired,
  holderNavUp: _propTypes2.default.element,
  holderNavDown: _propTypes2.default.element,
  holderNavLeft: _propTypes2.default.element,
  holderNavRight: _propTypes2.default.element,
  holderNavZoomIn: _propTypes2.default.element,
  holderNavZoomOut: _propTypes2.default.element,
  holderNavRotate: _propTypes2.default.element,
  holderControlsReset: _propTypes2.default.element,
  holderControlsCrop: _propTypes2.default.element,
  errorImageMaxSize: _propTypes2.default.func.isRequired,
  errorImageWidthHeight: _propTypes2.default.func.isRequired,
  errorFileUpload: _propTypes2.default.func.isRequired
};
ReactThumbCropper.defaultProps = {
  maxSize: 500000,
  moveStep: 2,
  moveInterval: 10,
  cropAreaWidth: 350,
  cropAreaHeight: 350,
  cropRadius: 128,
  cropBackgroundColor: 'rgba(256, 256, 256, 0.7)',
  zoomStep: 10,
  defaultUploadedImageHeight: 500,
  holderNavUp: _react2.default.createElement(
    'span',
    null,
    '\uD83E\uDC05'
  ),
  holderNavDown: _react2.default.createElement(
    'span',
    null,
    '\uD83E\uDC07'
  ),
  holderNavLeft: _react2.default.createElement(
    'span',
    null,
    '\uD83E\uDC04'
  ),
  holderNavRight: _react2.default.createElement(
    'span',
    null,
    '\uD83E\uDC06'
  ),
  holderNavZoomIn: _react2.default.createElement(
    'span',
    null,
    '\u2795'
  ),
  holderNavZoomOut: _react2.default.createElement(
    'span',
    null,
    '\u2796'
  ),
  holderNavRotate: _react2.default.createElement(
    'span',
    null,
    '\u21BB'
  ),
  holderControlsReset: _react2.default.createElement(
    'span',
    null,
    'reset'
  ),
  holderControlsCrop: _react2.default.createElement(
    'span',
    null,
    'crop'
  )
};
exports.default = ReactThumbCropper;
