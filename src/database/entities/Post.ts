import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"
import { IPost } from "../../interface.js"

@Entity()
export class Post implements IPost{
    @PrimaryGeneratedColumn('uuid')
    id: number

    @Column( {type : 'text'} )
    title: string

    @Column( {type : 'text'} )
    text: string
}