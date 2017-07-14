import 'reflect-metadata';

import { Method, ObservableHandler, RouteDescriptor } from '.';

export const basePathKey = Symbol('basePath');
export const routesKey = Symbol('routes');

export function Controller(basePath: string) {
  return Reflect.metadata(basePathKey, basePath);
}

export function Use(path?: string) {
  return (target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<ObservableHandler>) => {
    const routes = getOwnRoutes(target);

    routes.push({method: undefined, path, key, handler: descriptor.value});
    return descriptor;
  };
}

export function Route(method: Method, path = '') {
  return (target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<ObservableHandler>) => {
    const routes = getOwnRoutes(target);

    routes.push({method, path, key, handler: descriptor.value});
    return descriptor;
  };
}

export function Get(path = '') {
  return Route('get', path);
}

export function Put(path = '') {
  return Route('put', path);
}

export function Post(path = '') {
  return Route('post', path);
}

export function Delete(path = '') {
  return Route('delete', path);
}

export function Patch(path = '') {
  return Route('patch', path);
}

export function Head(path = '') {
  return Route('head', path);
}

export function All(path = '') {
  return Route('all', path);
}

function getOwnRoutes(target: Object) {
  let routes: RouteDescriptor[] = Reflect.getOwnMetadata(routesKey, target);

  if (!routes) {
    routes = [];
    Reflect.defineMetadata(routesKey, routes, target);
  }

  return routes;
}
