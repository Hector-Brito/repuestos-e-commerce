import { BadRequestException, ConflictException, Injectable, NotFoundException, Req } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PedidoEntity } from './entities/pedido.entity';
import { Equal, Repository } from 'typeorm';
import { PedidoItemService } from './pedidoItem.service';
import { PedidoItemEntity } from './entities/pedidoItem.entity';
import { CreatePedidoItemDto } from './dto/create-pedido-item.dto';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Rol } from 'src/usuarios/enum/rol.enum';



@Injectable()
export class PedidosService {

  constructor(
    @InjectRepository(PedidoEntity) private readonly pedidoRepository:Repository<PedidoEntity>,
    private readonly pedidoItemService:PedidoItemService,
    private readonly usuariosService:UsuariosService,
  ){}

  async create(user:{sub:number,username:string,role:Rol,profileId:number},createPedidoDto: CreatePedidoDto) {
    const createPedidoItemsDtos:CreatePedidoItemDto[] = createPedidoDto.items
    const pedidoItems:PedidoItemEntity[] = await Promise.all( createPedidoItemsDtos.map(async(item) => {
      const pedidoItem = await this.pedidoItemService.create(item)
      return pedidoItem
    }))
    
    const pedido = this.pedidoRepository.create(
      {
        tipoDePedido:createPedidoDto.tipoDePedido,
        pagado:createPedidoDto.pagado ?? false,
        estado:createPedidoDto.estado ?? undefined,
      }
    )
    const usuario = await this.usuariosService.findOne(user.sub)
    if (user.role === Rol.User){
      if (usuario.perfil === null) throw new ConflictException('Es necesario tener un perfil para crear un pedido.')
      pedido.perfil = usuario.perfil
      
    }
    if(user.role === Rol.Seller || user.role === Rol.Admin){
      if (!(typeof createPedidoDto.perfilId === 'number'))throw new ConflictException('Es necesario un perfilId para crear el pedido.')
      const perfil = await this.usuariosService.findOnePerfil(createPedidoDto.perfilId)
      pedido.vendedor = usuario
      pedido.perfil = perfil
    }
    
    pedido.items = pedidoItems
    return await this.pedidoRepository.save(pedido,{reload:true})
  }

  async findAll() {
    const pedidos = await this.pedidoRepository.find(
      {
        relations:{
          perfil:true,
          items:{
            producto:true
          },
          envios:true
        }
      }
    )
    pedidos.map((pedido) => pedido['precioTotal'] = pedido.getTotalPrice())
    return pedidos
  }

  

  async findOne(id: number) {
    const pedido = await this.pedidoRepository.findOneOrFail({where:{id:id},relations:{items:{producto:true}}})
    pedido['precioTotal'] = pedido.getTotalPrice()
    return pedido
  }


  async findOwnPedidos(user:{sub:number,username:string,role:Rol,profileId:number}){
    const usuarioPedidos = await this.pedidoRepository.find(
      {
        where:{
          perfil:{
            id:user.profileId
          }
        },
        order:{
          fecha:'DESC'
        }
      }
    )

    return usuarioPedidos
  }

  async findOwnVentas(user:{sub:number,username:string,role:Rol,profileId:number}){
    const usuarioVentas = await this.pedidoRepository.find(
      {
        where:{
          vendedor:{
            id:user.sub
          }
        },
        order:{
          fecha:'DESC'
        }
      }
    )
    return usuarioVentas
  }

  async findOwnOne(user:{sub:number,username:string,role:Rol,profileId:number},id:number){
    const pedido = await this.pedidoRepository.findOneOrFail(
      {
        where:{
          id:id,
          perfil:{
            id:user.profileId
          }
        },
        relations:{
          envios:true,
          pago:true,
          items:{
            producto:true
          }
        }
      }
    )
    pedido['precioTotal'] = pedido.getTotalPrice()
    return pedido
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto) {
    const pedido = await this.findOne(id)
    const pedidoItemIds = pedido.items.map((item) => item.id)
    const {items,...pedidoData} = updatePedidoDto
    Object.assign(pedido,pedidoData)
    const updatedPedido = await this.pedidoRepository.save(pedido)

    const updatedItems:Promise<PedidoItemEntity>[] | undefined = items?.map(async (item)=>{
      if (pedidoItemIds.includes(item.pedidoItemId)){
        const pedidoItem = await this.pedidoItemService.update(item.pedidoItemId,item)
        return pedidoItem
      }
      throw new NotFoundException(`item con el id ${item.pedidoItemId} no se encuentra en el pedido con id ${pedido.id}, solo las ids ${pedidoItemIds} estan relacionadas.`)
      
    })

    if (updatedItems){
        updatedPedido.items = await Promise.all(updatedItems)
    }

    return updatedPedido
  }

  async addPedidoItems(pedidoId:number,createPedidoItemsDtos:CreatePedidoItemDto[]){
    const pedido = await this.findOne(pedidoId)
    const productIds = pedido.items.map((item) =>{
      return item.producto.id
    } )
    const pedidoItems:PedidoItemEntity[] = await Promise.all( createPedidoItemsDtos.map(async (item) => {
      if (productIds.includes(item.productoId)){
        throw new BadRequestException(`Producto con id ${item.productoId} ya existe en el pedido, solo las los productos con id ${productIds} estan relacionados.`)
      }
      const pedidoItem = await this.pedidoItemService.create(item)
      pedidoItem.pedido = pedido
      return await this.pedidoItemService.save(pedidoItem)
    }))
    return pedidoItems

  }

  async removePedidoItems(pedidoId:number,itemsIds:number[]){
    const pedido = await this.findOne(pedidoId)
    const pedidoItemsIds = pedido.items.map((item) => item.id)
    const deletedPedidoItems:(PedidoItemEntity | undefined)[] = await Promise.all(itemsIds.map(async (itemId) => {
      if (pedidoItemsIds.includes(itemId)){
        return await this.pedidoItemService.remove(itemId)
      }
      throw new BadRequestException(`Item con el id ${itemId} no existe en pedido con id ${pedido.id}, solo los items con id ${pedidoItemsIds} estan relacionados.`)
    }))
    return deletedPedidoItems
  }

  async save(pedidoEntity:PedidoEntity){
    return await this.pedidoRepository.save(pedidoEntity)
  }

  async remove(id: number) {
    const pedido = await this.findOne(id)
    return await this.pedidoRepository.remove(pedido)
  }
}
