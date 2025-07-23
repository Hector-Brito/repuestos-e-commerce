import { IsEmail, IsEnum, IsNumberString, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { UniqueInDatabase } from "src/custom-validators/UniqueInDatabase.validator";
import { IsVePhoneNumber } from "src/usuarios/validators/numero-telefono.validator";
import { MetodoDePagoEntity } from "../entities/metodosDePago.entity";
import { TipoDeCuenta } from "../enum/tipoDeCuenta.enum";


export class CreateMetodoDePagoDto{
    
    @IsString()
    nombre:string

    @IsEmail()
    @IsOptional()
    email:string

    @IsVePhoneNumber({message:'numeroTelefono debe cumplir el formato 04(12|16|26|14|24)-XXXXXXX'})
    @UniqueInDatabase(MetodoDePagoEntity,'numeroTelefono')
    @IsOptional()
    numeroTelefono:string 

    @IsNumberString()
    @MinLength(7)
    @MaxLength(9)
    @UniqueInDatabase(MetodoDePagoEntity,'cedula')
    @IsOptional()
    cedula:string

    @IsString()
    nombreDeTitular:string

    @IsNumberString()
    @IsOptional()
    numeroDeCuenta:string
    
    @IsEnum(TipoDeCuenta)
    @IsOptional()
    tipoDeCuenta:TipoDeCuenta
    
}

