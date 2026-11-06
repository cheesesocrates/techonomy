// name | aliases | kind | year | weight | definition | related
export default `
@Servers & frameworks
Node.js | node, nodejs, node js | t | 2009 | 3 | JavaScript running on the server. | JavaScript; V8; Express; npm
Express | expressjs, express.js | t | 2010 | 2 | The minimal, classic web framework for Node.js. | Node.js; REST
NestJS | | t | 2017 | 1 | A structured, Angular-style framework for Node.js. | Node.js; TypeScript
Hono | | t | 2022 | 1 | A tiny web framework that runs on any JavaScript runtime. | Cloudflare Workers
Django | | t | 2005 | 2 | Python's batteries-included web framework. | Python; ORM
Flask | | t | 2010 | 2 | A small, flexible Python web framework. | Python; FastAPI
FastAPI | | t | 2018 | 2 | A modern Python framework for building APIs. | Python; OpenAPI; Flask
Ruby on Rails | rails, ror | t | 2004 | 2 | The framework that made building web apps feel fast. | Ruby; MVC; Convention over Configuration
Spring Boot | spring, spring framework | t | 2014 | 2 | The standard way to build Java backends. | Java; Dependency Injection
Laravel | | t | 2011 | 2 | PHP's elegant full-stack web framework. | PHP
ASP.NET Core | asp.net, aspnet | t | 2016 | 1 | Microsoft's framework for web apps on .NET. | .NET; C#
Nginx | | t | 2004 | 3 | A fast web server and reverse proxy. | Proxy; Load Balancing
Supabase | | t | 2020 | 2 | An open-source Firebase alternative built on Postgres. | PostgreSQL; Firebase
Firebase | | t | 2012 | 2 | Google's backend-in-a-box for apps. | Google Cloud; Supabase
ORM | object relational mapping, object-relational mapping | c | 1995 | 2 | Working with database rows as objects in code. | Prisma; Django; SQL
Prisma | | t | 2019 | 2 | A type-safe database toolkit for TypeScript. | ORM; TypeScript
Drizzle | drizzle orm | t | 2022 | 1 | A lightweight TypeScript ORM that stays close to SQL. | ORM
Cron | cron jobs, cron job, crontab | c | 1975 | 2 | Running tasks automatically on a schedule. | Background Jobs; Linux
Background Jobs | celery, sidekiq, task queue, job queue | p | 2005 | 1 | Doing slow work outside the request. | Message Queue; Cron

@APIs & messaging
API | apis, application programming interface | c | 1968 | 3 | A defined way for software to talk to other software. | REST; GraphQL
REST | rest api, restful, rest apis | c | 2000 | 3 | An API style built on URLs and standard HTTP methods. | HTTP; API; JSON
GraphQL | | s | 2015 | 2 | A query language where clients ask for exactly what they need. | API; REST
gRPC | | s | 2016 | 2 | Fast service-to-service calls with typed contracts. | Protocol Buffers; HTTP/2; Microservices
Protocol Buffers | protobuf, protobufs | s | 2008 | 1 | Google's compact binary format for structured data. | gRPC
JSON | | s | 2001 | 3 | The plain-text data format everything speaks. | REST; JavaScript
WebSockets | websocket | s | 2011 | 2 | A two-way connection between browser and server. | Server-Sent Events; HTTP
Webhooks | webhook | p | 2007 | 2 | One service calling yours when something happens. | API; Event-Driven Architecture
Server-Sent Events | sse | s | 2006 | 1 | A one-way stream of updates from server to browser. | WebSockets
tRPC | | t | 2021 | 1 | End-to-end type-safe APIs for TypeScript. | TypeScript; REST
OpenAPI | swagger | s | 2011 | 2 | A standard way to describe REST APIs. | REST; FastAPI
API Gateway | | c | 2012 | 2 | A single front door for many backend services. | Microservices; Rate Limiting
Rate Limiting | throttling | p | 2000 | 2 | Capping how many requests a client can make. | API Gateway; DDoS
Apache Kafka | kafka | t | 2011 | 2 | A durable log for streaming events at huge scale. | Stream Processing; Event-Driven Architecture
RabbitMQ | | t | 2007 | 2 | A popular general-purpose message broker. | Message Queue
Message Queue | message queues, mq, sqs, message broker | c | 1993 | 2 | A buffer that lets services hand off work asynchronously. | RabbitMQ; Background Jobs; Pub/Sub
Pub/Sub | publish subscribe, pubsub, publish/subscribe | c | 1987 | 2 | Senders publish to topics that subscribers listen to. | Message Queue; Apache Kafka

@Databases
SQL | | l | 1974 | 3 | The language for asking relational databases questions. | PostgreSQL; MySQL; Indexing
PostgreSQL | postgres, psql | t | 1996 | 3 | The most loved open-source relational database. | SQL; pgvector; Supabase
MySQL | mariadb | t | 1995 | 3 | The open-source database behind much of the web. | SQL; PostgreSQL
SQLite | | t | 2000 | 2 | A complete database in a single file. | SQL; Local-First
SQL Server | mssql | t | 1989 | 2 | Microsoft's relational database. | SQL; .NET
Oracle Database | oracle | t | 1979 | 1 | The classic enterprise database. | SQL
MongoDB | mongo | t | 2009 | 3 | The most popular document database. | NoSQL; JSON
Redis | | t | 2009 | 3 | A very fast in-memory data store. | Caching; NoSQL; Valkey
Valkey | | t | 2024 | 1 | The open-source fork of Redis. | Redis; Source-available
Apache Cassandra | cassandra | t | 2008 | 1 | A distributed database built for massive writes. | NoSQL; Eventual Consistency
DynamoDB | | t | 2012 | 2 | AWS's managed key-value database. | AWS; NoSQL
Elasticsearch | elastic, opensearch | t | 2010 | 2 | A distributed engine for search and logs. | Full-Text Search; ELK Stack
Neo4j | graph database, graph databases | t | 2007 | 1 | The leading graph database. | Knowledge Graph
DuckDB | | t | 2019 | 2 | SQLite for analytics. | SQL; Parquet
ClickHouse | | t | 2016 | 1 | A very fast database for analytics. | Data Warehouse
NoSQL | | c | 2009 | 3 | Databases that drop the relational table model. | MongoDB; Redis; Distributed Systems
Indexing | database index, database indexes, b-tree, btree | c | 1970 | 3 | Extra structures that make lookups fast. | SQL; Binary Tree
ACID | acid transactions, transactions | c | 1983 | 2 | The guarantees that keep database transactions correct. | PostgreSQL; Eventual Consistency
Database Normalization | normalization, normal forms | c | 1970 | 2 | Structuring tables to avoid duplicate data. | SQL
Sharding | shards | c | 2005 | 2 | Splitting a database across many machines. | Replication; Distributed Systems
Replication | read replica, read replicas | c | 1985 | 2 | Keeping copies of data on several machines. | Sharding; High Availability
Caching | cache | c | 1970 | 3 | Keeping a nearby copy of data to avoid slow work. | Redis; CDN; CPU Cache
Schema Migration | migrations, database migrations | p | 2005 | 2 | Changing a database's structure safely over time. | Prisma; SQL
Full-Text Search | fulltext search, full text search | c | 1990 | 1 | Finding documents by the words inside them. | Elasticsearch; Semantic Search
Time-Series Database | timescaledb, influxdb, tsdb | c | 2013 | 1 | A database tuned for timestamped data. | Metrics

@Data engineering
ETL | elt, extract transform load | p | 1990 | 2 | Pulling data out, reshaping it and loading it elsewhere. | Data Warehouse; dbt
Data Warehouse | data warehouses | c | 1988 | 2 | A central store built for analytical queries. | Snowflake; BigQuery; ETL
Data Lake | data lakes | c | 2010 | 2 | Cheap storage for raw data of any shape. | S3; Lakehouse
Lakehouse | data lakehouse | c | 2020 | 1 | A data lake with warehouse-style tables on top. | Databricks; Apache Iceberg
Snowflake | | t | 2014 | 2 | The cloud data warehouse that separated storage from compute. | Data Warehouse
BigQuery | | t | 2011 | 2 | Google's serverless data warehouse. | Data Warehouse; Google Cloud
Databricks | | t | 2013 | 2 | A data and AI platform built around Spark. | Apache Spark; Lakehouse
Apache Spark | spark, pyspark | t | 2014 | 2 | The standard engine for large-scale data processing. | Databricks; Hadoop
Hadoop | mapreduce, hdfs | t | 2006 | 1 | The system that started the big data era. | Apache Spark
Apache Airflow | airflow | t | 2015 | 2 | A scheduler for complex data workflows. | Data Pipeline
dbt | data build tool | t | 2016 | 2 | Transforming warehouse data with version-controlled SQL. | SQL; ETL; Data Warehouse
Apache Flink | flink | t | 2014 | 1 | An engine for real-time stream processing. | Stream Processing
Apache Iceberg | iceberg | s | 2017 | 1 | An open table format for huge analytic datasets. | Lakehouse; Parquet
Parquet | apache parquet | s | 2013 | 1 | The column-based file format for analytics. | Apache Iceberg; DuckDB
Stream Processing | event streaming, real-time data | c | 2011 | 2 | Handling data continuously as it arrives. | Apache Kafka; Apache Flink
Change Data Capture | cdc, debezium | p | 2005 | 1 | Streaming every change a database makes. | Stream Processing
Data Pipeline | data pipelines | c | 2010 | 2 | Automated steps that move and transform data. | ETL; Apache Airflow

@Analytics
Data Science | | c | 2008 | 3 | Using statistics and code to learn from data. | Pandas; Machine Learning; Jupyter
Pandas | | t | 2008 | 3 | Python's table library for data analysis. | Python; NumPy; Data Science
NumPy | | t | 2006 | 2 | Python's foundation for fast numerical arrays. | Python; Pandas
Jupyter | jupyter notebook, jupyter notebooks, notebooks, ipython | t | 2014 | 2 | Interactive notebooks mixing code, charts and prose. | Python; Data Science
Polars | | t | 2020 | 1 | A very fast, Rust-based dataframe library. | Pandas; Rust
Tableau | | t | 2003 | 1 | A leading tool for visual data analysis. | Business Intelligence
Power BI | powerbi | t | 2015 | 2 | Microsoft's business analytics tool. | Business Intelligence; Excel
Excel | spreadsheets, spreadsheet, google sheets | t | 1985 | 2 | The spreadsheet that quietly runs the business world. | Business Intelligence
Business Intelligence | bi | c | 1989 | 2 | Turning company data into reports and decisions. | Tableau; Power BI; Data Warehouse
Data Visualization | dataviz, data visualisation | c | 1975 | 2 | Showing data as charts people can read. | D3.js; Tableau
D3.js | d3 | t | 2011 | 1 | The JavaScript library for custom data graphics. | Data Visualization; JavaScript

@Distributed systems
Distributed Systems | distributed computing | c | 1978 | 3 | Many machines cooperating as if they were one. | CAP Theorem; Consensus; Microservices
CAP Theorem | cap | c | 2000 | 2 | During a network split, choose consistency or availability. | Distributed Systems; Eventual Consistency
Eventual Consistency | | c | 2000 | 2 | Copies of data agree given enough time. | CAP Theorem; CRDT
Consensus | raft, paxos, consensus algorithm | c | 1989 | 2 | Getting many machines to agree on one value. | Distributed Systems; etcd; Blockchain
Idempotency | idempotent | c | 2000 | 2 | Doing something twice has the same effect as once. | REST; Distributed Systems
Microservices | microservice, microservice architecture | c | 2014 | 3 | Splitting an app into small independently deployed services. | Monolith; Containers; API Gateway
Monolith | monolithic, modular monolith | c | 2000 | 2 | One app deployed as a single unit. | Microservices
Event-Driven Architecture | eda, event driven architecture | c | 2003 | 2 | Services reacting to events instead of calling each other. | Apache Kafka; Event Sourcing; Pub/Sub
Event Sourcing | | p | 2005 | 1 | Storing every change rather than just current state. | CQRS; Event-Driven Architecture
CQRS | command query responsibility segregation | p | 2010 | 1 | Separating the models for reads and writes. | Event Sourcing
Saga Pattern | saga | p | 1987 | 1 | Coordinating a long transaction across services. | Microservices
CRDT | crdts, conflict-free replicated data type | c | 2011 | 1 | Data that merges automatically without conflicts. | Local-First; Eventual Consistency
`
