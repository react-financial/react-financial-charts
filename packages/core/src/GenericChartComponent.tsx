import { GenericComponent } from "./GenericComponent";
import { isDefined } from "./utils";
import { ChartContext } from "./Chart";

const ALWAYS_TRUE_TYPES = ["drag", "dragend"];

export class GenericChartComponent extends GenericComponent {
    public static defaultProps = GenericComponent.defaultProps;
    public static contextType = ChartContext;

    public constructor(props: any, context: any) {
        super(props, context);

        this.preCanvasDraw = this.preCanvasDraw.bind(this);
        this.postCanvasDraw = this.postCanvasDraw.bind(this);
        this.shouldTypeProceed = this.shouldTypeProceed.bind(this);
        this.preEvaluate = this.preEvaluate.bind(this);
        this.updateMoreProps = this.updateMoreProps.bind(this);
    }

    public preCanvasDraw(ctx: CanvasRenderingContext2D, moreProps: any) {
        super.preCanvasDraw(ctx, moreProps);

        ctx.save();
        const { margin, ratio } = this.context;
        const {
            chartConfig: { width, height, origin },
        } = moreProps;

        const canvasOriginX = 0.5 * ratio + origin[0] + margin.left;
        const canvasOriginY = 0.5 * ratio + origin[1] + margin.top;

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

    public postCanvasDraw(ctx: CanvasRenderingContext2D, moreProps: any) {
        super.postCanvasDraw(ctx, moreProps);
        ctx.restore();
    }

    public updateMoreProps(moreProps: any) {
        super.updateMoreProps(moreProps);
        const { chartConfig: chartConfigList } = moreProps;

        if (chartConfigList && Array.isArray(chartConfigList)) {
            const { chartId } = this.context;
            const chartConfig = chartConfigList.find((each) => each.id === chartId);
            this.moreProps.chartConfig = chartConfig;
        }
        if (isDefined(this.moreProps.chartConfig)) {
            const {
                origin: [ox, oy],
            } = this.moreProps.chartConfig;
            if (isDefined(moreProps.mouseXY)) {
                const {
                    mouseXY: [x, y],
                } = moreProps;
                this.moreProps.mouseXY = [x - ox, y - oy];
            }
            if (isDefined(moreProps.startPos)) {
                const {
                    startPos: [x, y],
                } = moreProps;
                this.moreProps.startPos = [x - ox, y - oy];
            }
        }
    }

    public preEvaluate(/* type, moreProps */) {
        ///
    }

    public shouldTypeProceed(type: string, moreProps: any) {
        if ((type === "mousemove" || type === "click") && this.props.disablePan) {
            return true;
        }
        if (ALWAYS_TRUE_TYPES.indexOf(type) === -1 && isDefined(moreProps) && isDefined(moreProps.currentCharts)) {
            return moreProps.currentCharts.indexOf(this.context.chartId) > -1;
        }
        return true;
    }
}
