import { Input } from '@wa-dev/email-editor-ui';
import { Loader2, Upload } from 'lucide-react';
import { Uploader } from '@panels/utils/Uploader';
import React, { useEffect, useRef, useState } from 'react';

export interface UploadFieldProps {
  onChange: (val: string) => void;
  value: string;
  inputDisabled?: boolean;
  accept?: string;
  uploadHandler: (file: File) => Promise<string>;
}

export function UploadField(props: UploadFieldProps) {
  const { onChange, inputDisabled = false, accept, uploadHandler } = props;
  const [loading, setLoading] = useState(false);
  const { current: uploader } = useRef(
    new Uploader(uploadHandler, {
      limit: 1,
      accept,
    })
  );

  useEffect(() => {
    uploader.on('start', () => {
      setLoading(true);
      uploader.on('end', (photos) => {
        setLoading(false);
        onChange(
          photos
            .filter((item) => item.status === 'done')
            .map((item) => item.url)[0] || ''
        );
      });
    });
  }, [onChange, uploader]);

  const onClick = () => {
    if (loading) return;
    uploader.chooseFile();
  };

  return (
    <Input
      prefix={loading ? <Loader2 className="h-4 w-4" /> : <Upload className="h-4 w-4 cursor-pointer" onClick={onClick} />}
      value={props.value}
      onChange={inputDisabled ? undefined : (value) => onChange(value)}
    />
  );
}
