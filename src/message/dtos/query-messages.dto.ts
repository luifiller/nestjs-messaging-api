import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsBase64,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AtLeastOneFilter } from '../utils/at-least-one-filter/at-least-one-filter';

export class QueryMessagesRequestDto {
  @AtLeastOneFilter({
    message: 'You must provide either sender or startDate and endDate',
  })
  _filterCheck: boolean;

  @ApiProperty({
    description: 'Filter messages by sender name',
    required: false,
    example: 'user-123',
  })
  @IsOptional()
  @IsString()
  sender?: string;

  @ApiProperty({
    description: 'Number of messages to return (default is 10)',
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Decoded cursor for pagination',
    required: false,
    example: 'eyJpZCI6IjEyMyIsImNyZWF0ZWn0=',
  })
  @IsOptional()
  @IsBase64()
  cursor?: Base64URLString;

  @ApiProperty({
    description: 'Timestamp (Unix timestamp in milliseconds)',
    required: false,
    example: 1707436800000,
  })
  @IsOptional()
  @Type(() => Number)
  startDate?: number;

  @ApiProperty({
    description: 'Timestamp (Unix timestamp in milliseconds)',
    required: false,
    example: 1707436800000,
  })
  @IsOptional()
  @Type(() => Number)
  endDate?: number;
}
