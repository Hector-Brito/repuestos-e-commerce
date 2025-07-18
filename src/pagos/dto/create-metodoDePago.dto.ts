import { IsEmail, IsNumberString, IsString, MaxLength, MinLength } from "class-validator";
import { UniqueInDatabase } from "src/custom-validators/UniqueInDatabase.validator";
import { IsVePhoneNumber } from "src/usuarios/validators/numero-telefono.validator";
import { MetodoDePagoEntity } from "../entities/metodosDePago.entity";


export class CreateMetodoDePagoDto{
    
    @IsString()
    nombre:string

    @IsEmail()
    email:string

    @IsVePhoneNumber({message:'numeroTelefono debe cumplir el formato 04(12|16|26|14|24)-XXXXXXX'})
    @UniqueInDatabase(MetodoDePagoEntity,'numeroTelefono')
    numeroTelefono:string 

    @IsNumberString()
    @MinLength(7)
    @MaxLength(9)
    @UniqueInDatabase(MetodoDePagoEntity,'cedula')
    cedula:string

    @IsString()
    nombreDeTitular:string
}

