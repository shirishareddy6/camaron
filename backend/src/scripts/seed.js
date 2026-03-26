require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Seed products
    const products = [
      { name: 'Manamei', slug: 'manamei', category: 'feed',
        description: 'Premium Vannamei feed engineered for superior appetite stimulation and rapid growth.',
        features: ['Greater appetite & faster growth','Richer returns per harvest','Pond-friendly water quality','Balanced micronutrient profile'],
        sort_order: 1 },
      { name: 'Profeed 3M', slug: 'profeed-3m', category: 'feed',
        description: 'Vigorous growth formula for high-density stocking with outstanding FCR performance.',
        features: ['Vigorous growth & high FCR','Ideal for high stocking densities','Richer returns per cycle','Eco-friendly formulation'],
        sort_order: 2 },
      { name: 'Prostar', slug: 'prostar', category: 'feed',
        description: 'Balanced nutrition specifically designed for Black Tiger shrimp.',
        features: ['High attractivity & palatability','Best FCR with faster growth','3-hour water stability','Optimised for tiger shrimp'],
        sort_order: 3 },
      { name: 'Titan', slug: 'titan', category: 'feed',
        description: 'High-performance formula from premium raw materials delivering record yields.',
        features: ['Best FCR, rapid growth','3-hour water stability','High survival rate','High yields, high profits'],
        sort_order: 4 },
      { name: 'High Boost', slug: 'high-boost', category: 'feed',
        description: 'Advanced nutritional science with natural attractants and enhanced immunity support.',
        features: ['Advanced nutrition formulation','Natural attractability','Improved immunity & survival','Eco-friendly process'],
        sort_order: 5 },
      { name: 'Avant Catcher', slug: 'avant-catcher', category: 'health_care',
        description: 'Clears water turbidity and improves overall pond condition.',
        features: ['Clears water turbidity','Reduces water viscosity','Increases dissolved oxygen','Safe for aquatic life'],
        sort_order: 10 },
      { name: 'Avant Pro W', slug: 'avant-pro-w', category: 'health_care',
        description: 'Probiotic solution to improve pond soil condition and water quality.',
        features: ['Controls water quality parameters','Stabilises plankton bloom','Controls vibrio','Biological pond control'],
        sort_order: 11 },
      { name: 'Avant Immupak', slug: 'avant-immupak', category: 'health_care',
        description: 'Enhances shrimp immunity and protects against environmental stress.',
        features: ['Improves stress resistance','Enhances immune response','Protects from infections','Supports growth'],
        sort_order: 12 },
    ];

    for (const p of products) {
      await client.query(
        `INSERT INTO products (name, slug, category, description, features, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (slug) DO NOTHING`,
        [p.name, p.slug, p.category, p.description, JSON.stringify(p.features), p.sort_order]
      );
    }

    // Seed admin user
    await client.query(
      `INSERT INTO users (phone, name, role, email)
       VALUES ('+910000000000', 'Camaron Admin', 'admin', 'admin@camaron.in')
       ON CONFLICT (phone) DO NOTHING`
    );

    await client.query('COMMIT');
    console.log('✓ Seed complete — products and admin user created.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
