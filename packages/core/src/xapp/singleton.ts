import { getAppObject } from './xapp';

type AppObject = ReturnType<typeof getAppObject>;

let cachedAppObject: AppObject | null = null;

const getResolvedAppObject = (): AppObject => {
	cachedAppObject ??= getAppObject();
	return cachedAppObject;
};

const createAppProxy = (): AppObject =>
	new Proxy(Object.create(null) as AppObject, {
		get(_target, propertyKey, receiver) {
			const appObject = getResolvedAppObject();
			const value = Reflect.get(appObject, propertyKey, receiver);
			return typeof value === 'function' ? value.bind(appObject) : value;
		},
		set(_target, propertyKey, value, receiver) {
			return Reflect.set(getResolvedAppObject(), propertyKey, value, receiver);
		},
		has(_target, propertyKey) {
			return propertyKey in getResolvedAppObject();
		},
	});

/**
 * kintone javascript APIのルートオブジェクト
 */
export const xapp = createAppProxy();
