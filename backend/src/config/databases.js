import { Sequelize } from 'sequelize';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(process.env.POSTGRES_URL, {
  dialect: 'postgres', logging: false,
  retry: { max: 5 },
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
});

export async function connectDatabases() {
  await sequelize.authenticate();
  await mongoose.connect(process.env.MONGO_URL);
  console.log('Connected to PostgreSQL and MongoDB');
}
