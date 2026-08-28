import { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { fontSize, fontFamily } from '@/design-system';
import { useTheme } from '../../hooks/useTheme';

export type LineChartPoint = {
  id: string;
  value: number;
  topLabel: string;
  bottomLabelPrimary: string;
  bottomLabelSecondary?: string;
};

interface Props {
  data: LineChartPoint[];
  color: string;
  height: number;
  valueFormatter?: (value: number) => string;
}

const MIN_LABEL_SPACING = 50;
const POINT_RADIUS = 4;
const Y_AXIS_WIDTH = 40;

export function DynamicLineChart({ data, color, height, valueFormatter }: Props) {
  const { colors } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  if (data.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height }]} onLayout={handleLayout}>
        <Text style={[styles.emptyText, { color: colors.text.tertiary }]}>No data available</Text>
      </View>
    );
  }

  const chartWidth = containerWidth;
  
  // Vertical Scaling
  const values = data.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  
  const rawRange = maxVal - minVal;
  const padding = rawRange === 0 ? 1 : rawRange * 0.15;
  const chartMin = minVal - padding;
  const chartMax = maxVal + padding;
  const paddedRange = chartMax - chartMin;

  // Coordinate Calculations
  const paddingRight = 24;
  const paddingLeft = Y_AXIS_WIDTH + 8; // 40px for axis + 8px gap
  const drawableWidth = Math.max(0, chartWidth - paddingLeft - paddingRight);
  const pointSpacing = data.length > 1 ? drawableWidth / (data.length - 1) : drawableWidth;
  const labelStep = Math.max(1, Math.ceil(MIN_LABEL_SPACING / pointSpacing));

  const getX = (index: number) => {
    if (data.length <= 1) {
      return paddingLeft + drawableWidth / 2;
    }
    return paddingLeft + (index / (data.length - 1)) * drawableWidth;
  };
  
  const getY = (val: number) => {
    if (paddedRange === 0) return height / 2;
    return height - ((val - chartMin) / paddedRange) * height;
  };

  const pointsString = data
    .map((point, index) => `${getX(index)},${getY(point.value)}`)
    .join(' ');

  // Label Visibility Logic (Bottom Dates)
  const shouldShowLabel = (index: number) => {
    if (index === 0) return true; 
    
    if (index === data.length - 1) {
      const lastIntermediateIndex = Math.floor((data.length - 2) / labelStep) * labelStep;
      const indexToCompare = lastIntermediateIndex > 0 ? lastIntermediateIndex : 0;
      if ((index - indexToCompare) * pointSpacing < MIN_LABEL_SPACING) {
        return false;
      }
      return true;
    }
    
    if (index % labelStep === 0) return true;
    return false;
  };

  // Y-axis labels
  const yLabels = maxVal === minVal ? [minVal] : [maxVal, (maxVal + minVal) / 2, minVal];
  const formatYValue = (val: number) => valueFormatter ? valueFormatter(val) : val.toString();

  return (
    <View style={styles.wrapper}>
      {/* Invisible container to measure available width */}
      {containerWidth === 0 && (
        <View style={StyleSheet.absoluteFill} onLayout={handleLayout} />
      )}
      
      {containerWidth > 0 && (
        <View style={{ width: chartWidth }}>
          
          {/* Y-Axis Layer */}
          <View style={[StyleSheet.absoluteFill, { zIndex: 3, marginTop: 24, width: Y_AXIS_WIDTH }]}>
            {yLabels.map((val, i) => (
              <Text 
                key={`y-axis-${i}`} 
                style={[
                  styles.yAxisLabel, 
                  { 
                    color: colors.text.secondary,
                    position: 'absolute',
                    top: getY(val) - 8, // center vertically (height 16 / 2)
                    width: Y_AXIS_WIDTH,
                  }
                ]}
              >
                {formatYValue(val)}
              </Text>
            ))}
          </View>

          {/* React Native Labels Layer (Bottom dates only) */}
          <View style={[styles.labelsLayer, { height: height + 48 }]}>
            {data.map((point, index) => {
              const isVisible = shouldShowLabel(index);
              const xPos = getX(index);
              const LABEL_WIDTH = 60; 

              if (!isVisible) return null;

              return (
                <View 
                  key={`label-${point.id}`} 
                  style={[
                    styles.labelColumn, 
                    { 
                      position: 'absolute',
                      left: xPos - (LABEL_WIDTH / 2),
                      width: LABEL_WIDTH,
                      bottom: 0 // anchor to bottom
                    }
                  ]}
                >
                  <View style={styles.bottomLabels}>
                    <Text style={[styles.bottomLabelPrimary, { color: colors.text.secondary }]}>
                      {point.bottomLabelPrimary}
                    </Text>
                    {point.bottomLabelSecondary ? (
                      <Text style={[styles.bottomLabelSecondary, { color: colors.text.tertiary }]}>
                        {point.bottomLabelSecondary}
                      </Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>

          {/* SVG Graphics Layer */}
          <View style={[StyleSheet.absoluteFill, { zIndex: 1, marginTop: 24 }]}>
            <Svg width={chartWidth} height={height}>
              <Polyline
                points={pointsString}
                fill="none"
                stroke={color}
                strokeWidth="2"
              />
              {data.map((point, index) => (
                <Circle
                  key={`circle-${point.id}`}
                  cx={getX(index)}
                  cy={getY(point.value)}
                  r={POINT_RADIUS}
                  fill={color}
                />
              ))}
            </Svg>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: 8,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.body,
    fontFamily: fontFamily.regular,
  },
  yAxisLabel: {
    fontSize: fontSize.caption,
    fontFamily: fontFamily.semiBold,
    textAlign: 'right',
    paddingRight: 4,
    height: 16,
    lineHeight: 16, 
  },
  labelsLayer: {
    width: '100%',
    zIndex: 2,
  },
  labelColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bottomLabels: {
    alignItems: 'center',
    height: 24,
  },
  bottomLabelPrimary: {
    fontSize: 10,
    fontFamily: fontFamily.regular,
    textAlign: 'center',
  },
  bottomLabelSecondary: {
    fontSize: 10,
    fontFamily: fontFamily.regular,
    textAlign: 'center',
  }
});
