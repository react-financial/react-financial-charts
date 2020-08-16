import * as React from "react";
import { GenericChartComponent } from "@react-financial-charts/core";

export interface AnnotateProps {
    readonly className?: string;
    readonly with: React.ElementType;
    readonly when: (value: any, index: number, array: any[]) => boolean;
    readonly usingProps?: any;
}

export class Annotate extends React.Component<AnnotateProps> {
    public static defaultProps = {
        className:
            "react-financial-charts-enable-interaction react-financial-charts-annotate react-financial-charts-default-cursor",
    };

    public render() {
        return <GenericChartComponent svgDraw={this.renderSVG} drawOn={["pan"]} />;
    }

    private readonly renderSVG = (moreProps: any) => {
        const {
            xAccessor,
            xScale,
            chartConfig: { yScale },
            plotData,
        } = moreProps;

        const { className, usingProps, with: Annotation, when } = this.props;

        const data = (plotData as unknown[]).filter(when);

        return (
            <g className={className}>
                {data.map((d, idx) => {
                    return (
                        <Annotation
                            key={idx}
                            {...usingProps}
                            xScale={xScale}
                            yScale={yScale}
                            xAccessor={xAccessor}
                            plotData={plotData}
                            datum={d}
                        />
                    );
                })}
            </g>
        );
    };
}
