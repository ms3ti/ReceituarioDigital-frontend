import { useState } from "react";
import {
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input as ChakraInput,
    InputGroup,
    InputRightElement,
    Box,
} from "@chakra-ui/react";
import InputMask from "react-input-mask";

interface Props {
    placeholder: string;
    value: string | number | readonly string[] | undefined;
    type?: string;
    onChange: any;
    required?: boolean;
    id?: string;
    name?: string;
    readOnly?: boolean;
    width?: string | number | object;
    margin?: string | number;
    validation?: boolean;
    errorMessage?: string;
    mask?: string;
    maxLength?: number;
    isPassword?: boolean;
    icon?: any;
    onKeyPress?: (e: any) => void;
}

export function InputIcon({
    placeholder,
    value,
    type = "text",
    onChange,
    required = false,
    id,
    name,
    readOnly = false,
    width = "100%",
    validation,
    margin = "5px",
    errorMessage,
    mask = "",
    maxLength,
    isPassword = true,
    icon,
    onKeyPress,
}: Props) {
    const [show, setShow] = useState<boolean>(false);
    const handleClick = () => setShow(!show);
    const passwordIcon = !show ? (
        <i style={{ color: "gray.300" }} className="ri-eye-close-line"></i>
    ) : (
        <i style={{ color: "gray.300" }} className="ri-eye-line"></i>
    );
    const switchType = show ? "text" : "password";
    return (
        <FormControl
            variant="floating"
            isInvalid={String(value).length > 0 ? validation : undefined}
        >
            <InputGroup>
                <ChakraInput
                    required={required}
                    placeholder={" "}
                    border={"1px solid #7D899D;"}
                    background="white"
                    width={width}
                    borderRadius="8px"
                    boxShadow="2px 3px 15px rgba(64, 70, 82, 0.05);"
                    margin={margin}
                    value={value}
                    onChange={onChange}
                    id={id}
                    name={name}
                    onKeyPress={onKeyPress}
                    readOnly={readOnly}
                    type={isPassword ? switchType : "text"}
                    height="49px"
                    paddingTop="10px"
                    as={String(mask).length > 0 ? InputMask : undefined}
                    mask={String(mask)}
                />
                <FormLabel fontWeight={400} color="gray.200" fontSize="15px">
                    {placeholder}
                </FormLabel>
                <FormErrorMessage marginLeft="10px" marginBottom="15px">
                    {errorMessage}
                </FormErrorMessage>
                <InputRightElement py={8} px={7} _hover={{ cursor: "pointer" }}>
                    <Box onClick={handleClick}>
                        {isPassword ? passwordIcon : icon}
                    </Box>
                </InputRightElement>
            </InputGroup>
        </FormControl>
    );
}
