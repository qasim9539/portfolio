import mongoose from "mongoose";

const TimelineSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title required"],
    },
    description: {
        type: String,
        required: [true, "Description required"],
    },
    timeline: {
        from: {
            type: String,
            required: [true, "Timeline starting date required"],
        },
        to: String
    }
})

export const Timeline = mongoose.model("Timeline", TimelineSchema)