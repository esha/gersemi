import { GenesisClient } from '../src/genesis-base';

test('create a client', () => {
  const client = new GenesisClient();
  expect(client).not.toBeNull();
});

