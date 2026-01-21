import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_roles\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_roles_order_idx\` ON \`users_roles\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`users_roles_parent_idx\` ON \`users_roles\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_gallery_order_idx\` ON \`products_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_gallery_parent_id_idx\` ON \`products_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_gallery_image_idx\` ON \`products_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`products_gallery_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_gallery_locales_locale_parent_id_unique\` ON \`products_gallery_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_specifications\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_specifications_order_idx\` ON \`products_specifications\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_specifications_parent_id_idx\` ON \`products_specifications\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_specifications_locales\` (
  	\`label\` text,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_specifications\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_specifications_locales_locale_parent_id_unique\` ON \`products_specifications_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`featured_image_id\` integer,
  	\`category_id\` integer,
  	\`status\` text DEFAULT 'draft',
  	\`order\` numeric DEFAULT 0,
  	\`featured\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`product_categories\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`products_featured_image_idx\` ON \`products\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`products_category_idx\` ON \`products\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`products_updated_at_idx\` ON \`products\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`products_created_at_idx\` ON \`products\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`products__status_idx\` ON \`products\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`products_locales\` (
  	\`title\` text,
  	\`slug\` text,
  	\`short_description\` text,
  	\`description\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`meta_keywords\` text,
  	\`meta_no_index\` integer DEFAULT false,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_slug_idx\` ON \`products_locales\` (\`slug\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`products_meta_meta_image_idx\` ON \`products_locales\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`products_locales_locale_parent_id_unique\` ON \`products_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_rels_order_idx\` ON \`products_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_parent_idx\` ON \`products_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_path_idx\` ON \`products_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_products_id_idx\` ON \`products_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_gallery_order_idx\` ON \`_products_v_version_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_gallery_parent_id_idx\` ON \`_products_v_version_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_gallery_image_idx\` ON \`_products_v_version_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_gallery_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_version_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_version_gallery_locales_locale_parent_id_unique\` ON \`_products_v_version_gallery_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_specifications\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_specifications_order_idx\` ON \`_products_v_version_specifications\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_specifications_parent_id_idx\` ON \`_products_v_version_specifications\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_specifications_locales\` (
  	\`label\` text,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_version_specifications\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_version_specifications_locales_locale_parent_id_\` ON \`_products_v_version_specifications_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_featured_image_id\` integer,
  	\`version_category_id\` integer,
  	\`version_status\` text DEFAULT 'draft',
  	\`version_order\` numeric DEFAULT 0,
  	\`version_featured\` integer DEFAULT false,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_category_id\`) REFERENCES \`product_categories\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_parent_idx\` ON \`_products_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_featured_image_idx\` ON \`_products_v\` (\`version_featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_category_idx\` ON \`_products_v\` (\`version_category_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_updated_at_idx\` ON \`_products_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_created_at_idx\` ON \`_products_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version__status_idx\` ON \`_products_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_created_at_idx\` ON \`_products_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_updated_at_idx\` ON \`_products_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_snapshot_idx\` ON \`_products_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_published_locale_idx\` ON \`_products_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_latest_idx\` ON \`_products_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_autosave_idx\` ON \`_products_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_locales\` (
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_short_description\` text,
  	\`version_description\` text,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`version_meta_keywords\` text,
  	\`version_meta_no_index\` integer DEFAULT false,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_slug_idx\` ON \`_products_v_locales\` (\`version_slug\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_meta_version_meta_image_idx\` ON \`_products_v_locales\` (\`version_meta_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_locales_locale_parent_id_unique\` ON \`_products_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_rels_order_idx\` ON \`_products_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_rels_parent_idx\` ON \`_products_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_rels_path_idx\` ON \`_products_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_rels_products_id_idx\` ON \`_products_v_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE TABLE \`product_categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`image_id\` integer,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`product_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`product_categories_parent_idx\` ON \`product_categories\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`product_categories_image_idx\` ON \`product_categories\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`product_categories_updated_at_idx\` ON \`product_categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`product_categories_created_at_idx\` ON \`product_categories\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`product_categories_locales\` (
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`product_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`product_categories_slug_idx\` ON \`product_categories_locales\` (\`slug\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`product_categories_locales_locale_parent_id_unique\` ON \`product_categories_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_highlights_order_idx\` ON \`projects_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_highlights_parent_id_idx\` ON \`projects_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_highlights_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_highlights\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_highlights_locales_locale_parent_id_unique\` ON \`projects_highlights_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_gallery_order_idx\` ON \`projects_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`projects_gallery_parent_id_idx\` ON \`projects_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_gallery_image_idx\` ON \`projects_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`projects_gallery_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_gallery_locales_locale_parent_id_unique\` ON \`projects_gallery_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`projects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`client\` text,
  	\`completion_date\` text,
  	\`project_type\` text,
  	\`featured_image_id\` integer,
  	\`category_id\` integer,
  	\`status\` text DEFAULT 'draft',
  	\`featured\` integer DEFAULT false,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`project_categories\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`projects_featured_image_idx\` ON \`projects\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_category_idx\` ON \`projects\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_updated_at_idx\` ON \`projects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`projects_created_at_idx\` ON \`projects\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`projects__status_idx\` ON \`projects\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`projects_locales\` (
  	\`title\` text,
  	\`slug\` text,
  	\`excerpt\` text,
  	\`description\` text,
  	\`location\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`meta_keywords\` text,
  	\`meta_no_index\` integer DEFAULT false,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_slug_idx\` ON \`projects_locales\` (\`slug\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`projects_meta_meta_image_idx\` ON \`projects_locales\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_locales_locale_parent_id_unique\` ON \`projects_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_version_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_version_highlights_order_idx\` ON \`_projects_v_version_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_highlights_parent_id_idx\` ON \`_projects_v_version_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_version_highlights_locales\` (
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_version_highlights\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_projects_v_version_highlights_locales_locale_parent_id_uniq\` ON \`_projects_v_version_highlights_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_version_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_version_gallery_order_idx\` ON \`_projects_v_version_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_gallery_parent_id_idx\` ON \`_projects_v_version_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_gallery_image_idx\` ON \`_projects_v_version_gallery\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_version_gallery_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v_version_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_projects_v_version_gallery_locales_locale_parent_id_unique\` ON \`_projects_v_version_gallery_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_client\` text,
  	\`version_completion_date\` text,
  	\`version_project_type\` text,
  	\`version_featured_image_id\` integer,
  	\`version_category_id\` integer,
  	\`version_status\` text DEFAULT 'draft',
  	\`version_featured\` integer DEFAULT false,
  	\`version_order\` numeric DEFAULT 0,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_category_id\`) REFERENCES \`project_categories\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_parent_idx\` ON \`_projects_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_featured_image_idx\` ON \`_projects_v\` (\`version_featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_category_idx\` ON \`_projects_v\` (\`version_category_id\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_updated_at_idx\` ON \`_projects_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_created_at_idx\` ON \`_projects_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version__status_idx\` ON \`_projects_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_created_at_idx\` ON \`_projects_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_updated_at_idx\` ON \`_projects_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_snapshot_idx\` ON \`_projects_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_published_locale_idx\` ON \`_projects_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_latest_idx\` ON \`_projects_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_autosave_idx\` ON \`_projects_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_projects_v_locales\` (
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_excerpt\` text,
  	\`version_description\` text,
  	\`version_location\` text,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`version_meta_keywords\` text,
  	\`version_meta_no_index\` integer DEFAULT false,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_projects_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_projects_v_version_version_slug_idx\` ON \`_projects_v_locales\` (\`version_slug\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`_projects_v_version_meta_version_meta_image_idx\` ON \`_projects_v_locales\` (\`version_meta_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_projects_v_locales_locale_parent_id_unique\` ON \`_projects_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`project_categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`project_categories_image_idx\` ON \`project_categories\` (\`image_id\`);`)
  await db.run(sql`CREATE INDEX \`project_categories_updated_at_idx\` ON \`project_categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`project_categories_created_at_idx\` ON \`project_categories\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`project_categories_locales\` (
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`project_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`project_categories_slug_idx\` ON \`project_categories_locales\` (\`slug\`,\`_locale\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`project_categories_locales_locale_parent_id_unique\` ON \`project_categories_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`news\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`featured_image_id\` integer,
  	\`published_at\` text,
  	\`author_id\` integer,
  	\`status\` text DEFAULT 'draft',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`author_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`news_featured_image_idx\` ON \`news\` (\`featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`news_author_idx\` ON \`news\` (\`author_id\`);`)
  await db.run(sql`CREATE INDEX \`news_updated_at_idx\` ON \`news\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`news_created_at_idx\` ON \`news\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`news__status_idx\` ON \`news\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`news_locales\` (
  	\`title\` text,
  	\`slug\` text,
  	\`excerpt\` text,
  	\`content\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`meta_keywords\` text,
  	\`meta_no_index\` integer DEFAULT false,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`news_slug_idx\` ON \`news_locales\` (\`slug\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`news_meta_meta_image_idx\` ON \`news_locales\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`news_locales_locale_parent_id_unique\` ON \`news_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`news_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`news_texts_order_parent\` ON \`news_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_news_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_featured_image_id\` integer,
  	\`version_published_at\` text,
  	\`version_author_id\` integer,
  	\`version_status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_featured_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_author_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_news_v_parent_idx\` ON \`_news_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_version_version_featured_image_idx\` ON \`_news_v\` (\`version_featured_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_version_version_author_idx\` ON \`_news_v\` (\`version_author_id\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_version_version_updated_at_idx\` ON \`_news_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_version_version_created_at_idx\` ON \`_news_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_version_version__status_idx\` ON \`_news_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_created_at_idx\` ON \`_news_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_updated_at_idx\` ON \`_news_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_snapshot_idx\` ON \`_news_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_published_locale_idx\` ON \`_news_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_latest_idx\` ON \`_news_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_autosave_idx\` ON \`_news_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_news_v_locales\` (
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_excerpt\` text,
  	\`version_content\` text,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`version_meta_keywords\` text,
  	\`version_meta_no_index\` integer DEFAULT false,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_news_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_news_v_version_version_slug_idx\` ON \`_news_v_locales\` (\`version_slug\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`_news_v_version_meta_version_meta_image_idx\` ON \`_news_v_locales\` (\`version_meta_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_news_v_locales_locale_parent_id_unique\` ON \`_news_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_news_v_texts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`text\` text,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_news_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_news_v_texts_order_parent\` ON \`_news_v_texts\` (\`order\`,\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_hero_buttons\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link\` text,
  	\`variant\` text DEFAULT 'primary',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_buttons_order_idx\` ON \`pages_blocks_hero_buttons\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_buttons_parent_id_idx\` ON \`pages_blocks_hero_buttons\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_hero_buttons_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_hero_buttons\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_hero_buttons_locales_locale_parent_id_unique\` ON \`pages_blocks_hero_buttons_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`background_image_id\` integer,
  	\`background_video_id\` integer,
  	\`overlay\` text DEFAULT 'medium',
  	\`height\` text DEFAULT 'full',
  	\`text_align\` text DEFAULT 'center',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_order_idx\` ON \`pages_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_parent_id_idx\` ON \`pages_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_path_idx\` ON \`pages_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_background_image_idx\` ON \`pages_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_hero_background_video_idx\` ON \`pages_blocks_hero\` (\`background_video_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_hero_locales\` (
  	\`heading\` text,
  	\`subheading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_hero_locales_locale_parent_id_unique\` ON \`pages_blocks_hero_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_content_content_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_content_items_order_idx\` ON \`pages_blocks_content_content_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_content_items_parent_id_idx\` ON \`pages_blocks_content_content_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_content_content_items_locales\` (
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_content_content_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_content_content_items_locales_locale_parent_id_\` ON \`pages_blocks_content_content_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`columns\` text DEFAULT 'one',
  	\`background_color\` text DEFAULT 'white',
  	\`padding_top\` text DEFAULT 'medium',
  	\`padding_bottom\` text DEFAULT 'medium',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_order_idx\` ON \`pages_blocks_content\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_parent_id_idx\` ON \`pages_blocks_content\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_content_path_idx\` ON \`pages_blocks_content\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta_buttons\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link\` text,
  	\`variant\` text DEFAULT 'primary',
  	\`icon\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_buttons_order_idx\` ON \`pages_blocks_cta_buttons\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_buttons_parent_id_idx\` ON \`pages_blocks_cta_buttons\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta_buttons_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_cta_buttons\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_cta_buttons_locales_locale_parent_id_unique\` ON \`pages_blocks_cta_buttons_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`background_image_id\` integer,
  	\`style\` text DEFAULT 'default',
  	\`background_color\` text DEFAULT 'primary',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_order_idx\` ON \`pages_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_parent_id_idx\` ON \`pages_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_path_idx\` ON \`pages_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_cta_background_image_idx\` ON \`pages_blocks_cta\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_cta_locales\` (
  	\`heading\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_cta_locales_locale_parent_id_unique\` ON \`pages_blocks_cta_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_gallery_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_images_order_idx\` ON \`pages_blocks_gallery_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_images_parent_id_idx\` ON \`pages_blocks_gallery_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_images_image_idx\` ON \`pages_blocks_gallery_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_gallery_images_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_gallery_images\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_gallery_images_locales_locale_parent_id_unique\` ON \`pages_blocks_gallery_images_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'grid',
  	\`columns\` text DEFAULT '3',
  	\`gap\` text DEFAULT 'medium',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_order_idx\` ON \`pages_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_parent_id_idx\` ON \`pages_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_gallery_path_idx\` ON \`pages_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_gallery_locales\` (
  	\`heading\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_gallery_locales_locale_parent_id_unique\` ON \`pages_blocks_gallery_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_stats_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`icon\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_stats_order_idx\` ON \`pages_blocks_stats_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_stats_parent_id_idx\` ON \`pages_blocks_stats_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_stats_stats_locales\` (
  	\`label\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_stats_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_stats_stats_locales_locale_parent_id_unique\` ON \`pages_blocks_stats_stats_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`style\` text DEFAULT 'default',
  	\`background_image_id\` integer,
  	\`animate\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_order_idx\` ON \`pages_blocks_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_parent_id_idx\` ON \`pages_blocks_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_path_idx\` ON \`pages_blocks_stats\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_stats_background_image_idx\` ON \`pages_blocks_stats\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_stats_locales\` (
  	\`heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_stats_locales_locale_parent_id_unique\` ON \`pages_blocks_stats_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_product_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`source\` text DEFAULT 'auto',
  	\`category_id\` integer,
  	\`limit\` numeric DEFAULT 6,
  	\`columns\` text DEFAULT '3',
  	\`show_c_t_a\` integer DEFAULT true,
  	\`cta_link\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`product_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_product_grid_order_idx\` ON \`pages_blocks_product_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_product_grid_parent_id_idx\` ON \`pages_blocks_product_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_product_grid_path_idx\` ON \`pages_blocks_product_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_product_grid_category_idx\` ON \`pages_blocks_product_grid\` (\`category_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_product_grid_locales\` (
  	\`heading\` text,
  	\`description\` text,
  	\`cta_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_product_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_product_grid_locales_locale_parent_id_unique\` ON \`pages_blocks_product_grid_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_timeline_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`year\` text,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_timeline\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_timeline_items_order_idx\` ON \`pages_blocks_timeline_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_timeline_items_parent_id_idx\` ON \`pages_blocks_timeline_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_timeline_items_image_idx\` ON \`pages_blocks_timeline_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_timeline_items_locales\` (
  	\`title\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_timeline_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_timeline_items_locales_locale_parent_id_unique\` ON \`pages_blocks_timeline_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_timeline\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'alternating',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_timeline_order_idx\` ON \`pages_blocks_timeline\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_timeline_parent_id_idx\` ON \`pages_blocks_timeline\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_timeline_path_idx\` ON \`pages_blocks_timeline\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_timeline_locales\` (
  	\`heading\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_timeline\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_timeline_locales_locale_parent_id_unique\` ON \`pages_blocks_timeline_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_testimonials_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`author\` text,
  	\`company\` text,
  	\`avatar_id\` integer,
  	\`logo_id\` integer,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_testimonials_order_idx\` ON \`pages_blocks_testimonials_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_testimonials_parent_id_idx\` ON \`pages_blocks_testimonials_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_testimonials_avatar_idx\` ON \`pages_blocks_testimonials_testimonials\` (\`avatar_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_testimonials_logo_idx\` ON \`pages_blocks_testimonials_testimonials\` (\`logo_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_testimonials_testimonials_locales\` (
  	\`quote\` text,
  	\`position\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_testimonials_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_testimonials_testimonials_locales_locale_parent\` ON \`pages_blocks_testimonials_testimonials_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'carousel',
  	\`autoplay\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_order_idx\` ON \`pages_blocks_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_parent_id_idx\` ON \`pages_blocks_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_blocks_testimonials_path_idx\` ON \`pages_blocks_testimonials\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`pages_blocks_testimonials_locales\` (
  	\`heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_blocks_testimonials_locales_locale_parent_id_unique\` ON \`pages_blocks_testimonials_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_type\` text DEFAULT 'simple',
  	\`hero_image_id\` integer,
  	\`status\` text DEFAULT 'draft',
  	\`parent_id\` integer,
  	\`show_in_nav\` integer DEFAULT false,
  	\`nav_order\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_hero_image_idx\` ON \`pages\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_parent_idx\` ON \`pages\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`pages__status_idx\` ON \`pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`pages_locales\` (
  	\`title\` text,
  	\`slug\` text,
  	\`hero_subtitle\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`meta_image_id\` integer,
  	\`meta_keywords\` text,
  	\`meta_no_index\` integer DEFAULT false,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_slug_idx\` ON \`pages_locales\` (\`slug\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`pages_meta_meta_image_idx\` ON \`pages_locales\` (\`meta_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_locales_locale_parent_id_unique\` ON \`pages_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_rels_order_idx\` ON \`pages_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_parent_idx\` ON \`pages_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_path_idx\` ON \`pages_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_products_id_idx\` ON \`pages_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_hero_buttons\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link\` text,
  	\`variant\` text DEFAULT 'primary',
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_buttons_order_idx\` ON \`_pages_v_blocks_hero_buttons\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_buttons_parent_id_idx\` ON \`_pages_v_blocks_hero_buttons\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_hero_buttons_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_hero_buttons\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_hero_buttons_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_hero_buttons_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`background_image_id\` integer,
  	\`background_video_id\` integer,
  	\`overlay\` text DEFAULT 'medium',
  	\`height\` text DEFAULT 'full',
  	\`text_align\` text DEFAULT 'center',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_order_idx\` ON \`_pages_v_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_parent_id_idx\` ON \`_pages_v_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_path_idx\` ON \`_pages_v_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_background_image_idx\` ON \`_pages_v_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_hero_background_video_idx\` ON \`_pages_v_blocks_hero\` (\`background_video_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_hero_locales\` (
  	\`heading\` text,
  	\`subheading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_hero_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_hero_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_content_content_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_content_items_order_idx\` ON \`_pages_v_blocks_content_content_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_content_items_parent_id_idx\` ON \`_pages_v_blocks_content_content_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_content_content_items_locales\` (
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_content_content_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_content_content_items_locales_locale_parent_\` ON \`_pages_v_blocks_content_content_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`columns\` text DEFAULT 'one',
  	\`background_color\` text DEFAULT 'white',
  	\`padding_top\` text DEFAULT 'medium',
  	\`padding_bottom\` text DEFAULT 'medium',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_order_idx\` ON \`_pages_v_blocks_content\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_parent_id_idx\` ON \`_pages_v_blocks_content\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_content_path_idx\` ON \`_pages_v_blocks_content\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cta_buttons\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`link\` text,
  	\`variant\` text DEFAULT 'primary',
  	\`icon\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_buttons_order_idx\` ON \`_pages_v_blocks_cta_buttons\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_buttons_parent_id_idx\` ON \`_pages_v_blocks_cta_buttons\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cta_buttons_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_cta_buttons\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_cta_buttons_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_cta_buttons_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`background_image_id\` integer,
  	\`style\` text DEFAULT 'default',
  	\`background_color\` text DEFAULT 'primary',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_order_idx\` ON \`_pages_v_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_parent_id_idx\` ON \`_pages_v_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_path_idx\` ON \`_pages_v_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_cta_background_image_idx\` ON \`_pages_v_blocks_cta\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_cta_locales\` (
  	\`heading\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_cta_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_cta_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_gallery_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_images_order_idx\` ON \`_pages_v_blocks_gallery_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_images_parent_id_idx\` ON \`_pages_v_blocks_gallery_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_images_image_idx\` ON \`_pages_v_blocks_gallery_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_gallery_images_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_gallery_images\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_gallery_images_locales_locale_parent_id_uniq\` ON \`_pages_v_blocks_gallery_images_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'grid',
  	\`columns\` text DEFAULT '3',
  	\`gap\` text DEFAULT 'medium',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_order_idx\` ON \`_pages_v_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_parent_id_idx\` ON \`_pages_v_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_gallery_path_idx\` ON \`_pages_v_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_gallery_locales\` (
  	\`heading\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_gallery_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_gallery_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_stats_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`value\` text,
  	\`icon\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_stats_stats_order_idx\` ON \`_pages_v_blocks_stats_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_stats_stats_parent_id_idx\` ON \`_pages_v_blocks_stats_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_stats_stats_locales\` (
  	\`label\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_stats_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_stats_stats_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_stats_stats_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`style\` text DEFAULT 'default',
  	\`background_image_id\` integer,
  	\`animate\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_stats_order_idx\` ON \`_pages_v_blocks_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_stats_parent_id_idx\` ON \`_pages_v_blocks_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_stats_path_idx\` ON \`_pages_v_blocks_stats\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_stats_background_image_idx\` ON \`_pages_v_blocks_stats\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_stats_locales\` (
  	\`heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_stats_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_stats_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_product_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`source\` text DEFAULT 'auto',
  	\`category_id\` integer,
  	\`limit\` numeric DEFAULT 6,
  	\`columns\` text DEFAULT '3',
  	\`show_c_t_a\` integer DEFAULT true,
  	\`cta_link\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`product_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_product_grid_order_idx\` ON \`_pages_v_blocks_product_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_product_grid_parent_id_idx\` ON \`_pages_v_blocks_product_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_product_grid_path_idx\` ON \`_pages_v_blocks_product_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_product_grid_category_idx\` ON \`_pages_v_blocks_product_grid\` (\`category_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_product_grid_locales\` (
  	\`heading\` text,
  	\`description\` text,
  	\`cta_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_product_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_product_grid_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_product_grid_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_timeline_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`year\` text,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_timeline\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timeline_items_order_idx\` ON \`_pages_v_blocks_timeline_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timeline_items_parent_id_idx\` ON \`_pages_v_blocks_timeline_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timeline_items_image_idx\` ON \`_pages_v_blocks_timeline_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_timeline_items_locales\` (
  	\`title\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_timeline_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_timeline_items_locales_locale_parent_id_uniq\` ON \`_pages_v_blocks_timeline_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_timeline\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'alternating',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timeline_order_idx\` ON \`_pages_v_blocks_timeline\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timeline_parent_id_idx\` ON \`_pages_v_blocks_timeline\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_timeline_path_idx\` ON \`_pages_v_blocks_timeline\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_timeline_locales\` (
  	\`heading\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_timeline\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_timeline_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_timeline_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_testimonials_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`author\` text,
  	\`company\` text,
  	\`avatar_id\` integer,
  	\`logo_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_testimonials_testimonials_order_idx\` ON \`_pages_v_blocks_testimonials_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_testimonials_testimonials_parent_id_idx\` ON \`_pages_v_blocks_testimonials_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_testimonials_testimonials_avatar_idx\` ON \`_pages_v_blocks_testimonials_testimonials\` (\`avatar_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_testimonials_testimonials_logo_idx\` ON \`_pages_v_blocks_testimonials_testimonials\` (\`logo_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_testimonials_testimonials_locales\` (
  	\`quote\` text,
  	\`position\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_testimonials_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_testimonials_testimonials_locales_locale_par\` ON \`_pages_v_blocks_testimonials_testimonials_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'carousel',
  	\`autoplay\` integer DEFAULT true,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_testimonials_order_idx\` ON \`_pages_v_blocks_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_testimonials_parent_id_idx\` ON \`_pages_v_blocks_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_blocks_testimonials_path_idx\` ON \`_pages_v_blocks_testimonials\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_blocks_testimonials_locales\` (
  	\`heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_blocks_testimonials_locales_locale_parent_id_unique\` ON \`_pages_v_blocks_testimonials_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_hero_type\` text DEFAULT 'simple',
  	\`version_hero_image_id\` integer,
  	\`version_status\` text DEFAULT 'draft',
  	\`version_parent_id\` integer,
  	\`version_show_in_nav\` integer DEFAULT false,
  	\`version_nav_order\` numeric DEFAULT 0,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	\`autosave\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_parent_idx\` ON \`_pages_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_hero_image_idx\` ON \`_pages_v\` (\`version_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_parent_idx\` ON \`_pages_v\` (\`version_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_updated_at_idx\` ON \`_pages_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_created_at_idx\` ON \`_pages_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version__status_idx\` ON \`_pages_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_created_at_idx\` ON \`_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_updated_at_idx\` ON \`_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_snapshot_idx\` ON \`_pages_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_published_locale_idx\` ON \`_pages_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_latest_idx\` ON \`_pages_v\` (\`latest\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_autosave_idx\` ON \`_pages_v\` (\`autosave\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_locales\` (
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_hero_subtitle\` text,
  	\`version_meta_title\` text,
  	\`version_meta_description\` text,
  	\`version_meta_image_id\` integer,
  	\`version_meta_keywords\` text,
  	\`version_meta_no_index\` integer DEFAULT false,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`version_meta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_slug_idx\` ON \`_pages_v_locales\` (\`version_slug\`,\`_locale\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_meta_version_meta_image_idx\` ON \`_pages_v_locales\` (\`version_meta_image_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_locales_locale_parent_id_unique\` ON \`_pages_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_order_idx\` ON \`_pages_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_parent_idx\` ON \`_pages_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_path_idx\` ON \`_pages_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_products_id_idx\` ON \`_pages_v_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE TABLE \`team\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`department\` text,
  	\`photo_id\` integer,
  	\`contact_email\` text,
  	\`contact_phone\` text,
  	\`contact_linkedin\` text,
  	\`order\` numeric DEFAULT 0,
  	\`is_active\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`photo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`team_photo_idx\` ON \`team\` (\`photo_id\`);`)
  await db.run(sql`CREATE INDEX \`team_updated_at_idx\` ON \`team\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`team_created_at_idx\` ON \`team\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`team_locales\` (
  	\`position\` text NOT NULL,
  	\`bio\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`team\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`team_locales_locale_parent_id_unique\` ON \`team_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`logo_id\` integer,
  	\`logo_dark_id\` integer,
  	\`favicon_id\` integer,
  	\`company_name\` text DEFAULT 'BAS Endüstriyel Çözümler ve Uygulama Ltd. Şti.',
  	\`phone\` text,
  	\`email\` text,
  	\`map_embed\` text,
  	\`social_facebook\` text,
  	\`social_twitter\` text,
  	\`social_linkedin\` text,
  	\`social_instagram\` text,
  	\`social_youtube\` text,
  	\`default_o_g_image_id\` integer,
  	\`google_analytics_id\` text,
  	\`google_tag_manager_id\` text,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`logo_dark_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`favicon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`default_o_g_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_logo_idx\` ON \`site_settings\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_logo_dark_idx\` ON \`site_settings\` (\`logo_dark_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_favicon_idx\` ON \`site_settings\` (\`favicon_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_default_o_g_image_idx\` ON \`site_settings\` (\`default_o_g_image_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_locales\` (
  	\`site_name\` text DEFAULT 'BAS Endüstriyel' NOT NULL,
  	\`site_description\` text,
  	\`address\` text,
  	\`working_hours\` text,
  	\`default_meta_title\` text,
  	\`default_meta_description\` text,
  	\`footer_text\` text,
  	\`copyright_text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_locales_locale_parent_id_unique\` ON \`site_settings_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_main_menu_children\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'internal',
  	\`external_link\` text,
  	\`open_in_new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_main_menu\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_main_menu_children_order_idx\` ON \`navigation_main_menu_children\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`navigation_main_menu_children_parent_id_idx\` ON \`navigation_main_menu_children\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_main_menu_children_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_main_menu_children\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`navigation_main_menu_children_locales_locale_parent_id_uniqu\` ON \`navigation_main_menu_children_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_main_menu\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'internal',
  	\`external_link\` text,
  	\`open_in_new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_main_menu_order_idx\` ON \`navigation_main_menu\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`navigation_main_menu_parent_id_idx\` ON \`navigation_main_menu\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_main_menu_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_main_menu\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`navigation_main_menu_locales_locale_parent_id_unique\` ON \`navigation_main_menu_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_footer_columns_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'internal',
  	\`external_link\` text,
  	\`open_in_new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_footer_columns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_footer_columns_links_order_idx\` ON \`navigation_footer_columns_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`navigation_footer_columns_links_parent_id_idx\` ON \`navigation_footer_columns_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_footer_columns_links_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_footer_columns_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`navigation_footer_columns_links_locales_locale_parent_id_uni\` ON \`navigation_footer_columns_links_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_footer_columns\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_footer_columns_order_idx\` ON \`navigation_footer_columns\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`navigation_footer_columns_parent_id_idx\` ON \`navigation_footer_columns\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_footer_columns_locales\` (
  	\`title\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_footer_columns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`navigation_footer_columns_locales_locale_parent_id_unique\` ON \`navigation_footer_columns_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_top_bar_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`type\` text DEFAULT 'internal',
  	\`external_link\` text,
  	\`open_in_new_tab\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_top_bar_links_order_idx\` ON \`navigation_top_bar_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`navigation_top_bar_links_parent_id_idx\` ON \`navigation_top_bar_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_top_bar_links_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation_top_bar_links\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`navigation_top_bar_links_locales_locale_parent_id_unique\` ON \`navigation_top_bar_links_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`show_top_bar\` integer DEFAULT true,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`navigation_locales\` (
  	\`top_bar_content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`navigation_locales_locale_parent_id_unique\` ON \`navigation_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`navigation_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`pages_id\` integer,
  	\`products_id\` integer,
  	\`product_categories_id\` integer,
  	\`projects_id\` integer,
  	\`project_categories_id\` integer,
  	\`news_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`navigation\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`product_categories_id\`) REFERENCES \`product_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`project_categories_id\`) REFERENCES \`project_categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`news_id\`) REFERENCES \`news\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`navigation_rels_order_idx\` ON \`navigation_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`navigation_rels_parent_idx\` ON \`navigation_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_rels_path_idx\` ON \`navigation_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`navigation_rels_pages_id_idx\` ON \`navigation_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_rels_products_id_idx\` ON \`navigation_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_rels_product_categories_id_idx\` ON \`navigation_rels\` (\`product_categories_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_rels_projects_id_idx\` ON \`navigation_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_rels_project_categories_id_idx\` ON \`navigation_rels\` (\`project_categories_id\`);`)
  await db.run(sql`CREATE INDEX \`navigation_rels_news_id_idx\` ON \`navigation_rels\` (\`news_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_hero_slides\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`background_image_id\` integer,
  	\`button_link\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_hero_slides_order_idx\` ON \`homepage_hero_slides\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_hero_slides_parent_id_idx\` ON \`homepage_hero_slides\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_hero_slides_background_image_idx\` ON \`homepage_hero_slides\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_hero_slides_locales\` (
  	\`heading\` text,
  	\`subheading\` text,
  	\`button_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_hero_slides\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`homepage_hero_slides_locales_locale_parent_id_unique\` ON \`homepage_hero_slides_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_hero_buttons\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link\` text NOT NULL,
  	\`variant\` text DEFAULT 'primary',
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_blocks_hero_buttons_order_idx\` ON \`homepage_blocks_hero_buttons\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_hero_buttons_parent_id_idx\` ON \`homepage_blocks_hero_buttons\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_hero_buttons_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_hero_buttons\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`homepage_blocks_hero_buttons_locales_locale_parent_id_unique\` ON \`homepage_blocks_hero_buttons_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_hero\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`background_image_id\` integer,
  	\`background_video_id\` integer,
  	\`overlay\` text DEFAULT 'medium',
  	\`height\` text DEFAULT 'full',
  	\`text_align\` text DEFAULT 'center',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`background_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_blocks_hero_order_idx\` ON \`homepage_blocks_hero\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_hero_parent_id_idx\` ON \`homepage_blocks_hero\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_hero_path_idx\` ON \`homepage_blocks_hero\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_hero_background_image_idx\` ON \`homepage_blocks_hero\` (\`background_image_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_hero_background_video_idx\` ON \`homepage_blocks_hero\` (\`background_video_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_hero_locales\` (
  	\`heading\` text NOT NULL,
  	\`subheading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_hero\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`homepage_blocks_hero_locales_locale_parent_id_unique\` ON \`homepage_blocks_hero_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_content_content_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_blocks_content_content_items_order_idx\` ON \`homepage_blocks_content_content_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_content_content_items_parent_id_idx\` ON \`homepage_blocks_content_content_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_content_content_items_locales\` (
  	\`content\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_content_content_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`homepage_blocks_content_content_items_locales_locale_parent_\` ON \`homepage_blocks_content_content_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_content\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`columns\` text DEFAULT 'one',
  	\`background_color\` text DEFAULT 'white',
  	\`padding_top\` text DEFAULT 'medium',
  	\`padding_bottom\` text DEFAULT 'medium',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_blocks_content_order_idx\` ON \`homepage_blocks_content\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_content_parent_id_idx\` ON \`homepage_blocks_content\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_content_path_idx\` ON \`homepage_blocks_content\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_cta_buttons\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`link\` text NOT NULL,
  	\`variant\` text DEFAULT 'primary',
  	\`icon\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_blocks_cta_buttons_order_idx\` ON \`homepage_blocks_cta_buttons\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_cta_buttons_parent_id_idx\` ON \`homepage_blocks_cta_buttons\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_cta_buttons_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_cta_buttons\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`homepage_blocks_cta_buttons_locales_locale_parent_id_unique\` ON \`homepage_blocks_cta_buttons_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`background_image_id\` integer,
  	\`style\` text DEFAULT 'default',
  	\`background_color\` text DEFAULT 'primary',
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_blocks_cta_order_idx\` ON \`homepage_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_cta_parent_id_idx\` ON \`homepage_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_cta_path_idx\` ON \`homepage_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_cta_background_image_idx\` ON \`homepage_blocks_cta\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_cta_locales\` (
  	\`heading\` text NOT NULL,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`homepage_blocks_cta_locales_locale_parent_id_unique\` ON \`homepage_blocks_cta_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_gallery_images\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer NOT NULL,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_blocks_gallery_images_order_idx\` ON \`homepage_blocks_gallery_images\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_gallery_images_parent_id_idx\` ON \`homepage_blocks_gallery_images\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_gallery_images_image_idx\` ON \`homepage_blocks_gallery_images\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_gallery_images_locales\` (
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_gallery_images\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`homepage_blocks_gallery_images_locales_locale_parent_id_uniq\` ON \`homepage_blocks_gallery_images_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_gallery\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'grid',
  	\`columns\` text DEFAULT '3',
  	\`gap\` text DEFAULT 'medium',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_blocks_gallery_order_idx\` ON \`homepage_blocks_gallery\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_gallery_parent_id_idx\` ON \`homepage_blocks_gallery\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_gallery_path_idx\` ON \`homepage_blocks_gallery\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_gallery_locales\` (
  	\`heading\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_gallery\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`homepage_blocks_gallery_locales_locale_parent_id_unique\` ON \`homepage_blocks_gallery_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_stats_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`value\` text NOT NULL,
  	\`icon\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_blocks_stats_stats_order_idx\` ON \`homepage_blocks_stats_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_stats_stats_parent_id_idx\` ON \`homepage_blocks_stats_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_stats_stats_locales\` (
  	\`label\` text NOT NULL,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_stats_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`homepage_blocks_stats_stats_locales_locale_parent_id_unique\` ON \`homepage_blocks_stats_stats_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_stats\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`style\` text DEFAULT 'default',
  	\`background_image_id\` integer,
  	\`animate\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`background_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_blocks_stats_order_idx\` ON \`homepage_blocks_stats\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_stats_parent_id_idx\` ON \`homepage_blocks_stats\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_stats_path_idx\` ON \`homepage_blocks_stats\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_stats_background_image_idx\` ON \`homepage_blocks_stats\` (\`background_image_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_stats_locales\` (
  	\`heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_stats\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`homepage_blocks_stats_locales_locale_parent_id_unique\` ON \`homepage_blocks_stats_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_product_grid\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`source\` text DEFAULT 'auto',
  	\`category_id\` integer,
  	\`limit\` numeric DEFAULT 6,
  	\`columns\` text DEFAULT '3',
  	\`show_c_t_a\` integer DEFAULT true,
  	\`cta_link\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`category_id\`) REFERENCES \`product_categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_blocks_product_grid_order_idx\` ON \`homepage_blocks_product_grid\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_product_grid_parent_id_idx\` ON \`homepage_blocks_product_grid\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_product_grid_path_idx\` ON \`homepage_blocks_product_grid\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_product_grid_category_idx\` ON \`homepage_blocks_product_grid\` (\`category_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_product_grid_locales\` (
  	\`heading\` text,
  	\`description\` text,
  	\`cta_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_product_grid\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`homepage_blocks_product_grid_locales_locale_parent_id_unique\` ON \`homepage_blocks_product_grid_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_timeline_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`year\` text NOT NULL,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_timeline\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_blocks_timeline_items_order_idx\` ON \`homepage_blocks_timeline_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_timeline_items_parent_id_idx\` ON \`homepage_blocks_timeline_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_timeline_items_image_idx\` ON \`homepage_blocks_timeline_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_timeline_items_locales\` (
  	\`title\` text NOT NULL,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_timeline_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`homepage_blocks_timeline_items_locales_locale_parent_id_uniq\` ON \`homepage_blocks_timeline_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_timeline\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'alternating',
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_blocks_timeline_order_idx\` ON \`homepage_blocks_timeline\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_timeline_parent_id_idx\` ON \`homepage_blocks_timeline\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_timeline_path_idx\` ON \`homepage_blocks_timeline\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_timeline_locales\` (
  	\`heading\` text,
  	\`description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_timeline\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`homepage_blocks_timeline_locales_locale_parent_id_unique\` ON \`homepage_blocks_timeline_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_testimonials_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`author\` text NOT NULL,
  	\`company\` text,
  	\`avatar_id\` integer,
  	\`logo_id\` integer,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_blocks_testimonials_testimonials_order_idx\` ON \`homepage_blocks_testimonials_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_testimonials_testimonials_parent_id_idx\` ON \`homepage_blocks_testimonials_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_testimonials_testimonials_avatar_idx\` ON \`homepage_blocks_testimonials_testimonials\` (\`avatar_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_testimonials_testimonials_logo_idx\` ON \`homepage_blocks_testimonials_testimonials\` (\`logo_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_testimonials_testimonials_locales\` (
  	\`quote\` text NOT NULL,
  	\`position\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_testimonials_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`homepage_blocks_testimonials_testimonials_locales_locale_par\` ON \`homepage_blocks_testimonials_testimonials_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_testimonials\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`layout\` text DEFAULT 'carousel',
  	\`autoplay\` integer DEFAULT true,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_blocks_testimonials_order_idx\` ON \`homepage_blocks_testimonials\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_testimonials_parent_id_idx\` ON \`homepage_blocks_testimonials\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_blocks_testimonials_path_idx\` ON \`homepage_blocks_testimonials\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`homepage_blocks_testimonials_locales\` (
  	\`heading\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage_blocks_testimonials\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`homepage_blocks_testimonials_locales_locale_parent_id_unique\` ON \`homepage_blocks_testimonials_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_type\` text DEFAULT 'slider',
  	\`hero_video_id\` integer,
  	\`show_featured_products\` integer DEFAULT true,
  	\`featured_products_limit\` numeric DEFAULT 6,
  	\`show_featured_projects\` integer DEFAULT true,
  	\`featured_projects_limit\` numeric DEFAULT 3,
  	\`show_latest_news\` integer DEFAULT true,
  	\`latest_news_limit\` numeric DEFAULT 4,
  	\`og_image_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_video_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_hero_video_idx\` ON \`homepage\` (\`hero_video_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_og_image_idx\` ON \`homepage\` (\`og_image_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_locales\` (
  	\`hero_video_heading\` text,
  	\`featured_products_title\` text,
  	\`featured_projects_title\` text,
  	\`latest_news_title\` text,
  	\`meta_title\` text,
  	\`meta_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`homepage_locales_locale_parent_id_unique\` ON \`homepage_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_rels_order_idx\` ON \`homepage_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_parent_idx\` ON \`homepage_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_path_idx\` ON \`homepage_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_products_id_idx\` ON \`homepage_rels\` (\`products_id\`);`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`name\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`avatar_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`users_avatar_idx\` ON \`users\` (\`avatar_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`products_id\` integer REFERENCES products(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`product_categories_id\` integer REFERENCES product_categories(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`projects_id\` integer REFERENCES projects(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`project_categories_id\` integer REFERENCES project_categories(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`news_id\` integer REFERENCES news(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`pages_id\` integer REFERENCES pages(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`team_id\` integer REFERENCES team(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_products_id_idx\` ON \`payload_locked_documents_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_product_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`product_categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_project_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`project_categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_news_id_idx\` ON \`payload_locked_documents_rels\` (\`news_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_team_id_idx\` ON \`payload_locked_documents_rels\` (\`team_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_roles\`;`)
  await db.run(sql`DROP TABLE \`products_gallery\`;`)
  await db.run(sql`DROP TABLE \`products_gallery_locales\`;`)
  await db.run(sql`DROP TABLE \`products_specifications\`;`)
  await db.run(sql`DROP TABLE \`products_specifications_locales\`;`)
  await db.run(sql`DROP TABLE \`products\`;`)
  await db.run(sql`DROP TABLE \`products_locales\`;`)
  await db.run(sql`DROP TABLE \`products_rels\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_gallery\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_gallery_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_specifications\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_specifications_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v\`;`)
  await db.run(sql`DROP TABLE \`_products_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_rels\`;`)
  await db.run(sql`DROP TABLE \`product_categories\`;`)
  await db.run(sql`DROP TABLE \`product_categories_locales\`;`)
  await db.run(sql`DROP TABLE \`projects_highlights\`;`)
  await db.run(sql`DROP TABLE \`projects_highlights_locales\`;`)
  await db.run(sql`DROP TABLE \`projects_gallery\`;`)
  await db.run(sql`DROP TABLE \`projects_gallery_locales\`;`)
  await db.run(sql`DROP TABLE \`projects\`;`)
  await db.run(sql`DROP TABLE \`projects_locales\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_version_highlights\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_version_highlights_locales\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_version_gallery\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_version_gallery_locales\`;`)
  await db.run(sql`DROP TABLE \`_projects_v\`;`)
  await db.run(sql`DROP TABLE \`_projects_v_locales\`;`)
  await db.run(sql`DROP TABLE \`project_categories\`;`)
  await db.run(sql`DROP TABLE \`project_categories_locales\`;`)
  await db.run(sql`DROP TABLE \`news\`;`)
  await db.run(sql`DROP TABLE \`news_locales\`;`)
  await db.run(sql`DROP TABLE \`news_texts\`;`)
  await db.run(sql`DROP TABLE \`_news_v\`;`)
  await db.run(sql`DROP TABLE \`_news_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_news_v_texts\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_hero_buttons\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_hero_buttons_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_hero_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_content_content_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_content_content_items_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_content\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta_buttons\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta_buttons_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_cta_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_gallery_images\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_gallery_images_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_gallery_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_stats_stats\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_stats_stats_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_stats\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_stats_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_product_grid\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_product_grid_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_timeline_items\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_timeline_items_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_timeline\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_timeline_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_testimonials_testimonials\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_testimonials_testimonials_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_testimonials\`;`)
  await db.run(sql`DROP TABLE \`pages_blocks_testimonials_locales\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`DROP TABLE \`pages_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_rels\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_hero_buttons\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_hero_buttons_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_hero_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_content_content_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_content_content_items_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_content\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cta_buttons\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cta_buttons_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_cta_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_gallery_images\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_gallery_images_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_gallery_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_stats_stats\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_stats_stats_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_stats\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_stats_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_product_grid\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_product_grid_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_timeline_items\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_timeline_items_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_timeline\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_timeline_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_testimonials_testimonials\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_testimonials_testimonials_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_testimonials\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_blocks_testimonials_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_rels\`;`)
  await db.run(sql`DROP TABLE \`team\`;`)
  await db.run(sql`DROP TABLE \`team_locales\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings_locales\`;`)
  await db.run(sql`DROP TABLE \`navigation_main_menu_children\`;`)
  await db.run(sql`DROP TABLE \`navigation_main_menu_children_locales\`;`)
  await db.run(sql`DROP TABLE \`navigation_main_menu\`;`)
  await db.run(sql`DROP TABLE \`navigation_main_menu_locales\`;`)
  await db.run(sql`DROP TABLE \`navigation_footer_columns_links\`;`)
  await db.run(sql`DROP TABLE \`navigation_footer_columns_links_locales\`;`)
  await db.run(sql`DROP TABLE \`navigation_footer_columns\`;`)
  await db.run(sql`DROP TABLE \`navigation_footer_columns_locales\`;`)
  await db.run(sql`DROP TABLE \`navigation_top_bar_links\`;`)
  await db.run(sql`DROP TABLE \`navigation_top_bar_links_locales\`;`)
  await db.run(sql`DROP TABLE \`navigation\`;`)
  await db.run(sql`DROP TABLE \`navigation_locales\`;`)
  await db.run(sql`DROP TABLE \`navigation_rels\`;`)
  await db.run(sql`DROP TABLE \`homepage_hero_slides\`;`)
  await db.run(sql`DROP TABLE \`homepage_hero_slides_locales\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_hero_buttons\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_hero_buttons_locales\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_hero\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_hero_locales\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_content_content_items\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_content_content_items_locales\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_content\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_cta_buttons\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_cta_buttons_locales\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_cta_locales\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_gallery_images\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_gallery_images_locales\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_gallery\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_gallery_locales\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_stats_stats\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_stats_stats_locales\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_stats\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_stats_locales\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_product_grid\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_product_grid_locales\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_timeline_items\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_timeline_items_locales\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_timeline\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_timeline_locales\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_testimonials_testimonials\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_testimonials_testimonials_locales\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_testimonials\`;`)
  await db.run(sql`DROP TABLE \`homepage_blocks_testimonials_locales\`;`)
  await db.run(sql`DROP TABLE \`homepage\`;`)
  await db.run(sql`DROP TABLE \`homepage_locales\`;`)
  await db.run(sql`DROP TABLE \`homepage_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_users\`("id", "updated_at", "created_at", "email", "reset_password_token", "reset_password_expiration", "salt", "hash", "login_attempts", "lock_until") SELECT "id", "updated_at", "created_at", "email", "reset_password_token", "reset_password_expiration", "salt", "hash", "login_attempts", "lock_until" FROM \`users\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`ALTER TABLE \`__new_users\` RENAME TO \`users\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
}
