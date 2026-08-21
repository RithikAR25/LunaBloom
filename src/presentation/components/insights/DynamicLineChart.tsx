import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, LayoutChangeEvent } from 'react-native';
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
}

const MIN_POINT_SPACING = 60;
const POINT_RADIUS = 4;

export function DynamicLineChart({ data, color, height }: Props) {
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

  // Horizontal Sizing
  const contentWidth = Math.max(containerWidth, data.length * MIN_POINT_SPACING);
  const pointWidth = contentWidth / data.length;

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
  // SVG drawing area is just `height`, but the labels take extra space.
  const getX = (index: number) => (index * pointWidth) + (pointWidth / 2);
  const getY = (val: number) => {
    if (paddedRange === 0) return height / 2;
    return height - ((val - chartMin) / paddedRange) * height;
  };

  const pointsString = data
    .map((point, index) => `${getX(index)},${getY(point.value)}`)
    .join(' ');

  return (
    <View style={styles.wrapper}>
      {/* Invisible container to measure available width, overlays over scroll view? No, we just use flex: 1 on a wrapper. */}
      {containerWidth === 0 && (
        <View style={StyleSheet.absoluteFill} onLayout={handleLayout} />
      )}
      
      {containerWidth > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ minWidth: contentWidth }}
        >
          <View style={{ width: contentWidth }}>
            {/* React Native Labels Layer */}
            <View style={styles.labelsLayer}>
              {data.map((point) => (
                <View key={`label-${point.id}`} style={[styles.labelColumn, { width: pointWidth }]}>
                  <Text style={[styles.topLabel, { color: colors.text.primary }]}>
                    {point.topLabel}
                  </Text>
                  
                  {/* Invisible placeholder matching SVG chart height to space labels correctly */}
                  <View style={{ height }} />

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
              ))}
            </View>

            {/* SVG Graphics Layer */}
            <View style={[StyleSheet.absoluteFill, { zIndex: 1, marginTop: 24 }]}>
              <Svg width={contentWidth} height={height}>
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
        </ScrollView>
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
  labelsLayer: {
    flexDirection: 'row',
    zIndex: 2,
  },
  labelColumn: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 0,
  },
  topLabel: {
    fontSize: fontSize.caption,
    fontFamily: fontFamily.semiBold, // matching barValue
    height: 16,
    marginBottom: 8, // matching gap in barColumn
  },
  bottomLabels: {
    alignItems: 'center',
    height: 24,
    marginTop: 8, // matching gap in barColumn
  },
  bottomLabelPrimary: {
    fontSize: 10,
    fontFamily: fontFamily.regular,
  },
  bottomLabelSecondary: {
    fontSize: 10, // matching existing barLabelYear
    fontFamily: fontFamily.regular,
  }
});
