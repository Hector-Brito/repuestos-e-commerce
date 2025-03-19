
import { IsEnum, IsNumberString, Length} from "class-validator";
import { FormaDePago } from "../enum/formaDePago.enum";


export class CreatePagoDto{
    
    @IsEnum(FormaDePago)
    nombreFormaDePago:FormaDePago

    @IsNumberString()
    @Length(13)
    numeroReferencia:string

}