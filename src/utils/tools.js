import * as _  from 'lodash';
import mori from 'mori';

export const m = mori;

// eslint-disable-next-line
export const isNull = v => v == null;

export const isUndefined = v => v === undefined;

// eslint-disable-next-line
export const isSome = v => v != null;

export const isFunc = v => typeof v === "function";

export const isArray = Array.isArray;

export const isString = v => typeof v === "string";

export const isNumber = v => typeof v === "number";

export const isBoolean = v => typeof v === "boolean";

export const isHash = _.isPlainObject;

export const mapValues = _.mapValues;

export const forOwn = _.forOwn;

export const memoize = _.memoize;

export const trim = _.trim;

export const flatMap = _.flatMap;

export const split = (str, separator) => isString(str) && isString(separator) ? str.split(separator) : null;

export const join = (coll, separator) => isArray(coll) ? coll.join(separator) : isSeqable(coll) ? m.intoArray(coll).join(separator) : "";

export const isSubstr = (str, sub) => isString(str) && isString(sub) && str.indexOf(sub) >= 0;

// eslint-disable-next-line
export const isSeqable = v => isArray(v) || m.isCollection(v) && m.isSeqable(v);

// eslint-disable-next-line
export const isSequential = v => isArray(v) || m.isCollection(v) && m.isSequential(v);

export const throwError = (errorMsg, problemCause) => {
  isSome(problemCause) && tracer("This caused the problem")(problemCause);
  throw new Error(errorMsg)};

export const throwOnUnexpected = expected => item => throwError(`Expected: ${expected}`, item);

export const ensureNotNull = (v, errorMsg) => !isNull(v) ? v : throwError(errorMsg);

export const isStrictlyEqual = (a, b) => a === b;

export const isEqual = (a, b) => a === b ? true : m.isCollection(a) ? m.equals(a, b) : _.isEqual(a, b);

export const isEmpty = coll => m.isCollection(coll) ? m.isEmpty(coll) : _.isEmpty(coll);

export const count = coll => m.isCollection(coll) ? m.count(coll) : _.size(coll);

export const isPos = v => v > 0;

export const isNeg = v => v < 0;

export const isZero = v => v === 0;

export const isTrue = v => v === true;

export const isFalse = v => v === false;

export const isFalsey = v => isNull(v) || isFalse(v);

export const isTruthy = v => !isFalsey(v);

export const toArray = v =>
  isArray(v) ? v
    : isHash(v) ? _.toPairs(v)
      : m.isCollection(v) ? (m.isMap(v) ? m.intoArray(m.map(pair => [m.nth(pair,0), m.nth(pair,1)], v)) : m.intoArray(v))
        : isNull(v) ? v
          : throwError("Can't convert to array", v);

export const toString = _.toString;

export const comp = m.comp;

export const identity = m.identity;

export const constantly = m.constantly;

export const not = x => !x;

export const complement = func => (...args) => !apply(func, args);

export const PP = m.pipeline;

export const P = m.partial;

export const V = m.vector;

export const M = m.hashMap;

export const S = (...args) => m.set(args);

export const L = m.list;

export const Q = m.queue;

export const first = coll => isArray(coll) ? coll[0] : m.isCollection(coll) ? m.first(coll) : null;

export const second = coll => isArray(coll) ? coll[1] : m.isCollection(coll) ? m.first(m.drop(1,coll)) : null;

export const rest = coll => isArray(coll) ? coll.slice(1) : m.isCollection(coll) ? m.rest(coll) : null;

export const nth = (coll, idx, notFound) => {
  if (isNull(idx) || isNull(coll))
    return isSome(notFound) ? notFound : null;
  if (isArray(coll)) {
    const v = coll[idx];
    return v === undefined ? notFound : v;
  }
  return m.isCollection(coll) ? m.nth(coll, idx, notFound) : null;
}

export const get = (coll, key, notFound) => {
  if (isNull(key) || isNull(coll))
    return isSome(notFound) ? notFound : null;
  if (isFunc(key)) {
    const v = key(coll);
    return v === undefined ? notFound : v;
  }
  if (isHash(coll) || isArray(coll)) {
    const v = coll[key];
    return v === undefined ? notFound : v;
  }
  return m.isCollection(coll) ? m.get(coll, key, notFound) : null;
}

export const safeGet = (coll, path) =>
  isNull(path) ? null
  : isSeqable(path) ? m.reduce((result, k) => isSome(result) ? get(result, k) : null, coll, path)
    : get(coll, path);

export const last = coll =>
  isArray(coll) ? (coll.length ? coll[coll.length-1] : null)
    : m.isCollection(coll) ? m.last(coll)
    : null;

export const butLast = coll =>
  isArray(coll) ? (coll.length ? coll.slice(0, coll.length-1) : null)
    : m.isCollection(coll) && !m.isEmpty(coll) ? m.take(m.count(coll)-1, coll)
    : null;

export const indexOf = (coll, item, fromIndex) => {
  if (isArray(coll)) {
    const idx = coll.indexOf(item, fromIndex);
    return idx<0 ? null : idx;
  } else
    return  m.isCollection(coll)
      ? first(first(m.dropWhile(complement(second), m.map(V, m.iterate(m.inc, 0), m.map(v => v === item, coll)))))
      : null;
}

export const findByValue = (valueOrPred, coll) => {
  if (isNull(coll))
    return null;
  const pred = flow(second, isFunc(valueOrPred) ? valueOrPred : item => item === valueOrPred);
  coll = isSeqable(coll) ? m.map(V, m.iterate(m.inc, 0), coll) : isHash(coll) ? intoPairs(coll) : coll;
  return JS(first(m.dropWhile(complement(pred), coll)));
}

export const clone = coll =>
  isNull(coll) ? coll
    : coll.clone ? coll.clone()
    : isArray(coll) ? coll.slice(0)
    : {...coll};

export const omit = (keys, coll) => {
  // eslint-disable-next-line
  const reducer = coll =>
    isNull(coll) ? null
    // eslint-disable-next-line
      : m.isCollection(coll) ? m.reduce((a, key) => m.assoc(a, key, m.get(coll, key)), M(), m.difference(m.set(m.keys(coll)), m.set(keys)))
        // eslint-disable-next-line
        : m.reduce((a, key) => (delete a[key], a), clone(coll), keys);
  return isNull(coll) ? (coll === undefined ? reducer : null) : reducer(coll);
};

export const pick = (keys, coll) => {
  // eslint-disable-next-line
  const reducer = coll =>
    isNull(coll) ? null
    // eslint-disable-next-line
      : m.isCollection(coll) ? m.reduce((a, key) => m.assoc(a, key, m.get(coll, key)), M(), keys)
        // eslint-disable-next-line
        : m.reduce((a, key) => (a[key] = coll[key], a), {}, keys);
  return isNull(coll) ? (coll === undefined ? reducer : null) : reducer(coll);
};

export const pickOne = (key, coll) => coll === undefined ? (coll => safeGet(coll, key)) : safeGet(coll, key);


export const hashOne = (key, value) => value === undefined ? (value => ({[key]: value})) : ({[key]: value});

export const pickCheck = (key, pred, coll) => {
  const pickCheckFunc = flow(pickOne, isFunc(pred) ? pred : v => v === pred);
  return coll === undefined ? coll => pickCheckFunc(key, coll) : pickCheckFunc(key, coll);
}

export const pickStreams = (keys, coll) => {
  // eslint-disable-next-line
  const reducer = coll =>
    isNull(coll) ? null
      : m.isCollection(coll) ? m.reduce(
        (a, key) => {
          const item = m.get(coll, key);
          return isStream(item) ? m.assoc(a, key, m.get(coll, key)) : a},
        M(), keys)
      : m.reduce(
        (a, key) => {
          const item = coll[key];
          isStream(item) && (a[key] = coll[key]);
          return a},
        {}, keys);
  return isNull(coll) ? (coll === undefined ? reducer : null) : reducer(coll);
};

const META = Symbol('META');

// eslint-disable-next-line
export const injectMeta = (meta, item) => (item[META] = meta, item);

export const getMeta = item => isSome(item) ? item[META] : null;

export const addMeta = (meta, item) => isSome(item)
  ? injectMeta({...getMeta(item), ...meta}, isFunc(item) ? item : clone(item))
  : null;

export const getMetaKey = (item, metaKey) => {
  const meta = getMeta(item);
  return isSome(meta) ? meta[metaKey] : null;
}

export const tagAs = tag => item => !getMetaKey(item, tag) ? addMeta({[tag]:true}, item) : item;

export const hasTag = tag => item => Boolean(getMetaKey(item, tag));

export class Record {
  static create(type, payload) {
    return new Record(type, payload);
  }
  constructor(type, payload, meta) {
    this.type = type;
    this.payload = payload;
    isSome(meta) && injectMeta(meta, this);
  }
  clone() {
    return new Record(this.type, this.payload, getMeta(this));
  }
}

export const isRecord = (type, item) => isSome(item) && (item instanceof Record) && (type === item.type);

export const error = (message) => Record.create(error, {message});

export const isError = P(isRecord, error);

export const matchRecord = (...clauses) => {
  let clausesLen = clauses.length;
  // eslint-disable-next-line
  const elseClause = m.isOdd(clausesLen) ? (clausesLen = clausesLen-1, last(clauses)) : null;
  return (rec, ...args) => {
    const applyClause = f => isFunc(f) ? f(rec.payload, ...args) : f;
    const applyElseClause = f => isFunc(f) ? f(rec, ...args) : f;
    if (isNull(rec) || !(rec instanceof Record))
      return applyElseClause(elseClause);
    else
      for (let i = 0; i < clausesLen; i += 2) {
        const recordType = clauses[i];
        if (recordType === rec.type)
          return applyClause(clauses[i+1])
      }
    return applyElseClause(elseClause);
  }
}

export const vec = function (v) {return m.vector.apply(null,v)};

export function mapKV(func) {
  return function (immPair) {
    return func(first(immPair),second(immPair));
  }
}

export function mapK(func) {
  return immPair => V(func(first(immPair)), second(immPair));
}

export function mapV(func) {
  return immPair => V(first(immPair), func(second(immPair)));
}

export function mapHash(func,source) {
  return m.into(M(), m.map(func,source));
}

export function withIdx(idx, item) {
  return V(idx,item);
}

export function multi(coll1,coll2) {
  return m.mapcat(p2 => m.map(p1 => V(p1,p2),coll1),coll2);
}

export function amap(f,coll) {
  return m.intoArray(m.map(f,coll));
}

export function amapi(f,coll) {
  return m.intoArray(m.mapIndexed(f,coll));
}

export function afilter(f,coll) {
  return m.intoArray(m.filter(f, coll));
}

export function conj(a,b) {
  if (m.isCollection(a))
    return m.conj(a,b);
  else if (isArray(a))
    return a.concat([b]);
  else if (isHash(a) && isArray(b) && b.length === 2)
    return {...a, [b[0]]: b[1]};
  else
    throwError("Can't conj $(b) to $(a)", {coll: a, item: b});
}

export const keys = coll => isNull(coll) ? null : m.isCollection(coll) ? m.keys(coll) : Object.keys(coll);

export const vals = coll => isNull(coll) ? null : m.isCollection(coll) ? m.vals(coll) : Object.keys(coll).map(k => coll[k]);

export function apply(func, args) {
  return isFunc(func) ? func.apply(null, args) : isSome(func) && func.apply ? func.apply(args) : null;
}

export function call(func, ...args) {
  return func ? apply(func, args) : null;
}

export function callDelay(func, ...argsAndTime) {
  if (isNull(func)) return;
  const delay = last(argsAndTime);
  if (isSome(delay)) {
    const args = butLast(argsAndTime);
    if (args.length > 1)
      setTimeout(() => apply(func, args), delay);
    else if (args.length > 0)
      setTimeout(() => func(first(args)), delay);
    else
      setTimeout(func, delay);
  }
}

export function cond(...condList) {
  condList = condList.length === 1 && isArray(condList[0]) ? condList[0] : condList;
  let condListLen = condList.length;
  let elseClause = m.isOdd(condListLen) ? condList.pop() : undefined;
  if (elseClause!==undefined) condListLen--;
  function lazilyIfFunc(result,v) {
    return isFunc(result) ? (v!==undefined ? result(v) : result()) : result;
  }
  return function (c,v) {
    v = arguments.length>1 ? v : c;
    if (c !== undefined) {
      if (isFunc(c)) {
        for (let i = 0; i < condListLen; i += 2) {
          const condItem = condList[i];
          const condResult = condList[i+1];
          if (c(condItem))
            return lazilyIfFunc(condResult,v);
        }
      } else {
        for (let i = 0; i < condListLen; i += 2) {
          const condItem = condList[i];
          const condResult = condList[i+1];
          if (isFunc(condItem)) {
            if (condItem(c))
              return lazilyIfFunc(condResult,v);
          } else {
            if (isEqual(condItem,c))
              return lazilyIfFunc(condResult,v);
          }
        }
      }
    } else {
      for (let i = 0; i < condListLen; i += 2) {
        const condItem = condList[i];
        const condResult = condList[i+1];
        if (isFunc(condItem)) {
          if (condItem())
            return lazilyIfFunc(condResult,v);
        } else {
          if (condItem)
            return lazilyIfFunc(condResult,v);
        }
      }
    }
    if (elseClause !== undefined)
      return elseClause;
    throwError(`No matching clause in for: ${c}`, condList);
  }
}

export const getSome = (...items) => {
  const itemsLen = items.length;
  if (itemsLen === 2)
    return isSome(items[0]) ? items[0] : items[1];
  else {
    let i = 1, result = items[0];
    while (i<itemsLen && isNull(result))
      result = items[i++];
    return result;
  }
}

export const whenSome = (v, func) => isSome(v) ? func(v) : null;

export const doToFns = (...funcs) => {
  const funcsLen = funcs.length;
  if (funcsLen === 0)
    return identity;
  else if (funcsLen === 2) {
    const func0 = funcs[0];
    const func1 = funcs[1];
    const isSomeFunc0 = isSome(func0);
    const isSomeFunc1 = isSome(func1);
    return isSomeFunc0 && isSomeFunc1
      // eslint-disable-next-line
      ? ((...args) => (func0(...args), func1(...args)))
      : isSomeFunc0 ? func0
        : isSomeFunc1 ? func1
          : identity;
  } else {
    if (funcsLen === 1) {
      const firstFunc = funcs[0];
      if (isArray(firstFunc))
        funcs = firstFunc;
      else
        return firstFunc || identity;
    }
    return (...args) =>
      funcs.forEach(func => isSome(func) && func(...args));
  }
}

export function flow(...funcs) {
  const funcsLen = funcs.length;
  if (funcsLen === 0)
    return identity;
  else if (funcsLen === 2) {
    const func0 = funcs[0];
    const func1 = funcs[1];
    const isSomeFunc0 = isSome(func0);
    const isSomeFunc1 = isSome(func1);
    return isSomeFunc0 && isSomeFunc1
      ? ((...args) => func1(func0(...args)))
      : isSomeFunc0 ? func0
        : isSomeFunc1 ? func1
          : identity;
  } else {
    if (funcsLen === 1) {
      const firstFunc = funcs[0];
      if (isArray(firstFunc))
        funcs = firstFunc;
      else
        return firstFunc || identity;
    }
    return (...args) => {
      let result = apply(funcs[0] || identity, args);
      for (let i = 1; i < funcsLen; i++) {
        const func = funcs[i];
        result = isSome(func) ? func(result) : result;
      }
      return result;
    }
  }
}

export function everyPred(...preds) {
  if (preds.length === 0)
    throwOnUnexpected("predicates", preds);
  else if (preds.length === 2) {
    return (...args) => apply(preds[0], args) && apply(preds[1], args);
  } else {
    if (preds.length === 1) {
      const firstPred = preds[0];
      if (isArray(firstPred))
        preds = firstPred;
      else
        return firstPred;
    }
    return (...args) => {
      let result;
      for (let i = 0, predsLen = preds.length; i < predsLen; i++) {
        result = apply(preds[i], args);
        if (!result) return result;
      }
      return result;
    }
  }
}

export function someFn(...preds) {
  if (preds.length === 0)
    throwOnUnexpected("predicates", preds);
  else if (preds.length === 2) {
    return (...args) => apply(preds[0], args) || apply(preds[1], args);
  } else {
    if (preds.length === 1) {
      const firstPred = preds[0];
      if (isArray(firstPred))
        preds = firstPred;
      else
        return firstPred;
    }
    return (...args) => {
      let result;
      for (let i = 0, predsLen = preds.length; i < predsLen; i++) {
        result = apply(preds[i], args);
        if (result) return result;
      }
      return result;
    }
  }
}

export function arities(...arList) {
  if (!arList)
    throw new Error("No arities defined!");
  let maxArgCount = 0;
  // eslint-disable-next-line
  const arMap = _.fromPairs(arList.map(entry => (maxArgCount = Math.max(entry.length,maxArgCount),[entry.length, entry])));
  return (...args) => {
    const argsLen = args.length;
    const func = arMap[argsLen];
    if (func)
      return apply(func,args);
    if (argsLen>maxArgCount)
      apply(arMap[maxArgCount],args);
    else
      throw new Error(`Can't find suitable function arity for arguments: ${args}`);
  }
}

export const IMM = v => (m.isCollection(v) ? v : m.toClj(v));

export function JS(level,value) {
  if (arguments.length === 1) {
    value = level;
    level = 1;
  }
  function oneLevel(value,goDeeper) {
    return m.isCollection(value)
      ? (m.isMap(value)
      ? m.reduceKV((acc,k,v)=> {acc[k] = goDeeper ? oneLevel(v,goDeeper-1) : v; return acc}, {}, value)
      : (goDeeper ? m.intoArray(value).map(v => oneLevel(v,goDeeper-1)) : m.intoArray(value)))
      : value;
  }
  return oneLevel(value,level-1);
}

export function D(level,func) {
  if (arguments.length === 1) {
    func = level;
    level = 1;
  }
  return v => func(JS(level,v));
}

function immType(v) {
  return m.isSet(v) ? 'SET' : m.isVector(v) ? 'VEC' : m.isMap(v) ? 'MAP' : m.isList(v) ? 'LIST' : 'SEQ';
}

export function inDevMode() {
  return process.env.NODE_ENV === 'development';
}

try {
  isSome(window) && (window.inDevMode = inDevMode);
} catch (e) {}

let traceEnabled = false;

export function enableTrace(v) {
  traceEnabled = v;
}

export function tracer(msg,f) {
  msg += '>';
  f = f || identity;
  return v => {
    if (inDevMode() || traceEnabled) {
      let rv = f(v);
      if (m.isCollection(rv)) {
        console.log(msg, 'IMM:'+immType(rv), m.toJs(rv));
      } else {
        const convertImm = item => m.isCollection(item) ? ['IMM:'+immType(item), m.toJs(item)] : item;
        // eslint-disable-next-line
        rv = isArray(rv) ? rv.map(convertImm) : isHash(rv) ? reduceHash((a, k, v) => (a[k] = convertImm(v), a), {}, rv) : rv;
        console.log(msg, rv);
      }
    }
    return v;
  };
}

export function rawTracer(msg, f) {
  msg += '>';
  f = f || identity;
  return v => {
    const rv = f(v);
    console.log(msg, rv);
    return v
  };
}

export function timeTracer(tag,func) {
  function result(func) {
    return function (...args) {
      const startTime = Date.now();
      const result = apply(func, args);
      tracer(tag)(Date.now() - startTime);
      return result;
    }
  }
  return func ? result(func) : result;
}

export function funcTracer(tag,func) {
  function result(func) {
    return function (...args) {
      tracer(tag+":input")(args);
      const result = apply(func,args);
      tracer(tag+":result")(result);
      return result;
    }
  }
  return func ? result(func) : result;
}

export function msgTracer(...msg) {
  // eslint-disable-next-line
  msg = msg.reduce((a, v) => (m.isCollection(v) ? (a.push('IMM:'+immType(v)), a.push(m.toJs(v))) : a.push(v), a), []);
  return () => console.log.apply(null, msg);
}

export function isPromise(item) {
  return isSome(item) && isFunc(item.then);
}

export function isStream(item) {
  return isSome(item) && isFunc(item.subscribe);
}

export function isAsync(item) {
  return isStream(item) || isPromise(item);
}

export function promiseDelay(msec) {
  return value => new Promise(resolved => _.delay(() => resolved(value),msec));
}

export function funcDelay(func, msec) {
  return isSome(func) ? value => setTimeout(() => func(value), msec) : null;
}

export function addTag(tag) {
  return v => V(tag,v);
}

export function promiseTimeout(promise,msec) {
  return new Promise((resolved,rejected) => {
    const timeoutId = _.delay(()=> {
      rejected('TIMEOUT');
    },msec);
    promise.then(value => {clearTimeout(timeoutId);resolved(value)},error => {clearTimeout(timeoutId);rejected(error)});
  });
}

export function promiseSequential(seq,step) {
  const prevPromise = Promise.resolve([]);
  const source = seq.slice();
  function processNext() {
    return source.length
      ? prevPromise.then(function (result) {
      const item = source.shift();
      return step(item).then(function (transformed) {
        result.push(transformed);
        return result;
      });
    }).then(function () {return processNext()})
      : prevPromise;
  }
  return processNext();
}

export function promisedTrap() {
  let trap;
  const promise = new Promise((resolved) => trap = resolved);
  return {trap,promise};
}

export function cancelToken() {
  let canceled = false;
  return {
    canceled: () => canceled,
    cancel: () => canceled = true
  }
}

export function promiseCancel(token,reject) {
  return value => new Promise((resolved,rejected) => {
    if (token && token.canceled()) {
      if (reject)
        rejected(Promise.reject("Canceled"));
    } else
      resolved(value);
  });
}

export function log(sources, tag) {
  tag = isSome(tag) ? tag+':' : '';
  // eslint-disable-next-line
  const subscribeOrTrace = (name, item) => isStream(item) ? item.subscribe(tracer(tag + name)) : tracer(tag+name)(item);
  // eslint-disable-next-line
  isHash(sources)
    ? hashEach(sources, subscribeOrTrace)
    : isSeqable(sources) ? m.each(m.mapIndexed(withIdx), (p) => subscribeOrTrace(first(p), second(p)))
    : isStream(sources) ? subscribeOrTrace("", sources)
      : null;
  return sources;
}

export const condLog = (cond) => {
  const effCond = isFunc(cond) ? cond() : cond;
  return (data,tag) => effCond ? log(data,tag) : null;
}

export function merge(...args) {
  args = (args.length === 1 && isArray(args[0])) ? args[0] : args;
  if (m.isCollection(args[0])) {
    return apply(m.merge, args);
  } else {
    const result = {};
    m.each(args, item => hashEach(item, (k, v) => result[k] = v));
    return result;
  }
}

export function mergeWith(func, ...args) {
  args = (args.length === 1 && isArray(args[0])) ? args[0] : args;
  if (m.isCollection(args[0]))
    return m.mergeWith.apply(null, [func].concat(args));
  return m.reduce(
    // eslint-disable-next-line
    (accum, item) => (_.forOwn(item, (v, k) => accum[k] = isNull(accum[k]) ? v : func(accum[k], v)), accum),
    {},
    args);
}

export function hashEach(hash, f) {
  isSome(hash) && isSome(f) && Object.keys(hash).forEach(k => f(k, hash[k]));
}

export function reduceHash(f, init, hash) {
  return isSome(hash) ? Object.keys(hash).reduce((a, k) => f(a, k, hash[k]), init) : null;
}

export function intoPairs(hash) {
  // eslint-disable-next-line
  return reduceHash((a, k, v) => (a.push([k, v]), a), [], hash);
}

export function intoHash(pairs) {
  // eslint-disable-next-line
  return m.reduce((a, pair) => (a[first(pair)] = second(pair), a), {}, pairs);
}

export function hashFilter(pred, hash) {
  return intoHash(m.filter(([__, v]) => pred(v), intoPairs(hash)));
}

export function preserve(hash, ...rest) {
  function extendPreserve(target, source) {
    hashEach(source, (k, v) => target[k]===undefined && (target[k] = v));
    return target;
  }
  return isPos(rest.length)
    ? rest.reduce(extendPreserve, {...hash})
    : arg => extendPreserve({...hash}, arg)
}

export function defaults(hash, ...rest) {
  function extendDefault(target, source) {
    hashEach(source, (k, v) => isSome(v) && (target[k] = v));
    return target;
  }
  return isPos(rest.length)
    ? rest.reduce(extendDefault, {...hash})
    : arg => extendDefault({...hash}, arg)
}

export function evalDefaults(rules, hash) {
  return hash === undefined
    ? (hash => evalDefaults(rules, hash))
    : defaults(
      isNull(rules) ? null
        : isFunc(rules) ? rules(hash)
        // eslint-disable-next-line
        : reduceHash((a, k, f) => (isNull(hash[k]) && (a[k] = isFunc(f) ? f(hash) : f), a), {}, rules),
      hash);
}

export const evd = evalDefaults;

export function evalHash(rules, hash) {
  return hash === undefined
    ? (hash => evalHash(rules, hash))
    : isNull(rules) ? null
      : isFunc(rules) ? rules(hash)
        // eslint-disable-next-line
        : reduceHash((a, k, f) => (a[k] = isFunc(f) ? f(hash) : f, a), {}, rules);
}

export function evalHashWithExtraArgs(rules, hash, ...rest) {
  return isNull(rules) ? null
    : isFunc(rules) ? rules(hash, ...rest)
      // eslint-disable-next-line
      : reduceHash((a, k, f) => (a[k] = isFunc(f) ? f(hash, ...rest) : f, a), {}, rules);
}

export function evalOverride(rules, hash) {
  return hash === undefined
    ? (hash => evalOverride(rules, hash))
    : ({...hash, ...evalHash(rules, hash)});
}

export const evo = evalOverride;

export function groupHashBy(func, source) {
  const result = [];
  hashEach(source, (k, v) => {
    let idx = func(v);
    let hash = result[idx];
    isNull(hash) && (result[idx] = hash = {});
    hash[k] = v;
  });
  return result;
}

export function asKeywords(symbols) {
  return _.fromPairs(_.map(symbols, sym => [sym,sym]));
}

export function reduceReducers(...reducers) {
  return (previous, current) =>
    reducers.reduce(
      (p, r) => r(p, current),
      previous
    );
}

// eslint-disable-next-line
export const uuid = function b(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,b)}

export const ensureTrailing = s => path => _.endsWith(path,s) ? path : path+s;

export const ensureStarting = s => path => _.startsWith(path,s) ? path : s + path;

export const combineLatest = (names, handler, transform) => {
  const state = [];
  const handlerCount = names.length;
  const genProxyHandler = idx => data => {
    state[idx] = data;
    let needToNotify = true;
    for (let i=0;i<handlerCount;i++)
      if (state[i]===undefined) {
        needToNotify = false;
        break;
      }
    if (needToNotify) {
      let outgoing = state.slice();
      outgoing = transform ? transform(outgoing) : outgoing;
      handler(outgoing);
    }
  };
  return names.map((name,i) => [name,genProxyHandler(i)]);
}

export const combineHandlers = (...handlers) => {
  handlers = handlers.map(m.identity);
  return handlers.length>1 ? e => handlers.forEach(handler => handler(e)) : handlers.length===1 ? handlers[0] : null;
};

export const consensus = handler => {
  let s = S();
  return ([id, hover]) => {
    s = (hover ? m.conj : m.disj)(s, id);
    handler && handler(!isEmpty(s));
  }
}

export const warn = warnMsg => console.error("Frontier Warning", warnMsg);

/**
 * JS Implementation of MurmurHash2
 *
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 *
 * @param {string} str ASCII only
 * @return {string} Base 36 encoded hash result
 */
function murmurhash2_32_gc(str) {
  let l = str.length;
  let h = l;
  let i = 0;
  let k = undefined;

  while (l >= 4) {
    // eslint-disable-next-line
    k = str.charCodeAt(i) & 0xff | (str.charCodeAt(++i) & 0xff) << 8 | (str.charCodeAt(++i) & 0xff) << 16 | (str.charCodeAt(++i) & 0xff) << 24;

    k = (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0x5bd1e995 & 0xffff) << 16);
    k ^= k >>> 24;
    k = (k & 0xffff) * 0x5bd1e995 + (((k >>> 16) * 0x5bd1e995 & 0xffff) << 16);

    h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16) ^ k;

    l -= 4;
    ++i;
  }

  /* eslint-disable no-fallthrough */ // forgive existing code
  switch (l) {
    case 3:
      h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
    case 2:
      h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
    case 1:
      h ^= str.charCodeAt(i) & 0xff;
      h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16);
    default:
  }
  /* eslint-enable no-fallthrough */

  h ^= h >>> 13;
  h = (h & 0xffff) * 0x5bd1e995 + (((h >>> 16) * 0x5bd1e995 & 0xffff) << 16);
  h ^= h >>> 15;

  return (h >>> 0).toString(36);
}

// Taken from https://github.com/Khan/aphrodite

// Note that this uses JSON.stringify to stringify the objects so in order for
// this to produce consistent hashes browsers need to have a consistent
// ordering of objects. Ben Alpert says that Facebook depends on this, so we
// can probably depend on this too.
export const hashObject = (object) => {
  return murmurhash2_32_gc(JSON.stringify(object));
};

export const shortUuid = () => "u" + hashObject(uuid());

export const isPngData = v => isString(v) && v.startsWith('data:image/png;base64,');

export const matchRegExp = regexp => {
  regexp = _.isRegExp(regexp) ? regexp : new RegExp(regexp);
  return str => isString(str) && str.match(regexp);
};

export const randInt = n => Math.floor(Math.random()*n);

export const sample = coll => {
  const idx = randInt(count(coll));
  return m.isCollection ? m.get(coll, idx) : coll[idx];
}

export const isShallowEqual = (a, b) => {
  if (a === b || (a == null && b == null))
    return true;
  if (a == null || b == null)
    return false;
  const aType = typeof a;
  const bType = typeof b;
  if (aType !== bType || aType === 'string' || aType === 'number' || aType === 'boolean' || aType === 'function')
    return false;
  if (isArray(a)) {
    if (!isArray(b))
      return false;
    const aLen = a.length;
    if (aLen!==b.length)
      return false;
    for (let i = 0; i<aLen; i++)
      if (!m.equals(a[i], b[i]))
        return false;
  } else if (aType === 'object') {
    const aKeys = _.keys(a);
    const aKeysLen = aKeys.length;
    const bKeys = _.keys(b);
    const bKeysLen = bKeys.length;
    if (aKeysLen !== bKeysLen)
      return false;
    for (let k of aKeys)
      if (!m.equals(a[k], b[k])) {
        return false;
      }
  }
  return true;
}

export const mem = () => {
  const storage = {};
  return (key, ctor) => {
    const storedValue = storage[key];
    return (isNull(storedValue) && isFunc(ctor)) ? (storage[key] = ctor()) : storedValue
  }
};

export const capitalize = str => str ? str[0].toUpperCase() + str.substr(1) : str;

export const startsWith = _.startsWith;

export const endsWith = _.endsWith;

export const showShallowDiff = (a, b) => {
  if (isNull(a) || isNull(b))
    return;
  tracer("Differences")([a, b]);
  const ks = m.union(m.set(keys(a)), m.set(keys(b)));
  m.each(ks, k => a[k]!==b[k] && tracer(k+" is different")([a[k], b[k]]));
}

export const toLowerCase = str => isString(str) ? str.toLowerCase() : null;

export const isNodeParent = (target, parent) =>
  isNull(target) ? false
  : target === parent ? true
  : isNodeParent(target.parentNode, parent);

const HASH_MAP = "~#hm";
const VECTOR = "~#vec";
const SET = "~#set";
const LIST = "~#list";

export function serializeIMM(data) {
  function serializeSeq(coll) {
    return m.intoArray(m.map(serializeItem,coll));
  }
  function serializeItem(item) {
    if (m.isCollection(item)) {
      return cond(
        m.isMap,
        coll => [HASH_MAP, _.flatten(m.intoArray(m.map(
          pair => [serializeItem(first(pair)),serializeItem(second(pair))],
          coll)))],
        //
        m.isVector,
        coll => [VECTOR, serializeSeq(coll)],
        //
        m.isSet,
        coll => [SET, serializeSeq(coll)],
        //
        m.isList,
        coll => [LIST, serializeSeq(coll)]
      )(item);
    } else
      return item;
  }
  return serializeItem(data);
}

export function deserializeIMM(data) {
  function deserializeItem(item) {
    if (isArray(item)) {
      return cond(
        HASH_MAP,
        source => m.hashMap.apply(null, source.map(deserializeItem)),
        //
        VECTOR,
        source => m.vector.apply(null,source.map(deserializeItem)),
        //
        SET,
        source => m.set(source.map(deserializeItem)),
        //
        LIST,
        source => m.list.apply(null,source.map(deserializeItem)),
        //
        item
      )(item[0],item[1]);
    } else
      return item;
  }
  return deserializeItem(data);
}

export const ensurePostfix = postfix => str => endsWith(str,postfix) ? str : str+postfix;

export const action = (type, payload) => isFunc(type) || isString(type)
  ? Record.create(action, {type, payload})
  : throwOnUnexpected("function or string", type);

export const asAction = type => payload => action(type, payload);

export const dispatchAction = (type, onDispatch) => payload => call(onDispatch, action(type, payload));

export const dispatchAsAction = onDispatch => value => onDispatch(isSeqable(value) ? action(first(value), second(value)) : action(value));

export function isMobileBrowser() {
  return (isSome(window) ? window.navigator.userAgent : "").toLowerCase().indexOf("mobile")>=0
}

export function sortFlow(...comparators) {
  const comparatorsLen = comparators.length;
  if (comparatorsLen === 0)
    return constantly(0);
  else if (comparatorsLen === 2) {
    const func0 = comparators[0];
    const func1 = comparators[1];
    const isSomeFunc0 = isSome(func0);
    const isSomeFunc1 = isSome(func1);
    return isSomeFunc0 && isSomeFunc1
      ? ((a, b) => { const firstResult = func0(a, b); return firstResult !== 0 ? firstResult : func1(a, b) })
      : isSomeFunc0 ? func0
        : isSomeFunc1 ? func1
          : constantly(0);
  } else {
    if (comparatorsLen === 1) {
      const firstFunc = comparators[0];
      if (isArray(firstFunc))
        return apply(sortFlow, firstFunc);
      else
        return firstFunc || constantly(0);
    }
    return (a, b) => {
      for (let i = 0; i < comparatorsLen; i++) {
        const result = isSome(comparators[0]) ? comparators[0](a, b) : 0;
        if (result!==0) return result;
      }
      return 0;
    }
  }
}

export function sortByFlow(keyFn, ...comparators) {
  const comparatorFlow = sortFlow(comparators);
  return (a, b) => comparatorFlow(keyFn(a), keyFn(b));
}

export const invertHashTree = (hashTree) => reduceHash(
  (a, k, vs) => isSeqable(vs)
    // eslint-disable-next-line
    ? m.reduce((a, v) => (a[v] = isSome(a[v]) ? conj(a[v], k) : [k], a), a, vs)
    : throwOnUnexpected("seqable", [vs, hashTree]),
  {}, hashTree);

export function storeValue(k, v) {
  window.localStorage.setItem(k, JSON.stringify(v));
}

export function readValue(k) {
  const s = window.localStorage.getItem(k);
  return isSome(k) ? JSON.parse(s) : null;
}

export function removeValue(k) {
  window.localStorage.removeItem(k);
}