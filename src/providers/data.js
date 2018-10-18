import {
  afilter, amap, constantly,
  count,
  isArray,
  isEmpty,
  isHash, isNull,
  isSequential,
  isSome, isString, join,
  M,
  m, memoize,
  reduceHash, second,
  V
} from "../utils/tools";
import clarinet from "clarinet";


export class JsonNode {
  constructor (id, key, value, isHash) {
    this.id = id;
    this.key = key;
    this.value = value;
    this.isAtomic = !isHash && !isSequential(value);
    this.isHash = isHash;
    this.count = this.isAtomic ? 1 : count(value);
  }
  static create(id, key, value, isHash) {return new JsonNode(id, key, value, isHash)}
}

export const buildTreeFromObject = (source) => {
  const processNode = (prev, nodeSource) => {
    const nodeIsHash = isHash(nodeSource);
    const nodeIsArray = !nodeIsHash && isArray(nodeSource);
    const nodeIsColl = nodeIsHash || nodeIsArray;
    const newId = prev.currentId;
    let updated = {...prev, currentId: newId + 1};
    updated =
      nodeIsHash
      ? reduceHash(
        (prev, key, value) => processNode({...prev, key}, value),
        {...updated, parent: newId, parentColl: V()},
        nodeSource)
      : nodeIsArray
      ? m.reduce(
        (prev, node) => ({...processNode(prev, node), key: prev.key + 1}),
        {...updated, parent: newId, parentColl: V(), key: 0},
        nodeSource)
      : updated;
    const jsonNode = JsonNode.create(newId, prev.key, nodeIsColl ? updated.parentColl : nodeSource, nodeIsHash);
    return {
      nodes: m.assoc(updated.nodes, newId, jsonNode),
      branches: nodeIsColl ? m.assoc(updated.branches, newId, updated.parentColl) : updated.branches,
      currentId: updated.currentId,
      parents: isSome(prev.parent) ? m.assoc(updated.parents, newId, prev.parent) : updated.parents,
      parent: prev.parent,
      parentColl: m.conj(prev.parentColl, newId)
    }
  }
  const {nodes, branches, parents} = processNode({nodes: M(), branches: M(), parents: M(), currentId: 0}, source);
  return {nodes, branches, parents};
}

const leftPad = memoize(c => join(amap(constantly(" "), m.range(c)), ""));

export const buildJsonFromTree = ({branches, nodes}, isIncluded, pretty) => {
  const eol = pretty ? "\r\n" : "";
  const comma_eol = pretty ? ",\r\n" : ", ";
  const renderIds = (ids, level, isHash) => {
    const indent = pretty ? leftPad(level * 2) : "";
    level += 1;
    const idsToRender = m.filter(isIncluded, ids);
    if (isEmpty(idsToRender))
      return null;
    const renderedItems = afilter(isSome, m.map(id => renderId(id, level, isHash), idsToRender));
    return isEmpty(renderedItems)
      ? null
      : isHash
        ? `{${eol}${join(renderedItems, comma_eol)}${eol}${indent}}`
        : `[${eol}${join(renderedItems, comma_eol)}${eol}${indent}]`;
  }
  const renderId = (id, level, showKey) => {
    if (!isIncluded(id)) return null;
    const indent = pretty ? leftPad(level * 2) : "";
    const {key, value, isHash, isAtomic} = m.get(nodes, id);
    const result = isAtomic ? (isString(value) ? `"${value}"` : value + "") : renderIds(value, level, isHash);
    return isSome(result) ? indent + (showKey ? `"${key}": ${result}` : result) : null;
  }
  return renderId(0, 0);
}

const readFallback = (source) => {
  const parser = clarinet.parser();

  let nodes = M();
  let branches = M();
  let parents = M();
  let currentId = 0;
  let parentId = null;
  let stack = V();
  let parentColl = null;
  let parentIsHash = null;
  let currentKey = null;

  let error = null;

  const openColl = collIsHash => {
    const collId = currentId++;
    stack = m.conj(stack, {collId, parentId, parentColl, parentIsHash, currentKey, collIsHash});
    parentId = collId;
    parentColl = V();
    parentIsHash = collIsHash;
    currentKey = 0;
  }

  const closeColl = () => {
    const prev = m.peek(stack);
    stack = m.pop(stack);
    const itemId = prev.collId;
    currentKey = prev.currentKey;
    const jsonNode = JsonNode.create(itemId, currentKey, parentColl, prev.collIsHash);
    nodes = m.assoc(nodes, itemId, jsonNode);
    branches = m.assoc(branches, itemId, parentColl);
    parentId = prev.parentId;
    parentColl = prev.parentColl;
    parentColl = isSome(parentColl) ? m.conj(parentColl, itemId) : parentColl;
    parentIsHash = prev.parentIsHash;
    if (!parentIsHash) currentKey++;
  }

  parser.onerror = function (e) {
    if (isSome(error)) return;
    while (!isEmpty(stack)) closeColl();
  };
  parser.onvalue = function (v) {
    if (isSome(error)) return;
    // got some value.  v is the value. can be string, double, bool, or null.
    const itemId = currentId++;
    const jsonNode = JsonNode.create(itemId, currentKey, v, false);
    nodes = m.assoc(nodes, itemId, jsonNode);
    parents = isSome(parentId) ? m.assoc(parents, itemId, parentId) : parents;
    parentColl = isSome(parentColl) ? m.conj(parentColl, itemId) : null;
    if (!parentIsHash) currentKey++;
  };
  parser.onopenobject = function (key) {
    if (isSome(error)) return;
    // opened an object. key is the first key.
    openColl(true);
    currentKey = key;
  };
  parser.onkey = function (key) {
    if (isSome(error)) return;
    // got a subsequent key in an object.
    currentKey = key;
  };
  parser.oncloseobject = function () {
    if (isSome(error)) return;
    // closed an object.
    closeColl();
  };
  parser.onopenarray = function () {
    if (isSome(error)) return;
    // opened an array.
    openColl(false);
  };
  parser.onclosearray = function () {
    if (isSome(error)) return;
    // closed an array.
    closeColl();
  };

  try {
    parser.write(source).close();
  } catch (e) {}
  return {nodes, branches, parents}
}

export const buildTreeFromStream = (source) => {
  if (!source)
    return [null, {message: "Source is empty"}];

  try {
    return [buildTreeFromObject(JSON.parse(source))];
  } catch (e) {
    const treeData = readFallback(source);
    const message = e.message;
    let error = null;
    if (message.indexOf("Unexpected end") >= 0)
      error = {message};
    else {
      const offset = parseInt(second(/at\sposition\s(\d+)/.exec(message)), 10);
      if (!isNaN(offset)) {
        const excerptStart = Math.max(0, offset - 20);
        const excerptEnd = Math.min(source.length, offset + 20);
        let excerpt = source.substring(excerptStart, excerptEnd);
        let excerptProblemOffset = offset - excerptStart;
        if (excerptStart > 0) {
          excerpt = "\u2026" + excerpt;
          excerptProblemOffset += 1;
        }
        if (excerptEnd < source.length)
          excerpt += "\u2026";
        error = {message, excerpt, excerptProblemOffset}
      } else
        error = {message};
    }
    return [treeData, error];
  }
}

export const readFile = (file) => new Promise((resolve, reject) => {
  if (isNull(file))
    reject();
  else {
    const reader = new FileReader();
    reader.onloadend = (evt) => reader.readyState === 2 ? resolve(reader.result) : reject(evt);
    reader.onerror = reject;
    reader.readAsText(file);
  }
});