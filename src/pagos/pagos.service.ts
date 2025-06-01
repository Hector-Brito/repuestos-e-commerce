import { ConflictException, ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PagoEntity } from "./entities/pago.entity";
import { Repository } from "typeorm";
import { PedidosService } from "../pedidos/pedidos.service";
import { CreatePagoDto } from "./dto/create-pago.dto";
import { UpdatePagoDto } from "./dto/update-pago.dto";


@Injectable()
export class PagosService{
    
    constructor(
        @InjectRepository(PagoEntity) private readonly pagosRepository:Repository<PagoEntity>,
        private readonly pedidosService:PedidosService
    ){}

    /**
     * Crea un pago y lo asigna a un pedido
     * @param pedidoId 
     * @param createPagoDto 
     * @returns 
     */
    async create(pedidoId:number,createPagoDto:CreatePagoDto){
        const pedido = await this.pedidosService.findOne(pedidoId)
        const pago = this.pagosRepository.create({...createPagoDto})
        pago.pedido = pedido
        return await this.pagosRepository.save(pago)
    }

    /**
     * Obtiene todos los pagos
     * @returns 
     */
    async findAll(){
        return await this.pagosRepository.find({})
    }

    /**
     * Obtiene un pago por id
     * @param id 
     * @returns 
     */
    async findOne(id:number){
        return await this.pagosRepository.findOneByOrFail({id:id})
        
    }

    /**
     * Actualiza los datos de un pago
     * @param pedidoId 
     * @param updatePagoDto 
     * @returns 
     */
    async update(id:number,updatePagoDto:UpdatePagoDto){
        const pago = await this.pagosRepository.findOneByOrFail({id:id})
        Object.assign(pago,updatePagoDto)
        return await this.pagosRepository.save(pago)    
    }

    /**
     * Elimina un pago
     * @param id 
     * @returns 
     */
    async remove(id:number){
        const pago = await this.pagosRepository.findOneByOrFail({id:id})//manejar error
        return await this.pagosRepository.remove(pago)
    }
        
}