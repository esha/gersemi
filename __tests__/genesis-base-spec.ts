import { GenesisBase } from '../src/genesis-base';

test('Should greet with message', () => {
  const greeter = new GenesisBase('friend');
  expect(greeter.greet()).toBe('Bonjour, friend!');
});
