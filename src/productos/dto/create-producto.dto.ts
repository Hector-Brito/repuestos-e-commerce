import { Type } from "class-transformer";
import { IsUrl,IsString, IsOptional, IsBoolean, IsNumber, IsNotEmpty, Max, Min} from "class-validator";
import { CategoriaEntity } from "src/categorias/entities/categoria.entity";
import { IsInDatabase } from "src/custom-validators/IsInDatabase.validator";
import { UniqueInDatabase } from "src/custom-validators/UniqueInDatabase.validator";
import { ProductoEntity } from "../entities/producto.entity";

export class CreateProductoDto {

    @IsUrl()
    @IsOptional()
    image_url:string

    @IsString()
    @IsNotEmpty()
    @UniqueInDatabase(ProductoEntity,'nombre')
    nombre:string

    @IsString()
    @IsOptional()
    descripcion:string

    @IsBoolean()
    @IsOptional()
    disponible:boolean

    @IsNumber({maxDecimalPlaces:2})
    @IsOptional()
    @Max(100)
    @Min(0)
    @Type(() => Number)
    descuento:number

    @IsNumber({maxDecimalPlaces:2})
    @Min(0)
    @IsNotEmpty()
    @Type(() => Number)
    precio:number

    @IsBoolean()
    @IsOptional()
    aplicarDescuentoCategoria:boolean

    @IsNumber()
    @IsOptional()
    stock:number

    @IsInDatabase(CategoriaEntity,'id')
    @IsOptional()
    categoriaId?:number
}
