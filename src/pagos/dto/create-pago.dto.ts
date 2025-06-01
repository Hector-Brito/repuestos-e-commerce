
import { IsEnum, IsNumberString, IsOptional, Length} from "class-validator";
import { FormaDePago } from "../enum/formaDePago.enum";


export class CreatePagoDto{
    
    @IsEnum(FormaDePago)
    nombreFormaDePago:FormaDePago

    @IsNumberString()
    @Length(13)
    @IsOptional()
    numeroReferencia:string

}