import * as React from "react";
import * as ReactDOM from "react-dom";

export default function withDimensions(WrappedComponent, props: any = {}) {

    const {
        minWidth = 100,
        minHeight = 100,
        ratio,
        width,
        height,
    } = props;

    function getDimensions(el) {
        const w = el.parentNode.clientWidth;
        const h = el.parentNode.clientHeight;

        return {
            width: width !== undefined ? width : Math.max(w, minWidth),
            height: height !== undefined ? height : Math.max(h, minHeight),
        };
    }

    class ResponsiveComponent extends React.Component<any, any> {
        private node;
        private testCanvas;
        constructor(props: any) {
            super(props);
            this.handleWindowResize = this.handleWindowResize.bind(this);
            this.getWrappedInstance = this.getWrappedInstance.bind(this);
            this.saveNode = this.saveNode.bind(this);
            this.setTestCanvas = this.setTestCanvas.bind(this);
            this.state = {};
        }
        public saveNode(node) {
            this.node = node;
        }
        public setTestCanvas(node) {
            this.testCanvas = node;
        }
        public getRatio() {
            if (this.testCanvas !== undefined) {
                const context = this.testCanvas.getContext("2d");

                const devicePixelRatio = window.devicePixelRatio || 1;
                const backingStoreRatio = context.webkitBackingStorePixelRatio ||
                    context.mozBackingStorePixelRatio ||
                    context.msBackingStorePixelRatio ||
                    context.oBackingStorePixelRatio ||
                    context.backingStorePixelRatio || 1;

                return devicePixelRatio / backingStoreRatio;

            }
            return 1;
        }
        public componentDidMount() {
            window.addEventListener("resize", this.handleWindowResize);
            const dimensions = getDimensions(this.node);

            this.setState({
                ...dimensions,
                ratio: ratio !== undefined ? ratio : this.getRatio(),
            });
        }
        public componentWillUnmount() {
            window.removeEventListener("resize", this.handleWindowResize);
        }
        public handleWindowResize() {
            const node = ReactDOM.findDOMNode(this.node);
            this.setState(getDimensions(node));
        }
        public getWrappedInstance() {
            return this.node;
        }
        public render() {
            const ref = { ref: this.saveNode };

            if (this.state.width) {
                return <WrappedComponent
                    height={this.state.height}
                    width={this.state.width}
                    ratio={this.state.ratio}
                    {...this.props}
                    {...ref}
                />;
            } else {
                return <div {...ref}>
                    <canvas ref={this.setTestCanvas} />
                </div>;
            }
        }
    }

    return ResponsiveComponent;
}
