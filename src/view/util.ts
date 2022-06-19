import * as R from 'ramda';

export function textToRules(text: string) {
    return R.pipe(
        R.split('\n'),
        R.map(R.trim),
        R.reject(R.isEmpty),
        R.reject(R.startsWith('#'))
    )(text)
}