import { Pressable } from 'react-native';
import SvgWrapper from './SVG/SvgWrapper';
import MicSvg from './SVG/recording/Mic';


const RecButton = ({
    startRecording = () => { },
    stopRecording = () => { }
}) => {
    return (
        <Pressable
            className={`w-40 h-40 rounded-full flex items-center justify-center bg-red-600`}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
        >
            <SvgWrapper svgComponent={MicSvg} containerStyle={{
                width: '50%',
                height: '50%'
            }}
            />
        </Pressable>
    );
};

export default RecButton;