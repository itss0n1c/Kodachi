/* eslint-disable no-undefined */
/* eslint-disable no-dupe-class-members */


export interface Argument {
	name?: string
	type?: string
	value?: any
}

export class Arguments extends Map<string, Argument> {
	private _array: Argument[]
	constructor(entries?: ReadonlyArray<readonly [string, Argument]> | null) {
		super(entries);
		Object.defineProperty(this, '_array', {
			value: [],
			writable: true,
			configurable: true
		});
	}

	has (k: string): boolean {
		return super.has(k);
	}

	get (k: string): Argument | undefined {
		return super.get(k);
	}

	set (k: string, v: Argument): this {
		this._array = [];
		return super.set(k, v);
	}

	clearArray (): void {
		this._array = [];
	}

	delete (k: string): boolean {
		this._array = null;
		return super.delete(k);
	}

	clear (): void {
		return super.clear();
	}

	array (): Argument[] {
		if (!this._array || this._array.length !== this.size) {
			this._array = [ ...this.values() ];
		}
		return this._array;
	}

	public find(fn: (value: Argument, key: string, obj: this) => boolean): Argument | undefined;
	public find<T>(fn: (this: string, value: Argument, key: string, obj: this) => boolean, thisArg: T): Argument | undefined;
	public find (fn: (value: Argument, key: string, obj: this) => boolean, thisArg?: unknown): Argument | undefined {
		if (typeof thisArg !== 'undefined') {
			fn = fn.bind(thisArg);
		}
		for (const [ key, val ] of this) {
			if (fn(val, key, this)) {
				return val;
			}
		}

		return undefined;
	}
}
