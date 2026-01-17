// app.js
import { spawn } from 'child_process';

const child = spawn('npx', ['next', 'start'], { stdio: 'inherit' });

child.on('exit', (code) => {
    console.log(`Next.js process exited with code ${code}`);
});
