import { Select as ChakraSelect } from "@chakra-ui/react";

interface Props {
    placeholder: string;
    options: string[];
    id: string;
    name: string;
    onChange: any;
    value: string | undefined;
    width?:
        | string
        | number
        | {
              base: string;
              md: string;
          };
    disabled?: boolean;
}

export function Select({
    placeholder,
    options = [],
    id,
    name,
    onChange,
    value,
    width,
    disabled = false,
}: Props) {
    return (
        <ChakraSelect
            placeholder={placeholder}
            border="1px solid #7D899D"
            borderColor="#7D899D"
            background="white"
            borderRadius="8px"
            boxShadow="2px 3px 15px rgba(64, 70, 82, 0.05);"
            margin="5px"
            marginRight={-1}
            color="gray.200"
            id={id}
            name={name}
            onChange={onChange}
            _placeholder={{
                color: "#94A0B4",
            }}
            value={value}
            height="49px"
            width={width != null ? width : { base: "100%", md: "98%" }}
            disabled={disabled}
        >
            {options.map((option) => (
                <option value={option} key={option}>
                    {option}
                </option>
            ))}
        </ChakraSelect>
    );
}
