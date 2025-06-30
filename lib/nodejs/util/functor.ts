import { Functor, Functor1 } from 'fp-ts/Functor';
import { HKT, Kind, URIS } from 'fp-ts/HKT';

export function lift<F extends URIS>(F: Functor1<F>): <A, B>(f: (a: A) => B) => (fa: Kind<F, A>) => Kind<F, B>;
export function lift<F>(F: Functor<F>): <A, B>(f: (a: A) => B) => (fa: HKT<F, A>) => HKT<F, B> {
	return (f) => (fa) => F.map(fa, f);
}
