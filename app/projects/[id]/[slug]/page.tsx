import React from 'react';
import { createClient } from '@/utils/supabase-server';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TipJar from '@/components/TipJar';
import type { Database } from '@/types/database'; 