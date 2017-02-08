import 'reflect-metadata';

import * as express from 'express';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/catch';

import { basePathKey, routesKey, ObservableHandler, RouteDescriptor } from '.';

export type ErrorHandler = (req: express.Request, res: express.Response, error: any) => void;

export function registerController(router: express.Router, controller: any, handleError: ErrorHandler = defaultErrorHandler) {
  let basePath: string = Reflect.getMetadata(basePathKey, controller.constructor);
  let routes: RouteDescriptor[] = getRoutes(controller);

  for (let route of routes) {
    let path = `${basePath}${route.path ? route.path : ''}`;
    let handler = wrapHandler(route.handler.bind(controller), handleError);

    if (route.method === 'get') {
      router.get(path, handler);
    } else if (route.method === 'put') {
      router.put(path, handler);
    } else if (route.method === 'post') {
      router.post(path, handler);
    } else if (route.method === 'delete') {
      router.delete(path, handler);
    } else if (route.method === 'patch') {
      router.patch(path, handler);
    } else if (route.method === 'head') {
      router.head(path, handler);
    } else if (route.method === 'all') {
      router.all(path, handler);
    } else if (route.method === undefined) {
      router.use(path, handler);
    }
  }
}

function getRoutes(controller: any): RouteDescriptor[] {
  let prototypes: any[] = [];
  let currentPrototype = Object.getPrototypeOf(controller);

  while (currentPrototype != null) {
    prototypes.unshift(currentPrototype);
    currentPrototype = Object.getPrototypeOf(currentPrototype);
  }

  return prototypes
    .map(prototype => Reflect.getMetadata(routesKey, prototype) || [])
    .reduce((accumulation: RouteDescriptor[], current: RouteDescriptor[]) => accumulation.concat(current), []);
}

function wrapHandler(handler: ObservableHandler, handleError: ErrorHandler) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      let result = handler(req, res, next);

      if (result && result instanceof Observable) {
        let observable: Observable<any> = result;

        observable
          .catch(error => {
            handleError(req, res, error);
            return Observable.of(undefined);
          })
          .subscribe(() => { });
      }
    } catch (exception) {
      handleError(req, res, exception);
    }
  };
}

function defaultErrorHandler(_req: express.Request, res: express.Response) {
  res.status(500).send('500 Internal Server Error');
}
