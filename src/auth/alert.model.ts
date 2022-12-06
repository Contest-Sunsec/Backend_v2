import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { Users } from './auth.models';

@Table({ timestamps: true })
export class Alert extends Model<Alert> {
  @AllowNull(false)
  @Unique(true)
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string;

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  check!: boolean;

  @ForeignKey(() => Users)
  @Column(DataType.UUID)
  userId!: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;
}
