const fs = require('fs');

const urls = [
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=800&h=600&auto=format&fit=crop', // Classic luxury Suite
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=800&h=600&auto=format&fit=crop', // Modern minimalist hotel room
    'https://images.unsplash.com/photo-1562438668-bcf0ca6578f0?q=80&w=800&h=600&auto=format&fit=crop', // Boutique style bedroom
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=800&h=600&auto=format&fit=crop', // Spacious premium room
    'https://images.unsplash.com/photo-1729717949948-56b52db111dd?q=80&w=800&h=600&auto=format&fit=crop', // Infinity pool
    'https://images.unsplash.com/photo-1729717949712-1c51422693d1?q=80&w=800&h=600&auto=format&fit=crop', // Tropical resort pool
    'https://images.unsplash.com/photo-1723465308831-29da05e011f3?q=80&w=800&h=600&auto=format&fit=crop', // Modern high-rise hotel
    'https://images.unsplash.com/photo-1670337476682-522bd45a188d?q=80&w=800&h=600&auto=format&fit=crop', // Classic grand hotel
    'https://images.unsplash.com/photo-1677129667171-92abd8740fa3?q=80&w=800&h=600&auto=format&fit=crop', // Modern elegant lobby
    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=800&h=600&auto=format&fit=crop'  // Grand lobby
];

async function checkUrls() {
    let output = '';
    for (let u of urls) {
        try {
            const r = await fetch(u, { method: 'HEAD' });
            output += r.status + ' : ' + u + '\n';
        } catch (e) {
            output += 'ERROR : ' + u + '\n';
        }
    }
    fs.writeFileSync('url_status.txt', output);
    console.log('done');
}
checkUrls();
