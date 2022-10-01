import {
  AllowNull,
  Column,
  CreatedAt,
  DataType,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({ timestamps: true })
export class Sensor extends Model<Sensor> {
  @AllowNull(false)
  @Unique(true)
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id!: string;

  @AllowNull(false)
  @Column({ type: DataType.DOUBLE })
  soilEc!: number;

  @AllowNull(false)
  @Column({ type: DataType.DOUBLE })
  soilTemp!: number;

  @AllowNull(false)
  @Column({ type: DataType.DOUBLE })
  soilHum!: number;

  @AllowNull(false)
  @Column({ type: DataType.DOUBLE })
  airTemp!: number;

  @AllowNull(false)
  @Column({ type: DataType.DOUBLE })
  airHum!: number;

  @AllowNull(false)
  @Column({ type: DataType.DOUBLE })
  solar!: number;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
