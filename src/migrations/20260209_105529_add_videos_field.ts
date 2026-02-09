import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`products_videos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`youtube_id\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_videos_order_idx\` ON \`products_videos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_videos_parent_id_idx\` ON \`products_videos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_videos_locales\` (
  	\`title\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_videos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_videos_locales_locale_parent_id_unique\` ON \`products_videos_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_videos\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`youtube_id\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_videos_order_idx\` ON \`_products_v_version_videos\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_videos_parent_id_idx\` ON \`_products_v_version_videos\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_videos_locales\` (
  	\`title\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_version_videos\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_version_videos_locales_locale_parent_id_unique\` ON \`_products_v_version_videos_locales\` (\`_locale\`,\`_parent_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`products_videos\`;`)
  await db.run(sql`DROP TABLE \`products_videos_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_videos\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_videos_locales\`;`)
}
