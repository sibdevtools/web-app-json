// Base interface for all schema nodes
export interface BaseSchemaNode {
  nodeType: 'simple' | 'oneOf' | 'anyOf' | 'allOf';
  type: 'undefined' | 'string' | 'boolean' | 'number' | 'integer' | 'object' | 'array' | 'null';
  specification: 'none' | 'enum' | 'const' | 'reference';
  const?: string;
  enum?: Array<string>;
  reference?: string;
  definitions?: Record<string, SchemaNode>;
  nullable: boolean;
  title: string;
  description: string;
  default?: string;
  schema?: string;
  examples?: string[];
  allOf?: SchemaNode[];
  anyOf?: SchemaNode[];
  oneOf?: SchemaNode[];
}

// Interface for string type schema nodes
export interface StringSchemaNode extends BaseSchemaNode {
  type: 'string';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
}

// Interface for number/integer type schema nodes
export interface NumberSchemaNode extends BaseSchemaNode {
  type: 'number' | 'integer';
  minimum?: number;
  exclusiveMinimum?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;
}

// Interface for object type schema nodes
export interface ObjectSchemaNode extends BaseSchemaNode {
  type: 'object';
  properties?: Array<{
    name: string;
    required: boolean;
    schema: SchemaNode;
  }>;
  patternProperties?: Array<{
    name: string;
    schema: SchemaNode;
  }>;
  additionalProperties?: boolean;
  minProperties?: number;
  maxProperties?: number;
}

// Interface for array type schema nodes
export interface ArraySchemaNode extends BaseSchemaNode {
  type: 'array';
  items?: SchemaNode;
  minItems?: number;
  maxItems?: number;
}

// Union type for all schema nodes
export type SchemaNode =
  | BaseSchemaNode
  | StringSchemaNode
  | NumberSchemaNode
  | ObjectSchemaNode
  | ArraySchemaNode;
