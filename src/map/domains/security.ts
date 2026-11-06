// name | aliases | kind | year | weight | definition | related
export default `
@Foundations
Cybersecurity | infosec, information security, cyber security | c | 1970 | 3 | Protecting systems and data from attack. | Threat Modeling; OWASP Top 10
CIA Triad | | c | 1998 | 2 | Confidentiality, integrity and availability. | Cybersecurity
Threat Modeling | stride, threat modelling | p | 1999 | 2 | Working out how a system could be attacked. | Cybersecurity; Attack Surface
Zero Trust | zero trust architecture, ztna, zero-trust | p | 2010 | 3 | Never assume a request is safe because of where it came from. | Principle of Least Privilege; Authentication
Defense in Depth | defence in depth | p | 2000 | 2 | Layering protections so one failure isn't fatal. | Firewall; Zero Trust
Principle of Least Privilege | least privilege | p | 1975 | 3 | Give each thing only the access it needs. | Zero Trust; IAM; RBAC
Attack Surface | | c | 2003 | 2 | Every point where an attacker could get in. | Threat Modeling
CVE | cves, common vulnerabilities and exposures | s | 1999 | 2 | The public catalogue of known security flaws. | Zero-day; Dependabot
OWASP Top 10 | owasp | s | 2003 | 3 | The classic list of the most critical web security risks. | SQL Injection; Cross-Site Scripting
Bug Bounty | bug bounties | p | 2013 | 2 | Paying outsiders to find your security flaws. | Penetration Testing
Penetration Testing | pentest, pentesting, pen testing | p | 1990 | 2 | Attacking your own system to find weaknesses. | Kali Linux; Red Team; Burp Suite
Red Team | red teaming, blue team, purple team | p | 2008 | 2 | A group that plays the attacker to test defences. | Penetration Testing

@Attacks
SQL Injection | sqli | c | 1998 | 3 | Sneaking database commands in through user input. | SQL; OWASP Top 10; Prompt Injection
Cross-Site Scripting | xss, cross site scripting | c | 2000 | 3 | Injecting malicious scripts into pages others view. | OWASP Top 10; JavaScript; CSRF
CSRF | cross-site request forgery, cross site request forgery, xsrf | c | 2001 | 2 | Tricking a logged-in browser into making requests. | Cross-Site Scripting; Session Cookies
SSRF | server-side request forgery, server side request forgery | c | 2012 | 1 | Making a server send requests on the attacker's behalf. | OWASP Top 10
Phishing | spear phishing | c | 1996 | 3 | Fake messages that trick people into giving things up. | Social Engineering; Multi-Factor Authentication
Social Engineering | | c | 1990 | 2 | Manipulating people instead of hacking machines. | Phishing
Ransomware | | c | 2013 | 2 | Malware that locks your files until you pay. | Malware; Disaster Recovery
Malware | virus, viruses, trojan, spyware, worm | c | 1990 | 2 | Software written to cause harm. | Ransomware; EDR
DDoS | denial of service, dos attack, ddos attack | c | 1999 | 2 | Flooding a service with traffic until it falls over. | Cloudflare; Rate Limiting
Zero-day | 0day, zero day, 0-day | c | 2000 | 2 | A flaw attackers know about before there's a fix. | CVE; Bug Bounty
Buffer Overflow | | c | 1988 | 2 | Writing past the end of memory to take over a program. | Memory Safety; C
Supply Chain Attack | supply chain attacks, supply chain security | c | 2020 | 2 | Compromising software through something it depends on. | SBOM; Package Manager
Man-in-the-Middle | mitm, man in the middle | c | 1995 | 2 | Secretly sitting between two parties who think they're alone. | TLS
Credential Stuffing | | c | 2011 | 1 | Trying leaked passwords on other websites. | Multi-Factor Authentication; Rate Limiting
Spectre and Meltdown | spectre, meltdown | c | 2018 | 1 | CPU flaws that leak secrets through speculative execution. | CPU
Log4Shell | log4j | c | 2021 | 1 | A logging-library flaw that exposed much of the internet. | Java; Supply Chain Attack

@Defense & tooling
Firewall | firewalls, waf, web application firewall | c | 1988 | 3 | A filter that controls which traffic gets through. | Defense in Depth; VPC
VPN | virtual private network, vpns | c | 1996 | 3 | An encrypted tunnel through a public network. | WireGuard; TLS
WireGuard | tailscale | t | 2019 | 1 | A modern, minimal VPN protocol. | VPN
SIEM | | c | 2005 | 1 | A system that collects security logs and raises alerts. | Logging; SOC
EDR | endpoint detection and response, crowdstrike | c | 2013 | 1 | Software that watches devices for attacks. | Malware
SOC | security operations center, security operations centre | c | 2000 | 1 | The team that monitors for attacks around the clock. | SIEM
Sandboxing | sandbox | c | 2000 | 2 | Running code in a locked-down space. | Containers; Virtual Machine
SAST and DAST | sast, dast | p | 2005 | 1 | Testing code for flaws, statically and while running. | Static Analysis; DevSecOps
SBOM | software bill of materials | s | 2018 | 1 | A list of every component inside a piece of software. | Supply Chain Attack
Dependabot | renovate | t | 2017 | 1 | A bot that keeps dependencies patched. | GitHub; CVE
Snyk | | t | 2015 | 1 | A tool that finds vulnerabilities in code and dependencies. | DevSecOps
Secrets Management | hashicorp vault, vault, secrets manager | p | 2015 | 2 | Storing keys and passwords safely. | IAM; DevSecOps
Kali Linux | kali | t | 2013 | 1 | A Linux distribution packed with security tools. | Linux; Penetration Testing
Metasploit | | t | 2003 | 1 | A framework for testing known exploits. | Penetration Testing
Wireshark | | t | 1998 | 2 | A tool for inspecting network traffic packet by packet. | TCP/IP
Nmap | | t | 1997 | 1 | A scanner that maps networks and open ports. | Penetration Testing
Burp Suite | | t | 2003 | 1 | The standard toolkit for testing web app security. | Penetration Testing
DevSecOps | shift left, shift-left | p | 2012 | 2 | Building security into every step of delivery. | DevOps; SAST and DAST; CI/CD

@Identity
Authentication | authn, login | c | 1961 | 3 | Proving who you are. | Authorization; Multi-Factor Authentication; OAuth
Authorization | authz, permissions | c | 1970 | 3 | Deciding what you're allowed to do. | Authentication; RBAC
OAuth | oauth2, oauth 2.0, oauth 2 | s | 2010 | 3 | Letting an app act for you without your password. | OpenID Connect; JWT; Authorization
OpenID Connect | oidc | s | 2014 | 2 | A login layer built on top of OAuth. | OAuth; Single Sign-On
SAML | | s | 2002 | 1 | The enterprise standard for single sign-on. | Single Sign-On
JWT | json web token, json web tokens, jwts | s | 2015 | 3 | A signed token that carries claims about a user. | OAuth; Authentication
Session Cookies | cookies, cookie, sessions | c | 1994 | 2 | Small values that keep you logged in. | Authentication; CSRF
Single Sign-On | sso, single sign on | c | 2000 | 2 | One login for many applications. | SAML; OpenID Connect
Multi-Factor Authentication | mfa, 2fa, two-factor authentication, two factor | c | 2005 | 3 | Proving who you are with more than a password. | Authentication; Passkeys; Phishing
Passkeys | passkey, webauthn, fido2 | s | 2022 | 2 | Phishing-resistant logins that replace passwords. | Multi-Factor Authentication; Public-Key Cryptography
RBAC | role-based access control, role based access control | c | 1992 | 2 | Granting permissions through roles. | Authorization; Principle of Least Privilege
Password Hashing | bcrypt, argon2, scrypt, salting | p | 1999 | 2 | Storing passwords so a leak doesn't reveal them. | Hash Function

@Cryptography
Cryptography | | c | 1976 | 3 | The mathematics of keeping information secret and authentic. | Public-Key Cryptography; Symmetric Encryption; Hash Function
Public-Key Cryptography | asymmetric encryption, rsa, public key cryptography, public key | c | 1976 | 3 | Encryption with a public key and a private key. | TLS; Digital Signature; SSH
Symmetric Encryption | aes, encryption | c | 1977 | 2 | Encryption where both sides share one secret key. | Cryptography; TLS
Hash Function | sha-256, sha256, hashing, md5, sha | c | 1979 | 3 | A one-way fingerprint for any piece of data. | Password Hashing; Blockchain; Hash Table
TLS | ssl, ssl/tls | s | 1999 | 3 | The protocol that encrypts traffic on the web. | HTTPS; Public-Key Cryptography
End-to-End Encryption | e2ee, end to end encryption | c | 1991 | 2 | Only the sender and receiver can read the message. | Public-Key Cryptography
Digital Signature | digital signatures | c | 1976 | 2 | Mathematical proof of who wrote something. | Public-Key Cryptography
Elliptic Curve Cryptography | ecc, ed25519, ecdsa | c | 1985 | 1 | Strong public-key cryptography with smaller keys. | Public-Key Cryptography
Zero-Knowledge Proof | zk, zkp, zk-snark, zk-snarks, zero knowledge, zero knowledge proofs | c | 1985 | 2 | Proving you know something without revealing it. | Layer 2; Cryptography
Post-Quantum Cryptography | pqc, post quantum | c | 2016 | 2 | Encryption designed to survive quantum computers. | Quantum Computing; Cryptography
Homomorphic Encryption | | c | 2009 | 1 | Computing on data while it stays encrypted. | Cryptography

@Privacy & compliance
GDPR | general data protection regulation | s | 2018 | 3 | Europe's far-reaching data protection law. | Data Anonymization; Digital Sovereignty
CCPA | | s | 2020 | 1 | California's consumer privacy law. | GDPR
SOC 2 | soc2 | s | 2010 | 2 | The security audit startups need to sell to enterprises. | Cybersecurity
HIPAA | | s | 1996 | 1 | US rules protecting health information. | GDPR
PCI DSS | pci | s | 2004 | 1 | Security rules for handling card payments. | SOC 2
Differential Privacy | | c | 2006 | 1 | Adding noise so no individual can be picked out. | Federated Learning; Data Anonymization
Data Anonymization | anonymization, pii, personal data, anonymisation | c | 2000 | 2 | Removing what could identify a person. | GDPR; Differential Privacy
Browser Fingerprinting | fingerprinting | c | 2010 | 1 | Identifying people by their browser's quirks. | Session Cookies

@Blockchain & Web3
Blockchain | blockchains, distributed ledger | c | 2008 | 3 | A shared ledger that no single party controls. | Bitcoin; Ethereum; Consensus
Bitcoin | btc | t | 2009 | 3 | The first decentralised digital currency. | Blockchain; Proof of Work
Ethereum | eth | t | 2015 | 3 | A blockchain that runs programs. | Smart Contract; Solidity; Blockchain
Smart Contract | smart contracts | c | 2015 | 2 | A program that runs on a blockchain. | Ethereum; Solidity
Solidity | | l | 2014 | 2 | The main language for writing smart contracts. | Smart Contract; Ethereum
Proof of Work | pow, mining | c | 2009 | 2 | Securing a network by spending computing power. | Bitcoin; Proof of Stake
Proof of Stake | pos, staking | c | 2012 | 2 | Securing a network by locking up money. | Proof of Work; Ethereum
DeFi | decentralized finance, decentralised finance | c | 2018 | 2 | Financial services run by smart contracts. | Smart Contract; Stablecoin
NFT | nfts, non-fungible token | c | 2017 | 2 | A unique token recording ownership on a blockchain. | Ethereum
DAO | decentralized autonomous organization, daos | c | 2016 | 1 | An organisation run by token-holder votes. | Smart Contract; Decentralization
Stablecoin | stablecoins, usdc, usdt | c | 2014 | 2 | A crypto token pegged to a currency like the dollar. | DeFi
Layer 2 | l2, rollup, rollups, l2s | c | 2018 | 1 | Networks that scale a blockchain by working on top of it. | Ethereum; Zero-Knowledge Proof
Solana | | t | 2020 | 1 | A fast, high-throughput blockchain. | Blockchain
MetaMask | crypto wallet, wallet | t | 2016 | 1 | The most widely used crypto wallet. | Ethereum
Web3 | web 3 | c | 2021 | 2 | The idea of an internet owned through tokens. | Blockchain; Decentralization
Tokenomics | | c | 2017 | 1 | How a crypto token's supply and incentives are designed. | DeFi
`
