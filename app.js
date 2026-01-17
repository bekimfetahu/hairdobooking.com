// app.js
import { spawn } from 'child_process';

spawn('npx', ['next', 'start'], {
    stdio: 'inherit'
});
