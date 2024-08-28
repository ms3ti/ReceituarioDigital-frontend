import {
    Box,
    Button as ChakraButton,
    Flex,
    MenuItem,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
} from "@chakra-ui/react";
import { isCEP } from "brazilian-values";
import { useFormik } from "formik";
import { useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { IAddressOwnerAddressPayloadDto } from "../../interfaces/address/address.ownerAddress.payload.dto";
import { ICreateAddressPayloadDto } from "../../interfaces/address/create.address.payload.dto";
import { editAddress } from "../../services/editAddress";
import { removeImage } from "../../services/removeImage";
import { saveImage } from "../../services/saveImage";
import { getAddress } from "../../services/viaCep";
import { localStorageKeys } from "../../utils/enum/localStorageKeys.enum";
import { asyncLocalStorage } from "../../utils/fetchLocalStorageData";
import { removeMask } from "../../utils/removeMask";
import { ufs } from "../../utils/uf";
import { BoxTitle } from "../BoxTitle";
import { Button } from "../Button";
import { CompanyLogo } from "../CompanyLogo";
import { FormError } from "../FormError";
import { Input } from "../Input";
import { Select } from "../Select";
import { ToastMessage } from "../ToastMessage";

interface Props {
    address: IAddressOwnerAddressPayloadDto;
    onOpen: () => void;
    isOpen: boolean;
    onClose: () => void;
    updateList: () => Promise<void>;
}

export function EditAddress({
    address,
    isOpen,
    onOpen,
    onClose,
    updateList,
}: Props) {
    const [disableByCEP, setDisableByCEP] = useState(false);
    const [loading, setLoading] = useState(false);
    const [, forceUpdate] = useReducer((x) => Number(x) + 1, 0);
    const initialValueImage =
        address?.imageUrl?.length > 0 ? [{ data_url: address.imageUrl }] : [];
    const [image, setImage] = useState(initialValueImage as any);
    const [shouldUpdateImage, setShouldUpdateImage] = useState(false);
    const validationSchema = Yup.object().shape({
        ownerPhone: Yup.string().required("O número é obrigatório"),
        ownerName: Yup.string().required("O nome da empresa é obrigatório"),
        cep: Yup.string()
            .min(8, "O CEP deve conter no mínimo 8 caracteres")
            .required("O CEP é obrigatório")
            .test("is-cep", "CEP inválido", (value) => isCEP(String(value))),
        state: Yup.string().required("O estado é obrigatório"),
        city: Yup.string().required("A cidade é obrigatório"),
        street: Yup.string().required("A rua é obrigatório"),
        district: Yup.string().required("O bairro é obrigatório"),
        number: Yup.string().required("O número é obrigatório"),
    });
    const formik = useFormik({
        initialValues: {
            ...address,
            personId: 0,
        },
        validateOnChange: true,
        validationSchema,
        onSubmit: async (values: ICreateAddressPayloadDto) => {
            try {
                setLoading(true);
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
                values.personId = Number(personId);
                await editAddress(values);
                if (shouldUpdateImage) {
                    const doctorId = await asyncLocalStorage.getItem(
                        localStorageKeys.DOCTOR_ID,
                    );
                    if (image[0]?.data_url.length > 0) {
                        await saveImage(
                            address.ownerAddressId,
                            Number(doctorId),
                            {
                                data_url: image[0]?.data_url,
                            },
                        );
                    } else {
                        await removeImage(address.ownerAddressId);
                    }
                }
                setLoading(false);
                onClose();
                await updateList();
                toast.success(
                    <ToastMessage
                        title="Alterado"
                        description="Endereço alterado com sucesso!"
                    />,
                );
            } catch (error) {
                setLoading(false);
                toast.error(
                    <ToastMessage
                        title="Erro"
                        description="Erro ao alterar o endereço!"
                    />,
                );
            }
        },
    });

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!image[0]?.data_url?.includes("mrd-bucket")) {
            setShouldUpdateImage(true);
        }
    }, [image]);

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
            <ChakraButton
                height="max-content"
                margin={0}
                padding={0}
                width="100%"
            >
                <MenuItem
                    onClick={onOpen}
                    width="100%"
                    _hover={{
                        background: "gray.500",
                    }}
                    _active={{
                        background: "gray.500",
                    }}
                >
                    <i
                        className="ri-edit-line"
                        style={{ color: "#7D899D" }}
                    ></i>
                    <Text marginLeft="8px">Visualizar / Editar</Text>
                </MenuItem>
            </ChakraButton>
            <Modal
                isOpen={isOpen}
                onClose={() => {
                    formik.resetForm();
                    onClose();
                }}
                motionPreset="slideInBottom"
                size={{ base: "full", md: "xl" }}
                scrollBehavior="inside"
            >
                <form onSubmit={formik.handleSubmit}>
                    <ModalOverlay />
                    <ModalContent backgroundColor="white">
                        <ModalHeader boxShadow="inset 0px -1px 0px #EDEDF3">
                            Editar endereço
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
                                            formik.errors?.ownerName,
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
                                            formik.errors?.ownerPhone,
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
                                                    formik.errors?.cep,
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
                                                    formik.errors?.state,
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
                                        message={String(formik.errors?.street)}
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
                                        message={String(formik.errors?.city)}
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
                                            formik.errors?.district,
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
                                        message={String(formik.errors?.number)}
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
                            <CompanyLogo image={image} setImage={setImage} />
                        </ModalBody>

                        <ModalFooter width="100%">
                            <Button
                                disable={loading || !formik.isValid}
                                isLoading={loading}
                                bgColor="#D72A34"
                                textColor="#FFFFFF"
                                fontSize={14}
                                hasIcon={false}
                                text="Continuar"
                                type="submit"
                                onClick={() => {}}
                            />
                        </ModalFooter>
                    </ModalContent>
                </form>
            </Modal>
        </>
    );
}
