import { AdvancedType } from '@wa-dev/email-editor-shared';

export function isAdvancedBlock(type: unknown) {
  return Object.values(AdvancedType).includes(type as AdvancedType);
}
