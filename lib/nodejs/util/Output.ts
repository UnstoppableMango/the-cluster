import * as pulumi from '@pulumi/pulumi';
import { Apply1 } from 'fp-ts/Apply';
import * as array from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import { Functor1 } from 'fp-ts/Functor';
import { IO } from 'fp-ts/IO';
import { Applicative1 } from 'fp-ts/lib/Applicative';
import { lift } from './functor';

const _map: Functor1<URI>['map'] = (fa, f) => pipe(fa, map(f));
const _apPar: Apply1<URI>['ap'] = (fab, fa) => pipe(fab, ap(fa));
const _apSeq: Apply1<URI>['ap'] = (fab, fa) => flatMap(fab, (f) => pipe(fa, map(f)));
const _of: Applicative1<URI>['of'] = (a) => pipe(a, of);

export const map: <A, B>(f: (a: A) => B) => (fa: Output<A>) => Output<B> = (f) => (fa) => fa.apply(f);

export const ap: <A>(fa: Output<A>) => <B>(fab: Output<(a: A) => B>) => Output<B> = (fa) => (fab) =>
	pulumi.all([fab, fa]).apply(([f, a]) => f(a as any));

export const of: <A>(a: A) => Output<A> = pulumi.output;

export function flatMap<A, B>(f: (a: A) => Output<B>, ma: Output<A>): Output<B>;
export function flatMap<A, B>(ma: Output<A>, f: (a: A) => Output<B>): Output<B>;
export function flatMap<A, B>(f: ((a: A) => Output<B>) | Output<A>, ma: ((a: A) => Output<B>) | Output<A>): Output<B> {
	if (typeof f === 'function' && typeof ma !== 'function') {
		return ma.apply(f);
	} else if (typeof f !== 'function' && typeof ma === 'function') {
		return f.apply(ma);
	} else {
		throw new Error('how did we get here');
	}
}

// export const concat: (a: Output<string>[]) => Output<string> =
//   a => pipe(a, array.traverse(ApplicativeSeq))

export const URI = 'Output';
export type URI = typeof URI;
export type Output<T> = pulumi.Output<T>;

declare module 'fp-ts/HKT' {
	interface URItoKind<A> {
		readonly [URI]: Output<A>;
	}
}

export const Functor: Functor1<URI> = { URI, map: _map };
export const ApplyPar: Apply1<URI> = { URI, map: _map, ap: _apPar };
export const ApplicativePar: Applicative1<URI> = { URI, map: _map, ap: _apPar, of };
export const ApplySeq: Apply1<URI> = { URI, map: _map, ap: _apSeq };
export const ApplicativeSeq: Applicative1<URI> = { URI, map: _map, ap: _apSeq, of };
