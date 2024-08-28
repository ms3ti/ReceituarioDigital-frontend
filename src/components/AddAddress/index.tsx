import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Box,
    Flex,
} from "@chakra-ui/react";
import { isCEP } from "brazilian-values";
import { useFormik } from "formik";
import { useReducer, useState } from "react";
import { toast } from "react-toastify";
import { ICreateAddressPayloadDto } from "../../interfaces/address/create.address.payload.dto";
import { getAddress } from "../../services/viaCep";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { removeMask } from "../../utils/removeMask";
import { ufs } from "../../utils/uf";
import { BoxTitle } from "../BoxTitle";
import { Button } from "../Button";
import { Input } from "../Input";
import { Select } from "../Select";
import { ToastMessage } from "../ToastMessage";
import * as Yup from "yup";
import { FormError } from "../FormError";
import { CompanyLogo } from "..";
import { ICreatedAddressDto } from "../../interfaces/address/created.address.dto";

interface Props {
    addAddress: (
        values: ICreateAddressPayloadDto,
        image: any,
    ) => Promise<ICreatedAddressDto>;
}

export function AddAddress({ addAddress }: Props) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [disableByCEP, setDisableByCEP] = useState(false);
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);
    const [image, setImage] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const validationSchema = Yup.object().shape({
        ownerName: Yup.string().required("O nome da empresa é obrigatório"),
        ownerPhone: Yup.string().required("O número é obrigatório"),
        cep: Yup.string().required("O CEP é obrigatório"),
        state: Yup.string().required("O estado é obrigatório"),
        city: Yup.string().required("A cidade é obrigatório"),
        street: Yup.string().required("A rua é obrigatório"),
        district: Yup.string().required("O bairro é obrigatório"),
        number: Yup.string().required("O número é obrigatório"),
        ownerPhone2: Yup.string()
            .nullable()
            .transform((value, originalValue) =>
                originalValue.trim() === "" ? null : value,
            )
            .test(
                "len",
                "O número precisa ter no mínimo 10 caracteres",
                (value) => !value || value.length >= 11,
            ),
    });

    const formik = useFormik({
        initialValues: {
            ownerName: "",
            cnpj: "",
            ownerEmail: "",
            ownerPhone: "",
            ownerPhone2: "",
            cep: "",
            state: "",
            street: "",
            city: "",
            complement: "",
            district: "",
            number: "",
            personId: 0,
            isDefault: false,
        },
        validateOnChange: true,
        validationSchema,
        onSubmit: async (values: ICreateAddressPayloadDto) => {
            try {
                setLoading(true);
                // Validações

                if (!isCEP(String(values.cep))) {
                    toast.error(
                        <ToastMessage
                            title="Erro"
                            description="O CEP deve ser válido"
                        />,
                    );
                    setLoading(false);
                    return;
                }

                const personId = await asyncLocalStorage.getItem(
                    localStorageKeys.PERSON_ID,
                );

                values.cnpj = removeMask.cnpj(String(values?.cnpj));
                values.cep = removeMask.cep(values.cep);
                values.ownerPhone = removeMask.ownerPhone(
                    String(values.ownerPhone),
                );
                values.ownerPhone2 = removeMask.ownerPhone(
                    String(values.ownerPhone2),
                );

                values.personId = Number(personId?.replaceAll('"', ""));
                await addAddress(values, image);
                if (image.length > 0) {
                    setImage([]);
                }
                setLoading(false);
                toast.success(
                    <ToastMessage
                        title="Criado"
                        description="Novo endereço criado com sucesso!"
                    />,
                );
                formik.resetForm();
                setImage([]);
                onClose();
            } catch (error) {
                toast.error(
                    <ToastMessage
                        title="Erro"
                        description="Erro ao criar um novo endereço!"
                    />,
                );
                setLoading(false);
            }
        },
    });

    async function handleGetAddres(value: string) {
        const result = await getAddress(value);
        if (!Object.prototype.hasOwnProperty.call(result, "erro")) {
            setDisableByCEP(true);
        } else {
            await formik.setFieldValue("cep", "");

            toast.error(
                <ToastMessage
                    title="Erro"
                    description="CEP inexistente, por favor adicione um cep válido."
                />,
            );
        }
        await formik.setFieldValue("city", result.localidade);
        await formik.setFieldValue("district", result.bairro);
        await formik.setFieldValue("street", result.logradouro);
        await formik.setFieldValue("complement", result.complemento);
        await formik.setFieldValue("state", result.uf);

        forceUpdate();
    }

    function handleChangeCEP(value: string) {
        const cep = value
            .replace("-", "")
            .replaceAll("_", "")
            .replaceAll(" ", "");
        if (cep.length === 8) {
            void handleGetAddres(cep);
        } else {
            setDisableByCEP(false);
        }
    }

    return (
        <>
            <Button
                onClick={onOpen}
                text="Adicionar endereço"
                textColor="red.100"
                bgColor="white.0"
                icon={
                    <i
                        className="ri-add-line"
                        style={{
                            color: "#D72A34",
                            fontWeight: 800,
                        }}
                    ></i>
                }
                border="1px solid rgba(215, 42, 52, 0.2)"
                hasIcon
                width="100%"
                height={47}
                fontSize={14}
            />

            <Modal
                isOpen={isOpen}
                onClose={() => {
                    formik.resetForm();
                    setImage([]);
                    onClose();
                }}
                motionPreset="slideInBottom"
                size={{ base: "full", md: "2xl" }}
                scrollBehavior="inside"
            >
                <form onSubmit={formik.handleSubmit}>
                    <ModalOverlay />
                    <ModalContent height="100%" backgroundColor="white">
                        <ModalHeader boxShadow="inset 0px -1px 0px #EDEDF3">
                            Adicionar endereço
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody padding={0}>
                            <Box
                                backgroundColor={"#F7F8FA"}
                                padding="15px"
                                width="100%"
                                marginBottom="20px"
                            >
                                <BoxTitle text="Dados da empresa" />
                                <Input
                                    placeholder="Nome fantasia"
                                    value={formik.values.ownerName}
                                    onChange={formik.handleChange}
                                    id="ownerName"
                                    name="ownerName"
                                />
                                {formik.values.ownerName === "" ? (
                                    <FormError
                                        message={String(
                                            formik?.errors?.ownerName,
                                        )}
                                    />
                                ) : null}
                                <Input
                                    placeholder="CNPJ"
                                    value={formik.values.cnpj}
                                    onChange={formik.handleChange}
                                    id="cnpj"
                                    name="cnpj"
                                    errorMessage="CNPJ Inválido"
                                    mask="99.999.999/9999-99"
                                    width="100%"
                                />

                                <Input
                                    placeholder="E-mail"
                                    value={formik.values.ownerEmail}
                                    onChange={formik.handleChange}
                                    id="ownerEmail"
                                    name="ownerEmail"
                                />
                                <Input
                                    placeholder="Telefone"
                                    value={formik.values.ownerPhone}
                                    onChange={formik.handleChange}
                                    id="ownerPhone"
                                    name="ownerPhone"
                                    mask={"(99) 999999999"}
                                />
                                {formik.values.ownerPhone === "" ? (
                                    <FormError
                                        message={String(
                                            formik?.errors?.ownerPhone,
                                        )}
                                    />
                                ) : null}

                                <Input
                                    placeholder="Telefone 2"
                                    value={formik.values.ownerPhone2}
                                    onChange={formik.handleChange}
                                    id="ownerPhone2"
                                    name="ownerPhone2"
                                    mask={"(99) 999999999"}
                                />

                                <FormError
                                    message={String(
                                        formik?.errors?.ownerPhone2,
                                    )}
                                />
                            </Box>
                            <Box
                                backgroundColor={"#F7F8FA"}
                                padding="15px"
                                width="100"
                                marginBottom="20px"
                            >
                                <BoxTitle text="Endereço da empresa" />
                                <Flex>
                                    <Flex
                                        flexDirection="column"
                                        flexWrap="wrap"
                                        width="100%"
                                    >
                                        <Input
                                            placeholder="CEP"
                                            value={formik.values.cep}
                                            onChange={(e: any) => {
                                                formik.handleChange(e);
                                                handleChangeCEP(e.target.value);
                                            }}
                                            id="cep"
                                            name="cep"
                                            width="98%"
                                            mask="99999-999"
                                        />
                                        {formik.values.cep === "" ? (
                                            <FormError
                                                message={String(
                                                    formik?.errors?.cep,
                                                )}
                                            />
                                        ) : null}
                                    </Flex>

                                    <Flex
                                        flexDirection="column"
                                        flexWrap="wrap"
                                        width="100%"
                                    >
                                        <Select
                                            placeholder="UF"
                                            options={ufs}
                                            value={formik.values.state}
                                            id="address.state"
                                            name="address.state"
                                            onChange={formik.handleChange}
                                            width="100%"
                                            disabled={disableByCEP}
                                        />
                                        {formik.values.state === "" ? (
                                            <FormError
                                                message={String(
                                                    formik?.errors?.state,
                                                )}
                                            />
                                        ) : null}
                                    </Flex>
                                </Flex>
                                <Input
                                    placeholder="Endereço"
                                    value={formik.values.street}
                                    onChange={formik.handleChange}
                                    id="street"
                                    name="street"
                                    maxLength={95}
                                />
                                {formik.values.street === "" ? (
                                    <FormError
                                        message={String(formik?.errors?.street)}
                                    />
                                ) : null}

                                <Input
                                    placeholder="Cidade"
                                    value={formik.values.city}
                                    onChange={(e: any) =>
                                        formik.handleChange(e)
                                    }
                                    id="city"
                                    name="city"
                                    disabled={disableByCEP}
                                    maxLength={35}
                                />
                                {formik.values.city === "" ? (
                                    <FormError
                                        message={String(formik?.errors?.city)}
                                    />
                                ) : null}

                                <Input
                                    placeholder="Bairro"
                                    value={formik.values.district}
                                    onChange={formik.handleChange}
                                    id="district"
                                    name="district"
                                    maxLength={50}
                                />

                                {formik.values.district === "" ? (
                                    <FormError
                                        message={String(
                                            formik?.errors?.district,
                                        )}
                                    />
                                ) : null}

                                <Input
                                    placeholder="Número"
                                    value={formik.values.number}
                                    onChange={formik.handleChange}
                                    id="number"
                                    name="number"
                                    maxLength={10}
                                />
                                {formik.values.number === "" ? (
                                    <FormError
                                        message={String(formik?.errors?.number)}
                                    />
                                ) : null}

                                <Input
                                    placeholder="Complemento"
                                    value={formik.values.complement}
                                    onChange={formik.handleChange}
                                    id="complement"
                                    name="complement"
                                    maxLength={20}
                                />
                            </Box>

                            <CompanyLogo setImage={setImage} image={image} />
                        </ModalBody>

                        <ModalFooter width="100%">
                            <Button
                                disable={!formik.isValid}
                                bgColor="#D72A34"
                                textColor="#FFFFFF"
                                isLoading={loading}
                                fontSize={14}
                                hasIcon={false}
                                text="Continuar"
                                type="submit"
                            />
                        </ModalFooter>
                    </ModalContent>
                </form>
            </Modal>
        </>
    );
}
