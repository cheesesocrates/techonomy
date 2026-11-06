// name | aliases | kind | year | weight | definition | related
export default `
@Languages
JavaScript | js, ecmascript, es6 | l | 1995 | 3 | The programming language of the web browser. | TypeScript; Node.js; DOM
TypeScript | ts | l | 2012 | 3 | JavaScript with a type system that catches mistakes early. | JavaScript; Type System; Transpiler
Python | py, python3 | l | 1991 | 3 | A readable all-rounder and the language of machine learning. | Pandas; PyTorch; Django
Java | | l | 1995 | 3 | A long-running language that powers enterprise backends. | JVM; Spring Boot; Kotlin
C | c language, clang | l | 1972 | 3 | The small, fast language that operating systems are built in. | Unix; C++; Assembly
C++ | cpp, cplusplus | l | 1985 | 3 | C with objects and templates, for speed-critical software. | C; Unreal Engine; LLVM
C# | csharp, c sharp | l | 2000 | 2 | Microsoft's language for .NET and Unity games. | .NET; Unity
Go | golang | l | 2009 | 2 | Google's simple language for fast networked services. | Concurrency; Docker; Kubernetes
Rust | rustlang | l | 2015 | 3 | A fast systems language that guarantees memory safety. | Memory Safety; Ownership and Borrowing; WebAssembly
Swift | | l | 2014 | 2 | Apple's modern language for its platforms. | iOS; SwiftUI
Kotlin | | l | 2011 | 2 | A modern JVM language and the default for Android. | Android; Java; Jetpack Compose
Ruby | | l | 1995 | 2 | An expressive language built for programmer happiness. | Ruby on Rails
PHP | | l | 1995 | 2 | The server language behind much of the web. | Laravel; MySQL
Scala | | l | 2004 | 1 | A JVM language that blends objects and functions. | JVM; Apache Spark
Haskell | | l | 1990 | 1 | A purely functional language with a powerful type system. | Functional Programming
Elixir | | l | 2012 | 1 | A friendly language on Erlang's fault-tolerant runtime. | Erlang; Actor Model
Erlang | | l | 1986 | 1 | A telecom language designed for systems that never stop. | Elixir; Actor Model
Clojure | | l | 2007 | 1 | A modern Lisp on the JVM. | Lisp; Immutability
Lisp | common lisp, scheme | l | 1958 | 1 | One of the oldest languages, where code is data. | Clojure; Metaprogramming
Lua | | l | 1993 | 1 | A tiny scripting language embedded in games and tools. | Game Loop
R | r language, rlang | l | 1993 | 1 | A language made for statistics and data analysis. | Data Science
Julia | | l | 2012 | 1 | A fast language for scientific computing. | NumPy
Dart | | l | 2011 | 1 | Google's language behind Flutter. | Flutter
Zig | | l | 2016 | 1 | A small modern alternative to C. | C; Rust
Bash | shell script, shell scripting, sh, zsh | l | 1989 | 3 | The default language of the Unix command line. | Command Line; Linux
Assembly | asm | l | 1949 | 2 | Human-readable instructions that map directly to a CPU. | Instruction Set; C
COBOL | | l | 1959 | 1 | The old business language still running banks. | Mainframe
Fortran | | l | 1957 | 1 | The first widely used language, still used in science. | Compiler
WebAssembly | wasm | s | 2017 | 2 | A fast binary format that runs in browsers and beyond. | Rust; JavaScript; V8
Mojo | | l | 2023 | 1 | A Python-like language built for AI performance. | Python

@Paradigms
Object-Oriented Programming | oop, object oriented, object oriented programming | c | 1967 | 3 | Organising code into objects that bundle data and behaviour. | Java; Design Patterns
Functional Programming | fp | c | 1958 | 3 | Building programs from pure functions and immutable data. | Haskell; Immutability; Closure
Async/Await | async await, asynchronous programming, async, promises | c | 2012 | 3 | Writing code that waits without blocking everything else. | Concurrency; JavaScript
Concurrency | parallelism, multithreading | c | 1965 | 3 | Handling many tasks that overlap in time. | Go; Process and Thread; Async/Await
Actor Model | actors | c | 1973 | 1 | Concurrency through isolated units that pass messages. | Erlang; Elixir; Concurrency
Type System | static typing, type systems, types, strong typing | c | 1970 | 2 | Rules that describe what kind of data code handles. | TypeScript; Generics
Generics | | c | 1975 | 2 | Code written to work across many types. | Type System
Immutability | immutable | c | 1980 | 2 | Data that never changes once created. | Functional Programming
Recursion | recursive | c | 1960 | 3 | A function solving a problem by calling itself. | Dynamic Programming; Stack and Heap
Closure | closures | c | 1964 | 2 | A function that remembers the variables around it. | Functional Programming; JavaScript
Reactive Programming | rx, rxjs | c | 2009 | 1 | Programming with streams of values that change over time. | Pub/Sub
Metaprogramming | macros | c | 1960 | 1 | Code that writes or changes other code. | Lisp
Memory Safety | memory safe | c | 2015 | 2 | Guarantees against bugs like reading the wrong memory. | Rust; Buffer Overflow; Garbage Collection
Garbage Collection | gc, garbage collector | c | 1959 | 2 | Automatically reclaiming memory a program stopped using. | JVM; Memory Safety
Ownership and Borrowing | borrow checker, ownership | c | 2015 | 1 | Rust's rules for who may touch data and when. | Rust; Memory Safety

@Algorithms & structures
Big O Notation | big o, time complexity, complexity | c | 1976 | 3 | A way to describe how an algorithm slows as input grows. | Sorting Algorithms; Data Structures
Data Structures | dsa, data structure | c | 1960 | 3 | Ways of organising data so the right operations are fast. | Hash Table; Binary Tree; Big O Notation
Hash Table | hashmap, hash map, hash tables, dictionary | c | 1953 | 3 | Key-value storage with near-instant lookups. | Data Structures; Hash Function
Binary Search | | c | 1946 | 3 | Finding an item by halving a sorted list each step. | Big O Notation
Linked List | linked lists | c | 1955 | 2 | A chain of items that each point to the next. | Data Structures
Binary Tree | trees, tree, bst, binary search tree | c | 1960 | 2 | A hierarchy where each node has up to two children. | Data Structures; Indexing
Graph Algorithms | bfs, dfs, dijkstra, graph traversal, graphs | c | 1956 | 2 | Methods for walking networks of connected things. | Data Structures
Dynamic Programming | dp | c | 1953 | 2 | Solving big problems by saving answers to small ones. | Recursion
Sorting Algorithms | quicksort, merge sort, sorting | c | 1945 | 2 | Methods for putting items in order. | Big O Notation
Bloom Filter | bloom filters | c | 1970 | 1 | A tiny structure that says "maybe" or "definitely not". | Hash Table
Trie | | c | 1959 | 1 | A tree for fast prefix lookups, as in autocomplete. | Binary Tree
Regular Expressions | regex, regexp | c | 1968 | 3 | A compact language for matching patterns in text. | Command Line
P vs NP | np complete, np-complete, np hard | c | 1971 | 1 | Are problems easy to check also easy to solve? | Big O Notation

@Testing & quality
Unit Testing | unit tests, unit test | p | 1997 | 3 | Checking small pieces of code in isolation. | Test-Driven Development; Jest; Pytest
Integration Testing | integration tests | p | 2000 | 2 | Checking that pieces work together. | Unit Testing
End-to-End Testing | e2e, end to end testing, e2e testing | p | 2005 | 2 | Testing a whole app the way a user would. | Playwright; Cypress; Integration Testing
Test-Driven Development | tdd | p | 2002 | 2 | Writing the failing test before the code. | Unit Testing; Extreme Programming
Jest | | t | 2014 | 2 | A popular JavaScript testing framework. | Unit Testing; Vitest
Vitest | | t | 2021 | 1 | A fast test runner built on Vite. | Vite; Jest
Pytest | | t | 2009 | 2 | The go-to testing framework for Python. | Python; Unit Testing
Playwright | | t | 2020 | 2 | Microsoft's tool for reliable browser automation. | End-to-End Testing; Cypress
Cypress | | t | 2017 | 1 | A developer-friendly browser testing tool. | End-to-End Testing
Selenium | | t | 2004 | 1 | The original browser automation framework. | End-to-End Testing
Code Review | pr review, code reviews | p | 1976 | 3 | Having others read your change before it merges. | Pull Request
Linting | linter, eslint | p | 1978 | 2 | Automatically flagging suspicious or sloppy code. | Static Analysis; Prettier
Prettier | formatter, code formatter | t | 2017 | 1 | An opinionated tool that formats code automatically. | Linting
Property-based Testing | quickcheck, property based testing | p | 2000 | 1 | Generating many random inputs to test general rules. | Unit Testing
Refactoring | refactor | p | 1999 | 3 | Improving code's structure without changing what it does. | Technical Debt; Unit Testing
Technical Debt | tech debt | c | 1992 | 3 | The future cost of taking shortcuts today. | Refactoring
Static Analysis | | p | 1976 | 1 | Finding bugs by reading code without running it. | Linting; SAST and DAST

@Tools & workflow
Git | | t | 2005 | 3 | The version control system nearly everyone uses. | GitHub; Pull Request; Linux
GitHub | | t | 2008 | 3 | The home of open-source code and pull requests. | Git; GitHub Actions; Open Source
GitLab | | t | 2011 | 2 | A code platform with built-in CI/CD. | Git; CI/CD
Pull Request | pr, prs, pull requests, merge request, mr | p | 2008 | 3 | Proposing a change for review before it merges. | Git; Code Review
Trunk-Based Development | trunk based development | p | 2016 | 1 | Everyone merges small changes into one main branch. | CI/CD; Feature Flags
Monorepo | monorepos, turborepo, nx | p | 2015 | 2 | Keeping many projects in a single repository. | Git
npm | | t | 2010 | 3 | The default package manager for JavaScript. | Node.js; Package Manager
pnpm | | t | 2017 | 1 | A faster, disk-efficient JavaScript package manager. | npm
Bun | | t | 2022 | 2 | An all-in-one JavaScript runtime and toolkit. | Node.js; Deno
Deno | | t | 2020 | 1 | A secure JavaScript runtime from Node's creator. | Node.js; TypeScript
VS Code | vscode, visual studio code | t | 2015 | 3 | Microsoft's free code editor, the default for most developers. | TypeScript; Electron; Language Server Protocol
Vim | neovim, nvim | t | 1991 | 2 | A keyboard-driven terminal editor with devoted fans. | Command Line
Emacs | | t | 1976 | 1 | A deeply extensible text editor from the 1970s. | Lisp
JetBrains IDEs | intellij, pycharm, webstorm, jetbrains, rider | t | 2001 | 2 | A family of heavyweight, language-aware IDEs. | Java; Kotlin
Command Line | cli, terminal, shell, command prompt | c | 1971 | 3 | Controlling a computer by typing commands. | Bash; Unix
Homebrew | brew | t | 2009 | 1 | The missing package manager for macOS. | macOS; Package Manager
Makefile | make, makefiles | t | 1976 | 2 | A classic way to script how software gets built. | C; Command Line
Semantic Versioning | semver | s | 2011 | 2 | Version numbers that signal what changed. | npm; Package Manager
Debugger | debugging, breakpoints, breakpoint | c | 1960 | 3 | Stepping through a running program to find what's wrong. | VS Code
Stack Overflow | stackoverflow | t | 2008 | 2 | The question-and-answer site developers relied on for years. | Open Source
Language Server Protocol | lsp | s | 2016 | 1 | A standard that brings code smarts to any editor. | VS Code
Package Manager | package managers, dependency management | c | 1993 | 2 | A tool that installs and tracks code you depend on. | npm; Homebrew; Supply Chain Attack

@Architecture & patterns
Design Patterns | gang of four, gof | c | 1994 | 3 | Named, reusable solutions to common code problems. | Object-Oriented Programming; Observer Pattern
SOLID | solid principles | p | 2000 | 2 | Five rules for object-oriented code that's easy to change. | Object-Oriented Programming; Clean Architecture
DRY | don't repeat yourself, dont repeat yourself | p | 1999 | 2 | Keep each piece of knowledge in exactly one place. | KISS
KISS | keep it simple stupid, keep it simple | p | 1960 | 1 | Prefer the simple design over the clever one. | DRY; YAGNI
YAGNI | you aren't gonna need it, you arent gonna need it | p | 1999 | 1 | Don't build things before you need them. | KISS; Extreme Programming
Clean Architecture | hexagonal architecture, ports and adapters, onion architecture | c | 2012 | 2 | Keeping core logic independent of frameworks and databases. | SOLID; Domain-Driven Design
Domain-Driven Design | ddd | p | 2003 | 2 | Shaping code around the language of the business. | Clean Architecture; Microservices
MVC | model view controller, model-view-controller | c | 1979 | 2 | Separating data, display and input handling. | Ruby on Rails; Design Patterns
Dependency Injection | di, ioc, inversion of control | p | 2004 | 2 | Handing a component what it needs instead of building it. | Spring Boot; SOLID
Observer Pattern | observer | c | 1994 | 1 | Objects subscribing to changes in another object. | Design Patterns; Pub/Sub

@Compilers & runtimes
Compiler | compilers | c | 1952 | 3 | A program that translates code into something a machine runs. | LLVM; Abstract Syntax Tree; Interpreter
Interpreter | interpreters | c | 1960 | 2 | A program that runs code directly, line by line. | Compiler; Python
JIT Compilation | jit, just in time compilation | c | 1990 | 2 | Compiling code while it runs to make it fast. | V8; JVM
LLVM | | t | 2003 | 2 | The compiler toolkit behind Clang, Rust and Swift. | Compiler; Rust; Swift
Abstract Syntax Tree | ast | c | 1970 | 1 | Code represented as a tree a compiler can work with. | Compiler; Transpiler
Bytecode | | c | 1970 | 1 | A compact instruction set for a virtual machine. | JVM; WebAssembly
JVM | java virtual machine | t | 1995 | 2 | The runtime that executes Java and Kotlin. | Java; Kotlin; Garbage Collection
V8 | | t | 2008 | 2 | Google's JavaScript engine in Chrome and Node.js. | JavaScript; Node.js; JIT Compilation
.NET | dotnet, .net core | t | 2002 | 2 | Microsoft's cross-platform development platform. | C#; ASP.NET Core
Transpiler | babel, swc, esbuild | c | 2014 | 1 | A tool that converts source code into other source code. | TypeScript; Vite
`
