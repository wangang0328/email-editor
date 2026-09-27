import { InputNumber, TreeSelect } from '@wa-dev/email-editor-ui';
import { Input as ArcoInput, Switch, Slider } from '@wa-dev/email-editor-ui';
import type { SliderProps, InputNumberProps, SwitchProps, TextAreaProps, TreeSelectProps } from '@wa-dev/email-editor-ui';
import { ImageUploaderProps, ImageUploader } from './ImageUploader';
import { UploadField as Uploader, UploadFieldProps } from './UploadField';
import { Select, SelectProps } from './Select';
import { RadioGroup, RadioGroupProps } from './RadioGroup';
import enhancer from './enhancer';
import { Input, InputProps } from './Input';
import { InputWithUnit, InputWithUnitProps } from './InputWithUnit';
import { CheckBoxGroup, CheckboxGroupProps } from './CheckBoxGroup';
import { EditTab, EditTabProps } from './EditTab';
import { EditGridTab, EditGridTabProps } from './EditGridTab';
import { InlineText, InlineTextProps } from './InlineTextField';
import { AutoCompleteProps, AutoComplete } from './AutoComplete';
import type { InputSearchProps } from '@wa-dev/email-editor-ui';
import { ColorPickerField } from './ColorPickerField';

export { MultiSelectStringField } from './MultiSelect';

export { RichTextField } from './RichTextField';

export const TextField = enhancer<InputProps>(Input, value => value);

export const InputWithUnitField = enhancer<InputWithUnitProps>(
  InputWithUnit,
  value => value,
  { debounceTime: 50 },
);

export const SearchField = enhancer<InputSearchProps>(ArcoInput.Search, val => val);

export const TextAreaField = enhancer<TextAreaProps>(ArcoInput.TextArea, val => val);

export const NumberField = enhancer<InputNumberProps>(InputNumber, e => e, {
  debounceTime: 50,
});

export const SliderField = enhancer<SliderProps>(Slider, e => e);

export const UploadField = enhancer<UploadFieldProps>(Uploader, val => val);

export const ImageUploaderField = enhancer<ImageUploaderProps>(ImageUploader, url => url);

export const SelectField = enhancer<SelectProps>(Select, e => e);

export const TreeSelectField = enhancer<TreeSelectProps>(TreeSelect, e => e);

export const AutoCompleteField = enhancer<AutoCompleteProps>(AutoComplete, e => e);

export const RadioGroupField = enhancer<RadioGroupProps>(RadioGroup, value => value);

export const SwitchField = enhancer<SwitchProps>(Switch, e => e);

export const CheckboxField = enhancer<CheckboxGroupProps>(CheckBoxGroup, e => e);

export const EditTabField = enhancer<EditTabProps>(EditTab, (e: any[]) => e);
export const EditGridTabField = enhancer<EditGridTabProps>(EditGridTab, (e: any[]) => e);

export const InlineTextField = enhancer<InlineTextProps>(InlineText, value => value);

export { ColorPickerField };

export { enhancer };
