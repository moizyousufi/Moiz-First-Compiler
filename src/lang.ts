/**
 * lang.ts defines the grammar of the language
 * This creates the Abstract Syntax Tree for our language
 */




// types
export type TVar = { tag: "var"; value: string };
export const tVar = (value: string): TVar => ({ tag: "var", value });

export type TInt = { tag: "int"; value: number };
export const tInt = (value: number): TInt => ({ tag: "int", value });

export type TFLPO = { tag: "flpo"; value: number }
export const tFLPO = (value: number): TFLPO => ({ tag: "flpo", value });

export type TNull = { tag: "null" }
export const tNull = (): TNull => ({ tag: "null" })

// operations
export type TAdd = { tag: "add"; lhs: Exp; rhs: Exp }
export const add = (lhs: Exp, rhs: Exp): TAdd => ({ tag: "add", lhs, rhs })

export type TLam = { tag: 'lam', params: string[], body: Exp }
export const lam = (params: string[], body: Exp): TLam => ({ tag: 'lam', params, body })



// object 
export type TKeyword = {tag: 'keyword', value: string}
export const keyword = (value: string): TKeyword => ({tag: 'keyword', value})

export type TObj = {tag: 'obj', fields: Map<string, Value>}
export const obj = (fields: Map<string, Value>): TObj => ({tag: 'obj', fields})

// primitive functions
export type TPrim = { tag: 'prim', name: string, fn: (args: Value[]) => Value }
export const prim = (name: string, fn: (args: Value[]) => Value): TPrim => ({tag: 'prim', name, fn})

export type TClosure = { tag: 'closure', params: string[], body: Exp, env: Env }
export const closure = (params: string[], body: Exp, env: Env): TClosure => ({ tag: 'closure', params, body, env })

// Exp and Value definitions
export type Exp = TVar | TInt | TFLPO | TAdd | TLam | TNull | TKeyword | TObj

export type Value = TInt | TFLPO | TPrim | TClosure | TNull | TKeyword | TObj




// typechecker versions
export type TyInt = { tag: 'int' }
export const tyint: Typ = { tag: 'int' }

export type tyFLPO = { tag: 'flpo' }
export const tyflpo: Typ = { tag: 'flpo' }

export type tyNull = { tag: 'null' }
export const tynull: Typ = { tag: 'null' }

export type tyObj = {tag: 'obj'}
export const tyobj: Typ = {tag: 'obj'}

export type Typ = TyInt | tyFLPO | tyNull | tyObj



// Statements
export type Stmt = SDefine | SPrint
export type SDefine = { tag: 'define', id: string, exp: Exp }
export type SPrint = { tag: 'print', exp: Exp }

export const sdefine = (id: string, exp: Exp): SDefine => ({ tag: 'define', id, exp })
export const sprint = (exp: Exp): SPrint => ({ tag: 'print', exp })


export type Prog = Stmt[]

/******* Runtime Environment  ************************************************/
/******* (adapted from Peter-Michael Osera in Lab 07-Prototypes) *************/

export class Env 
{
    private outer?: Env
    private bindings: Map<string, Value>
  
    constructor (bindings?: Map<string, Value>) 
    {
      this.bindings = bindings || new Map()
    }
  
    has (x: string): boolean 
    {
      return this.bindings.has(x) || (this.outer !== undefined && this.outer.has(x))
    }
  
    get (x: string): Value 
    {
      if (this.bindings.has(x)) 
      {
        return this.bindings.get(x)!
      } 
      else if (this.outer !== undefined) 
      {
        return this.outer.get(x)
      } 
      else 
      {
        throw new Error(`Runtime error: unbound variable '${x}'`)
      }
    }
  
    set (x: string, v: Value): void 
    {
      if (this.bindings.has(x)) 
      {
        throw new Error(`Runtime error: redefinition of variable '${x}'`)
      } 
      else 
      {
        this.bindings.set(x, v)
      }
    }
  
    update (x: string, v: Value): void {
      this.bindings.set(x, v)
      if (this.bindings.has(x)) 
      {
        this.bindings.set(x, v)
      } 
      else if (this.outer !== undefined) 
      {
        return this.outer.update(x, v)
      } 
      else 
      {
        throw new Error(`Runtime error: unbound variable '${x}'`)
      }
    }
  
    extend1 (x: string, v: Value): Env 
    {
      const ret = new Env()
      ret.outer = this
      ret.bindings = new Map([[x, v]])
      return ret
    }
  
    extend (xs: string[], vs: Value[]): Env 
    {
      const ret = new Env()
      ret.outer = this
      ret.bindings = new Map(xs.map((x, i) => [x, vs[i]]))
      return ret
    }
  }


/******* Pretty-Printing ************************************************/
export function prettyExp(e: Exp): string 
{
    switch(e.tag)
    { 
        case 'var':
            return `${e.value}`
        case 'int':
            return `${e.value}`
        case 'flpo':
            return `${e.value}`
        case 'add':
            return `${prettyExp(e.lhs)} + ${prettyExp(e.rhs)}`
        case 'lam':
            return `lambda(${e.params.join(' ')}, ${prettyExp(e.body)})`
        case 'null':
            return 'null'
        case 'keyword':
            return `${e.value}`
        default:
            return ''
    }
}



export function prettyValue(v: Value): string 
{
    switch(v.tag)
    { 
        case 'int':
            return `${v.value}`
        case 'flpo':
            return `${v.value}`
        case 'prim':
            return `<prim ${v.name}>`
        case 'null':
            return 'null'
        case 'obj':
            let prettyObj = `obj (`
            v.fields.forEach((val: Value, key: string) => {
                prettyObj += ' ' + key + ' : ' + prettyValue(val) + ','
              })
            prettyObj = prettyObj.substring(0, prettyObj.length - 1)
            prettyObj += ')'
            return prettyObj
        default:
            return ''
    }
}

export function prettyStmt (s: Stmt): string 
{
    switch(s.tag) 
    {
        case 'define': 
            return `define (${s.id}, ${prettyExp(s.exp)})`
        case 'print':
            return `print (${prettyExp(s.exp)})`
    }
}

export function prettyProg (p: Prog): string 
{
    return p.map(prettyStmt).join(';\n')
}
