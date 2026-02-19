
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
console.log('Running sync-menu.js...');

// Convert __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try to load dotenv dynamically if present (for local dev)
try {
    const dotenv = await import('dotenv');
    dotenv.default.config({ path: path.join(__dirname, '../.env') });
    console.log('Loaded .env file');
} catch (e) {
    console.log('dotenv not found or .env missing, relying on system env vars');
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    const menuPath = path.join(__dirname, '../public/menu.json');
    if (fs.existsSync(menuPath)) {
        console.warn('Warning: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY not set. Using existing public/menu.json for build.');
        process.exit(0);
    } else {
        console.error('Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in Environment, and no menu.json found.');
        console.error('Current Dir:', __dirname);
        process.exit(1);
    }
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncMenu() {
    console.log('Starting menu synchronization...');

    try {
        // Fetch Categories
        const { data: categories, error: catError } = await supabase
            .from('categories')
            .select('*')
            .order('id');

        if (catError) throw catError;

        // Fetch Products
        const { data: products, error: prodError } = await supabase
            .from('products')
            .select('*')
            .order('id');

        if (prodError) throw prodError;

        // Fetch Store Config
        const { data: config, error: configError } = await supabase
            .from('store_config')
            .select('*')
            .single();

        if (configError) {
            console.warn('Warning: Could not fetch store_config, using default.');
        }

        const menuData = {
            products,
            categories,
            config: config || {
                description: 'Sabor artesanal en cada sorbo.',
                schedule: 'Lunes - Domingo: 12:00 PM - 8:00 PM',
                address: 'Ubicación pendiente',
                landing_hero_image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaqjuXy7A9z4VPgBsY5CgsKz6H6Iou2Aj_2FdNfe3qYhzrmbDvTRete_LUpK7_OVEdOB-1J3VaCxg77p4-ac3vf_5khnKwnaugHEJVKi14Jm6Ijsk7qDRInZdnthLGq5k3WVaNlVXdWSEQr2nUNVdvoSkfzAIIjwxnxHuXNmcNSjxQFiPJ7q00ixEd1Fvv6hmGy_7CL9JFSzoMy99U9f6vA1eVeFPEpQ5JA6hsYV5l_yuOLHxCyECjN8G5WKMV5KBK7s8zhkbI9mo6',
                home_hero_image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=2000'
            }
        };

        const outputPath = path.join(__dirname, '../public/menu.json');

        // Ensure directory exists
        const publicDir = path.dirname(outputPath);
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }

        fs.writeFileSync(outputPath, JSON.stringify(menuData, null, 2));
        console.log(`Successfully synced menu to ${outputPath}`);

    } catch (error) {
        console.error('Failed to sync menu:', error);
        process.exit(1);
    }
}

syncMenu();
