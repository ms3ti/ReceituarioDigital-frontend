import { Box, Flex, Text } from "@chakra-ui/react";
import { BoxTitle } from "..";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { Dispatch, SetStateAction } from "react";

interface Props {
    setImage: Dispatch<SetStateAction<never[]>>;
    image: never[];
}

export function CompanyLogo({ setImage, image }: Props) {
    const maxNumber = 1;

    const onChange = (
        imageList: ImageListType,
        addUpdateIndex: number[] | undefined,
    ) => {
        setImage(imageList as never[]);
    };
    return (
        <Box
            backgroundColor={"#F7F8FA"}
            padding="15px"
            width="100%"
            marginBottom="20px"
        >
            <BoxTitle text="Logo da empresa" />

            <ImageUploading
                value={image}
                onChange={onChange}
                maxNumber={maxNumber}
                dataURLKey="data_url"
                resolutionWidth={30}
                resolutionHeight={30}
                acceptType={["jpg", "jpeg", "png"]}
                maxFileSize={5242880}
            >
                {({
                    imageList,
                    onImageUpload,
                    onImageRemoveAll,
                    onImageUpdate,
                    onImageRemove,
                    isDragging,
                    dragProps,
                }) => (
                    <>
                        <Box
                            width="100%"
                            backgroundColor="white"
                            padding="20px"
                            marginTop="15px"
                            marginBottom="15px"
                            textAlign="center"
                            border="1px dashed #EDEDF3"
                            boxShadow="2px 3px 15px rgba(64, 70, 82, 0.05)"
                            borderRadius="8px"
                            onClick={
                                image.length > 0 ? () => {} : onImageUpload
                            }
                            {...dragProps}
                            cursor="pointer"
                        >
                            {image.length > 0 ? null : (
                                <>
                                    <Text color="#202D46">
                                        Arraste e solte a logo aqui
                                    </Text>
                                    <Text color="#7D899D">ou</Text>
                                    <Flex placeContent="center">
                                        <i
                                            className="ri-upload-cloud-2-line"
                                            style={{
                                                color: "#D72A34",
                                                marginRight: "5px",
                                            }}
                                        ></i>
                                        <Text
                                            color="#D72A34"
                                            textAlign="center"
                                        >
                                            {" "}
                                            Carregue imagem
                                        </Text>
                                    </Flex>
                                </>
                            )}
                            {image.map((img: any) => (
                                <Flex
                                    key={img}
                                    justifyContent="center"
                                    alignContent="center"
                                    alignItems="center"
                                >
                                    <img
                                        src={img.data_url}
                                        alt="Logo selecionada"
                                    />
                                </Flex>
                            ))}
                            {image.length > 0 ? (
                                <Text
                                    color="#D72A34"
                                    textAlign="center"
                                    onClick={() => {
                                        onImageRemoveAll();
                                        setImage([] as any);
                                    }}
                                    cursor="pointer"
                                    marginTop="10px"
                                    _hover={{
                                        textDecoration: "underline",
                                    }}
                                >
                                    Remover
                                </Text>
                            ) : null}
                        </Box>
                    </>
                )}
            </ImageUploading>

            <Text color="#7D899D" fontSize="13px" textAlign="center">
                Dica para as imagens utilizadas: sem fundo e sem borda; deve ter
                79x79 pixels; deve ser em JPEG ou PNG.
            </Text>
        </Box>
    );
}
