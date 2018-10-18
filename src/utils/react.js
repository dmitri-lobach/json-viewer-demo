import React from 'react';

export const el = React.createElement;

export const div = (props, children) => el("div", props, children);

export const span = (props, children) => el("span", props, children);