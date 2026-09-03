import mongoose, {Schema,type Model, Types} from "mongoose";

export interface Questions{
          questionDescription:string
          subTopicId:Types.ObjectId
          order:string
          createdAt?: Date;
          updatedAt?: Date;
}

const QuestionSchema = new Schema<Questions>({
          questionDescription:{
                    type:String,
                    required:true,
                    trim:true
          },
          subTopicId:{
                    type:Schema.Types.ObjectId,
                    ref:"SubTopic",
                    required:true,
          },
          order:{
                    type:String,
                    required:true
          }
},{timestamps:true})

export const Question: Model<Questions> = mongoose.model<Questions>("Question",QuestionSchema)