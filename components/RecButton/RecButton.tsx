import { Pressable } from 'react-native';
import SvgWrapper from '../SVG/SvgWrapper';
import MicSvg from '../SVG/recording/Mic';
import BouncingLoader from './BouncingLoader';


const RecButton = ({
    startRecording = () => { },
    stopRecording = () => { },
    disabled = false,
    isLoading = false,
}) => {
    return (
        <Pressable
            className={`w-40 h-40 rounded-full flex items-center justify-center bg-red-600`}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={disabled}
        >
            {isLoading ?
                <BouncingLoader /> :
                <SvgWrapper svgComponent={MicSvg} containerStyle={{
                    width: '50%',
                    height: '50%'
                }} />
            }
        </Pressable>
    );
};

export default RecButton;