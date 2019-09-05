import * as PropTypes from "prop-types";

import GenericComponent from "./GenericComponent";
import {
    find,
    isDefined,
} from "./utils";

const ALWAYS_TRUE_TYPES = [
    "drag",
    "dragend",
];

class GenericChartComponent extends GenericComponent {

    public static defaultProps = GenericComponent.defaultProps;

    public static contextTypes = {
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
        margin: PropTypes.object.isRequired,
        chartId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        getCanvasContexts: PropTypes.func,
        chartCanvasType: PropTypes.string,
        xScale: PropTypes.func.isRequired,
        xAccessor: PropTypes.func.isRequired,
        displayXAccessor: PropTypes.func.isRequired,
        plotData: PropTypes.array.isRequired,
        fullData: PropTypes.array.isRequired,
        chartConfig: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object,
        ]).isRequired,
        morePropsDecorator: PropTypes.func,
        generateSubscriptionId: PropTypes.func,
        getMutableState: PropTypes.func.isRequired,
        amIOnTop: PropTypes.func.isRequired,
        subscribe: PropTypes.func.isRequired,
        unsubscribe: PropTypes.func.isRequired,
        setCursorClass: PropTypes.func.isRequired,
        canvasOriginX: PropTypes.number,
        canvasOriginY: PropTypes.number,
        ratio: PropTypes.number.isRequired,
    };

    public constructor(props, context) {
        super(props, context);

        this.preCanvasDraw = this.preCanvasDraw.bind(this);
        this.postCanvasDraw = this.postCanvasDraw.bind(this);
        this.shouldTypeProceed = this.shouldTypeProceed.bind(this);
        this.preEvaluate = this.preEvaluate.bind(this);
    }

    public preCanvasDraw(ctx, moreProps) {

        super.preCanvasDraw(ctx, moreProps);

        ctx.save();
        const { margin, ratio } = this.context;
        const { chartConfig } = moreProps;

        const canvasOriginX = (0.5 * ratio) + chartConfig.origin[0] + margin.left;
        const canvasOriginY = (0.5 * ratio) + chartConfig.origin[1] + margin.top;

        const { chartConfig: { width, height } } = moreProps;
        const { clip, edgeClip } = this.props;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(ratio, ratio);
        if (edgeClip) {
            ctx.beginPath();
            ctx.rect(-1, canvasOriginY - 10, width + margin.left + margin.right + 1, height + 20);
            ctx.clip();
        }

        ctx.translate(canvasOriginX, canvasOriginY);

        if (clip) {
            ctx.beginPath();
            ctx.rect(-1, -1, width + 1, height + 1);
            ctx.clip();
        }
    }

    public postCanvasDraw(ctx, moreProps) {
        super.postCanvasDraw(ctx, moreProps);
        ctx.restore();
    }

    public updateMoreProps(moreProps) {
        super.updateMoreProps(moreProps);
        const { chartConfig: chartConfigList } = moreProps;

        if (chartConfigList && Array.isArray(chartConfigList)) {
            const { chartId } = this.context;
            const chartConfig = find(chartConfigList, (each) => each.id === chartId);
            this.moreProps.chartConfig = chartConfig;
        }
        if (isDefined(this.moreProps.chartConfig)) {
            const { origin: [ox, oy] } = this.moreProps.chartConfig;
            if (isDefined(moreProps.mouseXY)) {
                const { mouseXY: [x, y] } = moreProps;
                this.moreProps.mouseXY = [
                    x - ox,
                    y - oy,
                ];
            }
            if (isDefined(moreProps.startPos)) {
                const { startPos: [x, y] } = moreProps;
                this.moreProps.startPos = [
                    x - ox,
                    y - oy,
                ];
            }
        }
    }

    public preEvaluate(/* type, moreProps */) {
        ///
    }

    public shouldTypeProceed(type, moreProps) {
        if (
            (type === "mousemove" || type === "click")
            && this.props.disablePan) {
            return true;
        }
        if (
            ALWAYS_TRUE_TYPES.indexOf(type) === -1
            && isDefined(moreProps)
            && isDefined(moreProps.currentCharts)
        ) {
            return (moreProps.currentCharts.indexOf(this.context.chartId) > -1);
        }
        return true;
    }
}

export default GenericChartComponent;
