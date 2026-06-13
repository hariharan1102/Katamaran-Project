const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const serverDir = path.join(__dirname, '..');
const prismaSchemaPath = path.join(serverDir, 'prisma', 'schema.prisma');
const envPath = path.join(serverDir, '.env');

console.log('🔄 Configuring database to use SQLite...');

try {
  // 1. Read and update schema.prisma
  if (fs.existsSync(prismaSchemaPath)) {
    let schema = fs.readFileSync(prismaSchemaPath, 'utf8');
    
    // Replace postgresql with sqlite
    schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
    
    // Remove @db.Text (unsupported in SQLite)
    schema = schema.replace(/\s*@db\.Text/g, '');
    
    fs.writeFileSync(prismaSchemaPath, schema, 'utf8');
    console.log('✅ Updated prisma/schema.prisma to use SQLite provider.');
  } else {
    throw new Error('prisma/schema.prisma not found!');
  }

  // 2. Read and update .env
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace DATABASE_URL value
    envContent = envContent.replace(
      /DATABASE_URL\s*=\s*".*"/g,
      'DATABASE_URL="file:./dev.db"'
    );
    
    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log('✅ Updated .env with SQLite database file path.');
  } else {
    // Create new .env if missing
    fs.writeFileSync(
      envPath,
      'DATABASE_URL="file:./dev.db"\nPORT=5000\nBASE_URL="http://localhost:5000"\nCLIENT_URL="http://localhost:5173"\nJWT_SECRET="super-secret-jwt-key-snaplink-2026"\nJWT_EXPIRES_IN="7d"\n'
    );
    console.log('✅ Created new .env with SQLite configurations.');
  }

  // 3. Initialize SQLite DB
  console.log('⏳ Running prisma db push...');
  execSync('npx prisma db push', { cwd: serverDir, stdio: 'inherit' });
  console.log('✅ SQLite database initialized.');

  // 4. Regenerate client
  console.log('⏳ Generating Prisma Client...');
  execSync('npx prisma generate', { cwd: serverDir, stdio: 'inherit' });
  console.log('✅ Prisma Client regenerated.');

  console.log('\n🎉 SQLite setup completed successfully! You can now run the server.');

} catch (error) {
  console.error('❌ Failed to set up SQLite:', error.message);
  process.exit(1);
}
