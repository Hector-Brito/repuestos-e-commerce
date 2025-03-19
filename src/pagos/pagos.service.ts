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

    async create(pedidoId:number,createPagoDto:CreatePagoDto){
        const pedido = await this.pedidosService.findOne(pedidoId)
        if (pedido.pago != null){
            throw new ForbiddenException('Un pago ya ha sido asignado a este pedido')
        }
        const pago = this.pagosRepository.create({...createPagoDto})
        pedido.pago = pago
        return await this.pedidosService.save(pedido)
    }

    async findAll(){
        return await this.pagosRepository.find({})
    }

    async findOne(id:number){
        return await this.pagosRepository.findOneByOrFail({id:id})
        
    }

    async update(pedidoId:number,updatePagoDto:UpdatePagoDto){
        const pedido = await this.pedidosService.findOne(pedidoId)
        Object.assign(pedido.pago,updatePagoDto)
        return await this.pedidosService.save(pedido)
        
    }

    async remove(pedidoId:number){
        const pedido = await this.pedidosService.findOne(pedidoId)
        if (pedido.pago){
            const pago = pedido.pago
            return await this.pagosRepository.remove(pago)
        }
        throw new ConflictException('El pedido no tiene un pago')
    }
        
}