import React, { useEffect } from 'react';
import { Layout } from '@demo/components/app-ui';
import { Breadcrumb } from '@demo/components/demo-ui';
import { Stack } from '../Stack';
import { pushEvent } from '@demo/utils/pushEvent';
import { githubButtonGenerate } from '@demo/utils/githubButtonGenerate';

const { Header, Content, Sider } = Layout;

interface FrameProps {
  title: string;
  breadcrumb?: React.ReactElement;
  primaryAction?: React.ReactElement;
  children: React.ReactElement;
}

export default function Frame({
  children,
  title,
  primaryAction,
  breadcrumb,
}: FrameProps) {
  useEffect(() => {
    githubButtonGenerate();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', flexDirection: 'column' }}>
      <Header style={{ padding: '0 20px', backgroundColor: '#001529' }}>
        <Stack distribution="equalSpacing" alignment="center">
          <h1 style={{ color: 'white', margin: '15px 0' }}>Easy-email</h1>
          <div style={{ marginTop: 10 }}>
            <Stack distribution="equalSpacing" alignment="center">
              <a
                href="https://github.com/wangang0328/email-editor?utm_source=webside"
                target="_blank"
                rel="noreferrer"
                onClick={() => pushEvent({ event: 'Donate' })}
              >
                <img
                  src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png"
                  alt="Buy Me A Coffee"
                />
              </a>
              <a
                className="github-button"
                href="https://github.com/wangang0328/email-editor?utm_source=webside&utm_medium=button&utm_content=star"
                data-size="large"
                data-icon="octicon-star"
                data-show-count="true"
                aria-label="Star wangang0328/email-editor on GitHub"
                style={{ opacity: 0 }}
              >
                Star
              </a>
              <a
                className="github-button"
                href="https://github.com/wangang0328/email-editor/fork?utm_source=webside&utm_medium=button&utm_content=fork"
                data-size="large"
                data-show-count="true"
                aria-label="Fork wangang0328/email-editor on GitHub"
                style={{ opacity: 0 }}
              >
                Fork
              </a>
              <a
                className="github-button"
                href="https://github.com/wangang0328/email-editor/issues?utm_source=webside&utm_medium=button&utm_content=issues"
                data-size="large"
                data-show-count="true"
                aria-label="Issue wangang0328/email-editor on GitHub"
                onClick={() => pushEvent({ event: 'Issue' })}
                style={{ opacity: 0 }}
              >
                Issue
              </a>
            </Stack>
          </div>
        </Stack>
      </Header>

      <Layout hasSider>
        <Sider width={200} style={{ background: '#fff', borderRight: '1px solid #e5e6eb' }}>
          <nav style={{ padding: '12px 16px' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Templates</div>
            <div style={{ paddingLeft: 8, color: '#4e5969' }}>Templates</div>
          </nav>
        </Sider>
        <Layout style={{ padding: 24, flex: 1, flexDirection: 'column' }}>
          <Stack vertical>
            {breadcrumb && (
              <Breadcrumb>
                <Breadcrumb.Item>{breadcrumb}</Breadcrumb.Item>
              </Breadcrumb>
            )}

            <Stack distribution="equalSpacing" alignment="center">
              <Stack.Item>
                <h2>
                  <strong>{title}</strong>
                </h2>
              </Stack.Item>
              <Stack.Item>{primaryAction}</Stack.Item>
            </Stack>

            <Stack.Item>
              <Content
                style={{
                  padding: 24,
                  margin: 0,
                  backgroundColor: '#fff',
                }}
              >
                {children}
              </Content>
            </Stack.Item>
          </Stack>
        </Layout>
      </Layout>
    </Layout>
  );
}
