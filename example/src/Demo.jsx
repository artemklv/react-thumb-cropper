import React, { Component } from 'react';
import './Demo.css';

import ReactThumbCropper from '../../src/react-thumb-cropper';

/* global FileReader */

export default class Demo extends Component {

  constructor() {
    super(...arguments)
    this.state = {
      thumbSrc:  null
    }
    this.setThumbImage = this.setThumbImage.bind(this)
  }

  setThumbImage(src) {
    this.setState({
      thumbSrc: src
    })
  }

  render() {
    return (
      <div>
        <ReactThumbCropper
          maxSize={5000000}
          dropHolder={<h1>Перетащите изображение</h1>}
          setCroppedImage={this.setThumbImage}
          errorImageWidthHeight={function(w, h, dw, dh) {
            return <span>
              Загружаемое изображение не должно быть менее {dw} на {dh} пик. <br/>
              Ваша изображение составляет {w} на {h} пик.
            </span>
          }}
          errorFileUpload={function () {
            return <span>Ошибка загрузки изображения</span>
          }}
          errorImageMaxSize={function (s, ds) {
            return <span>Размер изображения превышает 5 мб.</span>
          }}
        />
        <div style={{
          width: '256px',
          height: '256px',
          position: 'absolute',
          margin: '0 auto',
        }}>
          {!!this.state.thumbSrc && <img src={this.state.thumbSrc} alt=""/>}
        </div>
      </div>
    )
  }
}
