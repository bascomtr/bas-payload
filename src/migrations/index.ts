import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260121_091859 from './20260121_091859';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260121_091859.up,
    down: migration_20260121_091859.down,
    name: '20260121_091859'
  },
];
