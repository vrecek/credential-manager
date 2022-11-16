import mongoose from "mongoose"
import KVPType from "./KVPInterface"

const KVPSchema = new mongoose.Schema<KVPType>({
    name: String,
    m: String,
    p: String,
    additionalInfo: {
        type: String,
        default: null
    }
})

const KVP = mongoose.model<KVPType>('KVP', KVPSchema)

export default KVP

