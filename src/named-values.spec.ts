import { NamedValues } from './named-values';

describe('NamedValues', () => {
  const initializer = { Value1: 'Some value', Value2: 'Other value' };
  const collection = new NamedValues(initializer);

  it('Initializes the collection with a copy of the initializer', () => {
    expect(collection.values).toEqual(initializer);
    expect(collection.values).not.toBe(initializer);
  });

  it('The collection can be created without an initializer', () => {
    const collection2 = new NamedValues();

    expect(collection2.values).toEqual({});
  });

  it('set adds a new value to the collection', () => {
    collection.set('Pozdrav', 'Ahoj');

    expect(collection.get('Pozdrav')).toBe('Ahoj');
    expect(collection.values.Pozdrav).toBe('Ahoj');
  });

  it('set changes the existing value in the collection', () => {
    collection.set('Pozdrav', 'Nazdar');

    expect(collection.get('Pozdrav')).toBe('Nazdar');
    expect(collection.values.Pozdrav).toBe('Nazdar');
  });

  it('remove deletes an existing key from the collection', () => {
    collection.remove('Pozdrav');

    expect(collection.get('Pozdrav')).toBeUndefined();
    expect(collection.values.Pozdrav).toBeUndefined();
  });

  it('remove can handle non existing key', () => {
    expect(() => collection.remove('Pozdrav')).not.toThrow();
  });
});
