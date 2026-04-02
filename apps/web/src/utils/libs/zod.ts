import type { Primitive, ZodErrorMap, ZodLiteral, ZodNever, ZodParsedType, ZodSchema } from 'zod'
import { ZodIssueCode, z } from 'zod'

type MappedZodLiterals<T extends readonly Primitive[]> = {
  -readonly [K in keyof T]: ZodLiteral<T[K]>
}

export function createUnionSchemaLongerThanOne<A extends Readonly<[Primitive, Primitive, ...Primitive[]]>>(
  literals: A,
) {
  return z.union(literals.map((value) => z.literal(value)) as MappedZodLiterals<A>)
}

export function createUnionSchema<T extends readonly []>(values: T): ZodNever
export function createUnionSchema<T extends readonly [Primitive]>(values: T): ZodLiteral<T[0]>
export function createUnionSchema<T extends readonly [Primitive, Primitive, ...Primitive[]]>(
  values: T,
): z.ZodUnion<MappedZodLiterals<T>>

export function createUnionSchema<T extends readonly Primitive[]>(values: T) {
  if (values.length > 1) {
    return createUnionSchemaLongerThanOne(values as typeof values & [Primitive, Primitive, ...Primitive[]])
  }
  if (values.length === 1) {
    return z.literal(values[0])
  }
  if (values.length === 0) {
    return z.never()
  }
  throw new Error('Array must have a length')
}

export function createOmitArgsBySchema<T extends object>(shape: T): { [_ in keyof T]: true } {
  const keys = Object.keys(shape) as (keyof T)[]

  const result: Partial<{ [_ in keyof T]: true }> = {}

  keys.forEach((key) => {
    result[key] = true
  })

  return result as { [_ in keyof T]: true } // Object.keysで全てkeyが列挙されており、安全に asを使用できる
}

export const isTypeOf =
  <S extends ZodSchema>(schema: S): ((value: unknown) => value is z.infer<typeof schema>) =>
  (value: unknown): value is z.infer<typeof schema> => {
    const parsedData = schema.safeParse(value)
    if (parsedData.success) return true
    return false
  }

// https://github.com/colinhacks/zod/issues/372
type Implements<Model> = {
  [key in keyof Model]-?: undefined extends Model[key]
    ? null extends Model[key]
      ? z.ZodNullableType<z.ZodOptionalType<z.ZodType<Model[key]>>>
      : z.ZodOptionalType<z.ZodType<Model[key]>>
    : null extends Model[key]
      ? z.ZodNullableType<z.ZodType<Model[key]>>
      : z.ZodType<Model[key]>
}
export function typeToSchema<Model = never>() {
  return {
    with: <
      Schema extends Implements<Model> & {
        [_ in Exclude<keyof Schema, keyof Model>]: never
      },
    >(
      schema: Schema,
    ) => z.object(schema),
  }
}

export const numberLikeString = z.string().transform((value) => {
  try {
    const num = Number(value)
    if (Number.isNaN(num)) {
      return 0
    }
    return num
  } catch {
    return 0
  }
})

export const getParsed = <O, Schema extends ZodSchema<O>>(
  schema: Schema,
  value: unknown,
  verbose = false,
): z.infer<Schema> | undefined => {
  const parsed = schema.safeParse(value)
  if (parsed.success) return parsed.data
  if (verbose) console.error(parsed.error.errors.map((error) => ({ ...error, path: error.path.join('.') })))
  return
}

const invalidTypeMessages: Partial<Record<ZodParsedType, string>> = {
  number: '半角数字で入力してください。',
  integer: '整数で入力してください。',
  float: '小数で入力してください。',
  string: '文字列を入力してください。',
  boolean: '真偽値を入力してください。',
  date: '日付を入力してください。',
}

const invalidStringMessages: Partial<Record<string, string>> = {
  url: '対応していないURLの形式を含んでいます。',
  email: '対応していないメールアドレスの形式を含んでいます。',
}

function handleTooBig(issue: z.ZodTooBigIssue): string | undefined {
  const max = issue.maximum.toString()
  if (issue.type === 'string' || issue.type === 'number') return `${max}以下である必要があります。`
  if (issue.type === 'array') return `${max}個以下である必要があります。`
  return undefined
}

function handleTooSmall(issue: z.ZodTooSmallIssue): string | undefined {
  const min = issue.minimum.toString()
  if (issue.type === 'string') return min === '1' ? '必須項目です。' : '入力形式が正しくありません。'
  if (issue.type === 'array') return `${min}個以上である必要があります。`
  if (issue.type === 'number') return `${min}以上である必要があります。`
  return undefined
}

export const zodFormErrorMap: ZodErrorMap = (issue, ctx) => {
  const defaultError = { message: ctx.defaultError }
  switch (issue.code) {
    case ZodIssueCode.invalid_type: {
      const msg = invalidTypeMessages[issue.expected]
      return msg ? { message: msg } : defaultError
    }
    case ZodIssueCode.invalid_string: {
      const msg = invalidStringMessages[issue.validation as string]
      return msg ? { message: msg } : defaultError
    }
    case ZodIssueCode.too_big: {
      const msg = handleTooBig(issue)
      return msg ? { message: msg } : defaultError
    }
    case ZodIssueCode.too_small: {
      const msg = handleTooSmall(issue)
      return msg ? { message: msg } : defaultError
    }
    default:
      return defaultError
  }
}
