import * as React from "react";
import Svg, {
  SvgProps,
  G,
  Path,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
} from "react-native-svg";

export const SearchIcon = (props: SvgProps) => (
  <Svg width={14} height={14} fill="none" {...props}>
    <G clipPath="url(#a)">
      <Path
        fill="url(#b)"
        fillRule="evenodd"
        d="M2.75 6.417A3.667 3.667 0 1 1 9.076 8.94a1.01 1.01 0 0 0-.135.135 3.667 3.667 0 0 1-6.191-2.66Zm6.904 4.651a5.667 5.667 0 1 1 1.414-1.414l1.889 1.889a1 1 0 1 1-1.414 1.414l-1.89-1.889Z"
        clipRule="evenodd"
      />
    </G>
    <Defs>
      <LinearGradient
        id="b"
        x1={7}
        x2={7}
        y1={0.75}
        y2={13.25}
        gradientUnits="userSpaceOnUse"
      >
        <Stop stopColor="#61D9EB" />
        <Stop offset={1} stopColor="#63ECD2" />
      </LinearGradient>
      <ClipPath id="a">
        <Path fill="#fff" d="M0 0h14v14H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);
