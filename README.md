# ProofPath

A decentralized credential verification and skill recognition platform that allows individuals to prove, manage, and share what they know — without relying on traditional institutions.

---

## Overview

ProofPath is built on smart contracts that manage a fully transparent, tamper-proof, and reputation-driven system for digital credentials and skills. It empowers learners, educators, and employers to issue, verify, and view achievements on-chain.

The platform consists of ten main smart contracts:

1. **User Identity Contract** – Registers learners, verifiers, and institutions with verified profiles.
2. **Credential Issuer Contract** – Allows authorized issuers to publish skills, badges, or certifications.
3. **Skill Badge Contract** – Issues non-transferable NFTs (or SBTs) as on-chain credentials.
4. **Portfolio Manager Contract** – Lets users curate, share, and control visibility of their skills.
5. **Verification Market Contract** – Enables independent verification through challenges and peer review.
6. **Reputation Graph Contract** – Calculates trust scores based on endorsements and performance history.
7. **Access Control Contract** – Manages who can issue, view, endorse, or revoke credentials.
8. **Reward Vault Contract** – Distributes rewards for verified contributions and community validation.
9. **Dispute Resolution Contract** – Handles credential challenges and fraud reports through arbitration.
10. **Credential Revocation Contract** – Allows issuers to revoke or update skills and maintain audit history.

---

## Features

- **Verified user identity** tied to educational or professional background  
- **Tamper-proof skill badges** issued by trusted parties or peer networks  
- **Non-transferable credentials (SBTs)** to reflect authentic learning  
- **User-controlled portfolios** with public or private visibility  
- **Community-based skill verification** and challenge systems  
- **Decentralized reputation scores** based on endorsement and outcomes  
- **Permissioned access and revocation** of credentials  
- **Reward mechanisms** for active validators and mentors  
- **Built-in dispute resolution** for trust and transparency  
- **Layer 2 optimization** for scalable, low-cost issuance and verification  

---

## Smart Contracts

### User Identity Contract
- Registers and authenticates users
- Links off-chain credentials and decentralized IDs
- Assigns roles: learner, issuer, verifier

### Credential Issuer Contract
- Adds institutions or trusted verifiers as approved issuers
- Tracks issuance history and permissions
- Timestamped credential logs

### Skill Badge Contract
- Issues credentials as non-transferable tokens (SBTs)
- Stores metadata: skill name, issuer, level, date
- Links to proofs or project evidence

### Portfolio Manager Contract
- Organizes user credentials into a curated profile
- Controls visibility and sharing
- Links to off-chain projects, videos, or endorsements

### Verification Market Contract
- Facilitates open or private skill verification
- Verifiers earn rewards for participation
- Users submit to challenges or peer reviews

### Reputation Graph Contract
- Computes trust score from endorsements, reviews, and disputes
- Incentivizes honest participation
- Decays inactive or outdated scores over time

### Access Control Contract
- Grants/restricts visibility or endorsement rights
- Controls who can verify or challenge skills
- Supports privacy-preserving credentials

### Reward Vault Contract
- Issues rewards for verified contributions and accurate validations
- Funds are distributed from protocol fees or grants
- Anti-spam and reputation filters applied

### Dispute Resolution Contract
- Resolves credential fraud or mistaken issuance
- Community or appointed mediators review cases
- All rulings logged on-chain

### Credential Revocation Contract
- Enables revocation or update of issued badges
- Tracks reasons and issuer notes
- Audit trail for trust transparency

---

## Installation

1. Install [Clarinet CLI](https://docs.hiro.so/clarinet/getting-started)
2. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/proofpath.git
   ```
3. Run tests:
    ```bash
    npm test
    ```
4. Deploy contracts:
    ```bash
    clarinet deploy
    ```

---

## Usage

Each smart contract operates as part of a modular credential system. Integrators can use one or all depending on the application (education platforms, hiring portals, freelance marketplaces, etc.).

Check the /contracts folder for detailed documentation and function references.

----

## License

MIT License