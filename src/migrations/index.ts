import * as migration_20250929_111647 from './20250929_111647';
import * as migration_20260121_091859 from './20260121_091859';
import * as migration_20260209_105529_add_videos_field from './20260209_105529_add_videos_field';
import * as migration_20260209_115026_add_short_description_field from './20260209_115026_add_short_description_field';

export const migrations = [
  {
    up: migration_20250929_111647.up,
    down: migration_20250929_111647.down,
    name: '20250929_111647',
  },
  {
    up: migration_20260121_091859.up,
    down: migration_20260121_091859.down,
    name: '20260121_091859',
  },
  {
    up: migration_20260209_105529_add_videos_field.up,
    down: migration_20260209_105529_add_videos_field.down,
    name: '20260209_105529_add_videos_field',
  },
  {
    up: migration_20260209_115026_add_short_description_field.up,
    down: migration_20260209_115026_add_short_description_field.down,
    name: '20260209_115026_add_short_description_field'
  },
];
