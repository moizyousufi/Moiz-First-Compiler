import * as L from './lang'
import * as Lex from './lexer'
import { Stack } from 'typed-stack';
/**
 * 3 + 2
 * true and false
 * (1 + 3) > 5
 * [exp1] [operator] [exp2]
 */

export let context = new Map<string, L.Exp>()

type ParserState = 
{
  index: number
};

export function mkInitialState(): ParserState 
{
  return { index: 0 }
}

/** @return `f` but as a function that takes an array instead of 1 argument */
function wrap1<T>(f: (_x: T) => T): (args: T[]) => T 
{
  return (args) => f(args[0])
}

/** @return `f` but as a function that takes an array instead of 2 arguments */
function wrap2<T>(f: (_x1: T, _x2: T) => T): (args: T[]) => T 
{
  return (args) => f(args[0], args[1])
}

/** @return `f` but as a function that takes an array instead of 3 arguments */
function wrap3<T>(f: (_x1: T, _x2: T, _x3: T) => T): (args: T[]) => T 
{
  return (args) => f(args[0], args[1], args[2])
}

function chomp(state: ParserState, toks: Lex.Tok[], tag: string): void 
{
  if (toks[state.index].tag === tag) {
    state.index += 1
  } else {
    throw new Error(
      `Parser error: expected '${tag}', found '${toks[state.index].tag}'`
    );
  }
}

function parseAtom(toks: Lex.Tok[], pos: number): L.Exp
{
  const currTok = toks[pos]

  if (currTok.tag === "int") 
  {
    return L.tInt(currTok.value);
  } 
  else if (currTok.tag === "flpo") 
  { 
    return L.tFLPO(currTok.value);
  } 
  else if (currTok.tag === "null") 
  {
    return L.tNull();
  }
  else 
  {
    throw new Error(`Parser error: unexpected token: '${Lex.prettyTok(currTok)}'`);
  }
}

function parseAtomAsExp(currTok : L.Value): L.Exp
{
  if (currTok.tag === "int") 
  {
    return L.tInt(currTok.value);
  } 
  else if (currTok.tag === "flpo") 
  { 
    return L.tFLPO(currTok.value);
  } 
  else if (currTok.tag === "null") 
  {
    return L.tNull();
  }
  else 
  {
    throw new Error(`Parser error: unexpected token: '${L.prettyValue(currTok)}'`);
  }
}


function parseAtomAsValue(toks: Lex.Tok[], pos: number): L.Value
{
  const currTok = toks[pos]

  if (currTok.tag === "int") 
  {
    return L.tInt(currTok.value);
  } 
  else if (currTok.tag === "flpo") 
  { 
    return L.tFLPO(currTok.value);
  } 
  else if (currTok.tag === "null") 
  {
    return L.tNull();
  }
  else 
  {
    throw new Error(`Parser error: unexpected token: '${Lex.prettyTok(currTok)}'`);
  }
}


function parseExp(toks: Lex.Tok[]): L.Exp
{
  let currExp: L.Exp = L.tInt(0)
  let lhs : L.Exp
  let rhs : L.Exp

  for(let i = 0; i < toks.length; ++i) 
  {
    if (toks[i].tag === '(') 
    {
      let stk = new Stack<string>()
      let miniTok: Lex.Tok[] = []
      
      stk.push(toks[i++].tag)
      while(!stk.isEmpty())
      {
        if(toks[i].tag === ')')
        {
          stk.pop()
          if(!stk.isEmpty())
          {
            miniTok.push(toks[i])
          }
          ++i
        }
        else 
        {
          if(toks[i].tag === '(')
          {
            stk.push(toks[i].tag)
          }
          miniTok.push(toks[i++])
        }
        
        
      }
      
      if(currExp === L.tInt(0))
      {
        currExp = parseExp(miniTok)
      }
      else
      {
        lhs = parseExp(miniTok)
        currExp = L.add(currExp, lhs)
      }
    }
    else if (toks[i].tag === '{') 
    {
      let objVals =  parseObj(toks, i)

      // this is purely to make the index increment
      let stk = new Stack<String>()
      stk.push('{')
      ++i
      while(!stk.isEmpty)
      {
        if(toks[i].tag === '{')
        {
          stk.push('{')
          ++i
        }
        else if (toks[i].tag === '}')
        {
          stk.pop()
          ++i
        }
        else
        {
          ++i
        }
      }

      return L.obj(objVals)
    }
    else if(toks[i].tag === 'int')
    {
      if(currExp === L.tInt(0))
      {
        currExp = parseAtom(toks, i)
      }
      else
      {
        lhs = parseAtom(toks, i)
        currExp = L.add(lhs, currExp)
      }
    }
    else if(toks[i].tag === 'flpo')
    {
      if(currExp === L.tInt(0))
      {
        // currExp = L.tFLPO(0.0)
        currExp = parseAtom(toks, i)
      }
      else
      {
        lhs = parseAtom(toks, i)
        currExp = L.add(lhs, currExp)
      }
    }
    else if(toks[i].tag === 'add')
    {
      rhs = parseAtom(toks, ++i)
      currExp = L.add(currExp, rhs)
    }
    else if (Lex.prettyTok(toks[i]) === 'Define')
    {
      if(i + 2 >= toks.length)
      {
        throw new Error('ERROR: Sorry, I am expecting to see a variable name and value whenever I see a Define')
      }

      if(toks[i + 1].tag !== 'ident')
      {
        throw new Error(`ERROR: Sorry, I am expecting to see a variable name, not ` + toks[i+1].tag + `whenever I see a Define`)
      }
      if(toks[i + 2].tag !== 'int' && toks[i + 2].tag !== 'flpo' && toks[i + 2].tag !== '(' && toks[i + 2].tag !== '{' && toks[i + 1].tag !== 'null')
      {
        throw new Error(`ERROR: Sorry, I am expecting to see a variable name, not ` + toks[i+1].tag + `whenever I see a Define`)
      }

      let defVal = parseExp(toks.slice(2))

      context.set(Lex.prettyTok(toks[i+1]), defVal)

      return defVal
    }
    else if (Lex.prettyTok(toks[i]) === 'Call') 
    {

      if(i + 1 >= toks.length)
      {
        throw new Error('ERROR: Sorry, I am expecting to see a variable name whenever I see a Call')
      }

      if(toks[i + 1].tag !== 'ident')
      {
        throw new Error(`ERROR: Sorry, I am expecting to see a variable name, not ` + toks[i+1].tag + `whenever I see a Call`)
      }

      if(!context.has(Lex.prettyTok(toks[i+1])))
      {
        throw new Error(`ERROR: Sorry, I am expecting to see ` + Lex.prettyTok(toks[i+1]) + ` already declared, whenever I see a Call`)
      }

      let got = context.get(Lex.prettyTok(toks[++i]))

      if(got === undefined)
      {
        throw new Error('blah blah')
      }

      switch (got.tag)
      {
        case 'int':
        case 'flpo':
        case 'add':
          if(currExp === L.tInt(0))
          {
            return got
          }
          else
          {
            lhs = got
            currExp = L.add(lhs, currExp)
            return currExp
          }
          break
        case 'obj':
          if(i + 1 >= toks.length)
          {
            return got
          }
          else
          {
            if (Lex.prettyTok(toks[i + 1]) === '.')
            {
              if(i + 2 >= toks.length)
              {
                throw new Error(`. operator was used on object without calling any variable`)
              }
              
              

              if(got.fields.has(Lex.prettyTok(toks[i + 2])))
              {
                let curr = got.fields.get(Lex.prettyTok(toks[i + 2]))

                if(curr === undefined)
                {
                  throw new Error()
                }

                switch (curr.tag)
                {
                  case 'int':
                  case 'flpo':
                    if(currExp === L.tInt(0))
                    {
                      currExp = parseAtomAsExp(curr)
                      return currExp
                    }
                    else
                    {
                      lhs = parseAtomAsExp(curr)
                      currExp = L.add(lhs, currExp)
                      return currExp
                    }
                    break
                }
                break
              }
              else
              {
                throw new Error(`ERROR: It appears you have incorrectly called a variable that is not in this object`)
              }

            }
            else
            {
              throw new Error(`ERROR: Currently the language does not support ` + Lex.prettyTok(toks[i + 1]) + ` operator for objects`)
            }
          }
        default:
          return got
      }
    }
  }

  return currExp
}

export function parse(src: string): L.Exp {
  const toks = Lex.lex(src)
  const e = parseExp(toks)
  return e
}



// parsing object implementation
export function parseObj(toks: Lex.Tok[], index : number) : Map<string, L.Value>
{
  if (toks[index].tag !== '{')
  {
    throw new Error("ERROR: Sorry, I expected to find '{', but did not see it.")
  }

  let objVals : Map<string, L.Value> = new Map<string, L.Value>()

  for (let i : number = index + 1; i < toks.length; ++i)
  {
    if (toks[i].tag === 'ident')
    {
      let name : string = Lex.prettyTok(toks[i])

      if(objVals.has(name))
      {
        throw new Error('ERROR: It appears that you have listed the same name for two different elements ( ' + name + ' ) in this object. Try a different name')
      }
      else
      {
        if ( (i + 3) >= toks.length) 
        {
          throw new Error('ERROR: Sorry, I expect an additional argument of a Value here')
        }
        // inheritence does not go through these other arguments, only if there is no inheritence
        else if ( toks[i + 1].tag !== ':' ) 
        {
          throw new Error(`ERROR: Sorry, I expect a colon here, not ` + toks[i + 1].tag)
        }
        else
        {
          if (toks[i + 2].tag === 'ident') 
          {
            throw new Error(`ERROR: Sorry, I expect an argument of a Value here, not of ` + toks[i + 1].tag + ` type`)
          }
          else if (toks[i + 2].tag === '(' || toks[i + 2].tag === ')' || toks[i + 2].tag === 'add')
          {
            throw new Error(`ERROR: Sorry, I expect a simple value to be assigned to ` + name + `, not an expression`)
          }
          else if (toks[i+2].tag === 'semicolon')
          {
            throw new Error(`ERROR: Sorry, I don't quite expect a semicolon here`)
          }
          else 
          {
            objVals.set(name, parseAtomAsValue(toks, i + 2))
          }

          if(toks[i + 3].tag !== ',' && toks[i + 3].tag !== '}')
          {
            throw new Error(`ERROR: Sorry, I expect either ',' here if you add more elements to the object 
                            or '}' if you want to close the object, but got ` + toks[i+3].tag + ` instead`)
          }
          else if (toks[i + 3].tag === ',')
          {
            if(i + 4 >= toks.length)
            {
              throw new Error('ERROR: Sorry, I expect an additional argument for another element to the Object here')
            }
            
            i += 3
            continue
          }
          else if (toks[i + 3].tag === '}')
          {
            i += 3
            break
          }
        }
      }
    }
    // inheritance implementation
    else if (toks[i].tag === '{')
    {
      let tempMap : Map<string, L.Value> = parseObj(toks, i)

      // loop through tempmap and add each key-val to objVals while retaining consistent naming among elements
      tempMap.forEach((value, key) => 
      {
        if(!objVals.has(key))
        {
          objVals.set(key, value)
        }
      })

      // this is purely to make the index increment
      let stk = new Stack<String>()
      stk.push('{')
      ++i
      while(!stk.isEmpty)
      {
        if(toks[i].tag === '{')
        {
          stk.push('{')
          ++i
        }
        else if (toks[i].tag === '}')
        {
          stk.pop()
          ++i
        }
        else
        {
          ++i
        }
      }

      if (toks[i].tag === ',')
      {
        if(i + 1 >= toks.length)
        {
          throw new Error('ERROR: Sorry, I expect an additional argument for another element to the Object here')
        }

        i += 1
        continue
      }
      else if (toks[i].tag === '}')
      {
        i += 1
        break
      }
    }
  }
  return objVals
}

/*

z = {x : 0, y: 1}




*/