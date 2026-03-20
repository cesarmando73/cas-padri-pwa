require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ALLERGENS_DIR = 'd:/AI/Menu Restaurante/Cas Padri/Alergenos';
const BUCKET_NAME = 'allergens';

const allergensMapping = [
    { file: 'Gluten.svg', name_es: 'Cereales con gluten' },
    { file: 'Crustaceo.svg', name_es: 'Crustáceos' },
    { file: 'Huevo.svg', name_es: 'Huevos' },
    { file: 'Pescado.svg', name_es: 'Pescado' },
    { file: 'Cacahuete.svg', name_es: 'Cacahuetes' },
    { file: 'Soja.svg', name_es: 'Soja' },
    { file: 'Lacteos.svg', name_es: 'Lácteos' },
    { file: 'FrutosCascara.svg', name_es: 'Frutos de cáscara' },
    { file: 'Apio.svg', name_es: 'Apio' },
    { file: 'Mostaza.svg', name_es: 'Mostaza' },
    { file: 'GranosSesamo.svg', name_es: 'Granos de sésamo' },
    { file: 'DioxidoAzufreSulfitos.svg', name_es: 'Dióxido de azufre y sulfitos' },
    { file: 'Altramuces.svg', name_es: 'Altramuces' },
    { file: 'Moluscos.svg', name_es: 'Moluscos' }
];

async function setupAllergens() {
    console.log('--- SETTING UP ALLERGENS ---');

    // 1. Ensure bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets.find(b => b.name === BUCKET_NAME)) {
        console.log(`Creating bucket ${BUCKET_NAME}...`);
        await supabase.storage.createBucket(BUCKET_NAME, { public: true });
        // NOTE: If RLS is on for storage.buckets, this might need dashboard intervention.
    }

    // 1.5 Ensure tables exist (running the schema SQL via code if possible, or assuming user ran it)
    // Here we'll just try to insert.

    for (const item of allergensMapping) {
        const filePath = path.join(ALLERGENS_DIR, item.file);
        if (!fs.existsSync(filePath)) {
            console.error(`  Skipping ${item.file}: File not found.`);
            continue;
        }

        console.log(`Processing ${item.name_es}...`);

        // 2. Upload to Storage
        const fileBuffer = fs.readFileSync(filePath);
        const { error: uploadErr } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(item.file, fileBuffer, {
                contentType: 'image/svg+xml',
                upsert: true
            });

        if (uploadErr) {
            console.error(`  Upload failed for ${item.file}:`, uploadErr.message);
            // continue even if upload fails
        }

        // 3. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(item.file);

        // 4. Upsert into database
        const { error: dbErr } = await supabase
            .from('alergenos')
            .upsert({ 
                nombre_es: item.name_es, 
                icono_url: publicUrl 
            }, { onConflict: 'nombre_es' });

        if (dbErr) {
            console.error(`  DB Error for ${item.name_es}:`, dbErr.message);
        } else {
            console.log(`  SUCCESS: Registered ${item.name_es}`);
        }
    }

    console.log('\n--- ALLERGENS SETUP FINISHED ---');
}

setupAllergens().catch(console.error);
