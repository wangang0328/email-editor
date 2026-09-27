import { blocks } from '@wa-dev/email-editor-panels';
import React, { ReactNode } from 'react';

type ObjectComponent = { [key: string]: (...args: any) => ReactNode };

export class BlockAttributeConfigurationManager {
  private static map: ObjectComponent = { ...blocks };

  public static add(componentMap: ObjectComponent) {
    Object.keys(componentMap).forEach(name => {
      this.map[name] = componentMap[name];
    });
  }

  public static get<T extends ObjectComponent>(name: keyof T): () => React.JSX.Element | null {
    return (this.map as any)[name];
  }

  public static getMap() {
    return this.map;
  }
}
