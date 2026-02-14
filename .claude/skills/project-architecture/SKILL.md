# ---

# 

# name: project-architecture

# description: Architecture rules for the AI shopping list app

# ------------------------------------------------------------

# 

# \# Project Architecture

# 

# \## Stack

# 

# \* React Native + TypeScript

# \* Firebase backend

# \* Functional components only

# 

# \## Folder structure

# 

# Use feature-based architecture:

# 

# src/

# features/

# components/ui

# services

# hooks

# types

# 

# \## Rules

# 

# \* Business logic in hooks/services

# \* UI components stay presentational

# \* Firebase access only via services

# \* Prefer small reusable components

# 

