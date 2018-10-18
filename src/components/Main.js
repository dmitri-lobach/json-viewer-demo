import {Component} from "react";
import {div, el} from "../utils/react";
import {stylers} from "./stylers";
import {WithDropzone} from "./WithDropzone";
import {Scrollbars} from "react-custom-scrollbars";
import {constantly, first, isNull, isSome, isTrue, m, S, uuid} from "../utils/tools";
import {ErrorDisplay} from "./ErrorDisplay";
import {Tree} from "./Tree";
import {JsonVizNode} from "./JsonViz";
import {buildJsonFromTree, buildTreeFromStream, readFile} from "../providers/data";

const constantlyFalse = constantly(false);
const constantlyTrue = constantly(true);

export class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {includePred: constantlyFalse, treeKey: uuid()}
  }

  onDrop = (files) => readFile(first(files))
    .then(source => {
      const [treeData, error] = buildTreeFromStream(source);
      this.setState({treeData, error, includePred: constantlyFalse, json: null, treeKey: uuid()});
    });

  onSelection = (treeSelection) => {
    let includePred = null;
    const rootSelected = m.get(treeSelection, 0);
    if (isTrue(rootSelected))
      includePred = constantlyTrue;
    else if (!rootSelected)
      includePred = constantlyFalse;
    else {
      const selectedIds = m.reduce((prev, id) => m.get(treeSelection, id) ? m.conj(prev, id) : prev, S(), m.keys(treeSelection));
      includePred = id => m.hasKey(selectedIds, id);
    }
    this.setState({includePred}, this.updateExportJson);
  }

  updateExportJson = () => {
    const {treeData, includePred} = this.state;
    const json = buildJsonFromTree(treeData, includePred, true);
    this.setState({json});
  }

  render() {
    const {treeKey, treeData, error, json} = this.state;
    return (
      el(WithDropzone, {onDrop: this.onDrop},
        div({style: stylers.main.root()},
          isNull(treeData)
            ? div({key: "message", style: stylers.noContent()}, "Ready for JSON...")
            : [div({key: "tree-panel", style: stylers.main.treePanel()}, [
                el(Scrollbars, {style: stylers.tree.scrollWrapper()},
                  el(Tree, {key: treeKey, expandRoot: true, treeData, onSelection: this.onSelection}, JsonVizNode)),
                isSome(error) ? el(ErrorDisplay, {error}) : null]),
                div({key: "json-panel", style: stylers.main.jsonPanel()},
                  el(Scrollbars, {},
                    div({key: "json-export", style: stylers.jsonExport()}, json)))])))
  }
}