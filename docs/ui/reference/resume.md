# Michael Grosser

_Transcription of `resume.pdf`._

https://www.linkedin.com/in/michaelgrosser

> Redacted for this public repository: the personal email address and phone number
> printed on the PDF. They are in `resume.pdf`, which is git-ignored and stays local.

## Summary

Principal Software Engineer with 20+ years of experience designing and scaling distributed systems, platform architectures, and event-driven services. Proven record delivering high-throughput, low-latency systems supporting millions of daily transactions and tens of thousands of customers. Strong advocate of AI-assisted software development practices that accelerate delivery while maintaining engineering quality.

## Experience

### Toast

#### Principal Software Engineer - Toast Tables

February 2024 - Present

Principal Software Engineer responsible for the overall technical design and quality of the Toast Tables Reservations & Waitlist product.

- Technical owner for Toast Tables, a multi-tenant reservations platform serving ~20k restaurants and processing ~2M booking events daily.
- Introduced AI-assisted development workflows using Claude Code and agentic coding techniques, enabling engineers to move from Jira ticket to implementation-ready pull requests with automated first-pass review and significantly reducing development cycle time. Increased the team's PR throughput by 50% with no decrease in application latency, uptime, or error rate.
- Drove cross-functional integrations with Payments, Fintech, and other Toast platform teams, enabling shared capabilities across the ecosystem.
- Redesigned availability APIs, enabling searching 5B+ potential reservation slots across ~20k restaurants in sub-20ms, including geospatially.
- Partnered with Fintech to implement merchant tokens, enabling "just walk out" payment functionality to be built for Tables and used elsewhere in Toast.
- Led migration of critical workflows from synchronous REST polling to an event-driven architecture built on Apache Pulsar, reducing service load by 50%+ and improving host-facing latency from seconds to under 100 ms.
- Created standards and practices for the team to modernize our codebase and implemented ArchUnit tests to automatically ensure our standards are followed

#### Principal Software Engineer / Senior Engineering Manager - Guest Platform

January 2022 - February 2024

Principal Software Engineer and Tech Lead Manager responsible for the Digital Ordering Platform team, providing applications and tooling to support Online Ordering, Order-at-Table, Pay-at-Table, and Guest account management.

- Technical lead for modernization of Toast's Digital Ordering platform, decomposing monolithic systems into independently deployable services and establishing reusable event-driven patterns across teams.
- Designed and implemented an Elasticsearch-based search platform replacing Postgres search, enabling horizontal scaling and richer search capabilities.
- Led migration from BFF-style API gateway to federated GraphQL gateway, reducing duplicated API development and enabling product teams to ship features through shared platform contracts.
- Partnered with Payments to redesign Digital Ordering payment architecture, removing multiple applications from PCI/SOX scope and reducing compliance burden for engineering teams.
- Implemented SLOs/SLAs, Datadog dashboards, and OpsGenie alerting across Digital Ordering services to improve production ownership and incident response.

### Inspire11

#### Consultant, Enterprise Architecture (Contract)

May 2021 - January 2022

Worked with Inspire11 on two projects to help enterprise clients create scalable cloud environments on AWS.

- Designed the AWS architecture for a CI/CD services startup, guiding them on using cloud native services like Lambda and Serverless RDS.
- Migrated a large insurance company from on-prem infrastructure to AWS. Designed AWS topology and led the client on selecting low-code AWS managed service replacements for previously high-labor infrastructure.
- Optimized AWS spend using a combination of serverless technologies, auto-scaling, reserve instances, saving plans, and spot instances.
- Built confidence among stakeholders and implementation teams previously unfamiliar with cloud-based infrastructure.

### Neighborhoods.com

#### Vice President of Engineering

March 2015 - March 2021

Built the company's internal engineering organization and technical foundations, scaling to more than 30 engineers across backend, frontend, DevOps, data science, QA, and project management.

- Defined the company's technical strategy and engineering culture while scaling the organization to more than 30 engineers.
- Transitioned all of the company's products to internal engineering teams, replacing the use of external agencies and contractors
- Designed the neighborhoods.com platform from scratch, focusing on cloud-native microservices, event-driven pipelines, and React SPAs.
- Architected the company's AWS environment to support high availability, fault tolerance and auto-scaling to support highly variable traffic and frequent updates across ~10M+ real estate listings and ~100M parcel data records.
- Fostered a strong engineering team through the creation of a values system that reflects how the team works with code and with their peers.

### Gorilla Group

#### Practice Director, eCommerce

June 2011 - February 2015

Engineering Manager and Architectural Lead for Gorilla's e-commerce technical teams, with a primary focus on Magento and Hybris.

- Defined the architecture and deployment process for moving toward hosting on cloud-based environments.
- Implemented standards & tooling across the development team to streamline development practices with reusable code libraries, documented conventions, and reproducible virtualized developer environments.

#### Sr. Technical Architect

March 2010 - June 2011

Technical Architect responsible for designing and implementing e-commerce solutions for high volume, high complexity B2B and B2C e-commerce applications.

- Led discovery, technical design, and implementation efforts for multiple e-commerce platforms supporting thousands of sales per minute and highly variable traffic.

Earlier work history available upon request.

## Technical Skills

### Languages (by Proficiency)

Kotlin, Java, JavaScript/TypeScript, Python, Go, SQL

### Distributed Systems

Microservices, Event-Driven Architecture, Apache Pulsar, GraphQL, REST, gRPC

### Datastores & Infrastructure

Postgres, DynamoDB/NoSQL, Redis, Snowflake, Elasticsearch, AWS, Kubernetes, Terraform

### Observability & Reliability

Datadog, SLOs, SLAs, Observability, Incident Response, CI/CD

### AI-Assisted Engineering

Claude Code, Cursor, Agentic Development Workflows, Prompt Engineering

## Education & Certifications

### Amazon Web Services

#### Certified Solution Architect - Professional

October 2021 - October 2024

### Florida Gulf Coast University

#### BS, Finance and Computer Science Minor

August 2004 - May 2009
