import { createWaitablePromise, WaitablePromise } from '@algolia/client-common';
import { popRequestOption, RequestOptions } from '@algolia/transporter';

import {
  BatchActionEnum,
  BatchResponse,
  chunk,
  ChunkOptions,
  createMissingObjectIDError,
  SaveObjectsOptions,
  SearchIndex,
} from '../..';

export const saveObjects = (base: SearchIndex) => {
  return (
    objects: ReadonlyArray<{ readonly [key: string]: any }>,
    requestOptions?: RequestOptions & ChunkOptions & SaveObjectsOptions
  ): Readonly<WaitablePromise<readonly BatchResponse[]>> => {
    const autoGenerateObjectIDIfNotExist = popRequestOption(
      requestOptions,
      'autoGenerateObjectIDIfNotExist',
      false
    );

    const action = autoGenerateObjectIDIfNotExist
      ? BatchActionEnum.AddObject
      : BatchActionEnum.UpdateObject;

    if (action === BatchActionEnum.UpdateObject) {
      // eslint-disable-next-line functional/no-loop-statement
      for (const object of objects) {
        if (object.objectID === undefined) {
          return createWaitablePromise(Promise.reject(createMissingObjectIDError()));
        }
      }
    }

    return chunk(base)(objects, action, requestOptions);
  };
};
