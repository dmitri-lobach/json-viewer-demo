import {stylers} from "./stylers";
import {Component} from "react";
import {div, el} from "../utils/react";
import Dropzone from 'react-dropzone'
import {call} from "../utils/tools";

export class WithDropzone extends Component {
  constructor(props) {
    super(props);
    this.state = {active: false}
  }

  onDragEnter = () => this.setState({active: true});

  onDragLeave = () => this.setState({active: false});

  onDrop = (files) => {
    this.setState({active: false});
    call(this.props.onDrop, files);
  }

  render() {
    const { active } = this.state;

    return el(Dropzone,
      {...this.props, onDrop: this.onDrop, style: {position: "absolute", width: "100%", height: "100%"},
        disableClick: true, onDragEnter: this.onDragEnter, onDragLeave: this.onDragLeave},
      [active && div({key: "dropzone", style: stylers.dropOverlay()}, "Drop file..."), this.props.children]);
  }
}
