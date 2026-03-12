# Product Requirements Document

# BagsStudio

## 1. Summary

BagsStudio is a post-launch growth and loyalty operating system for Bags coins.

It helps creators sustain momentum after launch by identifying real supporters, launching community campaigns, and rewarding the wallets that actively keep a coin alive.

The product is designed for the Bags hackathon with two goals:
- stand out strongly against the judging criteria
- be useful enough to grow into a real product after the hackathon

---

## 2. Problem Statement

Most coin products focus on launch.
Very few help creators after launch.

As a result, many coins experience:
- a short burst of attention
- temporary trading activity
- weak supporter retention
- no structured community loop
- no system for rewarding the people who actually sustain momentum

For creators, this means:
- no post-launch operating layer
- no easy way to understand or segment supporters
- no way to run structured growth or loyalty campaigns

For supporters and traders, this means:
- no recognition for early or loyal support
- no utility beyond price speculation
- no reason to stay active in the community

BagsStudio exists to solve this post-launch collapse.

---

## 3. Vision

Turn launch hype into lasting community momentum.

BagsStudio should become the default post-launch layer for Bags coins by helping creators:
- understand who matters in their community
- create repeat engagement loops
- reward the supporters who keep the coin alive

---

## 4. Goals

### Primary Goals
- Create a clearly Bags-native post-launch product
- Help creators sustain community momentum after launch
- Give supporters reasons to return and stay engaged
- Demonstrate meaningful Bags API integration
- Align strongly with Bags hackathon judging criteria

### Secondary Goals
- Create a product with startup potential beyond the hackathon
- Build something demoable in under 2 minutes
- Support future fee-share and reward-routing extensions

---

## 5. Non-Goals

For v1, BagsStudio will not try to be:
- a launchpad
- a generic crypto analytics dashboard
- a generic social media marketing suite
- a full CRM platform for all crypto communities
- a multi-chain product
- a fully automated token distribution engine

---

## 6. Target Users

### User Type A: Creator / Dev / Coin Operator
A person who launched or operates a Bags coin and wants to maintain momentum after launch.

#### Needs
- understand who the real supporters are
- run community campaigns
- reward supporters fairly
- keep the coin active after launch
- build stronger community retention

### User Type B: Supporter / Trader / Holder
A wallet holder or active supporter who wants recognition, rewards, and reasons to stay engaged.

#### Needs
- know if they matter to the community
- earn status or rewards
- participate in campaigns
- feel recognized for loyalty or support

---

## 7. Core Product Thesis

Most products help a coin go live.
BagsStudio helps a coin stay alive.

---

## 8. Product Principles

- Bags-native, not generic
- post-launch first
- useful to both creators and supporters
- simple enough to demo fast
- measurable impact on momentum and engagement
- extensible into a real product

---

## 9. Key Product Concepts

### 9.1 Conviction Score
A dynamic score representing how much a wallet contributes to sustaining a coin after launch.

Potential inputs:
- early support
- current loyalty / holding behavior
- campaign participation
- activity contribution
- other momentum-related signals

Potential tier outputs:
- OG
- Active
- Loyal
- Catalyst
- Champion

### 9.2 Campaigns
Creator-defined engagement programs that reward behaviors or supporter segments.

Possible examples:
- top supporters this week
- loyal holders campaign
- milestone unlock campaign
- community comeback campaign

### 9.3 Studio Dashboard
A creator-facing view of coin health, supporter segments, and active campaigns.

### 9.4 Supporter-Facing Campaign Page
A public or semi-public page where supporters can connect wallets and see:
- supporter score
- tier
- campaign eligibility
- ranking / leaderboard
- potential rewards

---

## 10. User Stories

### Creator Stories
- As a creator, I want to connect my Bags coin so I can understand my post-launch community.
- As a creator, I want to see who my most valuable supporters are.
- As a creator, I want to launch a campaign that rewards the wallets helping sustain momentum.
- As a creator, I want to export or review reward-eligible wallets.
- As a creator, I want to understand whether my coin is gaining or losing momentum.

### Supporter Stories
- As a supporter, I want to connect my wallet and see if I qualify for campaign rewards.
- As a supporter, I want to know my supporter tier and standing.
- As a supporter, I want to participate in community campaigns.
- As a supporter, I want visible recognition for loyalty and contribution.

---

## 11. MVP Scope

### Must Have
1. Coin selection / connect flow
2. Creator dashboard for a Bags coin
3. Conviction Score computation
4. Supporter leaderboard
5. One campaign creation flow
6. Supporter-facing campaign page
7. Reward eligibility output / winner list

### Nice to Have
- multiple campaign templates
- richer analytics
- revival mode prompts
- fee-share-linked reward flows
- direct swap / onboarding flows

---

## 12. Functional Requirements

### 12.1 Coin Dashboard
The system must allow a creator to select a Bags coin and view:
- coin identity/context
- creator context
- momentum snapshot
- supporter leaderboard
- active campaign state

### 12.2 Conviction Score
The system must compute a supporter score for wallets associated with a coin based on defined heuristics.

The system should expose:
- numeric score
- supporter tier
- ranking relative to other supporters

### 12.3 Campaign Creation
The system must allow creators to create at least one campaign type in v1.

Suggested v1 campaign types:
- Top Supporters Campaign
- Loyal Holders Campaign
- Milestone Campaign

### 12.4 Supporter Campaign Page
The system must provide a campaign page where a supporter can:
- connect wallet
- view score and tier
- view eligibility
- view leaderboard state

### 12.5 Reward Eligibility Output
The system must provide creators with a reviewable/exportable list of eligible wallets for rewards.

---

## 13. Data Requirements

### Core Entities
- Coin
- Creator
- Supporter Wallet
- Conviction Score
- Campaign
- Campaign Participant
- Reward Eligibility Entry

### Derived Data
- momentum health score
- supporter rankings
- campaign qualification status
- segment labels

---

## 14. Bags Integration Requirements

BagsStudio must use Bags in a way that feels native and deep.

### Required Integration Themes
- coin and creator context from Bags-related surfaces
- post-launch activity / analytics signals from Bags-related data
- Bags-specific logic in the workflow, not just branding

### Planned Bags API Usage
- token launch creator data
- token analytics / lifetime fees
- claim stats / claim events
- pool / state surfaces
- fee share / partner config surfaces for future expansion
- trade quote / swap flows as a stretch feature

### Principle
The product should feel impossible without Bags, not merely compatible with it.

---

## 15. Success Criteria

### Hackathon Success
- clearly understood in under 60 seconds
- clearly Bags-native
- clearly post-launch focused
- demonstrates useful creator workflow
- demonstrates useful supporter workflow
- maps to judging criteria: traction, app usage, onchain relevance, growth potential

### Product Success
- creators can identify meaningful supporter segments
- creators can run at least one real momentum campaign
- supporters can understand and improve their standing
- the product creates repeat interaction, not one-time novelty

---

## 16. Demo Plan

### Demo Sequence
1. Open BagsStudio
2. Select a Bags coin
3. Show dashboard and supporter segmentation
4. Create a momentum campaign
5. Open the supporter-facing campaign page
6. Connect a wallet
7. Show score, tier, and eligibility
8. Return to creator view and show winner list / eligible supporters

### Demo Message
“Launch is not enough. BagsStudio gives Bags creators a system for keeping coins alive after launch.”

---

## 17. UX / Screen Plan

### Creator Screens
- Coin Select / Connect
- Coin Dashboard
- Supporters Leaderboard
- Campaign Builder
- Campaign Results / Reward Eligibility

### Supporter Screens
- Campaign Landing Page
- Wallet Status View
- Leaderboard / Tier View

---

## 18. Risks

- Conviction Score may become too abstract if not explained clearly
- Product may drift into generic dashboard territory if the campaign loop is weak
- Too many campaign types could slow MVP delivery
- Shallow Bags usage would weaken hackathon positioning

---

## 19. Mitigations

- keep the scoring model simple and explainable in v1
- anchor everything around post-launch momentum retention
- launch with 1–3 campaign types max
- foreground Bags-native data and logic throughout the demo

---

## 20. Future Extensions

- automated reward distribution
- fee-share-driven supporter incentives
- momentum alerts / revival mode
- supporter graphing and advanced segmentation
- multi-coin creator dashboards
- AI-generated campaign recommendations

---

## 21. One-Line Positioning

BagsStudio is the post-launch operating system for Bags coins.

## 22. Short Pitch

BagsStudio helps creators identify real supporters, run momentum campaigns, and reward the wallets that keep a Bags coin alive after launch.
