import { ICreatePersonDto } from "../person/create.person.dto";

export interface ICreateAdminDto extends ICreatePersonDto {
    password: string;
}
