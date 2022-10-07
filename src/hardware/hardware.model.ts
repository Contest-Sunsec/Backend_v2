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
    type: DataType.STRING,
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

  @AllowNull(false)
  @Column({ type: DataType.DATE })
  uptime: Date;

  @AllowNull(false)
  @Column({ type: DataType.DOUBLE })
  latitude: number;

  @AllowNull(false)
  @Column({ type: DataType.DOUBLE })
  longitude: number;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  speed: number;

  @AllowNull(false)
  @Column({ type: DataType.INTEGER })
  ping: number;

  @AllowNull(false)
  @Column({ type: DataType.DOUBLE })
  bettery: number;

  @AllowNull(false)
  @Column({ type: DataType.BOOLEAN })
  status: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
}
