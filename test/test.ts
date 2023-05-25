import { describe, expect, test } from '@jest/globals'
import * as Lang from "../src/lang"
import * as Lex from '../src/lexer'
import * as P from "../src/parser"
import * as Inter from '../src/interpreter'

let dumb: Lang.Env

describe('parser.ts and lexer.ts tests', () => {
  test('integers', () => {
    expect(P.parse('3')).toEqual(Lang.add(Lang.tInt(3), Lang.tInt(0)))
  })
  test('Short expression with whitespace', () => {
    expect(P.parse('3 +         2')).toEqual(Lang.add(Lang.tInt(2), Lang.add(Lang.tInt(3), Lang.tInt(0))))
  })

  test(' Short Expression evaluation', () => {
    expect(Inter.evaluate(dumb, P.parse('3 +         2'))).toEqual(Lang.tInt(5))
  })

  test('Long Expression evaluation', () => {
    expect(Inter.evaluate(dumb, P.parse('(3 + 2) + 2'))).toEqual(Lang.tInt(7))
  })

  test('Longer Expression evaluation', () => {
    expect(Inter.evaluate(dumb, P.parse('(3 + 2) + (2 + (5 + 6) )'))).toEqual(Lang.tInt(18))
  })

  test('floating-point numbers evaluation', () => {
    expect(Inter.evaluate(dumb, P.parse('3.545454'))).toEqual(Lang.tFLPO(3.545454))
  })

  test('floating-point numbers added to int evaluation', () => {
    expect(Inter.evaluate(dumb, P.parse('3.545454 + 3'))).toEqual(Lang.tFLPO(6.545453999999999))
  })

  test('floating-point numbers added to int evaluation 2', () => {
    expect(Inter.evaluate(dumb, P.parse('3 + 3.545454'))).toEqual(Lang.tFLPO(6.545453999999999))
  })

  test('floating-point numbers added to flpo evaluation 2', () => {
    expect(Inter.evaluate(dumb, P.parse('43.312121 + 3.545454'))).toEqual(Lang.tFLPO(46.857575))
  })
})

describe('object implementation tests', () => {
  test('basic declaration', () => {
    let objVals = new Map<string, Lang.Value>()

    objVals.set('x', Lang.tInt(3))
    objVals.set('y', Lang.tInt(4))

    expect(P.parse('{ x : 3 , y : 4}')).toEqual(Lang.obj(objVals))
  })

  test('inheritance ', () => {
    let objVals = new Map<string, Lang.Value>()

    objVals.set('x', Lang.tInt(3))
    objVals.set('y', Lang.tInt(4))
    objVals.set('z', Lang.tInt(3))

    expect(P.parse('{ x : 3 , y : 4 , { z : 3 } }')).toEqual(Lang.obj(objVals))
  })

  test('inheritance overrides', () => {
    let objVals = new Map<string, Lang.Value>()

    objVals.set('x', Lang.tInt(3))
    objVals.set('y', Lang.tInt(4))

    expect(P.parse('{ x : 3 , y : 4 , { x : 30 } }')).toEqual(Lang.obj(objVals))
  })

  /* Multiple inheritance does not work yet, not necessary for CSC-312 Project
  test('multiple inheritance', () => {
    let objVals = new Map<string, Lang.Value>()

    objVals.set('x', Lang.tInt(3))
    objVals.set('a', Lang.tFLPO(3.14))
    objVals.set('b', Lang.tInt(2))
    objVals.set('y', Lang.tInt(4))
    objVals.set('z', Lang.tInt(3))

    expect(P.parse('{ x : 3 , y : 4 , { a : 3.14 , b : 2 } , { z : 3 } }')).toEqual(Lang.obj(objVals))
  })
  */ 
  
  // still need to:
  //  - add variables ( I want to do 'Define' operator and 'Call' operator)
  //  - add '.' operator for objects
  //     SAMPLE:                       Define x = 3;  Call x + 3
  //  - add public/private operator for objects
})


describe('Variable implementation tests', () => {
  test('basic declaration', () => {
    let varVals = new Map<string, Lang.Exp>()

    varVals.set('x', Lang.add(Lang.tInt(3), Lang.tInt(0)))

    P.parse('Define x 3')

    expect(P.context).toEqual(varVals)
  })

  test('objects declaration', () => {
    let varVals = new Map<string, Lang.Exp>()

    let objVals = new Map<string, Lang.Value>()

    objVals.set('y', Lang.tInt(5))
    objVals.set('z', Lang.tInt(10))

    varVals.set('x', Lang.obj(objVals))

    P.parse('Define x { y : 5, z : 10 }')

    expect(P.context).toEqual(varVals)
  })

  test('basic call', () => {
    P.parse('Define x 3')

    expect(P.parse('Call x')).toEqual(Lang.add(Lang.add(Lang.tInt(3), Lang.tInt(0)), Lang.tInt(0)))
  })

  test('objects call', () => {

    P.parse('Define x { a : 0 , b : 5 }')

    expect(P.parse('Call x . b')).toEqual(Lang.add(Lang.tInt(5), Lang.tInt(0)))
  })
})


