/**
 * A KQL subset interpreter.
 *
 * This is deliberately not a complete Kusto implementation. It covers the
 * operators and functions that actually appear in SC-200 and SC-500 hunting, so
 * queries written in the lab transfer to the real portal. Anything unsupported
 * fails with a clear message rather than silently returning wrong results,
 * because a query engine that quietly lies is worse than none for learning.
 */

export type Value = string | number | boolean | Date | null | Value[];
export type Row = Record<string, Value>;
export type Dataset = Row[];
export type Tables = Record<string, Dataset>;

export class KqlError extends Error {}

/* ------------------------------------------------------------------ lexer */

type TokKind = "ident" | "num" | "str" | "punct" | "pipe" | "eof";
type Tok = { kind: TokKind; text: string; pos: number };

const PUNCT = [
  "==", "!=", "<=", ">=", "=~", "!~", "&&", "||",
  "(", ")", ",", ".", "<", ">", "=", "+", "-", "*", "/", "%", "[", "]", ":", "$",
];

function lex(src: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === "/" && src[i + 1] === "/") {
      while (i < src.length && src[i] !== "\n") i++;
      continue;
    }
    if (c === "|") { toks.push({ kind: "pipe", text: "|", pos: i }); i++; continue; }
    if (c === '"' || c === "'") {
      const quote = c;
      let s = "";
      i++;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === "\\" && i + 1 < src.length) { s += src[i + 1]; i += 2; continue; }
        s += src[i++];
      }
      if (i >= src.length) throw new KqlError("Unterminated string literal");
      i++;
      toks.push({ kind: "str", text: s, pos: i });
      continue;
    }
    if (/[0-9]/.test(c)) {
      let s = "";
      while (i < src.length && /[0-9._]/.test(src[i])) s += src[i++];
      if (i < src.length && /[smhd]/.test(src[i]) && !/[a-zA-Z0-9_]/.test(src[i + 1] ?? "")) {
        s += src[i++];
      }
      toks.push({ kind: "num", text: s, pos: i });
      continue;
    }
    // Negated word operators: !in, !contains, !has, !startswith, !endswith.
    if (c === "!" && /[A-Za-z]/.test(src[i + 1] ?? "")) {
      let s = "!";
      i++;
      while (i < src.length && /[A-Za-z0-9_]/.test(src[i])) s += src[i++];
      toks.push({ kind: "ident", text: s, pos: i });
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let s = "";
      while (i < src.length && /[A-Za-z0-9_]/.test(src[i])) s += src[i++];
      if (src[i] === "-" && /[A-Za-z]/.test(src[i + 1] ?? "")) {
        s += src[i++];
        while (i < src.length && /[A-Za-z0-9_]/.test(src[i])) s += src[i++];
      }
      toks.push({ kind: "ident", text: s, pos: i });
      continue;
    }
    const two = src.slice(i, i + 2);
    if (PUNCT.includes(two)) { toks.push({ kind: "punct", text: two, pos: i }); i += 2; continue; }
    if (PUNCT.includes(c)) { toks.push({ kind: "punct", text: c, pos: i }); i++; continue; }
    throw new KqlError(`Unexpected character '${c}'`);
  }
  toks.push({ kind: "eof", text: "", pos: i });
  return toks;
}

/* ----------------------------------------------------------------- parser */

type Expr =
  | { k: "lit"; v: Value }
  | { k: "col"; name: string }
  | { k: "bin"; op: string; l: Expr; r: Expr }
  | { k: "un"; op: string; e: Expr }
  | { k: "call"; name: string; args: Expr[] }
  | { k: "list"; items: Expr[] };

type NamedExpr = { name: string; expr: Expr };

type Op =
  | { k: "where"; e: Expr }
  | { k: "project"; cols: NamedExpr[] }
  | { k: "project-away"; names: string[] }
  | { k: "extend"; cols: NamedExpr[] }
  | { k: "summarize"; aggs: NamedExpr[]; by: NamedExpr[] }
  | { k: "count" }
  | { k: "take"; n: number }
  | { k: "top"; n: number; by: NamedExpr[]; desc: boolean[] }
  | { k: "sort"; by: NamedExpr[]; desc: boolean[] }
  | { k: "distinct"; names: string[] }
  | { k: "join"; kind: string; right: Query; on: string[] }
  | { k: "union"; tables: string[] }
  | { k: "render" };

type Query = { table: string; ops: Op[] };

const CMP = ["==", "!=", "<", ">", "<=", ">=", "=~", "!~"];
const WORD_CMP = [
  "contains", "has", "startswith", "endswith",
  "in", "matches", "between", "hasprefix", "hassuffix",
];

class Parser {
  private i = 0;
  constructor(private toks: Tok[]) {}

  private peek(o = 0): Tok { return this.toks[Math.min(this.i + o, this.toks.length - 1)]; }
  private next(): Tok { return this.toks[this.i++]; }
  private isIdent(v: string): boolean {
    const t = this.peek();
    return t.kind === "ident" && t.text.toLowerCase() === v;
  }
  private isPunct(v: string): boolean {
    const t = this.peek();
    return t.kind === "punct" && t.text === v;
  }
  private eatPunct(v: string): boolean {
    if (this.isPunct(v)) { this.i++; return true; }
    return false;
  }
  private expectPunct(v: string): void {
    if (!this.eatPunct(v)) throw new KqlError(`Expected '${v}'`);
  }

  parseQuery(): Query {
    const first = this.next();
    if (first.kind !== "ident") throw new KqlError("A query must start with a table name");
    const q: Query = { table: first.text, ops: [] };
    while (this.peek().kind === "pipe") {
      this.next();
      q.ops.push(this.parseOp());
    }
    return q;
  }

  private parseOp(): Op {
    const t = this.next();
    if (t.kind !== "ident") throw new KqlError("Expected an operator after '|'");
    const name = t.text.toLowerCase();

    switch (name) {
      case "where":
      case "filter":
        return { k: "where", e: this.parseExpr() };
      case "project":
        return { k: "project", cols: this.parseNamedList() };
      case "project-away":
        return { k: "project-away", names: this.parseNameList() };
      case "extend":
        return { k: "extend", cols: this.parseNamedList() };
      case "count":
        return { k: "count" };
      case "take":
      case "limit": {
        const n = this.next();
        if (n.kind !== "num") throw new KqlError("take expects a number");
        return { k: "take", n: Number(n.text) };
      }
      case "distinct":
        return { k: "distinct", names: this.parseNameList() };
      case "top": {
        const n = this.next();
        if (n.kind !== "num") throw new KqlError("top expects a number");
        if (!this.isIdent("by")) throw new KqlError("top expects 'by'");
        this.next();
        const { by, desc } = this.parseOrderList();
        return { k: "top", n: Number(n.text), by, desc };
      }
      case "sort":
      case "order": {
        if (!this.isIdent("by")) throw new KqlError(`${name} expects 'by'`);
        this.next();
        const { by, desc } = this.parseOrderList();
        return { k: "sort", by, desc };
      }
      case "summarize": {
        const aggs: NamedExpr[] = [];
        const by: NamedExpr[] = [];
        if (!this.isIdent("by")) {
          do { aggs.push(this.parseNamed()); } while (this.eatPunct(","));
        }
        if (this.isIdent("by")) {
          this.next();
          do { by.push(this.parseNamed()); } while (this.eatPunct(","));
        }
        return { k: "summarize", aggs, by };
      }
      case "join": {
        let kind = "inner";
        if (this.isIdent("kind")) {
          this.next();
          this.expectPunct("=");
          kind = this.next().text.toLowerCase();
        }
        this.expectPunct("(");
        const sub = this.parseQuery();
        this.expectPunct(")");
        if (!this.isIdent("on")) throw new KqlError("join expects 'on'");
        this.next();
        const on: string[] = [];
        do {
          if (this.isPunct("$")) {
            this.next(); this.next(); this.expectPunct(".");
            const l = this.next().text;
            this.expectPunct("==");
            this.next(); this.next(); this.expectPunct(".");
            const r = this.next().text;
            if (l !== r) {
              throw new KqlError("The lab supports joins on identically named columns only");
            }
            on.push(l);
          } else {
            on.push(this.next().text);
          }
        } while (this.eatPunct(","));
        return { k: "join", kind, right: sub, on };
      }
      case "union": {
        const tables: string[] = [];
        do { tables.push(this.next().text); } while (this.eatPunct(","));
        return { k: "union", tables };
      }
      case "render": {
        while (this.peek().kind !== "pipe" && this.peek().kind !== "eof") this.next();
        return { k: "render" };
      }
      default:
        throw new KqlError(
          `Operator '${t.text}' is not supported in the lab. Supported: where, project, project-away, extend, summarize, count, take, top, sort, distinct, join, union, render.`,
        );
    }
  }

  private parseNameList(): string[] {
    const names: string[] = [];
    do { names.push(this.next().text); } while (this.eatPunct(","));
    return names;
  }

  private parseNamedList(): NamedExpr[] {
    const out: NamedExpr[] = [];
    do { out.push(this.parseNamed()); } while (this.eatPunct(","));
    return out;
  }

  private parseNamed(): NamedExpr {
    if (this.peek().kind === "ident" && this.peek(1).kind === "punct" && this.peek(1).text === "=") {
      const name = this.next().text;
      this.next();
      return { name, expr: this.parseExpr() };
    }
    const start = this.i;
    const expr = this.parseExpr();
    return { name: this.defaultName(expr, start), expr };
  }

  private defaultName(e: Expr, startTok: number): string {
    if (e.k === "col") return e.name;
    if (e.k === "call") {
      if (e.name.toLowerCase() === "bin" && e.args[0]?.k === "col") {
        return (e.args[0] as { name: string }).name;
      }
      const arg = e.args[0];
      const suffix = arg && arg.k === "col" ? `_${arg.name}` : "_";
      return `${e.name}${suffix}`;
    }
    return this.toks.slice(startTok, this.i).map((t) => t.text).join("") || "Column1";
  }

  private parseOrderList(): { by: NamedExpr[]; desc: boolean[] } {
    const by: NamedExpr[] = [];
    const desc: boolean[] = [];
    do {
      const start = this.i;
      const expr = this.parseExpr();
      by.push({ name: this.defaultName(expr, start), expr });
      if (this.isIdent("desc")) { this.next(); desc.push(true); }
      else if (this.isIdent("asc")) { this.next(); desc.push(false); }
      else desc.push(true);
    } while (this.eatPunct(","));
    return { by, desc };
  }

  parseExpr(): Expr { return this.parseOr(); }

  private parseOr(): Expr {
    let l = this.parseAnd();
    while (this.isIdent("or") || this.isPunct("||")) {
      this.next();
      l = { k: "bin", op: "or", l, r: this.parseAnd() };
    }
    return l;
  }

  private parseAnd(): Expr {
    let l = this.parseCmp();
    while (this.isIdent("and") || this.isPunct("&&")) {
      this.next();
      l = { k: "bin", op: "and", l, r: this.parseCmp() };
    }
    return l;
  }

  private parseCmp(): Expr {
    let l = this.parseAdd();
    for (;;) {
      const t = this.peek();
      if (t.kind === "punct" && CMP.includes(t.text)) {
        this.next();
        l = { k: "bin", op: t.text, l, r: this.parseAdd() };
        continue;
      }
      if (t.kind === "ident") {
        const raw = t.text.toLowerCase();
        // Kusto spells negation as !contains / !has / !in; some docs use notcontains.
        const bangNegated = raw.startsWith("!");
        const wordNegated = !bangNegated && raw.startsWith("not") && raw.length > 3;
        const negated = bangNegated || wordNegated;
        const word = bangNegated ? raw.slice(1) : wordNegated ? raw.slice(3) : raw;
        const normalised = word.replace(/_cs$/, "");
        if (WORD_CMP.includes(normalised)) {
          this.next();
          if (normalised === "matches") {
            if (this.isIdent("regex")) this.next();
            l = { k: "bin", op: "matches", l, r: this.parseAdd() };
            continue;
          }
          if (normalised === "between") {
            this.expectPunct("(");
            const lo = this.parseAdd();
            if (this.isPunct(".")) { this.next(); this.next(); }
            const hi = this.parseAdd();
            this.expectPunct(")");
            l = {
              k: "bin",
              op: negated ? "!between" : "between",
              l,
              r: { k: "list", items: [lo, hi] },
            };
            continue;
          }
          if (normalised === "in") {
            this.expectPunct("(");
            const items: Expr[] = [];
            if (!this.isPunct(")")) {
              do { items.push(this.parseExpr()); } while (this.eatPunct(","));
            }
            this.expectPunct(")");
            l = { k: "bin", op: negated ? "!in" : "in", l, r: { k: "list", items } };
            continue;
          }
          l = { k: "bin", op: (negated ? "!" : "") + normalised, l, r: this.parseAdd() };
          continue;
        }
      }
      return l;
    }
  }

  private parseAdd(): Expr {
    let l = this.parseMul();
    while (this.isPunct("+") || this.isPunct("-")) {
      const op = this.next().text;
      l = { k: "bin", op, l, r: this.parseMul() };
    }
    return l;
  }

  private parseMul(): Expr {
    let l = this.parseUnary();
    while (this.isPunct("*") || this.isPunct("/") || this.isPunct("%")) {
      const op = this.next().text;
      l = { k: "bin", op, l, r: this.parseUnary() };
    }
    return l;
  }

  private parseUnary(): Expr {
    if (this.isIdent("not")) { this.next(); return { k: "un", op: "not", e: this.parseUnary() }; }
    if (this.isPunct("-")) { this.next(); return { k: "un", op: "-", e: this.parseUnary() }; }
    return this.parsePrimary();
  }

  private parsePrimary(): Expr {
    const t = this.next();
    if (t.kind === "num") return { k: "lit", v: parseNumeric(t.text) };
    if (t.kind === "str") return { k: "lit", v: t.text };
    if (t.kind === "punct" && t.text === "(") {
      const e = this.parseExpr();
      this.expectPunct(")");
      return e;
    }
    if (t.kind === "punct" && t.text === "*") return { k: "col", name: "*" };
    if (t.kind === "ident") {
      const lower = t.text.toLowerCase();
      if (lower === "true") return { k: "lit", v: true };
      if (lower === "false") return { k: "lit", v: false };
      if (lower === "null") return { k: "lit", v: null };
      if (this.isPunct("(")) {
        this.next();
        const args: Expr[] = [];
        if (!this.isPunct(")")) {
          do {
            if (this.isPunct("*")) { this.next(); args.push({ k: "col", name: "*" }); }
            else args.push(this.parseExpr());
          } while (this.eatPunct(","));
        }
        this.expectPunct(")");
        return { k: "call", name: t.text, args };
      }
      return { k: "col", name: t.text };
    }
    throw new KqlError(`Unexpected token '${t.text || "end of query"}'`);
  }
}

/** Numbers and timespan literals such as 7d, 30m, 1h, 45s (returns milliseconds). */
function parseNumeric(text: string): number {
  const m = /^([0-9._]+)([smhd])$/.exec(text);
  if (!m) return Number(text.replace(/_/g, ""));
  const n = Number(m[1].replace(/_/g, ""));
  const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[m[2]]!;
  return n * unit;
}

/* -------------------------------------------------------------- evaluator */

function toDate(v: Value): Date | null {
  if (v instanceof Date) return v;
  if (typeof v === "string") { const d = new Date(v); return isNaN(d.getTime()) ? null : d; }
  return null;
}

function num(v: Value): number {
  if (typeof v === "number") return v;
  if (v instanceof Date) return v.getTime();
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "string") { const n = Number(v); return isNaN(n) ? NaN : n; }
  return NaN;
}

function str(v: Value): string {
  if (v === null) return "";
  if (v instanceof Date) return v.toISOString();
  if (Array.isArray(v)) return JSON.stringify(v);
  return String(v);
}

function truthy(v: Value): boolean {
  if (v === null) return false;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") return v.length > 0;
  return true;
}

function eq(a: Value, b: Value): boolean {
  if (a instanceof Date || b instanceof Date) {
    const da = toDate(a);
    const db = toDate(b);
    if (da && db) return da.getTime() === db.getTime();
  }
  if (typeof a === "number" || typeof b === "number") {
    const na = num(a);
    const nb = num(b);
    if (!isNaN(na) && !isNaN(nb)) return na === nb;
  }
  return str(a) === str(b);
}

type Ctx = { row: Row; now: Date };

function evalExpr(e: Expr, ctx: Ctx): Value {
  switch (e.k) {
    case "lit": return e.v;
    case "col": {
      if (e.name === "*") return null;
      if (e.name in ctx.row) return ctx.row[e.name];
      const hit = Object.keys(ctx.row).find((k) => k.toLowerCase() === e.name.toLowerCase());
      return hit ? ctx.row[hit] : null;
    }
    case "list": return e.items.map((i) => evalExpr(i, ctx));
    case "un": {
      const v = evalExpr(e.e, ctx);
      return e.op === "not" ? !truthy(v) : -num(v);
    }
    case "call": return evalCall(e, ctx);
    case "bin": return evalBin(e, ctx);
  }
}

function evalBin(e: Extract<Expr, { k: "bin" }>, ctx: Ctx): Value {
  const { op } = e;
  if (op === "and") return truthy(evalExpr(e.l, ctx)) && truthy(evalExpr(e.r, ctx));
  if (op === "or") return truthy(evalExpr(e.l, ctx)) || truthy(evalExpr(e.r, ctx));

  const l = evalExpr(e.l, ctx);
  const r = evalExpr(e.r, ctx);

  switch (op) {
    case "==": return eq(l, r);
    case "!=": return !eq(l, r);
    case "=~": return str(l).toLowerCase() === str(r).toLowerCase();
    case "!~": return str(l).toLowerCase() !== str(r).toLowerCase();
    case "<": return num(l) < num(r);
    case ">": return num(l) > num(r);
    case "<=": return num(l) <= num(r);
    case ">=": return num(l) >= num(r);
    case "+":
      if (typeof l === "string" && typeof r === "string") return l + r;
      return num(l) + num(r);
    case "-": return num(l) - num(r);
    case "*": return num(l) * num(r);
    case "/": return num(r) === 0 ? null : num(l) / num(r);
    case "%": return num(l) % num(r);
    case "contains": return str(l).toLowerCase().includes(str(r).toLowerCase());
    case "!contains": return !str(l).toLowerCase().includes(str(r).toLowerCase());
    case "startswith": return str(l).toLowerCase().startsWith(str(r).toLowerCase());
    case "!startswith": return !str(l).toLowerCase().startsWith(str(r).toLowerCase());
    case "hasprefix": return str(l).toLowerCase().startsWith(str(r).toLowerCase());
    case "endswith": return str(l).toLowerCase().endsWith(str(r).toLowerCase());
    case "!endswith": return !str(l).toLowerCase().endsWith(str(r).toLowerCase());
    case "hassuffix": return str(l).toLowerCase().endsWith(str(r).toLowerCase());
    case "has": return hasWord(str(l), str(r));
    case "!has": return !hasWord(str(l), str(r));
    case "matches":
      try { return new RegExp(str(r), "i").test(str(l)); }
      catch { throw new KqlError(`Invalid regular expression: ${str(r)}`); }
    case "in": return Array.isArray(r) && r.some((x) => eq(l, x));
    case "!in": return Array.isArray(r) && !r.some((x) => eq(l, x));
    case "between": {
      const [lo, hi] = r as Value[];
      return num(l) >= num(lo) && num(l) <= num(hi);
    }
    case "!between": {
      const [lo, hi] = r as Value[];
      return !(num(l) >= num(lo) && num(l) <= num(hi));
    }
  }
  throw new KqlError(`Operator '${op}' is not supported`);
}

/** `has` matches whole words, unlike `contains`. */
function hasWord(haystack: string, needle: string): boolean {
  if (!needle) return false;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^A-Za-z0-9_])${escaped}([^A-Za-z0-9_]|$)`, "i").test(haystack);
}

const AGGREGATES = new Set([
  "count", "countif", "dcount", "sum", "avg", "min", "max",
  "make_set", "make_list", "arg_max", "arg_min", "any",
]);

export function isAggregate(name: string): boolean {
  return AGGREGATES.has(name.toLowerCase());
}

function evalCall(e: Extract<Expr, { k: "call" }>, ctx: Ctx): Value {
  const name = e.name.toLowerCase();
  const a = (i: number) => evalExpr(e.args[i], ctx);

  switch (name) {
    case "now": return ctx.now;
    case "ago": return new Date(ctx.now.getTime() - num(a(0)));
    case "datetime":
    case "todatetime": return toDate(a(0));
    case "bin":
    case "floor": {
      const v = a(0);
      const size = num(a(1));
      if (v instanceof Date) return new Date(Math.floor(v.getTime() / size) * size);
      return Math.floor(num(v) / size) * size;
    }
    case "startofday": {
      const d = toDate(a(0));
      if (!d) return null;
      const c = new Date(d);
      c.setUTCHours(0, 0, 0, 0);
      return c;
    }
    case "tolower": return str(a(0)).toLowerCase();
    case "toupper": return str(a(0)).toUpperCase();
    case "strcat": return e.args.map((_, i) => str(a(i))).join("");
    case "strlen": return str(a(0)).length;
    case "substring": {
      const s = str(a(0));
      const start = num(a(1));
      const len = e.args.length > 2 ? num(a(2)) : undefined;
      return len === undefined ? s.slice(start) : s.slice(start, start + len);
    }
    case "indexof": return str(a(0)).indexOf(str(a(1)));
    case "split": {
      const parts = str(a(0)).split(str(a(1)));
      return e.args.length > 2 ? (parts[num(a(2))] ?? null) : parts;
    }
    case "tostring": return str(a(0));
    case "toint":
    case "tolong": return Math.trunc(num(a(0)));
    case "todouble":
    case "toreal": return num(a(0));
    case "isempty": {
      const v = a(0);
      return v === null || str(v) === "";
    }
    case "isnotempty": {
      const v = a(0);
      return !(v === null || str(v) === "");
    }
    case "isnull": return a(0) === null;
    case "isnotnull": return a(0) !== null;
    case "coalesce": {
      for (let i = 0; i < e.args.length; i++) {
        const v = a(i);
        if (v !== null && str(v) !== "") return v;
      }
      return null;
    }
    case "iff":
    case "iif": return truthy(a(0)) ? a(1) : a(2);
    case "array_length": {
      const v = a(0);
      return Array.isArray(v) ? v.length : 0;
    }
    case "hourofday": {
      const d = toDate(a(0));
      return d ? d.getUTCHours() : null;
    }
    case "dayofweek": {
      const d = toDate(a(0));
      return d ? d.getUTCDay() : null;
    }
    case "abs": return Math.abs(num(a(0)));
    case "round": return Math.round(num(a(0)));
  }
  if (isAggregate(name)) {
    throw new KqlError(`'${e.name}()' is an aggregation. Use it inside 'summarize'.`);
  }
  throw new KqlError(`Function '${e.name}()' is not supported in the lab.`);
}

/* -------------------------------------------------------------- operators */

function applyAggregate(agg: Extract<Expr, { k: "call" }>, rows: Dataset, now: Date): Value {
  const name = agg.name.toLowerCase();
  const val = (r: Row) => evalExpr(agg.args[0], { row: r, now });

  switch (name) {
    case "count": return rows.length;
    case "countif": return rows.filter((r) => truthy(val(r))).length;
    case "dcount": return new Set(rows.map((r) => str(val(r)))).size;
    case "sum": return rows.reduce((s, r) => s + (num(val(r)) || 0), 0);
    case "avg": {
      const ns = rows.map((r) => num(val(r))).filter((n) => !isNaN(n));
      return ns.length ? ns.reduce((s, n) => s + n, 0) / ns.length : null;
    }
    case "min":
    case "max": {
      const vs = rows.map((r) => val(r)).filter((v) => v !== null);
      if (!vs.length) return null;
      const sorted = [...vs].sort((x, y) => num(x) - num(y));
      return name === "min" ? sorted[0] : sorted[sorted.length - 1];
    }
    case "make_set": return [...new Set(rows.map((r) => str(val(r))))];
    case "make_list": return rows.map((r) => str(val(r)));
    case "any": return rows.length ? val(rows[0]) : null;
    default:
      throw new KqlError(`Aggregation '${agg.name}()' is not supported in the lab.`);
  }
}

/** arg_max and arg_min return the whole row holding the extreme value. */
function argExtreme(
  agg: Extract<Expr, { k: "call" }>,
  rows: Dataset,
  now: Date,
  max: boolean,
): Row {
  let best: Row | null = null;
  let bestVal = max ? -Infinity : Infinity;
  for (const r of rows) {
    const v = num(evalExpr(agg.args[0], { row: r, now }));
    if (isNaN(v)) continue;
    if (max ? v > bestVal : v < bestVal) { bestVal = v; best = r; }
  }
  return best ?? {};
}

function runOps(data: Dataset, ops: Op[], tables: Tables, now: Date): Dataset {
  let rows = data;
  for (const op of ops) {
    switch (op.k) {
      case "where":
        rows = rows.filter((row) => truthy(evalExpr(op.e, { row, now })));
        break;
      case "project":
        rows = rows.map((row) => {
          const out: Row = {};
          for (const c of op.cols) out[c.name] = evalExpr(c.expr, { row, now });
          return out;
        });
        break;
      case "project-away":
        rows = rows.map((row) => {
          const out: Row = { ...row };
          for (const n of op.names) {
            const hit = Object.keys(out).find((k) => k.toLowerCase() === n.toLowerCase());
            if (hit) delete out[hit];
          }
          return out;
        });
        break;
      case "extend":
        rows = rows.map((row) => {
          const out: Row = { ...row };
          for (const c of op.cols) out[c.name] = evalExpr(c.expr, { row, now });
          return out;
        });
        break;
      case "count":
        rows = [{ Count: rows.length }];
        break;
      case "take":
        rows = rows.slice(0, op.n);
        break;
      case "distinct": {
        const seen = new Set<string>();
        const out: Dataset = [];
        for (const row of rows) {
          const projected: Row = {};
          for (const n of op.names) {
            projected[n] = evalExpr({ k: "col", name: n }, { row, now });
          }
          const key = JSON.stringify(Object.values(projected).map(str));
          if (!seen.has(key)) { seen.add(key); out.push(projected); }
        }
        rows = out;
        break;
      }
      case "sort":
      case "top": {
        const sorted = [...rows].sort((x, y) => {
          for (let i = 0; i < op.by.length; i++) {
            const a = evalExpr(op.by[i].expr, { row: x, now });
            const b = evalExpr(op.by[i].expr, { row: y, now });
            const na = num(a);
            const nb = num(b);
            const c = !isNaN(na) && !isNaN(nb) ? na - nb : str(a).localeCompare(str(b));
            if (c !== 0) return op.desc[i] ? -c : c;
          }
          return 0;
        });
        rows = op.k === "top" ? sorted.slice(0, op.n) : sorted;
        break;
      }
      case "summarize": {
        const groups = new Map<string, { key: Row; rows: Dataset }>();
        for (const row of rows) {
          const key: Row = {};
          for (const b of op.by) key[b.name] = evalExpr(b.expr, { row, now });
          const id = JSON.stringify(Object.values(key).map(str));
          if (!groups.has(id)) groups.set(id, { key, rows: [] });
          groups.get(id)!.rows.push(row);
        }
        const out: Dataset = [];
        for (const g of groups.values()) {
          let row: Row = { ...g.key };
          for (const agg of op.aggs) {
            if (agg.expr.k !== "call") {
              row[agg.name] = evalExpr(agg.expr, { row: g.rows[0] ?? {}, now });
              continue;
            }
            const fname = agg.expr.name.toLowerCase();
            if (fname === "arg_max" || fname === "arg_min") {
              const picked = argExtreme(agg.expr, g.rows, now, fname === "arg_max");
              const wantsAll = agg.expr.args
                .slice(1)
                .some((x) => x.k === "col" && x.name === "*");
              if (wantsAll) {
                row = { ...picked, ...g.key };
              } else {
                for (const x of agg.expr.args.slice(1)) {
                  if (x.k === "col") row[x.name] = picked[x.name] ?? null;
                }
              }
              const byName = agg.expr.args[0];
              if (byName.k === "col") row[byName.name] = picked[byName.name] ?? null;
              continue;
            }
            row[agg.name] = applyAggregate(agg.expr, g.rows, now);
          }
          out.push(row);
        }
        rows = out;
        break;
      }
      case "join": {
        const right = execQuery(op.right, tables, now);
        const kind = op.kind.replace("=", "");
        const index = new Map<string, Dataset>();
        for (const r of right) {
          const key = op.on.map((c) => str(r[c] ?? "")).join(" ");
          if (!index.has(key)) index.set(key, []);
          index.get(key)!.push(r);
        }
        const out: Dataset = [];
        for (const l of rows) {
          const key = op.on.map((c) => str(l[c] ?? "")).join(" ");
          const matches = index.get(key) ?? [];
          if (kind === "leftanti") {
            if (!matches.length) out.push(l);
            continue;
          }
          if (kind === "leftsemi") {
            if (matches.length) out.push(l);
            continue;
          }
          if (!matches.length) {
            if (kind === "leftouter" || kind === "fullouter") out.push({ ...l });
            continue;
          }
          for (const r of matches) {
            const merged: Row = { ...l };
            for (const [k, v] of Object.entries(r)) {
              merged[k in l && !op.on.includes(k) ? `${k}1` : k] = v;
            }
            out.push(merged);
          }
        }
        rows = out;
        break;
      }
      case "union": {
        const extra = op.tables.flatMap((name) => {
          const d = lookupTable(name, tables);
          return d.map((r) => ({ ...r, Table: name }) as Row);
        });
        rows = [...rows.map((r) => ({ ...r })), ...extra];
        break;
      }
      case "render":
        break;
    }
  }
  return rows;
}

function lookupTable(name: string, tables: Tables): Dataset {
  const hit = Object.keys(tables).find((k) => k.toLowerCase() === name.toLowerCase());
  if (!hit) {
    throw new KqlError(
      `Table '${name}' does not exist in the lab. Use the schema browser to see what is available.`,
    );
  }
  return tables[hit];
}

function execQuery(q: Query, tables: Tables, now: Date): Dataset {
  return runOps(lookupTable(q.table, tables), q.ops, tables, now);
}

export type QueryResult = {
  columns: string[];
  rows: Dataset;
  /** Row count before the display cap, so the UI can flag truncation. */
  totalRows: number;
  durationMs: number;
};

/** Hard cap so a runaway query cannot lock up the browser. */
export const MAX_DISPLAY_ROWS = 500;

export function runQuery(
  query: string,
  tables: Tables,
  opts: { now?: Date; maxRows?: number } = {},
): QueryResult {
  const started = Date.now();
  const now = opts.now ?? new Date();
  const trimmed = query.trim();
  if (!trimmed) throw new KqlError("Enter a query to run.");

  const parsed = new Parser(lex(trimmed)).parseQuery();
  const all = execQuery(parsed, tables, now);
  const cap = opts.maxRows ?? MAX_DISPLAY_ROWS;
  const rows = all.slice(0, cap);

  const columns: string[] = [];
  for (const row of rows) {
    for (const k of Object.keys(row)) if (!columns.includes(k)) columns.push(k);
  }

  return { columns, rows, totalRows: all.length, durationMs: Date.now() - started };
}
