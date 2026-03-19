/* eslint-disable */
/**
 * STUB: Generated data model types.
 * This file is a placeholder until `npx convex dev` generates the real one.
 * @module
 */

// Type-only exports — these are erased at runtime, which is correct.
export type Id<TableName extends string = string> = string & { __tableName: TableName };
export type Doc<TableName extends string = string> = Record<string, any> & {
  _id: Id<TableName>;
  _creationTime: number;
};
export type TableNames = string;
export type DataModel = Record<string, any>;
