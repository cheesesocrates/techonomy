// name | aliases | kind | year | weight | definition | related
export default `
@Platforms
Cloud Computing | cloud | c | 2006 | 3 | Renting computing power over the internet instead of owning it. | AWS; Microsoft Azure; Google Cloud
AWS | amazon web services | t | 2006 | 3 | Amazon's cloud, the largest in the world. | Cloud Computing; S3; EC2; AWS Lambda
Microsoft Azure | azure | t | 2010 | 3 | Microsoft's cloud platform. | Cloud Computing; Multi-cloud
Google Cloud | gcp, google cloud platform | t | 2011 | 3 | Google's cloud platform. | Cloud Computing; BigQuery; Kubernetes
Cloudflare | | t | 2010 | 2 | A global network for security, speed and edge apps. | CDN; Cloudflare Workers; DDoS
Vercel | | t | 2015 | 2 | The frontend cloud behind Next.js. | Next.js; Serverless
Netlify | | t | 2014 | 1 | A platform for deploying modern websites. | Static Site Generation; Vercel
Fly.io | | t | 2017 | 1 | A platform for running apps close to users. | Containers
DigitalOcean | droplet | t | 2011 | 1 | A simple cloud for developers and small teams. | Cloud Computing
S3 | amazon s3, object storage, blob storage | t | 2006 | 3 | Amazon's storage service for files of any size. | AWS; Data Lake
EC2 | amazon ec2 | t | 2006 | 2 | AWS's rentable virtual servers. | AWS; Virtual Machine
IAM | identity and access management | c | 2011 | 2 | Controlling who can do what in a cloud account. | AWS; Principle of Least Privilege
VPC | virtual private cloud | c | 2009 | 2 | Your own private network inside a cloud. | AWS; Firewall
Multi-cloud | multicloud, hybrid cloud | c | 2015 | 1 | Running across more than one cloud provider. | Vendor Lock-in; Terraform
FinOps | cloud cost, cloud costs | p | 2018 | 1 | Managing and reducing cloud spending as a team. | Cloud Computing

@Containers
Containers | container, containerization, containerisation | c | 2013 | 3 | Packaging an app with everything it needs to run anywhere. | Docker; Kubernetes; Microservices
Docker | dockerfile, docker image | t | 2013 | 3 | The tool that made containers mainstream. | Containers; Kubernetes; Docker Compose
Kubernetes | k8s, kube | t | 2014 | 3 | The system that runs containers across many machines. | Containers; Helm; etcd; Docker
Helm | helm charts | t | 2016 | 2 | The package manager for Kubernetes. | Kubernetes
Docker Compose | compose, docker-compose | t | 2014 | 2 | Running a multi-container app from one file. | Docker
Podman | | t | 2018 | 1 | A daemonless alternative to Docker. | Docker
containerd | | t | 2015 | 1 | The container runtime under Docker and Kubernetes. | Docker; OCI
Service Mesh | istio, linkerd | c | 2017 | 2 | A network layer that manages traffic between services. | Kubernetes; Envoy; Microservices
etcd | | t | 2013 | 1 | The strongly consistent store behind Kubernetes. | Kubernetes; Consensus
Envoy | envoy proxy | t | 2016 | 1 | A high-performance proxy for cloud-native services. | Service Mesh
OCI | open container initiative | s | 2015 | 1 | The open standard for container images. | Containers

@Infrastructure as code
Infrastructure as Code | iac | p | 2011 | 3 | Defining servers and networks in version-controlled files. | Terraform; DevOps; Ansible
Terraform | | t | 2014 | 3 | The standard tool for declaring cloud infrastructure. | Infrastructure as Code; OpenTofu
OpenTofu | | t | 2023 | 1 | The open-source fork of Terraform. | Terraform; Source-available
Pulumi | | t | 2018 | 1 | Infrastructure as code in real programming languages. | Terraform
Ansible | | t | 2012 | 2 | Automating server setup with simple playbooks. | Infrastructure as Code
CloudFormation | | t | 2011 | 1 | AWS's own infrastructure-as-code service. | AWS; Terraform
Nix | nixos, nixpkgs | t | 2003 | 1 | A package manager built for reproducible systems. | Linux

@Delivery
DevOps | | p | 2009 | 3 | Developers and operators sharing ownership of shipping software. | CI/CD; Infrastructure as Code; Site Reliability Engineering
CI/CD | cicd, ci cd, continuous integration, continuous delivery, continuous deployment | p | 2010 | 3 | Automatically testing and shipping every change. | GitHub Actions; DevOps; Unit Testing
GitHub Actions | | t | 2018 | 3 | Automation that runs from your GitHub repository. | CI/CD; GitHub
Jenkins | | t | 2011 | 2 | The long-standing open-source automation server. | CI/CD
GitOps | argocd, argo cd, flux | p | 2017 | 2 | Using a Git repository as the source of truth for deployments. | Git; Kubernetes
Blue-Green Deployment | blue green deployment, blue/green | p | 2010 | 2 | Running two environments and switching traffic between them. | Canary Release
Canary Release | canary deployment, canary | p | 2012 | 2 | Rolling a change out to a few users first. | Blue-Green Deployment; Feature Flags
Feature Flags | feature toggles, feature flag, launchdarkly | p | 2010 | 2 | Turning features on and off without deploying. | Canary Release; A/B Testing
Platform Engineering | internal developer platform, idp | p | 2021 | 2 | Building self-service tools for your own developers. | DevOps; Developer Experience
Developer Experience | dx, devex | c | 2018 | 2 | How it actually feels to build with a tool. | Platform Engineering; User Experience

@Observability
Observability | o11y | c | 2017 | 3 | Understanding a running system from the signals it gives off. | Logging; Metrics; Distributed Tracing
Logging | logs | p | 1980 | 2 | Writing down what a system did and when. | Observability; ELK Stack
Metrics | telemetry | c | 2000 | 2 | Numbers that track a system's health over time. | Prometheus; Observability
Distributed Tracing | tracing, jaeger | p | 2010 | 2 | Following one request across many services. | OpenTelemetry; Microservices
OpenTelemetry | otel | s | 2019 | 2 | The open standard for collecting traces, metrics and logs. | Distributed Tracing; Observability
Prometheus | | t | 2012 | 2 | The open-source system for collecting metrics. | Metrics; Grafana; Kubernetes
Grafana | | t | 2014 | 2 | Dashboards for metrics and logs. | Prometheus
Datadog | | t | 2010 | 2 | A popular hosted monitoring platform. | Observability
Sentry | | t | 2012 | 2 | A tool that catches and groups errors in production. | Observability
ELK Stack | elk, kibana, logstash | t | 2012 | 1 | Elasticsearch, Logstash and Kibana for searching logs. | Elasticsearch; Logging

@Reliability
Site Reliability Engineering | sre | p | 2003 | 2 | Running production systems with software engineering. | DevOps; SLO; Incident Response
SLO | slos, sla, slas, sli, service level objective | c | 2016 | 2 | A target for how reliable a service should be. | Site Reliability Engineering
Incident Response | on-call, oncall, postmortem, postmortems | p | 2004 | 2 | How a team handles outages and learns from them. | Site Reliability Engineering
Chaos Engineering | chaos monkey | p | 2011 | 1 | Breaking things on purpose to find weaknesses. | Site Reliability Engineering
Autoscaling | auto scaling, auto-scaling, hpa | c | 2009 | 2 | Adding or removing capacity as demand changes. | Kubernetes; Load Balancing
Load Balancing | load balancer, load balancers | c | 1996 | 3 | Spreading traffic across several servers. | Nginx; Autoscaling
CDN | content delivery network, cdns | c | 1998 | 3 | Servers worldwide that deliver content close to users. | Cloudflare; Caching
Disaster Recovery | backups, backup | p | 1990 | 2 | Getting back up after something goes badly wrong. | High Availability
High Availability | ha | c | 1990 | 2 | Designing systems so they keep running through failures. | Replication; Load Balancing

@Serverless & edge
Serverless | faas, functions as a service | c | 2014 | 3 | Running code without managing any servers. | AWS Lambda; Cloudflare Workers; Vercel
AWS Lambda | lambda, lambda functions | t | 2014 | 3 | Amazon's service for running functions on demand. | Serverless; AWS
Cloudflare Workers | workers | t | 2017 | 2 | Code that runs on Cloudflare's global network. | Serverless; Edge Computing
Edge Computing | edge, edge functions | c | 2017 | 2 | Running code physically close to users. | Cloudflare Workers; CDN
Cold Start | cold starts | c | 2016 | 1 | The delay when a serverless function wakes up. | Serverless
`
