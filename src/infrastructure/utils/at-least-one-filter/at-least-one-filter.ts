import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function AtLeastOneFilter(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'AtLeastOneFilter',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(_: any, args: ValidationArguments) {
          const obj = args.object as any;

          const hasSender = !!obj.sender && obj.sender.trim().length > 0;

          const hasDateRange = !!(obj.startDate && obj.endDate);

          return hasSender || hasDateRange;
        },
        defaultMessage(args: ValidationArguments) {
          return 'At least one filter must be provided: sender or (startDate and endDate)';
        },
      },
    });
  };
}
