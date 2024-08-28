import { Button as ChakraButton, Text, Flex } from "@chakra-ui/react";

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
    width?: string | number | object;
    icon?: any;
    border?: string;
    borderColor?: string;
    disable?: boolean;
    fontWeight?: number;
    marginTop?: string;
    isLoading?: boolean;
    boxShadow?: string;
    borderRadius?: string;
    maxWidth?: string;
    marginRight?: string;
    paddingLeft?: string;
    marginBottom?: string;
}

export const Button = ({
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
    borderColor,
    disable,
    fontWeight,
    marginTop,
    isLoading = false,
    boxShadow,
    borderRadius,
    maxWidth,
    marginRight,
    paddingLeft,
    marginBottom,
}: Props) => {
    const iconSelected = hasIcon ? icon : undefined;

    return (
        <ChakraButton
            isLoading={isLoading}
            mx={1}
            colorScheme={bgColor}
            variant={variant}
            width={width}
            height={height}
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
            borderRadius={borderRadius}
            maxWidth={maxWidth}
            flexDirection={"column"}
            paddingLeft={paddingLeft}
            marginBottom={marginBottom}
        >
            <Flex justifyContent="center" alignItems="center">
                {iconSelected}
                <Text ml={2} fontSize={fontSize}>
                    {text}
                </Text>
            </Flex>
        </ChakraButton>
    );
};
