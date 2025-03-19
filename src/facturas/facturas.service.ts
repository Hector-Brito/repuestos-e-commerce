import { ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FacturaEntity } from "./entities/factura.entity";
import { Repository } from "typeorm";
import { CreateFacturaDto } from "./dto/create-factura.dto";
import { PedidosService } from "src/pedidos/pedidos.service";
import { UpdateFacturaDto } from "./dto/update-factura.dto";


@Injectable()
export class FacturasService{
    constructor(
        @InjectRepository(FacturaEntity) private readonly facturaRepository:Repository<FacturaEntity>,
        private readonly pedidosService:PedidosService,
    ){}

    async create(createFacturaDto:CreateFacturaDto){
        const pedido = await this.pedidosService.findOne(createFacturaDto.pedidoId)
        if (!pedido.pago){
            throw new ConflictException(`El pedido de ID ${pedido.id} no tiene un pago para ser facturado.`)
        }
        const factura = this.facturaRepository.create({...createFacturaDto})
        factura.pago = pedido.pago
        factura.pedido = pedido
        return await this.facturaRepository.save(factura)
    }

    async findAll(){
        return await this.facturaRepository.find({})
    }

    async findOne(id:number){
        return await this.facturaRepository.findOneByOrFail({id:id})
    }

    async update(id:number,updateFacturaDto:UpdateFacturaDto){
        const factura = await this.findOne(id)
        Object.assign(factura,updateFacturaDto)
        return await this.facturaRepository.save(factura)
    }

    async remove(id:number){
        const factura = await this.findOne(id)
        return await this.facturaRepository.remove(factura)
    }
}