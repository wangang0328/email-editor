import React, { useEffect } from 'react';
import Frame from '@demo/components/Frame';
import templateList from '@demo/store/templateList';
import { useTemplateListStore } from '@demo/store/templateList';
import { Button } from '@demo/components/app-ui';
import { CardItem } from './components/CardItem';
import { Stack } from '@demo/components/Stack';
import { history } from '@demo/utils/history';
import { pushEvent } from '@demo/utils/pushEvent';
import templates from '@demo/config/templates.json';

export default function Home() {
  const list = useTemplateListStore((state) => state.list);

  useEffect(() => {
    templateList.actions.fetch();
  }, []);

  return (
    <Frame
      title='Templates'
      primaryAction={
        <Button
          onClick={() => {
            pushEvent({ event: 'Create' });
            history.push('/editor');
          }}
        >
          Add
        </Button>
      }
    >
      <>
        <Stack>
          {[...templates, ...list].map((item) => (
            <CardItem data={item} key={item.article_id} />
          ))}
        </Stack>
      </>
    </Frame>
  );
}
