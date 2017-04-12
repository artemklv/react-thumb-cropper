import React, { Component } from 'react';
import './Demo.css';

import ReactThumbCropper from '../../src/react-thumb-cropper';

/* global FileReader */

export default class Demo extends Component {

  render() {
    return (
      <div>
        <ReactThumbCropper
          dropHolder={<h1>Перетащите изображение</h1>}
        />
      </div>
    )
  }
}
