import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(

    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>
  
  ){}

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto );
      return pokemon;
      
    } catch (error) {
      this.handleExceptions(error);
    }

  }

  findAll() {
    return this.pokemonModel.find()
  }

  async findOne(term: string) {
    
    let pokemon:Pokemon;

    if(!isNaN(+term) ){ // si es un numero 
      pokemon = await this.pokemonModel.findOne({ no: term })
    }

    if ( !pokemon && isValidObjectId(term) ){// si es un id de mongo
      pokemon = await this.pokemonModel.findById(term);
    }

    if ( !pokemon ){// si es un nombre de pokemon 
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() })
    }

    if (!pokemon) // si no se encontro nada 
      throw new NotFoundException(`Pokemon with id, name or no "${ term }" not found`); 

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne(term);   
    if ( updatePokemonDto.name )
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemon.updateOne( updatePokemonDto);      
      return {...pokemon.toJSON(), ...updatePokemonDto};
      
    } catch (error) {
      this.handleExceptions(error);
    }

    
  }

  async remove(id: string) {
    
    // const pokemon = await this.findOne(id)
    // await pokemon.deleteOne();
    // return {id};
    // const result = await this.pokemonModel.findByIdAndDelete( id );
    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id}); // Tener cuidado con delete MANY
    if ( deletedCount === 0 )
      throw new BadRequestException(`Pokemon with id "${id}" not found`);

    return;
  }


  private handleExceptions (error: any){
    if( error.code === 11000 ){
      throw new BadRequestException(`Pokemon exists in DB ${JSON.stringify(error.keyValue)}`)
    }
    console.log(error);
    throw new InternalServerErrorException('Error creating pokemon - Check server logs');
  }
}
