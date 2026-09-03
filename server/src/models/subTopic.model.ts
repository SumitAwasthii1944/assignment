import mongoose, {Schema,type Model, Types} from "mongoose";

export interface SubTopics{
          subTopicName:string
          topicId:Types.ObjectId
          order:string
          createdAt?: Date;
          updatedAt?: Date;
}

const SubTopicSchema = new Schema<SubTopics>({
          subTopicName:{
                    type:String,
                    required:true,
                    trim:true
          },
          topicId:{
                    type:Schema.Types.ObjectId,
                    ref:"Topic",
                    required:true,
                    index:true
          },
          order:{
                    type:String,
                    required:true
          }
},{timestamps:true})

export const SubTopic: Model<SubTopics> = mongoose.model<SubTopics>("SubTopic",SubTopicSchema)
