import { validate } from 'class-validator';
import { AtLeastOneFilter } from './at-least-one-filter';

class TestDto {
  @AtLeastOneFilter({
    message:
      'At least one filter must be provided: sender or (startDate and endDate)',
  })
  filters: string;

  sender?: string;
  startDate?: number;
  endDate?: number;
}

describe('AtLeastOneFilter Decorator', () => {
  let dto: TestDto;

  beforeEach(() => {
    dto = new TestDto();
  });

  describe('when sender is provided', () => {
    it('should pass validation when only sender is present', async () => {
      dto.sender = 'user123';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation when sender and date range are both present', async () => {
      dto.sender = 'user123';
      dto.startDate = 1609459200000;
      dto.endDate = 1609545600000;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('when date range is provided', () => {
    it('should pass validation when both startDate and endDate are present', async () => {
      dto.startDate = 1609459200000;
      dto.endDate = 1609545600000;

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation when only startDate is present', async () => {
      dto.startDate = 1609459200000;

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('AtLeastOneFilter');
      expect(errors[0].constraints?.AtLeastOneFilter).toBe(
        'At least one filter must be provided: sender or (startDate and endDate)',
      );
    });

    it('should fail validation when only endDate is present', async () => {
      dto.endDate = 1609545600000;

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('AtLeastOneFilter');
    });
  });

  describe('when no filters are provided', () => {
    it('should fail validation when all fields are undefined', async () => {
      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('filters');
      expect(errors[0].constraints).toHaveProperty('AtLeastOneFilter');
      expect(errors[0].constraints?.AtLeastOneFilter).toBe(
        'At least one filter must be provided: sender or (startDate and endDate)',
      );
    });

    it('should fail validation when all fields are null', async () => {
      dto.sender = null as any;
      dto.startDate = null as any;
      dto.endDate = null as any;

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('AtLeastOneFilter');
    });

    it('should fail validation when all fields are empty strings', async () => {
      dto.sender = '';
      dto.startDate = 0;
      dto.endDate = 0;

      const errors = await validate(dto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints).toHaveProperty('AtLeastOneFilter');
    });
  });

  describe('defaultMessage', () => {
    it('should return default message even when ValidationArguments are passed', async () => {
      class ArgsTestDto {
        @AtLeastOneFilter()
        filters: string;

        sender?: string;
        startDate?: number;
        endDate?: number;
      }

      const argsDto = new ArgsTestDto();
      argsDto.sender = '   '; // Whitespace only
      argsDto.startDate = 0;

      const errors = await validate(argsDto);

      expect(errors).toHaveLength(1);
      expect(errors[0].constraints?.AtLeastOneFilter).toBe(
        'At least one filter must be provided: sender or (startDate and endDate)',
      );
    });
  });
});
