import {div, el} from "../utils/react";
import {Tree} from "../components/Tree";
import {buildTreeFromStream} from "../providers/data";
import {JsonVizNode} from "../components/JsonViz";
import {amap, constantly, identity, isSome, join, log, m, tracer} from "../utils/tools";
import {Scrollbars} from "react-custom-scrollbars";
import {stylers} from "../components/stylers";
import flex from "../utils/flex";
import {ErrorDisplay} from "../components/ErrorDisplay";

const styler = () => ({width: 800, height: 800, ...flex.column(flex.align.start, flex.align.stretch)});

const testJson1 = {
  a: 1, b: [2, 3, 4, "5", {abc: 100500, def: "100500", g: false, h: "WTF?"}], c: true, d: null,
  e: {
    abc: join(amap(constantly("Каждый охотник желает знать, где сидит Тарзан."), m.range(10)), " "),
    def: join(amap(constantly("Bla-bla"), m.range(100)), " "),
    wtf: "Каждый охотник желает знать, где сидит Тарзан.",
    g: 100500
  },
  f: amap(identity, m.range(101)),
  g: [[[1]]],
  h: [{}]
};

export const testJsonStr1 = JSON.stringify(testJson1);

const [treeData, error] = buildTreeFromStream(testJsonStr1.substr(0, 40));


export const TreeTest = () =>
  div({style: styler()}, [
    el(Scrollbars, {style: stylers.tree.scrollWrapper()},
      el(Tree, {expandRoot: true, treeData}, JsonVizNode)),
    isSome(error) ? el(ErrorDisplay, {error}) : null]);
