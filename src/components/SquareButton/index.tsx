import {
    Button as ChakraButton,
    Flex,
    Text,
    useMediaQuery,
} from "@chakra-ui/react";
import { TextAlign } from "../../types/textAlign";
import React from "react";

interface Props {
    text: string;
    bgColor: string;
    textColor: string;
    onClick?: any;
    fontSize: number | string;
    type?: "button" | "submit" | "reset" | undefined;
    hasIcon: boolean;
    variant?: string;
    height?: number | string;
    width?: string | number;
    icon?: React.ReactElement<any>;
    border?: string;
    borderColor?: string;
    disable?: boolean;
    fontWeight?: number;
    marginTop?: string;
    isLoading?: boolean;
    boxShadow?: string;
    borderRadius?: string;
    maxWidth?: string;
    cannotBeBeSquare?: boolean;
    marginRight?: string;
    paddingLeft?: string;
    inLine?: boolean;
    textAlign?: TextAlign;
    children?: any;
    _hover?: any;
}

export const SquareButton = ({
    text,
    bgColor,
    textColor,
    onClick,
    type = "submit",
    hasIcon,
    variant = "solid",
    width = "100vw",
    height,
    fontSize,
    icon,
    border,
    borderColor = "",
    disable,
    fontWeight,
    marginTop,
    isLoading = false,
    boxShadow,
    borderRadius,
    maxWidth,
    cannotBeBeSquare = true,
    marginRight,
    paddingLeft,
    textAlign = "center",
    inLine = true,
    _hover,
}: Props) => {
    const [isLargerThan800] = useMediaQuery("(min-width: 800px)");

    return (
        <ChakraButton
            textAlign={textAlign}
            isLoading={isLoading}
            mx={1}
            colorScheme={bgColor}
            variant={variant}
            width={
                isLargerThan800 && cannotBeBeSquare && inLine ? width : "120px"
            }
            height={
                isLargerThan800 && cannotBeBeSquare && inLine ? height : "92px"
            }
            bg={bgColor}
            color={textColor}
            onClick={onClick}
            marginRight={marginRight}
            type={type}
            border={border}
            borderColor={borderColor}
            disabled={disable}
            fontWeight={fontWeight}
            marginTop={marginTop}
            boxShadow={boxShadow}
            _hover={_hover}
            borderRadius={borderRadius}
            maxWidth={
                isLargerThan800 && cannotBeBeSquare && inLine
                    ? maxWidth
                    : "92px"
            }
            flexDirection={
                isLargerThan800 && cannotBeBeSquare ? undefined : "column"
            }
            whiteSpace={
                isLargerThan800 && cannotBeBeSquare ? undefined : "break-spaces"
            }
        >
            <Flex
                direction={isLargerThan800 ? "row" : "column"}
                alignItems={isLargerThan800 ? "center" : undefined}
            >
                {icon}
                <Text
                    marginLeft={isLargerThan800 ? "10px" : undefined}
                    fontSize={fontSize}
                >
                    {text}
                </Text>
            </Flex>
        </ChakraButton>
    );
};
