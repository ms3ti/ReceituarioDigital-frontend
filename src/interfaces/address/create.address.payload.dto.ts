import { ICreateAddressDto } from "./create.address.dto";

export interface ICreateAddressPayloadDto extends ICreateAddressDto {
    personId: number;
}
