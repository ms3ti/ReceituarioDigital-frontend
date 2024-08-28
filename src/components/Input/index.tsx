import {
    FormControl,
    FormErrorMessage,
    FormLabel,
    Input as ChakraInput,
    Textarea,
} from "@chakra-ui/react";
import InputMask from "react-input-mask";
import { formatDateyyyyMMdd } from "../../utils/formatDateyyyyMMdd";
import { getSixMonthsAgo } from "../../utils/getSixMonthsAgo";

interface Props {
    placeholder: string;
    value: string | number | readonly string[] | undefined;
    type?: string;
    onChange: any;
    onBlur?: any;
    required?: boolean;
    id?: string;
    name?: string;
    readOnly?: boolean;
    width?:
        | string
        | number
        | {
              base: string;
              md: string;
          };
    margin?: string | number;
    validation?: boolean;
    errorMessage?: string;
    mask?: any;
    maxLength?: number;
    disabled?: boolean;
    min?: number;
    textArea?: boolean;
    paddingTopTextArea?: string;
    onClick?: any;
}

export function Input({
    placeholder,
    value,
    type = "text",
    onChange,
    onBlur,
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
    disabled,
    min = 2500,
    textArea = false,
    paddingTopTextArea = "10px",
    onClick,
}: Props) {
    return (
        <FormControl
            variant="floating"
            isInvalid={String(value).length > 0 ? validation : undefined}
        >
            {!textArea ? (
                <ChakraInput
                    onBlur={onBlur}
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
                    readOnly={readOnly}
                    type={type}
                    height="49px"
                    paddingTop="10px"
                    as={String(mask).length > 0 ? InputMask : undefined}
                    mask={String(mask)}
                    disabled={disabled}
                    maxLength={maxLength}
                    onClick={onClick}
                    maskChar=""
                    min={
                        type === "date"
                            ? formatDateyyyyMMdd(
                                  new Date(String(getSixMonthsAgo(min))),
                              )
                            : undefined
                    }
                    max={
                        type === "date"
                            ? formatDateyyyyMMdd(new Date().toString())
                            : undefined
                    }
                />
            ) : (
                <Textarea
                    onBlur={onBlur}
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
                    readOnly={readOnly}
                    type={type}
                    height="49px"
                    paddingTop={paddingTopTextArea}
                    as={String(mask).length > 0 ? InputMask : undefined}
                    mask={String(mask)}
                    disabled={disabled}
                    maxLength={maxLength}
                    min={
                        type === "date"
                            ? formatDateyyyyMMdd(
                                  new Date(String(getSixMonthsAgo(min))),
                              )
                            : undefined
                    }
                    max={
                        type === "date"
                            ? formatDateyyyyMMdd(new Date().toString())
                            : undefined
                    }
                    size="sm"
                    paddingLeft="15px"
                />
            )}

            <FormLabel fontWeight={400} color="gray.200" fontSize="15px">
                {placeholder}
            </FormLabel>
            <FormErrorMessage marginLeft="10px" marginBottom="15px">
                {errorMessage}
            </FormErrorMessage>
        </FormControl>
    );
}
