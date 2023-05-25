import * as L from './lang'

/** The output of our programs: a list of strings that our program printed. */
export type Output = string[]

export function evaluate(env: L.Env, e: L.Exp): L.Value 
{
    switch(e.tag)
    {
        case 'int':
            return e
        case 'flpo':
            return e
        case 'null':
            return e
        case 'keyword':
            return e
        case 'lam':
            return L.closure(e.params, e.body, env)
        case 'add':
        {
            const a = evaluate(env, e.lhs)
            const b = evaluate(env, e.rhs)
            if(a.tag === 'int' && b.tag === 'int')
                return L.tInt(a.value + b.value)
            else if((a.tag === 'flpo' && b.tag === 'flpo'))
                return L.tFLPO(a.value + b.value)
            else if((a.tag === 'int' && b.tag === 'flpo') || (a.tag === 'flpo' && b.tag === 'int'))
                return L.tFLPO(a.value + b.value)
            else
                throw new Error(`Type Error: int or floating-point was expected but ${a.tag} and ${b.tag} were given`)
        }
        default:
            return L.tNull()
    }
}

// TODO
export function execute(env : L.Env, prog : L.Prog): Output
{
    const output: Output = []

    for (const s of prog) 
    {
        switch (s.tag) 
        {
          case 'define': 
          {
            const v = evaluate(env, s.exp)
            env.set(s.id, v)
            break
          }
          case 'print': 
          {
            const v = evaluate(env, s.exp)
            output.push(L.prettyValue(v))
            break
          }
        }
      }

    return output
}











