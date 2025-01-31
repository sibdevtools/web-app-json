import { initialSchema } from '../components/SchemaFormBuilder';
import {
  ArraySchemaNode,
  BaseSchemaNode,
  NumberSchemaNode,
  ObjectSchemaNode,
  SchemaNode,
  StringSchemaNode
} from '../const/type';

export function convertToJsonSchema(node: SchemaNode, isRoot: boolean = false): any {
  const baseType = node.type === 'null' ? 'null' : node.type;
  const type = node.nullable ? ['null', baseType] : baseType;

  const schema: any = {
    title: node.title || undefined,
    description: node.description || undefined,
  };

  if (baseType !== 'undefined') {
    schema.type = type;
  }

  if (node.nodeType === 'simple') {
    switch (node.type) {
      case 'string':
        const stringNode = node as StringSchemaNode;
        if (stringNode.minLength !== undefined) schema.minLength = stringNode.minLength;
        if (stringNode.maxLength !== undefined) schema.maxLength = stringNode.maxLength;
        if (stringNode.pattern) schema.pattern = stringNode.pattern;
        if (stringNode.format) schema.format = stringNode.format;
        break;
      case 'integer':
      case 'number':
        const numberNode = node as NumberSchemaNode;
        if (numberNode.minimum !== undefined) schema.minimum = numberNode.minimum;
        if (numberNode.exclusiveMinimum !== undefined) schema.exclusiveMinimum = numberNode.exclusiveMinimum;
        if (numberNode.maximum !== undefined) schema.maximum = numberNode.maximum;
        if (numberNode.exclusiveMaximum !== undefined) schema.exclusiveMaximum = numberNode.exclusiveMaximum;
        if (numberNode.multipleOf !== undefined) schema.multipleOf = numberNode.multipleOf;
        break;
      case 'object':
        const objectNode = node as ObjectSchemaNode;
        schema.additionalProperties = objectNode.additionalProperties;
        if (objectNode.properties) {
          schema.properties = objectNode.properties.reduce((acc, prop) => {
            acc[prop.name] = convertToJsonSchema(prop.schema);
            return acc;
          }, {} as Record<string, any>);

          const required = objectNode.properties
            .filter(prop => prop.required)
            .map(prop => prop.name);
          if (required.length > 0) {
            schema.required = required;
          }
        }
        if (objectNode.patternProperties) {
          schema.patternProperties = objectNode.patternProperties.reduce((acc, prop) => {
            acc[prop.name] = convertToJsonSchema(prop.schema);
            return acc;
          }, {} as Record<string, any>);
        }
        break;
      case 'array':
        const arrayNode = node as ArraySchemaNode;
        if (arrayNode.items) schema.items = convertToJsonSchema(arrayNode.items);
        if (arrayNode.minItems !== undefined) schema.minItems = arrayNode.minItems;
        if (arrayNode.maxItems !== undefined) schema.maxItems = arrayNode.maxItems;
        break;
    }

    switch (node.specification) {
      case 'const':
        if (node.const) schema.const = JSON.parse(node.const);
        break;
      case 'enum':
        if (node.enum) schema.enum = node.enum?.map(it => JSON.parse(it));
        break;
      case 'reference':
        if (node.reference) {
          schema.$ref = node.reference;
        }
        break;
    }
  } else {
    schema[node.nodeType] = node[node.nodeType]?.map(schemaNode => convertToJsonSchema(schemaNode));
  }

  if (isRoot && node.definitions) {
    schema.$defs = Object.entries(node.definitions).reduce((acc, [name, defNode]) => {
      acc[name] = convertToJsonSchema(defNode);
      return acc;
    }, {} as Record<string, any>);
  }

  return schema;
}


export function parseJsonSchema(json: any): SchemaNode {
  let type: SchemaNode['type'] = 'undefined';
  let specification: SchemaNode['specification'] = 'none';
  let nullable = false;

  let nodeType: 'simple' | 'oneOf' | 'anyOf' | 'allOf' = 'simple';
  if (json.oneOf) nodeType = 'oneOf';
  else if (json.anyOf) nodeType = 'anyOf';
  else if (json.allOf) nodeType = 'allOf';

  if (Array.isArray(json.type)) {
    const types = json.type.filter((t: string) => t !== 'null');
    type = types[0] || 'null';
    nullable = json.type.includes('null');
  } else if (typeof json.type === 'string') {
    type = json.type as SchemaNode['type'];
  }

  if ('const' in json) {
    specification = 'const'
  } else if ('enum' in json) {
    specification = 'enum'
  } else if ('$ref' in json) {
    specification = 'reference'
  }

  const baseNode: BaseSchemaNode = {
    nodeType,
    type,
    specification,
    nullable,
    title: json.title || '',
    description: json.description || '',
  };

  switch (specification) {
    case 'const':
      baseNode.const = JSON.stringify(json.const);
      break;
    case 'enum':
      const jsonEnum = json.enum;
      baseNode.enum = []
      if (jsonEnum && typeof jsonEnum[Symbol.iterator] === 'function') {
        for (let jsonEnumItem of jsonEnum) {
          baseNode.enum.push(JSON.stringify(jsonEnumItem))
        }
      }
      break;
    case 'reference':
      baseNode.reference = json['$ref']
      break;
  }

  if (json.allOf) {
    baseNode.allOf = json.allOf.map((schema: any) => parseJsonSchema(schema));
  }
  if (json.anyOf) {
    baseNode.anyOf = json.anyOf.map((schema: any) => parseJsonSchema(schema));
  }
  if (json.oneOf) {
    baseNode.oneOf = json.oneOf.map((schema: any) => parseJsonSchema(schema));
  }

  if (json.$defs) {
    const definitions: Record<string, SchemaNode> = {};
    for (const [name, defJson] of Object.entries(json.$defs)) {
      definitions[name] = parseJsonSchema(defJson);
    }
    baseNode.definitions = definitions;
  }

  switch (type) {
    case 'string':
      return {
        ...baseNode,
        minLength: json.minLength,
        maxLength: json.maxLength,
        pattern: json.pattern,
        format: json.format,
      } as StringSchemaNode
    case 'integer':
    case 'number':
      return {
        ...baseNode,
        minimum: json.minimum,
        exclusiveMinimum: json.exclusiveMinimum,
        maximum: json.maximum,
        exclusiveMaximum: json.exclusiveMaximum,
        multipleOf: json.multipleOf,
      } as NumberSchemaNode
    case 'object':
      return {
        ...baseNode,
        additionalProperties: json.additionalProperties,
        properties: Object.entries(json.properties || {}).map(([name, prop]) => ({
          name,
          required: (json.required || []).includes(name),
          schema: parseJsonSchema(prop)
        })),
        patternProperties: Object.entries(json.patternProperties || {}).map(([name, prop]) => ({
          name,
          schema: parseJsonSchema(prop)
        }))
      } as ObjectSchemaNode
    case 'array':
      return {
        ...baseNode,
        items: json.items ? parseJsonSchema(json.items) : initialSchema,
        minItems: json.minItems,
        maxItems: json.maxItems,
      } as ArraySchemaNode
  }

  return baseNode;
}
