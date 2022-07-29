import 'dotenv/config'

export default {
    mongodb: {
        mongo: process.env.MONGO,
        db: process.env.DB,
        collectionMessage: process.env.COLLECTION
    }
}