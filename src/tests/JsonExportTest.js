import {amap, constantly, identity, join, m} from "../utils/tools";
import {buildJsonFromTree, buildTreeFromObject} from "../providers/data";
import {div, el} from "../utils/react";
import {JsonExport} from "../components/JsonExport";

const styler = () => ({width: 800, height: 800});

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

const testTree1 = buildTreeFromObject(testJson1);

const outJson1 = buildJsonFromTree(testTree1, constantly(true), true);

export const JsonExportTest = () =>
  div({style: styler()},
    el(JsonExport, {json: outJson1}));

