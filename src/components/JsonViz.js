import {div, el, span} from "../utils/react";
import {isBoolean, isNumber, isSome, isString, safeGet} from "../utils/tools";
import {stylers} from "./stylers";
import {m} from "../utils/tools";
import {Scrollbars} from "react-custom-scrollbars";


const comma = (k) => div({key: "comma" + (k || ""), style: stylers.jsonViz.comma()}, ",");

const colon = (k) => div({key: "colon" + (k || ""), style: stylers.jsonViz.colon()}, ":");

const spread = (k) => div({key: "spread" + (k || ""), style: stylers.jsonViz.spread()}, "...");

const leftBracket = (k) => div({key: "lBracket" + (k || ""), style: stylers.jsonViz.bracket()}, "{");

const rightBracket = (k) => div({key: "rBracket" + (k || ""), style: stylers.jsonViz.bracket()}, "}");

const leftSqBracket = (k) => div({key: "lBracket" + (k || ""), style: stylers.jsonViz.bracket()}, "[");

const rightSqBracket = (k) => div({key: "rBracket" + (k || ""), style: stylers.jsonViz.bracket()}, "]");


const commaSeparated = (items) => m.count(items) > 1
  ? m.intoArray(m.rest(m.interleave(m.map(comma, m.iterate(m.inc, 0)), items)))
  : m.intoArray(items);


const KVPair = ({k, children}) => isSome(k)
  ? div({style: stylers.jsonViz.kvPair()}, [span({key: "key", style: stylers.jsonViz.key()}, k), colon(), children])
  : children;


const DigestCollNode = ({level, item, hideKey, expanded, ...restProps, treeData}) => {
  const content = div({style: stylers.jsonViz.item()}, [
    item.count > 1 ? span({key: "counter", style: stylers.jsonViz.counter.outer()}, span({style: stylers.jsonViz.counter.inner()}, item.count)) : null,
    item.isHash ? leftBracket() : leftSqBracket(),
    item.count === 0 ? null
      : (level > 2 || expanded) ? spread()
      : [...commaSeparated(m.map(
          id => el(DigestNode, {key: id, id, item: safeGet(treeData.nodes, id), hideKey: !item.isHash, ...restProps}),
          m.take(3, item.value))),
        item.count > 3 ? [comma("last"), spread()] : null],
    item.isHash ? rightBracket() : rightSqBracket()
  ]);
  return hideKey ? content : el(KVPair, {k: item.key}, content);
}


const DigestAtomicNode = ({item, hideKey}) => {
  const v = item.value;
  const content =
    isString(v) ? span({style: {...stylers.jsonViz.types.string(), whiteSpace: "pre"}}, (isString(v) && v.length > 10) ? `"${v.substr(0, 10)}..."` : `"${v}"`)
      : isNumber(v) ? span({style: stylers.jsonViz.types.number()}, v)
      : isBoolean(v) ? span({style: stylers.jsonViz.types.boolean()}, v ? "true" : "false")
      : span({style: stylers.jsonViz.types.null()}, "null");
  return hideKey ? content : el(KVPair, {k: item.key}, content);
}


const DigestNode = ({...props, item}) => el(item.isAtomic ? DigestAtomicNode : DigestCollNode, props);


const TextBox = ({text}) =>
  el(Scrollbars, {style: stylers.jsonViz.textBlock(), autoHeight: true},
    div({style: stylers.jsonViz.types.string()}, text));


const AtomicNode = ({item}) => {
  const v = item.value;
  const content =
    isString(v) ? (v.length > 80 ? el(TextBox, {text: `"${v}"`}) : span({style: stylers.jsonViz.types.string()}, `"${v}"`))
      : isNumber(v) ? span({style: stylers.jsonViz.types.number()}, v)
      : isBoolean(v) ? span({style: stylers.jsonViz.types.boolean()}, v ? "true" : "false")
      : span({style: stylers.jsonViz.types.null()}, "null");
  return el(KVPair, {k: item.key}, content);
};


export const JsonVizNode = ({...props, item}) => el(item.isAtomic ? AtomicNode : DigestCollNode, props);
