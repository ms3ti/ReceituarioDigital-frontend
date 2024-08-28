import { Global } from "@emotion/react";
export const Fonts = () => (
    <Global
        styles={`
          @font-face {
            font-family: 'Avenir-Black';
            font-style: normal;
            src: url('./fonts/Avenir/AvenirLTStd-Black.otf') format('otf');
          }
          @font-face {
            font-family: 'Avenir-Light';
            font-style: normal;
            src: url('./fonts/Avenir/AvenirLTStd-Light.otf') format('otf');
          }
          `}
    />
);
