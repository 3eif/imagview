import {
  pgTable,
  text,
  timestamp,
  decimal,
  pgEnum,
  json,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const shapeEnum = pgEnum("shape", [
  "rectangle",
  "circle",
  "line",
  "arrow",
  "path",
]);

export const images = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  storageKey: text("storage_key").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const annotations = pgTable("annotations", {
  id: uuid("id").primaryKey().defaultRandom(),
  imageId: uuid("image_id")
    .notNull()
    .references(() => images.id, { onDelete: "cascade" }),
  x: decimal("x").notNull(),
  y: decimal("y").notNull(),
  width: decimal("width").notNull(),
  height: decimal("height").notNull(),
  rotation: decimal("rotation"),
  shape: shapeEnum("shape").notNull(),
  points: json("points").$type<{ x: number; y: number }[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  annotationId: uuid("annotation_id")
    .notNull()
    .references(() => annotations.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shareLinks = pgTable("share_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  imageId: uuid("image_id")
    .notNull()
    .references(() => images.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const imagesRelations = relations(images, ({ many }) => ({
  annotations: many(annotations),
  shareLinks: many(shareLinks),
}));

export const annotationsRelations = relations(annotations, ({ one, many }) => ({
  image: one(images, {
    fields: [annotations.imageId],
    references: [images.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  annotation: one(annotations, {
    fields: [comments.annotationId],
    references: [annotations.id],
  }),
}));

export const shareLinksRelations = relations(shareLinks, ({ one }) => ({
  image: one(images, {
    fields: [shareLinks.imageId],
    references: [images.id],
  }),
}));
