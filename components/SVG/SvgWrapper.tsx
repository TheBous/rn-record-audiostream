import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SvgProps } from 'react-native-svg';

interface SvgWrapperProps {
    svgComponent: React.ReactNode | ((props: SvgProps) => React.ReactNode) | (() => React.ReactNode);
    containerStyle: ViewStyle;
    svgProps?: SvgProps & ViewStyle & { crop?: boolean; color?: string; secondaryColor?: string };
    isActive?: boolean;
}

const SvgWrapper = ({
    svgComponent,
    svgProps,
    containerStyle,
    ...props
}: SvgWrapperProps): JSX.Element => {
    const SvgComp = svgComponent as React.ElementType;
    return (
        <View style={[containerStyle]}>
            <SvgComp {...svgProps} {...props} />
        </View>
    );
};

export default SvgWrapper;
