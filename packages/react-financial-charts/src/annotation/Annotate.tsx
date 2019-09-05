import * as React from "react";

import GenericChartComponent from "../GenericChartComponent";

interface AnnotateProps {
    readonly className?: string;
    readonly with?: any; // func
    readonly when?: any; // func
    readonly usingProps?: object;
}

export class Annotate extends React.Component<AnnotateProps> {

    public static defaultProps = {
        className: "react-stockcharts-annotate react-stockcharts-default-cursor",
    };

    public render() {
        return (
            <GenericChartComponent
                svgDraw={this.renderSVG}
                drawOn={["pan"]} />
        );
    }

    private readonly renderSVG = (moreProps: any) => {
        const { xAccessor } = moreProps;
        const { xScale, chartConfig: { yScale }, plotData } = moreProps;

        const { className, usingProps, with: Annotation, when } = this.props;

        const data = this.plotfilter(when, plotData);

        return (
            <g className={`react-stockcharts-enable-interaction ${className}`}>
                {data.map((d: any, idx) => {
                    return (
                        <Annotation key={idx}
                            {...usingProps}
                            xScale={xScale}
                            yScale={yScale}
                            xAccessor={xAccessor}
                            plotData={plotData}
                            datum={d} />
                    );
                })}
            </g>
        );
    }

    private readonly plotfilter = (when: any, plotData: any[]) => {
        return plotData.filter(when);
    }
}
