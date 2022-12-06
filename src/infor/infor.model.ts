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
  UpdatedAt,
} from 'sequelize-typescript';
import { Sensor } from 'src/hardware/hardware.model';

@Table({ timestamps: true })
export class InforSensor extends Model<InforSensor> {
  @AllowNull(false)
  @Unique(true)
  @PrimaryKey
  @Column({
    type: DataType.UUID,
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

  @ForeignKey(() => Sensor)
  @Column(DataType.STRING)
  sensorId!: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  updatedAt!: Date;
  bettery: number;
}
