import {div, el, span} from "../utils/react";
import React, {PureComponent} from "react";
import {amap, call, isEmpty, isNull, isTrue, m, M, not, S, safeGet} from "../utils/tools";
import {Icon, stylers} from "./stylers";


const ROOT = 0;

export const MISC = "MISC";

export class ExpansionToggle extends PureComponent {
  onClick = () => {
    const {onExpanded, expanded, id} = this.props;
    onExpanded(id, !expanded);
  }

  render() {
    return div({onClick: this.onClick, style: stylers.tree.node.expansionToggle(this.props)}, el(Icon, {name: "arrow_right"}));
  }
}


export class SelectionToggle extends PureComponent {
  onClick = () => {
    const {onSelected, selected, id} = this.props;
    onSelected(id, !selected);
  }

  render() {
    const selected = this.props.selected;
    const name = selected === MISC ? "indeterminate_check_box" : selected ? "check_box" : "check_box_outline_blank";
    return div({onClick: this.onClick, style: stylers.tree.node.selectionToggle(this.props)}, el(Icon, {name}));
  }
}


class TreeNodeCore extends PureComponent {
  render() {
    const props = this.props;
    const {id, expanded, level, children, treeData} = props;
    const item = safeGet(treeData.nodes, id);
    const subIds = safeGet(treeData.branches, id);
    return div({style: stylers.tree.node.group(props)}, [
      div({key: "nodes", style: stylers.tree.node.item(props)}, [
        el(SelectionToggle, {...props, key: "select"}),
        span({key: "indent", style: stylers.tree.node.indent(props)}),
        !isEmpty(subIds) ? el(ExpansionToggle, {...props, key: "expand"}) : null,
        el(children, {id, item, treeData, expanded, key: "content"})]),
      ...(expanded ? amap(id => el(TreeNode, {id, key: id, level: level+1}), subIds) : [])]);
  }
}

// I usually don't do things this way
// Just playing with new React context system

const TreeDataCtx = React.createContext();


const ExpansionCtx = React.createContext();


const SelectionCtx = React.createContext();


const CommonCtx = React.createContext();


const TreeNode = (props) =>
  el(TreeDataCtx.Consumer, {},
    treeData => el(CommonCtx.Consumer, {},
      ({onExpanded, onSelected, children}) => el(ExpansionCtx.Consumer, {},
        treeExpanded => el(SelectionCtx.Consumer, {},
          treeSelected => el(TreeNodeCore, {
            ...props,
            treeData,
            expanded: m.hasKey(treeExpanded, props.id),
            onExpanded,
            selected: m.get(treeSelected, props.id),
            onSelected,
            children
          })))));


const getAllChildrenIds = (branches, id) => {
  const processId = (prev, id) => m.reduce(processId, m.conj(prev, id), m.get(branches, id));
  return processId(S(), id);
}

export const selectId = (prev, {branches, parents}, id, select) => {
  const updateParent = (prev, id) => {
    const parentId = m.get(parents, id);
    if (isNull(parentId))
      return prev;
    const childrenState = m.map(id => m.get(prev, id), m.get(branches, parentId));
    const parentState = m.every(isTrue, childrenState) ? true : m.every(not, childrenState) ? false : MISC;
    const updated = parentState === m.get(prev, parentId)
      ? prev
      : m.assoc(prev, parentId, parentState);
    return updateParent(updated, parentId);
  }
  const updated = m.reduce((prev, id) => m.assoc(prev, id, select), prev, m.conj(getAllChildrenIds(branches, id)));
  return updateParent(updated, id);
}

export const expandId = (prev, {branches}, id, expand) =>
  expand ? m.conj(prev, id) : m.difference(prev, getAllChildrenIds(branches, id));

export class Tree extends PureComponent {
  constructor(props) {
    super(props);
    this.common = {onExpanded: this.onExpanded, onSelected: this.onSelected, children: props.children};
    this.state = {treeExpanded: props.expandRoot ? S(ROOT) : S(), treeSelected: M()}
  }

  onExpanded = (id, expand) => {
    let treeExpanded = expandId(this.state.treeExpanded, this.props.treeData, id, expand);
    if (this.props.expandRoot)
      treeExpanded = m.conj(treeExpanded, ROOT);
    this.setState({treeExpanded});
  }

  onSelected = (id, select) => {
    let treeSelected = selectId(this.state.treeSelected, this.props.treeData, id, select);
    call(this.props.onSelection, treeSelected);
    this.setState({treeSelected});
  }

  render() {
    const {treeData} = this.props;
    if (isNull(treeData))
      return null;
    const {nodes} = treeData;
    return (
      el(TreeDataCtx.Provider, {value: treeData},
        el(CommonCtx.Provider, {value: this.common},
          el(ExpansionCtx.Provider, {value: this.state.treeExpanded},
            el(SelectionCtx.Provider, {value: this.state.treeSelected},
              div({style: stylers.tree.root(this.props)},
                el(TreeNode, {id: ROOT, key: ROOT, item: safeGet(nodes, ROOT), level: 0})))))));
  }
}