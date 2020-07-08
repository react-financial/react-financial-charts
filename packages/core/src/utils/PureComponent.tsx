import * as React from "react";
import { shallowEqual } from "./shallowEqual";

export class PureComponent<T, S = {}, SS = any> extends React.Component<T, S, SS> {
    public shouldComponentUpdate(nextProps: T, nextState: S, nextContext: SS) {
        return (
            !shallowEqual(this.props, nextProps) ||
            !shallowEqual(this.state, nextState) ||
            !shallowEqual(this.context, nextContext)
        );
    }
}
