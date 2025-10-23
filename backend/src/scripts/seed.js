import bcrypt from 'bcrypt';
import pool, { query } from '../config/database.js';
import { logger } from '../utils/logger.js';

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');

    // Create default users
    const password = await bcrypt.hash('changeme123', 10);

    await query(`
      INSERT INTO users (email, password_hash, first_name, last_name)
      VALUES
        ($1, $2, $3, $4),
        ($5, $6, $7, $8)
      ON CONFLICT (email) DO NOTHING
    `, [
      'user1@newsai.com', password, 'Trading', 'User1',
      'user2@newsai.com', password, 'Trading', 'User2'
    ]);

    logger.info('✅ Default users created:');
    logger.info('   Email: user1@newsai.com | Password: changeme123');
    logger.info('   Email: user2@newsai.com | Password: changeme123');

    // Seed some historical patterns (example data)
    await query(`
      INSERT INTO historical_patterns (stock_symbol, event_type, avg_price_change, median_price_change, timeframe, sample_size, confidence)
      VALUES
        ('AAPL', 'product-launch', 8.5, 7.2, '2_weeks', 12, 0.75),
        ('AAPL', 'earnings-beat', 5.3, 4.8, '1_week', 24, 0.82),
        ('MSFT', 'acquisition', 12.1, 10.5, '1_month', 8, 0.68),
        ('GOOGL', 'legal-issues', -6.2, -5.8, '2_weeks', 15, 0.71),
        ('NVDA', 'product-launch', 15.7, 14.2, '1_month', 10, 0.79),
        ('META', 'partnership', 7.8, 6.9, '2_weeks', 18, 0.73)
      ON CONFLICT (stock_symbol, event_type, timeframe) DO NOTHING
    `);

    logger.info('✅ Historical patterns seeded');

    logger.info('🎉 Database seeding completed successfully!');
    logger.info('');
    logger.info('You can now login with:');
    logger.info('   Email: user1@newsai.com');
    logger.info('   Password: changeme123');
    logger.info('');
    logger.info('⚠️  Remember to change these passwords in production!');

  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

// Run seeding
seedDatabase();
