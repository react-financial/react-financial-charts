import * as React from "react";
import shallowEqual from "./shallowEqual";

export class PureComponent<T> extends React.Component<T> {
    public shouldComponentUpdate(nextProps, nextState, nextContext) {
        return !shallowEqual(this.props, nextProps)
            || !shallowEqual(this.state, nextState)
            || !shallowEqual(this.context, nextContext);
    }
}
