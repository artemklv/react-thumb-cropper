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
          dropHolder={<h1>Перетащите изображение</h1>}
          setCroppedImage={this.setThumbImage}
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
