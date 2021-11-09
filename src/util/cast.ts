/**
 * Cast a value to a type.
 * @param _value The value to cast
 * @template T The type to cast to
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function cast<T>(_value: unknown): asserts _value is T {}

export default cast;
