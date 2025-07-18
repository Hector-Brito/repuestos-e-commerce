import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MetodoDePagoEntity } from "./entities/metodosDePago.entity";
import { CreateMetodoDePagoDto } from "./dto/create-metodoDePago.dto";



@Injectable()
export class MetodosDePagoService{
    
    constructor(
        @InjectRepository(MetodoDePagoEntity) private readonly metodosDePagoRepository:Repository<MetodoDePagoEntity>
    ){}

    /**
    * Crea un metodo de pago. 
    * @param metodoDePagoDto
    * @returns 
    */
    async create(createMetodoDePagoDto:CreateMetodoDePagoDto){
        const metodoDePago = this.metodosDePagoRepository.create({...createMetodoDePagoDto})
        return await this.metodosDePagoRepository.save(metodoDePago)
    }

    /**
    * Elimina un metodo de pago por ID. 
    * @param metodoDePagoDto
    * @returns 
    */
    async remove(id:number){
        const metodoDePago = await this.metodosDePagoRepository.findOneByOrFail({id:id})
        return await this.metodosDePagoRepository.remove(metodoDePago) 
    }

     /**
    * Obtiene todos los metodos de pago. 
    * @returns 
    */
    async findAll(){
        return await this.metodosDePagoRepository.find({})
    }
    
}