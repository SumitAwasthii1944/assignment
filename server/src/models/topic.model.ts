import mongoose, {Schema,type Model, Types} from "mongoose";

export interface Topics{
          topicName:string
          order:string
          createdAt?: Date;
          updatedAt?: Date;
}

const TopicSchema=new Schema<Topics>({
          topicName:{
                    type:String,
                    required:true,
                    trim:true
          },
          order:{
                    type:String,
                    required:true
          },
},{timestamps:true})

export const Topic: Model<Topics> = mongoose.model<Topics>("Topic",TopicSchema)