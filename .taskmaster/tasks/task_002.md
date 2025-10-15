# Task 2: Set up Supabase local instance and database schema

**Status:** pending  
**Priority:** high  
**Dependencies:** 1

## Description
Initialize Supabase locally, create database migrations for chat sessions and messages tables, and configure the connection.

## Details
- Initialize Supabase CLI and start local instance
- Create migration for chat_sessions table (id, created_at, updated_at, title)
- Create migration for chat_messages table (id, created_at, chat_id, role, content, type, image_url)
- Set up RLS policies for both tables
- Test database connection from NextJS

## Test Strategy
Run migrations successfully, verify tables exist in local Supabase, test basic CRUD operations on both tables.

## Subtasks
No subtasks defined yet.

