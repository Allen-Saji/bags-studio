# Momentum OS

Post-launch growth and loyalty operating system for Bags coins.

## Thesis

Most coins can launch. Very few sustain momentum after launch.

Momentum OS helps Bags creators keep coins alive after launch by identifying real supporters, launching momentum campaigns, and rewarding the wallets that actively sustain the coin's community and activity.

## Core Problem

After launch, many coins lose momentum because there is:
- no post-launch retention layer
- no structured way to reward loyal supporters
- no operating system for campaigns, milestones, and community loops
- no clear distinction between short-term speculators and real supporters

Momentum OS solves this by giving creators and communities a shared post-launch coordination layer.

## Product Vision

Momentum OS is the post-launch operating system for Bags coins.

It helps creators:
- understand who their real supporters are
- run momentum campaigns
- reward wallets that keep the coin alive
- sustain community energy after launch

It helps supporters:
- earn visible status
- qualify for rewards and perks
- participate in campaigns
- become part of the coin's long-term community, not just its launch spike

## MVP

### Creator Side
- Coin dashboard
- Supporter leaderboard
- Supporter Score and tiering
- Momentum campaign creation
- Reward eligibility / winner list

### Supporter Side
- Wallet connect
- Personal supporter score / tier
- Active campaigns
- Leaderboard
- Reward eligibility view

## Core MVP Flow

1. Creator selects a Bags coin
2. Momentum OS ingests Bags-native coin and activity data
3. Supporter Score is computed for participating wallets
4. Creator launches a momentum campaign
5. Supporters connect wallets and view status / eligibility
6. Creator exports or finalizes reward recipients

## Key Differentiator

**Most launch products help a coin go live. Momentum OS helps a coin stay alive.**

## Proposed Feature Set

### 1. Coin Dashboard
- Coin overview
- Creator context
- Momentum health snapshot
- Top supporters
- Recent community activity

### 2. Supporter Score
A weighted score based on signals like:
- early support
- loyalty / holding behavior
- participation in campaigns
- measurable contribution to ongoing momentum

Possible tiers:
- OG
- Active
- Loyal
- Catalyst
- Champion

### 3. Momentum Campaigns
Suggested v1 campaign types:
- Top Supporters Campaign
- Loyal Holders Campaign
- Milestone Campaign

### 4. Reward Layer
- Reward eligibility generation
- Winner lists
- Exportable recipient sets
- NFT / allowlist / perk-based reward readiness

### 5. Supporter-Facing Campaign Pages
- wallet-specific score and tier
- active campaign visibility
- ranking / leaderboard
- reward qualification state

## Bags Hackathon Fit

Momentum OS is designed specifically for the Bags hackathon judging priorities:
- deep Bags integration
- real usage potential
- post-launch utility
- measurable traction and community retention
- value for both creators and supporters

## Why This Fits Bags

Bags coins need more than a launch moment.
They need post-launch momentum, loyalty, and repeat participation.

Momentum OS is designed to become the layer that turns:
- launch hype -> durable community
- holders -> supporters
- traders -> recurring participants

## Bags Integration Plan

Momentum OS should feel impossible without Bags, not merely compatible with it.

### Relevant Bags API Surfaces
- Token launch creator data
- Token analytics / lifetime fee data
- Claim stats / claim events
- Pool / state lookups
- Fee-share configuration surfaces
- Partner config surfaces
- Trade quote / swap endpoints (stretch)

### How We Use Them
- bootstrap creator + coin context
- compute momentum health signals
- surface post-launch activity metrics
- power supporter segmentation
- create future reward and fee-routing possibilities

## MVP Architecture

### Frontend
- Next.js
- wallet connect
- creator dashboard
- public campaign pages

### Backend
- Node / TypeScript service
- Bags API ingestion
- supporter score computation
- campaign management
- leaderboard and eligibility generation

### Core Data Models
- coins
- creators
- supporters
- supporter_scores
- campaigns
- campaign_participants
- rewards

## Demo Narrative

1. Select a Bags coin
2. Show momentum dashboard and supporter segmentation
3. Launch a momentum campaign
4. Visit public campaign page
5. Connect supporter wallet
6. Show supporter score / tier / eligibility
7. Show creator reward list

## Positioning

### Short Pitch
Momentum OS is the post-launch operating system for Bags coins.

### Longer Pitch
Momentum OS helps creators identify their real supporters, run momentum campaigns, and reward the wallets that keep a Bags coin alive after launch.

## Future Extensions
- automated reward distribution
- fee-share powered incentive flows
- revival mode for declining coin activity
- campaign recommendations
- richer supporter graphing and segmentation
- multi-coin community tooling
