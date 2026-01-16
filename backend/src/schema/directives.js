import { GraphQLScalarType, GraphQLError } from 'graphql';

// Custom DateTime scalar
export const DateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime scalar type',
  serialize(value) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'string') {
      return value;
    }
    throw new GraphQLError('Value is not a valid DateTime');
  },
  parseValue(value) {
    if (typeof value === 'string') {
      return new Date(value);
    }
    throw new GraphQLError('Value is not a valid DateTime string');
  },
  parseLiteral(ast) {
    if (ast.kind === 'StringValue') {
      return new Date(ast.value);
    }
    throw new GraphQLError('Value is not a valid DateTime string');
  },
});
