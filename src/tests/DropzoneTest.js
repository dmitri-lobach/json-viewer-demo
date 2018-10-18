import {div, el} from "../utils/react";
import {WithDropzone} from "../components/WithDropzone";
import {stylers} from "../components/stylers";
import {first, tracer} from "../utils/tools";
import {readFile} from "../providers/data";

const styler = () => ({width: 800, height: 800});

const onDrop = files => {
  const file = first(files);
  readFile(file).then(tracer(">>>>>>>"));
}


export const DropzoneTest = () =>
  div({style: styler()},
    el(WithDropzone, {onDrop, multiple: false, disablePreview: true},
      div({style: stylers.noContent()}, "Ready for JSON...")));
