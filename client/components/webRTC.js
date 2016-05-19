import React from 'react';

export default class WebRTC extends React.Component {
  // constructor(props) {
  //   super(props);
  // }
  render() {
    const style = {
      width: 150,
      height: 350,
      float: 'left',
    }
    return (
      <ul >
        <li><video id="localVideo"></video></li>
        <div id="remotes"></div>
      </ul>
    );
  }
}
