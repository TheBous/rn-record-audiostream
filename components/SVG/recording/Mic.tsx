import React from 'react';
import Svg, { Path, Rect, SvgProps } from 'react-native-svg';

const MicSvg = (props: SvgProps): JSX.Element => (
    <Svg width={'100%'} height={'100%'} {...props} viewBox="0 0 24 24" fill="none">
        <Rect
            x="9"
            y="3"
            strokeWidth={2}
            width="6"
            height="11"
            rx="3"
            stroke="white"
            strokeLinejoin="round"
        />
        <Path
            strokeWidth={2}
            d="M5.5 11C5.5 12.7239 6.18482 14.3772 7.40381 15.5962C8.62279 16.8152 10.2761 17.5 12 17.5C13.7239 17.5 15.3772 16.8152 16.5962 15.5962C17.8152 14.3772 18.5 12.7239 18.5 11"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M12 21V19"
            strokeWidth={2}
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>

);

export default MicSvg;
